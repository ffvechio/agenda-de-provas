"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trocarSenhaSchema, type TrocarSenhaInput } from "@/lib/auth/schemas";
import { trocarSenha } from "./actions";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function TrocarSenhaForm() {
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const form = useForm<TrocarSenhaInput>({
    resolver: zodResolver(trocarSenhaSchema),
    defaultValues: { senhaAtual: "", novaSenha: "", confirmarNovaSenha: "" },
  });

  async function onSubmit(values: TrocarSenhaInput) {
    setMensagem(null);
    const resultado = await trocarSenha(values);
    if ("message" in resultado) {
      setMensagem({ tipo: "erro", texto: resultado.message });
      return;
    }
    setMensagem({
      tipo: "ok",
      texto: "Senha alterada. Suas outras sessões foram desconectadas.",
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {mensagem ? (
          <p
            role={mensagem.tipo === "erro" ? "alert" : "status"}
            className={
              mensagem.tipo === "erro"
                ? "rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
                : "rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground"
            }
          >
            {mensagem.texto}
          </p>
        ) : null}

        <FormField
          control={form.control}
          name="senhaAtual"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha atual</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="novaSenha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nova senha</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" {...field} />
              </FormControl>
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

        <Button type="submit" className="self-start h-10" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Salvando..." : "Alterar senha"}
        </Button>
      </form>
    </Form>
  );
}
