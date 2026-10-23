/**
 * Normalização de e-mail: remove espaços nas extremidades e uniformiza
 * caixa (maiúsculas/minúsculas). Propositalmente NÃO removemos pontos nem
 * sufixos "+algo" — regras específicas de alguns provedores (ex.: Gmail)
 * não são universais e removê-los poderia unir contas de pessoas diferentes
 * em outros provedores.
 */
export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normaliza a senha para a forma Unicode NFC antes de enviar ao Supabase
 * Auth. Sem isso, dois caracteres visualmente idênticos (ex.: "á" digitado
 * como um único code point vs. "a" + acento combinante — algo que varia
 * entre teclado, método de entrada, autofill do navegador/gerenciador de
 * senhas) geram bytes diferentes e o GoTrue compara a senha byte a byte,
 * então um login com uma senha "igual" à cadastrada pode falhar
 * silenciosamente. Aplicado em todo fluxo que envia senha ao Supabase:
 * cadastro, login, redefinição e troca de senha.
 */
export function normalizarSenha(senha: string): string {
  return senha.normalize("NFC");
}

/** Política de senha do produto (ver docs/ARQUITETURA.md). */
export const POLITICA_SENHA = {
  minimo: 12,
  // O Supabase Auth usa bcrypt, que processa no máximo 72 bytes de senha —
  // além disso o restante é ignorado. Para não truncar silenciosamente,
  // rejeitamos no formulário qualquer senha acima desse limite.
  maximo: 72,
} as const;

export function dataNascimentoValida(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const data = new Date(`${valor}T00:00:00Z`);
  if (Number.isNaN(data.getTime())) return false;
  const hoje = new Date();
  const hojeUtc = new Date(
    Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate())
  );
  return data.getTime() <= hojeUtc.getTime();
}
