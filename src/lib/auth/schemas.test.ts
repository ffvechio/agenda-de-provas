import { describe, expect, it, vi, afterEach } from "vitest";
import { cadastroSchema, loginSchema } from "./schemas";

const senhaValida = "minhaFraseSenhaForte123";

describe("cadastroSchema", () => {
  afterEach(() => vi.useRealTimers());

  function dadosValidos() {
    return {
      nome: "Maria Atleta",
      dataNascimento: "1990-01-01",
      email: "  Maria@Exemplo.com ",
      senha: senhaValida,
      confirmarSenha: senhaValida,
    };
  }

  it("aceita dados válidos e normaliza o e-mail", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
    const resultado = cadastroSchema.safeParse(dadosValidos());
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.email).toBe("maria@exemplo.com");
    }
  });

  it("rejeita senha menor que 12 caracteres", () => {
    const resultado = cadastroSchema.safeParse({
      ...dadosValidos(),
      senha: "curta123",
      confirmarSenha: "curta123",
    });
    expect(resultado.success).toBe(false);
  });

  it("rejeita quando a confirmação não bate com a senha", () => {
    const resultado = cadastroSchema.safeParse({
      ...dadosValidos(),
      confirmarSenha: senhaValida + "x",
    });
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues.some((i) => i.path.includes("confirmarSenha"))).toBe(true);
    }
  });

  it("rejeita data de nascimento futura", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
    const resultado = cadastroSchema.safeParse({
      ...dadosValidos(),
      dataNascimento: "2026-06-16",
    });
    expect(resultado.success).toBe(false);
  });

  it("rejeita e-mail inválido", () => {
    const resultado = cadastroSchema.safeParse({
      ...dadosValidos(),
      email: "não-é-email",
    });
    expect(resultado.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("exige e-mail e senha não vazios", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", senha: "qualquer" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "a@b.com", senha: "" }).success).toBe(false);
  });
});
