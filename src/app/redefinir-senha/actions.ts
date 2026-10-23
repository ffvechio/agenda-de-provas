"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  redefinirSenhaSchema,
  type RedefinirSenhaInput,
} from "@/lib/auth/schemas";

export type RedefinirSenhaResult = { message: string } | void;

export async function redefinirSenha(
  input: RedefinirSenhaInput
): Promise<RedefinirSenhaResult> {
  const parsed = redefinirSenhaSchema.safeParse(input);
  if (!parsed.success) {
    return { message: "Verifique os dados informados." };
  }

  const supabase = await createClient();

  const { data: sessao } = await supabase.auth.getUser();
  if (!sessao.user) {
    return {
      message: "Sua sessão de redefinição expirou. Solicite um novo link.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.novaSenha,
  });

  if (error) {
    return { message: "Não foi possível redefinir sua senha. Tente novamente." };
  }

  // Invalida todas as sessões (incluindo a de recuperação usada agora) —
  // o atleta faz login novamente já com a nova senha.
  await supabase.auth.signOut({ scope: "global" });
  redirect("/entrar?redefinida=1");
}
