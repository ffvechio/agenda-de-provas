import { afterEach, describe, expect, it, vi } from "vitest";
import {
  diasEntre,
  diasRestantes,
  formatarDataBr,
  formatarHorario,
  hojeNoFuso,
} from "./formato";

describe("formatarDataBr", () => {
  it("formata YYYY-MM-DD como DD/MM/AAAA sem passar por Date/UTC", () => {
    expect(formatarDataBr("2026-03-05")).toBe("05/03/2026");
  });
});

describe("diasEntre", () => {
  it("calcula a diferença de dias dentro do mesmo mês", () => {
    expect(diasEntre("2026-03-01", "2026-03-05")).toBe(4);
  });

  it("calcula corretamente atravessando a virada de mês", () => {
    expect(diasEntre("2026-01-29", "2026-02-02")).toBe(4);
  });

  it("calcula corretamente atravessando a virada de ano", () => {
    expect(diasEntre("2025-12-29", "2026-01-03")).toBe(5);
  });

  it("retorna negativo quando a data final é anterior", () => {
    expect(diasEntre("2026-03-05", "2026-03-01")).toBe(-4);
  });
});

describe("hojeNoFuso", () => {
  it("usa o fuso para determinar a data de calendário, não o dia em UTC", () => {
    // 2026-01-01T01:00:00Z: em UTC já é dia 1º de janeiro, mas em
    // America/Sao_Paulo (UTC-3) ainda é 31 de dezembro de 2025.
    const instante = new Date("2026-01-01T01:00:00Z");
    expect(hojeNoFuso("UTC", instante)).toBe("2026-01-01");
    expect(hojeNoFuso("America/Sao_Paulo", instante)).toBe("2025-12-31");
  });
});

describe("diasRestantes", () => {
  afterEach(() => vi.useRealTimers());

  it("conta 5 dias de calendário atravessando ano novo, no fuso do atleta", () => {
    vi.useFakeTimers();
    // 2026-01-01T01:00:00Z ainda é 31/12/2025 às 22h em America/Sao_Paulo.
    vi.setSystemTime(new Date("2026-01-01T01:00:00Z"));
    expect(diasRestantes("2026-01-05", "America/Sao_Paulo")).toBe(5);
  });

  it("retorna 0 no dia da prova", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T10:00:00Z"));
    expect(diasRestantes("2026-03-10", "UTC")).toBe(0);
  });
});

describe("formatarHorario", () => {
  it("corta segundos de um horário HH:MM:SS", () => {
    expect(formatarHorario("07:30:00")).toBe("07:30");
  });

  it("retorna null para valores vazios", () => {
    expect(formatarHorario(null)).toBeNull();
    expect(formatarHorario(undefined)).toBeNull();
  });
});
