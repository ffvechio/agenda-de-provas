/**
 * Garante que um destino de redirecionamento pós-login seja um caminho
 * interno do próprio app — nunca uma URL absoluta ou protocol-relative,
 * para não permitir open redirect via ?redirect=.
 */
export function destinoSeguro(
  valor: string | null | undefined,
  fallback = "/inicio"
): string {
  if (!valor) return fallback;
  if (!valor.startsWith("/")) return fallback;
  if (valor.startsWith("//")) return fallback;
  if (valor.includes("://")) return fallback;
  return valor;
}
