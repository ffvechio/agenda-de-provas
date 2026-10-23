"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/password-input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { excluirConta } from "./actions";

export function ExcluirContaDialog() {
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  async function handleConfirmar(event: React.MouseEvent) {
    event.preventDefault();
    setMensagem(null);
    setExcluindo(true);
    const resultado = await excluirConta(senha);
    setExcluindo(false);
    if (resultado && "message" in resultado) {
      setMensagem(resultado.message);
    }
  }

  return (
    <AlertDialog
      onOpenChange={(open) => {
        if (!open) {
          setSenha("");
          setMensagem(null);
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="h-11 w-full text-destructive hover:text-destructive">
          <Trash2 className="size-4" aria-hidden="true" />
          Excluir minha conta
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir sua conta?</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação é permanente. Todas as suas provas, preferências e
            inscrições para notificações serão removidas. Confirme sua senha
            para continuar.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="senha-exclusao">Senha</Label>
          <PasswordInput
            id="senha-exclusao"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          {mensagem ? (
            <p role="alert" className="text-sm text-destructive">
              {mensagem}
            </p>
          ) : null}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={!senha || excluindo}
            onClick={handleConfirmar}
          >
            {excluindo ? "Excluindo..." : "Excluir permanentemente"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
