import { describe, expect, it, afterEach, vi } from "vitest";
import {
  dataNascimentoValida,
  normalizarEmail,
  normalizarSenha,
  POLITICA_SENHA,
} from "./validacao";

describe("normalizarEmail", () => {
  it("remove espaços nas extremidades", () => {
    expect(normalizarEmail("  atleta@exemplo.com  ")).toBe("atleta@exemplo.com");
  });

  it("converte para minúsculas", () => {
    expect(normalizarEmail("Atleta@Exemplo.COM")).toBe("atleta@exemplo.com");
  });

  it("não remove pontos nem sufixos +algo (diferente da regra do Gmail)", () => {
    expect(normalizarEmail("Nome.Sobrenome+corrida@exemplo.com")).toBe(
      "nome.sobrenome+corrida@exemplo.com"
    );
  });
});

describe("dataNascimentoValida", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("aceita datas passadas", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
    expect(dataNascimentoValida("1990-05-20")).toBe(true);
  });

  it("aceita a data de hoje", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
    expect(dataNascimentoValida("2026-06-15")).toBe(true);
  });

  it("rejeita datas futuras", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
    expect(dataNascimentoValida("2026-06-16")).toBe(false);
  });

  it("rejeita formato inválido", () => {
    expect(dataNascimentoValida("15/06/2026")).toBe(false);
    expect(dataNascimentoValida("not-a-date")).toBe(false);
  });
});

describe("normalizarSenha", () => {
  it("trata formas NFC e NFD do mesmo caractere acentuado como a mesma senha", () => {
    // "á" como 1 code point (NFC) vs "a" + acento agudo combinante (NFD) —
    // visualmente idênticos, mas strings JS diferentes até normalizar.
    // Bug real: o GoTrue compara a senha byte a byte, sem normalizar, então
    // cadastrar com uma forma e logar com a outra falhava silenciosamente.
    const nfc = "Senha123!ácil";
    const nfd = "Senha123!a" + "́" + "cil";
    expect(nfc).not.toBe(nfd);
    expect(normalizarSenha(nfc)).toBe(normalizarSenha(nfd));
  });

  it("não altera senhas que já estão em NFC", () => {
    expect(normalizarSenha("SenhaForte123!")).toBe("SenhaForte123!");
  });
});

describe("POLITICA_SENHA", () => {
  it("exige ao menos 12 caracteres e documenta o máximo de 72", () => {
    expect(POLITICA_SENHA.minimo).toBe(12);
    expect(POLITICA_SENHA.maximo).toBe(72);
  });
});
