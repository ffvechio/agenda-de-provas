"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cadastroSchema, type CadastroInput } from "@/lib/auth/schemas";
import { cadastrar } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function SignupForm() {
  const router = useRouter();
  const [mensagem, setMensagem] = useState<string | null>(null);
  const hoje = new Date().toISOString().slice(0, 10);

  const form = useForm<CadastroInput>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      nome: "",
      dataNascimento: "",
      email: "",
      senha: "",
      confirmarSenha: "",
    },
  });

  async function onSubmit(values: CadastroInput) {
    setMensagem(null);
    const resultado = await cadastrar(values);
    if (resultado?.message) {
      setMensagem(resultado.message);
      return;
    }
    router.push(`/confirmar-email?email=${encodeURIComponent(values.email)}`);
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
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input autoComplete="name" placeholder="Seu nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataNascimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de nascimento</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  autoComplete="bday"
                  max={hoje}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <FormField
          control={form.control}
          name="senha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" {...field} />
              </FormControl>
              <FormDescription>
                Mínimo de 12 caracteres. Frases-senha são aceitas e recomendadas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmarSenha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar senha</FormLabel>
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
          {form.formState.isSubmitting ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>
    </Form>
  );
}
