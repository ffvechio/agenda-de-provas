import { describe, expect, it } from "vitest";
import { destinoSeguro } from "./redirect-seguro";

describe("destinoSeguro", () => {
  it("aceita caminhos internos", () => {
    expect(destinoSeguro("/provas/123")).toBe("/provas/123");
  });

  it("usa o fallback quando vazio ou ausente", () => {
    expect(destinoSeguro(undefined)).toBe("/inicio");
    expect(destinoSeguro(null)).toBe("/inicio");
    expect(destinoSeguro("")).toBe("/inicio");
  });

  it("bloqueia URLs absolutas (open redirect)", () => {
    expect(destinoSeguro("https://evil.com")).toBe("/inicio");
    expect(destinoSeguro("http://evil.com/phishing")).toBe("/inicio");
  });

  it("bloqueia URLs protocol-relative (//)", () => {
    expect(destinoSeguro("//evil.com")).toBe("/inicio");
  });

  it("bloqueia caminhos sem barra inicial", () => {
    expect(destinoSeguro("entrar")).toBe("/inicio");
  });

  it("respeita um fallback customizado", () => {
    expect(destinoSeguro(undefined, "/perfil")).toBe("/perfil");
  });
});
