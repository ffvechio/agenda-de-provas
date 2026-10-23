"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { perfilSchema, type PerfilInput } from "@/lib/auth/schemas";
import { atualizarPerfil } from "./actions";
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

export function PerfilForm({ valoresIniciais }: { valoresIniciais: PerfilInput }) {
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const hoje = new Date().toISOString().slice(0, 10);
  const form = useForm<PerfilInput>({
    resolver: zodResolver(perfilSchema),
    defaultValues: valoresIniciais,
  });

  async function onSubmit(values: PerfilInput) {
    setMensagem(null);
    const resultado = await atualizarPerfil(values);
    if ("message" in resultado) {
      setMensagem({ tipo: "erro", texto: resultado.message });
    } else {
      setMensagem({ tipo: "ok", texto: "Dados atualizados." });
    }
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
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
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
                <Input type="date" max={hoje} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="self-start h-10" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Form>
  );
}
