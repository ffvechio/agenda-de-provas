"use client";

import { useMemo, useState } from "react";
import { ptBR } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import { ProvaCard } from "./prova-card";
import type { ProvaRow } from "@/lib/provas/types";

function dataParaIsoLocal(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function ProvasCalendario({ provas }: { provas: ProvaRow[] }) {
  const [selecionada, setSelecionada] = useState<Date | undefined>(undefined);

  const datasComProva = useMemo(
    () => new Set(provas.map((p) => p.data)),
    [provas]
  );

  const provasDoDia = useMemo(() => {
    if (!selecionada) return [];
    const iso = dataParaIsoLocal(selecionada);
    return provas.filter((p) => p.data === iso);
  }, [provas, selecionada]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Calendar
        mode="single"
        locale={ptBR}
        selected={selecionada}
        onSelect={setSelecionada}
        modifiers={{
          comProva: (data) => datasComProva.has(dataParaIsoLocal(data)),
        }}
        modifiersClassNames={{
          comProva: "after:absolute after:bottom-1 after:size-1.5 after:rounded-full after:bg-primary",
        }}
        className="rounded-xl border"
      />
      {selecionada ? (
        <div className="flex w-full flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            {provasDoDia.length === 0
              ? "Nenhuma prova neste dia."
              : `${provasDoDia.length} prova(s) neste dia`}
          </p>
          {provasDoDia.map((prova) => (
            <ProvaCard key={prova.id} prova={prova} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
