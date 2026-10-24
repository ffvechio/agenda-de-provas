"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cadastroSchema, type CadastroInput } from "@/lib/auth/schemas";

export type CadastroResult = { message: string; campo?: "email" } | void;

function contaJaExiste(error: { message?: string; code?: string }): boolean {
  return (
    error.code === "user_already_exists" ||
    Boolean(error.message?.toLowerCase().includes("already registered"))
  );
}

export async function cadastrar(
  input: CadastroInput
): Promise<CadastroResult> {
  const parsed = cadastroSchema.safeParse(input);
  if (!parsed.success) {
    return { message: "Verifique os dados informados." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.senha,
    options: {
      data: {
        nome: parsed.data.nome,
        data_nascimento: parsed.data.dataNascimento,
      },
    },
  });

  if (error) {
    if (contaJaExiste(error)) {
      return { message: "Este e-mail já está cadastrado.", campo: "email" };
    }
    if (error.status === 429) {
      return { message: "Muitas tentativas. Aguarde um pouco e tente novamente." };
    }
    return {
      message: "Não foi possível criar sua conta agora. Tente novamente.",
    };
  }

  // Sem confirmação por e-mail: o cadastro já deixa a conta ativa e com
  // sessão (cookies escritos pelo client acima) — vai direto para a área
  // autenticada.
  redirect("/inicio");
}
