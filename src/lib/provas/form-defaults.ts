import type { ProvaRow } from "./types";
import type { ProvaInput } from "./schemas";

export const provaFormPadrao: ProvaInput = {
  nome: "",
  data: "",
  modalidade: "corrida_rua",
  modalidadeOutra: "",
  distanciaValor: undefined,
  distanciaUnidade: "km",
  cidade: "",
  estado: "",
  pais: "Brasil",
  situacao: "interesse",
  horarioLargada: "",
  local: "",
  linkOficial: "",
  observacoes: "",
  desnivelPositivoM: undefined,
  notificarInteresse: false,
  etapas: [],
};

export function provaRowParaFormulario(prova: ProvaRow): ProvaInput {
  return {
    nome: prova.nome,
    data: prova.data,
    modalidade: prova.modalidade as ProvaInput["modalidade"],
    modalidadeOutra: prova.modalidade_outra ?? "",
    distanciaValor: prova.distancia_valor ?? undefined,
    distanciaUnidade: prova.distancia_unidade ?? "km",
    cidade: prova.cidade,
    estado: prova.estado,
    pais: prova.pais,
    situacao: prova.situacao,
    horarioLargada: prova.horario_largada?.slice(0, 5) ?? "",
    local: prova.local ?? "",
    linkOficial: prova.link_oficial ?? "",
    observacoes: prova.observacoes ?? "",
    desnivelPositivoM: prova.desnivel_positivo_m ?? undefined,
    notificarInteresse: prova.notificar_interesse,
    etapas: (prova.prova_etapas ?? [])
      .slice()
      .sort((a, b) => a.ordem - b.ordem)
      .map((etapa) => ({
        ordem: etapa.ordem,
        modalidade: etapa.modalidade,
        distanciaValor: etapa.distancia_valor,
        distanciaUnidade: etapa.distancia_unidade,
      })),
  };
}
