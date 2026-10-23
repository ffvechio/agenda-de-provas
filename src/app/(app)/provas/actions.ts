"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { provaSchema, type ProvaInput } from "@/lib/provas/schemas";

export type SalvarProvaResult = { message: string } | void;

function paraPayloadSql(dados: ReturnType<typeof provaSchema.parse>) {
  return {
    nome: dados.nome,
    data: dados.data,
    modalidade: dados.modalidade,
    modalidade_outra: dados.modalidadeOutra ?? "",
    distancia_valor: dados.distanciaValor ?? null,
    distancia_unidade: dados.distanciaUnidade ?? "",
    cidade: dados.cidade,
    estado: dados.estado,
    pais: dados.pais,
    situacao: dados.situacao,
    horario_largada: dados.horarioLargada ?? "",
    local: dados.local ?? "",
    link_oficial: dados.linkOficial ?? "",
    observacoes: dados.observacoes ?? "",
    desnivel_positivo_m: dados.desnivelPositivoM ?? null,
    notificar_interesse: dados.notificarInteresse,
  };
}

function paraEtapasSql(dados: ReturnType<typeof provaSchema.parse>) {
  return dados.etapas.map((etapa, index) => ({
    ordem: index + 1,
    modalidade: etapa.modalidade,
    distancia_valor: etapa.distanciaValor,
    distancia_unidade: etapa.distanciaUnidade,
  }));
}

export async function criarProva(input: ProvaInput): Promise<SalvarProvaResult> {
  const parsed = provaSchema.safeParse(input);
  if (!parsed.success) {
    return { message: "Verifique os campos do formulário." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("salvar_prova_com_etapas", {
    p_id: null,
    p_dados: paraPayloadSql(parsed.data),
    p_etapas: paraEtapasSql(parsed.data),
  });

  if (error || !data) {
    return { message: "Não foi possível salvar a prova. Tente novamente." };
  }

  revalidatePath("/provas");
  revalidatePath("/inicio");
  redirect(`/provas/${data}`);
}

export async function atualizarProva(
  id: string,
  input: ProvaInput
): Promise<SalvarProvaResult> {
  const parsed = provaSchema.safeParse(input);
  if (!parsed.success) {
    return { message: "Verifique os campos do formulário." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("salvar_prova_com_etapas", {
    p_id: id,
    p_dados: paraPayloadSql(parsed.data),
    p_etapas: paraEtapasSql(parsed.data),
  });

  if (error) {
    return { message: "Não foi possível salvar a prova. Tente novamente." };
  }

  revalidatePath("/provas");
  revalidatePath(`/provas/${id}`);
  revalidatePath("/inicio");
  redirect(`/provas/${id}`);
}

export async function excluirProva(id: string): Promise<SalvarProvaResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("provas").delete().eq("id", id);

  if (error) {
    return { message: "Não foi possível excluir a prova." };
  }

  revalidatePath("/provas");
  revalidatePath("/inicio");
  redirect("/provas");
}

export async function definirCancelamento(
  id: string,
  cancelada: boolean
): Promise<SalvarProvaResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("provas")
    .update({ cancelada })
    .eq("id", id);

  if (error) {
    return { message: "Não foi possível atualizar a prova." };
  }

  revalidatePath("/provas");
  revalidatePath(`/provas/${id}`);
  revalidatePath("/inicio");
}

export async function definirSituacaoInscrito(id: string): Promise<SalvarProvaResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("provas")
    .update({ situacao: "inscrito" })
    .eq("id", id);

  if (error) {
    return { message: "Não foi possível atualizar a prova." };
  }

  revalidatePath("/provas");
  revalidatePath(`/provas/${id}`);
  revalidatePath("/inicio");
}

export async function definirResultado(
  id: string,
  resultado: "concluida" | "nao_largou" | "nao_concluiu" | null
): Promise<SalvarProvaResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("provas")
    .update({ resultado })
    .eq("id", id);

  if (error) {
    return { message: "Não foi possível atualizar o resultado." };
  }

  revalidatePath("/provas");
  revalidatePath(`/provas/${id}`);
}

export async function buscarPossiveisDuplicatas(
  nome: string,
  data: string,
  idExcluido?: string
): Promise<Array<{ id: string; nome: string; data: string }>> {
  const nomeNormalizado = nome.trim();
  if (!nomeNormalizado || !data) return [];

  const supabase = await createClient();
  let query = supabase
    .from("provas")
    .select("id, nome, data")
    .ilike("nome", nomeNormalizado)
    .eq("data", data);

  if (idExcluido) {
    query = query.neq("id", idExcluido);
  }

  const { data: linhas } = await query;
  return linhas ?? [];
}
