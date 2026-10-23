import type { Metadata } from "next";
import { ProvaForm } from "@/components/provas/prova-form";
import { provaFormPadrao } from "@/lib/provas/form-defaults";
import { criarProva } from "../actions";

export const metadata: Metadata = { title: "Nova prova" };

export default function NovaProvaPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-foreground">Nova prova</h1>
      <ProvaForm valoresIniciais={provaFormPadrao} aoSalvar={criarProva} />
    </div>
  );
}
