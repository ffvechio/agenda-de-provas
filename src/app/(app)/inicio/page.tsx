import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ProvaCard } from "@/components/provas/prova-card";
import { labelModalidade } from "@/lib/provas/constantes";
import { diasRestantes, formatarDataBr } from "@/lib/datas/formato";
import type { ProvaRow } from "@/lib/provas/types";

export const metadata: Metadata = { title: "Início" };

export default async function InicioPage() {
  const supabase = await createClient();
  const [{ data: provas }, { data: perfil }] = await Promise.all([
    supabase
      .from("provas")
      .select("*")
      .eq("cancelada", false)
      .order("data", { ascending: true }),
    supabase.from("profiles").select("nome, fuso_lembretes").maybeSingle(),
  ]);

  const fuso = perfil?.fuso_lembretes ?? "America/Sao_Paulo";
  const todas = (provas ?? []) as ProvaRow[];

  const futuras = todas.filter((p) => diasRestantes(p.data, fuso) >= 0);
  const proximaConfirmada = futuras.find((p) => p.situacao === "inscrito");
  const proximasGeral = futuras.slice(0, 5);
  const totalInscritas = todas.filter((p) => p.situacao === "inscrito").length;
  const totalInteresse = todas.filter((p) => p.situacao === "interesse").length;

  if (todas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <CalendarPlus className="size-8" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Olá{perfil?.nome ? `, ${perfil.nome}` : ""}!
          </h1>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Comece cadastrando a primeira prova que você tem interesse ou já
            está inscrito.
          </p>
        </div>
        <Button asChild className="h-11">
          <Link href="/provas/novo">Adicionar prova</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">
          Olá{perfil?.nome ? `, ${perfil.nome.split(" ")[0]}` : ""}
        </h1>
        <Button asChild size="sm" className="h-10">
          <Link href="/provas/novo">
            <CalendarPlus className="size-4" aria-hidden="true" />
            Adicionar
          </Link>
        </Button>
      </div>

      {proximaConfirmada ? (
        <Link
          href={`/provas/${proximaConfirmada.id}`}
          className="flex flex-col gap-2 rounded-2xl bg-primary p-5 text-primary-foreground"
        >
          <span className="text-sm font-medium opacity-90">
            Próxima prova confirmada
          </span>
          <span className="text-2xl font-bold">{proximaConfirmada.nome}</span>
          <span className="flex items-center gap-1 text-sm opacity-90">
            <MapPin className="size-3.5" aria-hidden="true" />
            {proximaConfirmada.cidade}, {proximaConfirmada.estado}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-4xl font-bold tabular-nums">
              {diasRestantes(proximaConfirmada.data, fuso)}
            </span>
            <span className="text-sm opacity-90">
              {diasRestantes(proximaConfirmada.data, fuso) === 1 ? "dia" : "dias"} ·{" "}
              {formatarDataBr(proximaConfirmada.data)}
            </span>
          </div>
          <span className="text-xs opacity-80">
            {labelModalidade(proximaConfirmada.modalidade, proximaConfirmada.modalidade_outra)}
          </span>
        </Link>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-card p-4 text-center">
          <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
            {totalInscritas}
          </p>
          <p className="text-xs text-muted-foreground">Inscrições confirmadas</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 text-center">
          <p className="font-mono text-2xl font-bold tabular-nums text-stat">
            {totalInteresse}
          </p>
          <p className="text-xs text-muted-foreground">Provas de interesse</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Próximas provas
          </h2>
          <Link href="/provas" className="text-sm text-primary hover:underline">
            Ver todas
          </Link>
        </div>
        {proximasGeral.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma prova futura cadastrada.
          </p>
        ) : (
          proximasGeral.map((prova) => <ProvaCard key={prova.id} prova={prova} />)
        )}
      </div>
    </div>
  );
}
