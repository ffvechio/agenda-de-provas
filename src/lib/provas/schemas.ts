import { z } from "zod";
import { ehMultietapa, MODALIDADES } from "./constantes";

const valoresModalidade = MODALIDADES.map((m) => m.value) as [string, ...string[]];

const etapaSchema = z.object({
  ordem: z.number().int().min(1),
  modalidade: z
    .string()
    .trim()
    .min(1, { error: "Informe a modalidade da etapa." })
    .max(60),
  distanciaValor: z.coerce
    .number({ error: "Informe a distância da etapa." })
    .positive({ error: "A distância precisa ser maior que zero." }),
  distanciaUnidade: z.enum(["km", "m"], { error: "Selecione a unidade." }),
});

export type EtapaInput = z.input<typeof etapaSchema>;

export const provaSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(1, { error: "Informe o nome da prova." })
      .max(160, { error: "Nome muito longo." }),
    data: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Informe uma data válida." }),
    modalidade: z.enum(valoresModalidade, {
      error: "Selecione a modalidade.",
    }),
    modalidadeOutra: z.string().trim().max(80).optional().or(z.literal("")),
    distanciaValor: z.coerce
      .number()
      .positive({ error: "A distância precisa ser maior que zero." })
      .optional(),
    distanciaUnidade: z.enum(["km", "m"]).optional(),
    cidade: z
      .string()
      .trim()
      .min(1, { error: "Informe a cidade." })
      .max(120),
    estado: z
      .string()
      .trim()
      .min(1, { error: "Informe o estado ou região." })
      .max(80),
    pais: z.string().trim().min(1).max(80).default("Brasil"),
    situacao: z.enum(["interesse", "inscrito"]).default("interesse"),
    horarioLargada: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .optional()
      .or(z.literal("")),
    local: z.string().trim().max(200).optional().or(z.literal("")),
    linkOficial: z
      .string()
      .trim()
      .max(500)
      .refine((v) => v === "" || /^https?:\/\//i.test(v), {
        error: "O link precisa começar com http:// ou https://.",
      })
      .optional()
      .or(z.literal("")),
    observacoes: z.string().trim().max(2000).optional().or(z.literal("")),
    desnivelPositivoM: z.coerce
      .number()
      .int()
      .min(0, { error: "O desnível não pode ser negativo." })
      .optional(),
    notificarInteresse: z.boolean().default(false),
    etapas: z.array(etapaSchema).default([]),
  })
  .superRefine((dados, ctx) => {
    if (dados.modalidade === "outra" && !dados.modalidadeOutra) {
      ctx.addIssue({
        code: "custom",
        message: "Informe o nome da modalidade.",
        path: ["modalidadeOutra"],
      });
    }

    if (ehMultietapa(dados.modalidade)) {
      if (dados.etapas.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "Adicione pelo menos duas etapas para essa modalidade.",
          path: ["etapas"],
        });
      }
    } else if (!dados.distanciaValor || !dados.distanciaUnidade) {
      ctx.addIssue({
        code: "custom",
        message: "Informe a distância da prova.",
        path: ["distanciaValor"],
      });
    }
  });

export type ProvaInput = z.input<typeof provaSchema>;
export type ProvaOutput = z.output<typeof provaSchema>;

export const resultadoSchema = z.object({
  resultado: z.enum(["concluida", "nao_largou", "nao_concluiu"]).nullable(),
});
