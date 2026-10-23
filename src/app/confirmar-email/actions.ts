"use server";

import { createClient } from "@/lib/supabase/server";
import { normalizarEmail } from "@/lib/auth/validacao";

export async function reenviarConfirmacao(email: string): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.resend({
    type: "signup",
    email: normalizarEmail(email),
  });
}
