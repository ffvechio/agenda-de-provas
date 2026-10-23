-- Reforça "revalidar os dados antes do envio" em dois pontos:
--
-- 1) Ao editar/cancelar uma prova (bump_schedule_version já roda), cancela
--    imediatamente qualquer reminder_job pendente da versão antiga — não
--    espera o próximo ciclo do cron para descobrir que o agendamento mudou.
-- 2) No momento de reivindicar jobs para envio, revalida a prova (ainda não
--    cancelada e ainda elegível pela situação) antes de efetivamente
--    devolver o job para a Edge Function enviar o push.

create or replace function public.bump_schedule_version()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.data is distinct from old.data
     or new.situacao is distinct from old.situacao
     or new.cancelada is distinct from old.cancelada then
    new.schedule_version = old.schedule_version + 1;

    update public.reminder_jobs
    set status = 'canceled', updated_at = now()
    where prova_id = old.id
      and status = 'pending'
      and schedule_version < new.schedule_version;
  end if;
  return new;
end;
$$;

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
  ),
  invalidados as (
    update public.reminder_jobs rj
    set status = 'canceled', updated_at = now()
    from claimados c
    join public.provas pr on pr.id = c.prova_id
    where rj.id = c.id
      and (
        pr.cancelada = true
        or not (
          pr.situacao = 'inscrito'
          or (pr.situacao = 'interesse' and pr.notificar_interesse = true)
        )
      )
    returning rj.id
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
  join public.push_subscriptions ps on ps.id = c.subscription_id
  where c.id not in (select id from invalidados);
end;
$$;

revoke execute on function public.reivindicar_lembretes_pendentes(integer) from public;
grant execute on function public.reivindicar_lembretes_pendentes(integer) to service_role;
