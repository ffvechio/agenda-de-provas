"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RESULTADOS } from "@/lib/provas/constantes";
import type { Resultado, Situacao } from "@/lib/provas/types";
import {
  definirCancelamento,
  definirResultado,
  definirSituacaoInscrito,
  excluirProva,
} from "@/app/(app)/provas/actions";

export function ProvaActions({
  id,
  situacao,
  cancelada,
  resultado,
  dataPassada,
}: {
  id: string;
  situacao: Situacao;
  cancelada: boolean;
  resultado: Resultado;
  dataPassada: boolean;
}) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);

  async function executar(acao: () => Promise<unknown>) {
    setCarregando(true);
    try {
      await acao();
      router.refresh();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button asChild variant="outline" className="flex-1 h-11">
          <Link href={`/provas/${id}/editar`}>
            <Pencil className="size-4" aria-hidden="true" />
            Editar
          </Link>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="h-11 text-destructive hover:text-destructive">
              <Trash2 className="size-4" aria-hidden="true" />
              Excluir
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir esta prova?</AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não pode ser desfeita. Os dados da prova e seus
                lembretes agendados serão removidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-700 text-white hover:bg-red-800"
                onClick={() => executar(() => excluirProva(id))}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {situacao === "interesse" && !cancelada ? (
        <Button
          variant="secondary"
          disabled={carregando}
          onClick={() => executar(() => definirSituacaoInscrito(id))}
        >
          Marcar inscrição como confirmada
        </Button>
      ) : null}

      {!cancelada ? (
        <Button
          variant="outline"
          disabled={carregando}
          onClick={() => executar(() => definirCancelamento(id, true))}
        >
          Cancelar participação
        </Button>
      ) : (
        <Button
          variant="outline"
          disabled={carregando}
          onClick={() => executar(() => definirCancelamento(id, false))}
        >
          Reativar participação
        </Button>
      )}

      {dataPassada ? (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Como foi essa prova?
          </span>
          <Select
            value={resultado ?? "nenhum"}
            onValueChange={(valor) =>
              executar(() =>
                definirResultado(
                  id,
                  valor === "nenhum" ? null : (valor as Exclude<Resultado, null>)
                )
              )
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Registrar resultado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nenhum">Sem registro</SelectItem>
              {RESULTADOS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  );
}
