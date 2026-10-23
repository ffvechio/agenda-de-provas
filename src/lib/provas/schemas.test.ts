import { describe, expect, it } from "vitest";
import { provaSchema } from "./schemas";

function base() {
  return {
    nome: "Meia Maratona da Cidade",
    data: "2026-09-20",
    modalidade: "corrida_rua" as const,
    modalidadeOutra: "",
    distanciaValor: 21.1,
    distanciaUnidade: "km" as const,
    cidade: "São Paulo",
    estado: "SP",
    pais: "Brasil",
    situacao: "inscrito" as const,
    horarioLargada: "",
    local: "",
    linkOficial: "",
    observacoes: "",
    desnivelPositivoM: undefined,
    notificarInteresse: false,
    etapas: [],
  };
}

describe("provaSchema — modalidade única", () => {
  it("aceita quando distância e unidade estão preenchidas", () => {
    expect(provaSchema.safeParse(base()).success).toBe(true);
  });

  it("rejeita sem distância", () => {
    const resultado = provaSchema.safeParse({
      ...base(),
      distanciaValor: undefined,
      distanciaUnidade: undefined,
    });
    expect(resultado.success).toBe(false);
  });

  it("rejeita distância negativa ou zero", () => {
    expect(provaSchema.safeParse({ ...base(), distanciaValor: 0 }).success).toBe(false);
    expect(provaSchema.safeParse({ ...base(), distanciaValor: -5 }).success).toBe(false);
  });
});

describe("provaSchema — modalidade outra", () => {
  it("exige o nome da modalidade quando 'outra'", () => {
    const resultado = provaSchema.safeParse({
      ...base(),
      modalidade: "outra",
      modalidadeOutra: "",
    });
    expect(resultado.success).toBe(false);
  });

  it("aceita quando o nome é informado", () => {
    const resultado = provaSchema.safeParse({
      ...base(),
      modalidade: "outra",
      modalidadeOutra: "Corrida de montanha",
    });
    expect(resultado.success).toBe(true);
  });
});

describe("provaSchema — multisport", () => {
  it("rejeita triatlon com menos de 2 etapas", () => {
    const resultado = provaSchema.safeParse({
      ...base(),
      modalidade: "triatlon",
      distanciaValor: undefined,
      distanciaUnidade: undefined,
      etapas: [{ ordem: 1, modalidade: "Natação", distanciaValor: 1.5, distanciaUnidade: "km" }],
    });
    expect(resultado.success).toBe(false);
  });

  it("aceita triatlon com etapas completas", () => {
    const resultado = provaSchema.safeParse({
      ...base(),
      modalidade: "triatlon",
      distanciaValor: undefined,
      distanciaUnidade: undefined,
      etapas: [
        { ordem: 1, modalidade: "Natação", distanciaValor: 1.5, distanciaUnidade: "km" },
        { ordem: 2, modalidade: "Ciclismo", distanciaValor: 40, distanciaUnidade: "km" },
        { ordem: 3, modalidade: "Corrida", distanciaValor: 10, distanciaUnidade: "km" },
      ],
    });
    expect(resultado.success).toBe(true);
  });
});

describe("provaSchema — link oficial", () => {
  it("rejeita links sem protocolo http(s)", () => {
    const resultado = provaSchema.safeParse({ ...base(), linkOficial: "www.prova.com" });
    expect(resultado.success).toBe(false);
  });

  it("aceita link vazio (opcional)", () => {
    expect(provaSchema.safeParse({ ...base(), linkOficial: "" }).success).toBe(true);
  });

  it("aceita link https válido", () => {
    expect(
      provaSchema.safeParse({ ...base(), linkOficial: "https://prova.com.br" }).success
    ).toBe(true);
  });
});
