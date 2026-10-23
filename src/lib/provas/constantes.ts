export const MODALIDADES = [
  { value: "corrida_rua", label: "Corrida de rua" },
  { value: "trail_running", label: "Trail running" },
  { value: "ultramaratona", label: "Ultramaratona" },
  { value: "triatlon", label: "Triatlon" },
  { value: "duatlon", label: "Duatlon" },
  { value: "aquatlon", label: "Aquatlon" },
  { value: "outra", label: "Outra" },
] as const;

export type Modalidade = (typeof MODALIDADES)[number]["value"];

export const MODALIDADES_MULTIETAPA: readonly Modalidade[] = [
  "triatlon",
  "duatlon",
  "aquatlon",
];

export function ehMultietapa(modalidade: string): boolean {
  return (MODALIDADES_MULTIETAPA as readonly string[]).includes(modalidade);
}

export function labelModalidade(modalidade: string, outra?: string | null): string {
  if (modalidade === "outra") return outra?.trim() || "Outra";
  return MODALIDADES.find((m) => m.value === modalidade)?.label ?? modalidade;
}

export const ETAPAS_SUGERIDAS = [
  { value: "natacao", label: "Natação" },
  { value: "ciclismo", label: "Ciclismo" },
  { value: "corrida", label: "Corrida" },
] as const;

export const UNIDADES_DISTANCIA = [
  { value: "km", label: "km" },
  { value: "m", label: "m" },
] as const;

export const SITUACOES = [
  { value: "interesse", label: "Tenho interesse" },
  { value: "inscrito", label: "Inscrição confirmada" },
] as const;

export const RESULTADOS = [
  { value: "concluida", label: "Concluída" },
  { value: "nao_largou", label: "Não largou" },
  { value: "nao_concluiu", label: "Não concluiu" },
] as const;
