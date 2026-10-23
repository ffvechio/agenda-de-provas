"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  redefinirSenhaSchema,
  type RedefinirSenhaInput,
} from "@/lib/auth/schemas";
import { redefinirSenha } from "./actions";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/password-input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function ResetPasswordForm() {
  const [mensagem, setMensagem] = useState<string | null>(null);
  const form = useForm<RedefinirSenhaInput>({
    resolver: zodResolver(redefinirSenhaSchema),
    defaultValues: { novaSenha: "", confirmarNovaSenha: "" },
  });

  async function onSubmit(values: RedefinirSenhaInput) {
    setMensagem(null);
    const resultado = await redefinirSenha(values);
    if (resultado?.message) {
      setMensagem(resultado.message);
    }
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

        <FormField
          control={form.control}
          name="novaSenha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nova senha</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" {...field} />
              </FormControl>
              <FormDescription>Mínimo de 12 caracteres.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmarNovaSenha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar nova senha</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" {...field} />
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
          {form.formState.isSubmitting ? "Salvando..." : "Definir nova senha"}
        </Button>
      </form>
    </Form>
  );
}
