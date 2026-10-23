import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Clock,
  Link as LinkIcon,
  MapPin,
  Mountain,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ProvaActions } from "@/components/provas/prova-actions";
import {
  labelModalidade,
  RESULTADOS,
  SITUACOES,
} from "@/lib/provas/constantes";
import {
  diasRestantes,
  formatarDataBr,
  formatarHorario,
} from "@/lib/datas/formato";
import type { EtapaRow, ProvaRow } from "@/lib/provas/types";

export const metadata: Metadata = { title: "Detalhe da prova" };

export default async function DetalheProvaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: prova }, { data: perfil }] = await Promise.all([
    supabase.from("provas").select("*, prova_etapas(*)").eq("id", id).maybeSingle(),
    supabase.from("profiles").select("fuso_lembretes").maybeSingle(),
  ]);

  if (!prova) notFound();

  const provaRow = prova as ProvaRow;
  const fuso = perfil?.fuso_lembretes ?? "America/Sao_Paulo";
  const faltam = diasRestantes(provaRow.data, fuso);
  const dataPassada = faltam < 0;
  const horario = formatarHorario(provaRow.horario_largada);
  const etapas = (provaRow.prova_etapas ?? []).slice().sort((a: EtapaRow, b: EtapaRow) => a.ordem - b.ordem);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant={provaRow.situacao === "inscrito" ? "default" : "secondary"}>
            {SITUACOES.find((s) => s.value === provaRow.situacao)?.label}
          </Badge>
          {provaRow.cancelada ? <Badge variant="destructive">Cancelada</Badge> : null}
          {provaRow.resultado ? (
            <Badge variant="outline">
              {RESULTADOS.find((r) => r.value === provaRow.resultado)?.label}
            </Badge>
          ) : null}
        </div>
        <h1 className="text-2xl font-bold text-foreground">{provaRow.nome}</h1>
        <p className="text-muted-foreground">
          {labelModalidade(provaRow.modalidade, provaRow.modalidade_outra)}
        </p>
      </div>

      {!dataPassada && !provaRow.cancelada ? (
        <div className="rounded-xl bg-accent p-4 text-accent-foreground">
          <p className="text-sm">
            {faltam === 0
              ? "É hoje!"
              : faltam === 1
                ? "Falta 1 dia"
                : `Faltam ${faltam} dias`}
          </p>
        </div>
      ) : null}

      <dl className="flex flex-col gap-3 text-sm">
        <div className="flex items-center gap-3">
          <CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" />
          <span>
            {formatarDataBr(provaRow.data)}
            {horario ? ` às ${horario}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="size-4 text-muted-foreground" aria-hidden="true" />
          <span>
            {[provaRow.local, provaRow.cidade, provaRow.estado, provaRow.pais]
              .filter(Boolean)
              .join(", ")}
          </span>
        </div>
        {etapas.length > 0 ? (
          <div className="flex items-start gap-3">
            <Mountain className="size-4 text-muted-foreground" aria-hidden="true" />
            <ul className="flex flex-col gap-1">
              {etapas.map((etapa: EtapaRow) => (
                <li key={etapa.id}>
                  {etapa.modalidade}: {etapa.distancia_valor} {etapa.distancia_unidade}
                </li>
              ))}
            </ul>
          </div>
        ) : provaRow.distancia_valor ? (
          <div className="flex items-center gap-3">
            <Mountain className="size-4 text-muted-foreground" aria-hidden="true" />
            <span>
              {provaRow.distancia_valor} {provaRow.distancia_unidade}
              {provaRow.desnivel_positivo_m
                ? ` · ${provaRow.desnivel_positivo_m} m de desnível`
                : ""}
            </span>
          </div>
        ) : null}
        {provaRow.link_oficial ? (
          <div className="flex items-center gap-3">
            <LinkIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            <a
              href={provaRow.link_oficial}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Site oficial
            </a>
          </div>
        ) : null}
        {horario ? (
          <div className="flex items-center gap-3">
            <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
            <span>Largada às {horario}</span>
          </div>
        ) : null}
      </dl>

      {provaRow.observacoes ? (
        <div>
          <h2 className="mb-1 text-sm font-semibold text-muted-foreground">
            Observações
          </h2>
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {provaRow.observacoes}
          </p>
        </div>
      ) : null}

      <ProvaActions
        id={provaRow.id}
        situacao={provaRow.situacao}
        cancelada={provaRow.cancelada}
        resultado={provaRow.resultado}
        dataPassada={dataPassada}
      />
    </div>
  );
}
