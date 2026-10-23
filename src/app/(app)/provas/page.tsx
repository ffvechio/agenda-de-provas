import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ProvasExplorer } from "@/components/provas/provas-explorer";
import type { ProvaRow } from "@/lib/provas/types";

export const metadata: Metadata = { title: "Minhas provas" };

export default async function ProvasPage() {
  const supabase = await createClient();
  const [{ data: provas }, { data: perfil }] = await Promise.all([
    supabase.from("provas").select("*").order("data", { ascending: true }),
    supabase.from("profiles").select("fuso_lembretes").maybeSingle(),
  ]);

  if (!provas || provas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <CalendarPlus className="size-8" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Nenhuma prova cadastrada ainda
          </h1>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Adicione uma prova em que você está inscrito ou que tem interesse
            para começar sua agenda.
          </p>
        </div>
        <Button asChild className="h-11">
          <Link href="/provas/novo">Adicionar prova</Link>
        </Button>
      </div>
    );
  }

  return (
    <ProvasExplorer
      provas={provas as ProvaRow[]}
      fuso={perfil?.fuso_lembretes ?? "America/Sao_Paulo"}
    />
  );
}
