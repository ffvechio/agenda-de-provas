"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import {
  esqueciSenhaSchema,
  type EsqueciSenhaInput,
} from "@/lib/auth/schemas";
import { solicitarRecuperacao } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function ForgotPasswordForm() {
  const [enviado, setEnviado] = useState(false);
  const form = useForm<EsqueciSenhaInput>({
    resolver: zodResolver(esqueciSenhaSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: EsqueciSenhaInput) {
    await solicitarRecuperacao(values);
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <MailCheck className="size-7" aria-hidden="true" />
        </div>
        <p className="text-sm text-foreground">
          Se houver uma conta com este e-mail, enviamos um link para
          redefinir a senha. Verifique sua caixa de entrada.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  {...field}
                />
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
          {form.formState.isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
        </Button>
      </form>
    </Form>
  );
}
