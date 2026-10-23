import { z } from "zod";
import {
  POLITICA_SENHA,
  dataNascimentoValida,
  normalizarEmail,
  normalizarSenha,
} from "./validacao";

// Normaliza para NFC ANTES de validar o tamanho — ver normalizarSenha().
// A mesma transformação é aplicada em qualquer campo de senha que acabe
// sendo comparado ou enviado ao Supabase Auth (login, confirmação,
// senha atual), não só aqui.
const senhaSchema = z
  .string()
  .transform(normalizarSenha)
  .pipe(
    z
      .string()
      .min(POLITICA_SENHA.minimo, {
        error: `A senha precisa ter pelo menos ${POLITICA_SENHA.minimo} caracteres.`,
      })
      .max(POLITICA_SENHA.maximo, {
        error: `A senha pode ter no máximo ${POLITICA_SENHA.maximo} caracteres.`,
      })
  );

const confirmarSenhaSchema = z.string().transform(normalizarSenha);

// Normaliza (trim + minúsculas) ANTES de validar o formato — caso
// contrário, espaços nas extremidades fariam a validação de formato
// rejeitar e-mails que seriam válidos depois de normalizados.
const emailSchema = z
  .string()
  .transform(normalizarEmail)
  .pipe(z.email({ error: "Informe um e-mail válido." }));

export const cadastroSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(2, { error: "Informe seu nome completo." })
      .max(120, { error: "Nome muito longo." }),
    dataNascimento: z
      .string()
      .refine(dataNascimentoValida, {
        error: "Informe uma data de nascimento válida e não futura.",
      }),
    email: emailSchema,
    senha: senhaSchema,
    confirmarSenha: confirmarSenhaSchema,
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    error: "As senhas não coincidem.",
    path: ["confirmarSenha"],
  });

export type CadastroInput = z.input<typeof cadastroSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  senha: z
    .string()
    .min(1, { error: "Informe sua senha." })
    .transform(normalizarSenha),
});

export type LoginInput = z.input<typeof loginSchema>;

export const esqueciSenhaSchema = z.object({
  email: emailSchema,
});

export type EsqueciSenhaInput = z.input<typeof esqueciSenhaSchema>;

export const redefinirSenhaSchema = z
  .object({
    novaSenha: senhaSchema,
    confirmarNovaSenha: confirmarSenhaSchema,
  })
  .refine((dados) => dados.novaSenha === dados.confirmarNovaSenha, {
    error: "As senhas não coincidem.",
    path: ["confirmarNovaSenha"],
  });

export type RedefinirSenhaInput = z.input<typeof redefinirSenhaSchema>;

export const trocarSenhaSchema = z
  .object({
    senhaAtual: z
      .string()
      .min(1, { error: "Informe sua senha atual." })
      .transform(normalizarSenha),
    novaSenha: senhaSchema,
    confirmarNovaSenha: confirmarSenhaSchema,
  })
  .refine((dados) => dados.novaSenha === dados.confirmarNovaSenha, {
    error: "As senhas não coincidem.",
    path: ["confirmarNovaSenha"],
  });

export type TrocarSenhaInput = z.input<typeof trocarSenhaSchema>;

export const perfilSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, { error: "Informe seu nome completo." })
    .max(120, { error: "Nome muito longo." }),
  dataNascimento: z.string().refine(dataNascimentoValida, {
    error: "Informe uma data de nascimento válida e não futura.",
  }),
});

export type PerfilInput = z.input<typeof perfilSchema>;
