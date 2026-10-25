import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { labelModalidade } from "@/lib/provas/constantes";
import { formatarDataBr } from "@/lib/datas/formato";
import { cn } from "cn";
import type { ProvaRow } from "@/lib/provas/types";

export function ProvaCard({ prova }: { prova: Pick<ProvaRow,
  "id" | "nome" | "data" | "modalidade" | "modalidade_outra" |
  "distancia_valor" | "distancia_unidade" | "cidade" | "estado" |
  "situacao" | "cancelada"
> }) {
  const distancia = prova.distancia_valor
    ? `${prova.distancia_valor} ${prova.distancia_unidade}`
    : "Multisport";

  return (
    <Link
      href={`/provas/${prova.id}`}
      className={cn(
        "group/prova-card relative flex flex-col gap-2 overflow-hidden rounded-2xl border bg-card p-4 pl-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-1.5",
          prova.cancelada
            ? "bg-destructive/60"
            : prova.situacao === "inscrito"
              ? "bg-primary"
              : "bg-muted-foreground/40"
        )}
      />
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-card-foreground">{prova.nome}</h3>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          {prova.cancelada ? (
            <Badge variant="destructive">Cancelada</Badge>
          ) : (
            <Badge variant={prova.situacao === "inscrito" ? "default" : "secondary"}>
              {prova.situacao === "inscrito" ? "Inscrito" : "Interesse"}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          {formatarDataBr(prova.data)}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="size-3.5" aria-hidden="true" />
          {prova.cidade}, {prova.estado}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>{labelModalidade(prova.modalidade, prova.modalidade_outra)}</span>
        <span aria-hidden="true">·</span>
        <span className="font-mono text-foreground">{distancia}</span>
      </div>
    </Link>
  );
}
