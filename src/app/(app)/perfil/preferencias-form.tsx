"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FUSOS_SUPORTADOS } from "@/lib/datas/fusos";
import { atualizarFusoLembretes, atualizarNotificacoesAtivas } from "./actions";

export function PreferenciasForm({
  fusoInicial,
  notificacoesAtivasInicial,
}: {
  fusoInicial: string;
  notificacoesAtivasInicial: boolean;
}) {
  const [fuso, setFuso] = useState(fusoInicial);
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(notificacoesAtivasInicial);
  const [salvando, setSalvando] = useState(false);

  async function handleFusoChange(valor: string) {
    setFuso(valor);
    setSalvando(true);
    await atualizarFusoLembretes(valor);
    setSalvando(false);
  }

  async function handleNotificacoesChange(valor: boolean) {
    setNotificacoesAtivas(valor);
    setSalvando(true);
    await atualizarNotificacoesAtivas(valor);
    setSalvando(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>Fuso horário dos lembretes</Label>
        <Select value={fuso} onValueChange={handleFusoChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FUSOS_SUPORTADOS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between rounded-xl border p-3">
        <div>
          <Label htmlFor="notificacoes-ativas">Lembretes de prova</Label>
          <p className="text-sm text-muted-foreground">
            Receber lembrete 5 dias antes de cada prova confirmada.
          </p>
        </div>
        <Switch
          id="notificacoes-ativas"
          checked={notificacoesAtivas}
          onCheckedChange={handleNotificacoesChange}
        />
      </div>

      {salvando ? (
        <p className="text-xs text-muted-foreground" role="status">
          Salvando...
        </p>
      ) : null}
    </div>
  );
}
