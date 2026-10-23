import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProvaForm } from "@/components/provas/prova-form";
import { provaRowParaFormulario } from "@/lib/provas/form-defaults";
import type { ProvaRow } from "@/lib/provas/types";
import { atualizarProva } from "../../actions";

export const metadata: Metadata = { title: "Editar prova" };

export default async function EditarProvaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: prova } = await supabase
    .from("provas")
    .select("*, prova_etapas(*)")
    .eq("id", id)
    .maybeSingle();

  if (!prova) notFound();

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-foreground">Editar prova</h1>
      <ProvaForm
        valoresIniciais={provaRowParaFormulario(prova as ProvaRow)}
        provaId={id}
        aoSalvar={atualizarProva.bind(null, id)}
      />
    </div>
  );
}
