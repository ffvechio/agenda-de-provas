import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: sessao } = await supabase.auth.getUser();
  if (!sessao.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const [{ data: perfil }, { data: provas }] = await Promise.all([
    supabase.from("profiles").select("*").maybeSingle(),
    supabase.from("provas").select("*, prova_etapas(*)"),
  ]);

  const exportacao = {
    geradoEm: new Date().toISOString(),
    conta: { email: sessao.user.email, id: sessao.user.id },
    perfil,
    provas,
  };

  return new NextResponse(JSON.stringify(exportacao, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="minha-agenda-de-provas.json"',
    },
  });
}
