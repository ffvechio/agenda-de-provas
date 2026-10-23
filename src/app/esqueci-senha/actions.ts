"use server";

import { createClient } from "@/lib/supabase/server";
import { esqueciSenhaSchema, type EsqueciSenhaInput } from "@/lib/auth/schemas";

export type EsqueciSenhaResult = { ok: true } | { message: string };

export async function solicitarRecuperacao(
  input: EsqueciSenhaInput
): Promise<EsqueciSenhaResult> {
  const parsed = esqueciSenhaSchema.safeParse(input);
  if (!parsed.success) {
    return { message: "Informe um e-mail válido." };
  }

  const supabase = await createClient();
  // Resultado sempre genérico: não revela se o e-mail tem conta cadastrada.
  await supabase.auth.resetPasswordForEmail(parsed.data.email);

  return { ok: true };
}
