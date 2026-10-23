"use client";

import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { buscarPossiveisDuplicatas } from "@/app/(app)/provas/actions";
import { formatarDataBr } from "@/lib/datas/formato";

export function DuplicidadeAviso({
  nome,
  data,
  idExcluido,
}: {
  nome: string;
  data: string;
  idExcluido?: string;
}) {
  const [duplicatas, setDuplicatas] = useState<
    Array<{ id: string; nome: string; data: string }>
  >([]);

  useEffect(() => {
    if (!nome.trim() || !data) return;
    let cancelado = false;
    const timeout = setTimeout(() => {
      buscarPossiveisDuplicatas(nome, data, idExcluido).then((resultado) => {
        if (!cancelado) setDuplicatas(resultado);
      });
    }, 500);
    return () => {
      cancelado = true;
      clearTimeout(timeout);
    };
  }, [nome, data, idExcluido]);

  if (!nome.trim() || !data || duplicatas.length === 0) return null;

  return (
    <div className="flex gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
      <TriangleAlert className="size-4 shrink-0 translate-y-0.5" aria-hidden="true" />
      <p>
        Você já tem uma prova chamada &quot;{duplicatas[0].nome}&quot; em{" "}
        {formatarDataBr(duplicatas[0].data)}. Pode continuar se for mesmo uma
        prova diferente.
      </p>
    </div>
  );
}
