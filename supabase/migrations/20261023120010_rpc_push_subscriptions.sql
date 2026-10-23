-- Registrar/atualizar a subscription de Web Push do dispositivo atual.
--
-- SECURITY DEFINER de propósito: um mesmo endpoint de push pode ter
-- pertencido a outro atleta que usou este navegador antes (troca de conta
-- no mesmo dispositivo) e saiu sem desativar notificações. A policy de
-- UPDATE de push_subscriptions (auth.uid() = user_id) bloquearia o
-- "reclaim" desse endpoint para o novo usuário — então fazemos a
-- reatribuição aqui, de forma controlada: só o dono do endpoint do
-- navegador atual (quem está autenticado nesta sessão) pode chamar esta
-- função, e ela só move a propriedade para auth.uid(), nunca para um
-- user_id arbitrário vindo do cliente.
create or replace function public.registrar_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth_key text,
  p_user_agent text,
  p_device_label text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Não autenticado.';
  end if;

  delete from public.push_subscriptions
  where endpoint = p_endpoint and user_id <> auth.uid();

  insert into public.push_subscriptions (
    user_id, endpoint, p256dh, auth_key, user_agent, device_label, last_seen_at
  ) values (
    auth.uid(), p_endpoint, p_p256dh, p_auth_key, p_user_agent, p_device_label, now()
  )
  on conflict (endpoint) do update set
    p256dh = excluded.p256dh,
    auth_key = excluded.auth_key,
    user_agent = excluded.user_agent,
    device_label = excluded.device_label,
    last_seen_at = now()
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function public.registrar_push_subscription(text, text, text, text, text) from public;
grant execute on function public.registrar_push_subscription(text, text, text, text, text) to authenticated;
