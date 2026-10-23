"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, type LoginInput } from "@/lib/auth/schemas";
import { destinoSeguro } from "@/lib/auth/redirect-seguro";

export type LoginResult = { message: string } | void;

export async function login(
  input: LoginInput,
  redirectTo?: string
): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { message: "Verifique os dados informados." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.senha,
  });

  if (error) {
    // Mensagem genérica de propósito: não revela se o e-mail existe, se a
    // senha está errada ou se o e-mail ainda não foi confirmado.
    return { message: "E-mail ou senha incorretos." };
  }

  redirect(destinoSeguro(redirectTo));
}
