export type Situacao = "interesse" | "inscrito";
export type Resultado = "concluida" | "nao_largou" | "nao_concluiu" | null;

export type EtapaRow = {
  id: string;
  prova_id: string;
  ordem: number;
  modalidade: string;
  distancia_valor: number;
  distancia_unidade: "km" | "m";
};

export type ProvaRow = {
  id: string;
  user_id: string;
  nome: string;
  data: string;
  modalidade: string;
  modalidade_outra: string | null;
  distancia_valor: number | null;
  distancia_unidade: "km" | "m" | null;
  cidade: string;
  estado: string;
  pais: string;
  situacao: Situacao;
  cancelada: boolean;
  resultado: Resultado;
  horario_largada: string | null;
  local: string | null;
  link_oficial: string | null;
  observacoes: string | null;
  desnivel_positivo_m: number | null;
  notificar_interesse: boolean;
  schedule_version: number;
  created_at: string;
  updated_at: string;
  prova_etapas?: EtapaRow[];
};
