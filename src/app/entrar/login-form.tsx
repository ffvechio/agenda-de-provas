"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/auth/schemas";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function LoginForm({
  redirectTo,
  erroLink,
  senhaRedefinida,
}: {
  redirectTo?: string;
  erroLink?: boolean;
  senhaRedefinida?: boolean;
}) {
  const router = useRouter();
  const [mensagem, setMensagem] = useState<string | null>(
    erroLink ? "O link usado é inválido ou expirou. Solicite um novo." : null
  );
  const [mensagemSucesso] = useState<string | null>(
    senhaRedefinida ? "Senha redefinida com sucesso. Entre com a nova senha." : null
  );
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", senha: "" },
  });

  async function onSubmit(values: LoginInput) {
    setMensagem(null);
    const resultado = await login(values, redirectTo);
    if (resultado?.message) {
      setMensagem(resultado.message);
      return;
    }
    router.refresh();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        {mensagem ? (
          <p
            role="alert"
            className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {mensagem}
          </p>
        ) : null}
        {mensagemSucesso ? (
          <p
            role="status"
            className="rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground"
          >
            {mensagemSucesso}
          </p>
        ) : null}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="username"
                  placeholder="voce@exemplo.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="senha"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Senha</FormLabel>
                <a
                  href="/esqueci-senha"
                  className="text-sm text-primary hover:underline"
                >
                  Esqueci minha senha
                </a>
              </div>
              <FormControl>
                <PasswordInput autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="mt-2 h-11"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </Form>
  );
}
