-- Funções usadas exclusivamente pela Edge Function send-reminders (chamada
-- com a service role key). Não são expostas a usuários autenticados comuns.

-- Cria reminder_jobs pendentes para provas cujo "5 dias antes", calculado no
-- fuso horário de cada atleta, cai em hoje — apenas durante a janela de
-- 09:00–09:15 local (a função roda a cada 15 min via pg_cron). Se a prova só
-- foi cadastrada depois dessa janela, o job simplesmente não é criado hoje —
-- é assim que o produto evita enviar lembretes retroativos.
create or replace function public.criar_lembretes_do_dia()
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_criados integer;
begin
  with candidatos as (
    select
      pr.id as prova_id,
      pr.schedule_version,
      ps.id as subscription_id,
      (((now() at time zone pf.fuso_lembretes)::date + time '09:00')
        at time zone pf.fuso_lembretes) as agendado_para
    from public.provas pr
    join public.profiles pf on pf.id = pr.user_id
    join public.push_subscriptions ps on ps.user_id = pr.user_id
    where pr.cancelada = false
      and pf.notificacoes_ativas = true
      and (
        pr.situacao = 'inscrito'
        or (pr.situacao = 'interesse' and pr.notificar_interesse = true)
      )
      and pr.data = ((now() at time zone pf.fuso_lembretes)::date + interval '5 days')::date
      and (now() at time zone pf.fuso_lembretes)::time >= time '09:00'
      and (now() at time zone pf.fuso_lembretes)::time < time '09:15'
  )
  insert into public.reminder_jobs (prova_id, subscription_id, schedule_version, scheduled_for, status)
  select prova_id, subscription_id, schedule_version, agendado_para, 'pending'
  from candidatos
  on conflict (prova_id, subscription_id, schedule_version) do nothing;

  get diagnostics v_criados = row_count;
  return v_criados;
end;
$$;

revoke execute on function public.criar_lembretes_do_dia() from public;
grant execute on function public.criar_lembretes_do_dia() to service_role;

-- Reivindica até p_limite reminder_jobs pendentes e já vencidos de forma
-- atômica (FOR UPDATE SKIP LOCKED) — chamadas concorrentes da Edge Function
-- nunca pegam o mesmo job duas vezes. Retorna os dados já prontos para
-- montar e enviar a notificação push.
create or replace function public.reivindicar_lembretes_pendentes(p_limite integer default 50)
returns table (
  job_id uuid,
  prova_id uuid,
  prova_nome text,
  prova_data date,
  subscription_id uuid,
  endpoint text,
  p256dh text,
  auth_key text,
  scheduled_for timestamptz,
  attempts integer
)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return query
  with claimados as (
    update public.reminder_jobs rj
    set status = 'processing', updated_at = now()
    where rj.id in (
      select rj2.id from public.reminder_jobs rj2
      where rj2.status = 'pending' and rj2.scheduled_for <= now()
      order by rj2.scheduled_for
      limit p_limite
      for update skip locked
    )
    returning rj.id, rj.prova_id, rj.subscription_id, rj.scheduled_for, rj.attempts
  )
  select
    c.id,
    c.prova_id,
    pr.nome,
    pr.data,
    c.subscription_id,
    ps.endpoint,
    ps.p256dh,
    ps.auth_key,
    c.scheduled_for,
    c.attempts
  from claimados c
  join public.provas pr on pr.id = c.prova_id
  join public.push_subscriptions ps on ps.id = c.subscription_id;
end;
$$;

revoke execute on function public.reivindicar_lembretes_pendentes(integer) from public;
grant execute on function public.reivindicar_lembretes_pendentes(integer) to service_role;

-- Marca o resultado final de um job (chamado pela Edge Function após tentar
-- enviar o push) e registra a tentativa em reminder_attempts.
create or replace function public.concluir_tentativa_lembrete(
  p_job_id uuid,
  p_sucesso boolean,
  p_status_final text,
  p_http_status integer,
  p_erro text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.reminder_jobs
  set
    status = p_status_final,
    attempts = attempts + 1,
    last_error = p_erro,
    updated_at = now()
  where id = p_job_id;

  insert into public.reminder_attempts (reminder_job_id, success, http_status, error)
  values (p_job_id, p_sucesso, p_http_status, p_erro);
end;
$$;

revoke execute on function public.concluir_tentativa_lembrete(uuid, boolean, text, integer, text) from public;
grant execute on function public.concluir_tentativa_lembrete(uuid, boolean, text, integer, text) to service_role;

-- Remove subscriptions inválidas (404/410 do serviço de push) — chamado
-- pela Edge Function.
create or replace function public.remover_subscription_invalida(p_subscription_id uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  delete from public.push_subscriptions where id = p_subscription_id;
$$;

revoke execute on function public.remover_subscription_invalida(uuid) from public;
grant execute on function public.remover_subscription_invalida(uuid) to service_role;
