"use server";

import { createClient } from "@/lib/supabase/server";

export type PushActionResult = { ok: true } | { message: string };

export async function inscreverPush(input: {
  endpoint: string;
  p256dh: string;
  authKey: string;
  userAgent?: string;
  deviceLabel?: string;
}): Promise<PushActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("registrar_push_subscription", {
    p_endpoint: input.endpoint,
    p_p256dh: input.p256dh,
    p_auth_key: input.authKey,
    p_user_agent: input.userAgent?.slice(0, 300) ?? null,
    p_device_label: input.deviceLabel?.slice(0, 120) ?? null,
  });

  if (error) {
    return { message: "Não foi possível ativar as notificações." };
  }
  return { ok: true };
}

export async function desinscreverPush(endpoint: string): Promise<PushActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);

  if (error) {
    return { message: "Não foi possível desativar as notificações." };
  }
  return { ok: true };
}
