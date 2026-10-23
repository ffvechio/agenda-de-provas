-- Agendamento periódico que invoca a Edge Function supabase/functions/send-reminders.
-- pg_cron dispara a cada 15 minutos; a própria function decide, por fuso do
-- atleta, se é "hoje" o dia de enviar o lembrete de 5 dias antes.
--
-- IMPORTANTE: a URL do projeto e a service role key NÃO ficam nesta
-- migration (não devem ir para o git). Elas são lidas em tempo de execução
-- do Supabase Vault. Configure uma vez por ambiente (local, preview,
-- produção) rodando no SQL Editor (ou `supabase db execute`):
--
--   select vault.create_secret('http://127.0.0.1:54321', 'project_url');       -- local
--   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url'); -- produção
--   select vault.create_secret('<service_role_key>', 'service_role_key');
--
-- Ver docs/IMPLANTACAO.md para o passo a passo completo.

create extension if not exists pg_cron;
create extension if not exists pg_net;

create schema if not exists private;

create or replace function private.invoke_send_reminders()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_project_url text;
  v_service_key text;
begin
  select decrypted_secret into v_project_url
    from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into v_service_key
    from vault.decrypted_secrets where name = 'service_role_key';

  if v_project_url is null or v_service_key is null then
    raise warning 'send-reminders: secrets project_url/service_role_key ausentes no Vault — execução ignorada';
    return;
  end if;

  -- Cria os jobs do dia (se algum atleta estiver na janela das 09:00 locais)
  -- antes de acionar a function que efetivamente envia os pushes pendentes.
  perform public.criar_lembretes_do_dia();

  perform net.http_post(
    url := v_project_url || '/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_service_key
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000
  );
end;
$$;

comment on function private.invoke_send_reminders() is
  'Chamada pelo pg_cron: dispara a Edge Function send-reminders via pg_net usando credenciais guardadas no Vault.';

select cron.schedule(
  'send-reminders-every-15-min',
  '*/15 * * * *',
  'select private.invoke_send_reminders();'
);
