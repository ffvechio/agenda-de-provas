"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MODALIDADES } from "@/lib/provas/constantes";
import { hojeNoFuso } from "@/lib/datas/formato";
import { ProvaCard } from "./prova-card";
import { ProvasCalendario } from "./provas-calendario";
import type { ProvaRow } from "@/lib/provas/types";

type FiltroPeriodo = "proximas" | "passadas" | "todas";
type FiltroSituacao = "todas" | "interesse" | "inscrito";

export function ProvasExplorer({
  provas,
  fuso,
}: {
  provas: ProvaRow[];
  fuso: string;
}) {
  const [busca, setBusca] = useState("");
  const [modalidade, setModalidade] = useState<string>("todas");
  const [situacao, setSituacao] = useState<FiltroSituacao>("todas");
  const [periodo, setPeriodo] = useState<FiltroPeriodo>("proximas");

  const hoje = useMemo(() => hojeNoFuso(fuso), [fuso]);

  const filtradas = useMemo(() => {
    return provas.filter((p) => {
      if (busca.trim() && !p.nome.toLowerCase().includes(busca.trim().toLowerCase())) {
        return false;
      }
      if (modalidade !== "todas" && p.modalidade !== modalidade) return false;
      if (situacao !== "todas" && p.situacao !== situacao) return false;
      if (periodo === "proximas" && p.data < hoje) return false;
      if (periodo === "passadas" && p.data >= hoje) return false;
      return true;
    });
  }, [provas, busca, modalidade, situacao, periodo, hoje]);

  const ordenadas = useMemo(() => {
    const copia = [...filtradas];
    copia.sort((a, b) =>
      periodo === "passadas" ? b.data.localeCompare(a.data) : a.data.localeCompare(b.data)
    );
    return copia;
  }, [filtradas, periodo]);

  return (
    <Tabs defaultValue="lista" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-foreground">Minhas provas</h1>
        <TabsList>
          <TabsTrigger value="lista">Lista</TabsTrigger>
          <TabsTrigger value="calendario">Calendário</TabsTrigger>
        </TabsList>
      </div>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar pelo nome da prova"
          className="pl-9"
          aria-label="Buscar provas pelo nome"
        />
      </div>

      <div className="flex gap-2">
        <Select value={periodo} onValueChange={(v) => setPeriodo(v as FiltroPeriodo)}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="proximas">Próximas</SelectItem>
            <SelectItem value="passadas">Passadas</SelectItem>
            <SelectItem value="todas">Todas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={situacao} onValueChange={(v) => setSituacao(v as FiltroSituacao)}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Qualquer situação</SelectItem>
            <SelectItem value="inscrito">Inscrito</SelectItem>
            <SelectItem value="interesse">Interesse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Select value={modalidade} onValueChange={setModalidade}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas as modalidades</SelectItem>
          {MODALIDADES.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <TabsContent value="lista" className="flex flex-col gap-3">
        {ordenadas.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhuma prova encontrada com esses filtros.
          </p>
        ) : (
          ordenadas.map((prova) => <ProvaCard key={prova.id} prova={prova} />)
        )}
      </TabsContent>

      <TabsContent value="calendario">
        <ProvasCalendario provas={filtradas} />
      </TabsContent>
    </Tabs>
  );
}
