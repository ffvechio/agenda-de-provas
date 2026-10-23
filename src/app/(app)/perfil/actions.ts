"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  perfilSchema,
  trocarSenhaSchema,
  type PerfilInput,
  type TrocarSenhaInput,
} from "@/lib/auth/schemas";

export type AcaoResult = { message: string } | { ok: true };

export async function atualizarPerfil(input: PerfilInput): Promise<AcaoResult> {
  const parsed = perfilSchema.safeParse(input);
  if (!parsed.success) {
    return { message: "Verifique os dados informados." };
  }

  const supabase = await createClient();
  const { data: sessao } = await supabase.auth.getUser();
  if (!sessao.user) return { message: "Sessão expirada. Entre novamente." };

  const { error } = await supabase
    .from("profiles")
    .update({
      nome: parsed.data.nome,
      data_nascimento: parsed.data.dataNascimento,
    })
    .eq("id", sessao.user.id);

  if (error) return { message: "Não foi possível salvar seus dados." };

  revalidatePath("/perfil");
  revalidatePath("/inicio");
  return { ok: true };
}

export async function trocarSenha(input: TrocarSenhaInput): Promise<AcaoResult> {
  const parsed = trocarSenhaSchema.safeParse(input);
  if (!parsed.success) {
    return { message: "Verifique os dados informados." };
  }

  const supabase = await createClient();
  const { data: sessao } = await supabase.auth.getUser();
  if (!sessao.user?.email) return { message: "Sessão expirada. Entre novamente." };

  // Reautenticação leve: confirma a senha atual antes de trocar.
  const { error: erroLogin } = await supabase.auth.signInWithPassword({
    email: sessao.user.email,
    password: parsed.data.senhaAtual,
  });
  if (erroLogin) {
    return { message: "Senha atual incorreta." };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.novaSenha,
  });
  if (error) return { message: "Não foi possível alterar sua senha." };

  await supabase.auth.signOut({ scope: "others" });
  return { ok: true };
}

export async function atualizarFusoLembretes(fuso: string): Promise<AcaoResult> {
  const supabase = await createClient();
  const { data: sessao } = await supabase.auth.getUser();
  if (!sessao.user) return { message: "Sessão expirada." };

  const { error } = await supabase
    .from("profiles")
    .update({ fuso_lembretes: fuso })
    .eq("id", sessao.user.id);

  if (error) return { message: "Não foi possível salvar o fuso." };
  revalidatePath("/perfil");
  return { ok: true };
}

export async function atualizarNotificacoesAtivas(ativo: boolean): Promise<AcaoResult> {
  const supabase = await createClient();
  const { data: sessao } = await supabase.auth.getUser();
  if (!sessao.user) return { message: "Sessão expirada." };

  const { error } = await supabase
    .from("profiles")
    .update({ notificacoes_ativas: ativo })
    .eq("id", sessao.user.id);

  if (error) return { message: "Não foi possível salvar a preferência." };
  revalidatePath("/perfil");
  return { ok: true };
}

export async function excluirConta(senhaAtual: string): Promise<AcaoResult> {
  const supabase = await createClient();
  const { data: sessao } = await supabase.auth.getUser();
  if (!sessao.user?.email) return { message: "Sessão expirada." };

  const { error: erroLogin } = await supabase.auth.signInWithPassword({
    email: sessao.user.email,
    password: senhaAtual,
  });
  if (erroLogin) {
    return { message: "Senha incorreta." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(sessao.user.id);
  if (error) {
    return { message: "Não foi possível excluir sua conta agora." };
  }

  await supabase.auth.signOut();
  redirect("/");
}
