/**
 * Configuração central de identidade do produto.
 * Alterar nome, descrição ou cores aqui propaga para metadata, manifest
 * PWA e textos estáticos que importam deste módulo.
 */
export const brand = {
  nomeApp: "Minha Agenda de Provas",
  nomeCurto: "Agenda de Provas",
  descricaoApp:
    "Organize seu calendário pessoal de provas de corrida, trail, ultramaratona, triatlon e mais.",
  corPrimaria: "#c2410c",
  corPrimariaClara: "#f97316",
  corFundo: "#ffffff",
  localeTag: "pt-BR",
  idiomaHtml: "pt-BR",
} as const;

export const defaultsAplicacao = {
  paisPadrao: "Brasil",
  fusoLembretesPadrao: "America/Sao_Paulo",
  horarioLembreteHora: 9,
  diasAntesLembrete: 5,
} as const;
