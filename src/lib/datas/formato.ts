/**
 * Utilitários de data que tratam "YYYY-MM-DD" como data de calendário pura,
 * nunca como um instante UTC — evita o bug clássico de exibir o dia errado
 * por causa da conversão de fuso horário local no `new Date(string)`.
 */

export function formatarDataBr(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function diasEntre(dataIsoInicio: string, dataIsoFim: string): number {
  const [anoA, mesA, diaA] = dataIsoInicio.split("-").map(Number);
  const [anoB, mesB, diaB] = dataIsoFim.split("-").map(Number);
  const utcA = Date.UTC(anoA, mesA - 1, diaA);
  const utcB = Date.UTC(anoB, mesB - 1, diaB);
  return Math.round((utcB - utcA) / 86_400_000);
}

/** Data de calendário "hoje" (YYYY-MM-DD) em um fuso horário específico. */
export function hojeNoFuso(fuso: string, agora: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: fuso,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(agora);
}

export function diasRestantes(dataProva: string, fuso: string): number {
  return diasEntre(hojeNoFuso(fuso), dataProva);
}

export function formatarHorario(horario: string | null | undefined): string | null {
  if (!horario) return null;
  return horario.slice(0, 5);
}
