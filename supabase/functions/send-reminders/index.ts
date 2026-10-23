// Edge Function acionada pelo pg_cron (ver supabase/migrations/..._cron_lembretes.sql)
// a cada 15 minutos. Responsabilidades:
//   1. (via RPC) criar reminder_jobs para provas cujo "5 dias antes" caiu em
//      hoje, no fuso de cada atleta, dentro da janela das 09:00 locais.
//   2. Reivindicar atomicamente um lote de jobs pendentes e vencidos.
//   3. Enviar o push de cada job, registrar a tentativa e atualizar o status.
//
// Autenticação: o pg_cron invoca este endpoint com
// `Authorization: Bearer <service_role_key>` (guardada no Supabase Vault,
// nunca no código) — o verify_jwt padrão do projeto já exige um JWT válido
// para qualquer chamada, então não há necessidade de um segredo adicional.
//
// Limitações documentadas (ver docs/IMPLANTACAO.md): Web Push não garante
// entrega nem exatamente uma entrega. Jobs vencidos há mais de 48h são
// marcados como "expired" e não são enviados.

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const MAX_TENTATIVAS = 3;
const EXPIRACAO_HORAS = 48;
const TTL_PUSH_SEGUNDOS = 3 * 24 * 60 * 60; // 3 dias

type JobReivindicado = {
  job_id: string;
  prova_id: string;
  prova_nome: string;
  prova_data: string;
  subscription_id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
  scheduled_for: string;
  attempts: number;
};

function montarPayload(job: JobReivindicado) {
  return {
    title: "Faltam 5 dias para sua prova!",
    body: `Faltam 5 dias para a ${job.prova_nome}! Confira os detalhes da sua prova.`,
    url: `/provas/${job.prova_id}`,
    tag: `prova-${job.prova_id}`,
  };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const vapidSubject = Deno.env.get("VAPID_SUBJECT");

  if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    console.error("send-reminders: variáveis de ambiente ausentes");
    return new Response(JSON.stringify({ error: "config ausente" }), { status: 500 });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: jobs, error: erroReivindicar } = await supabase.rpc(
    "reivindicar_lembretes_pendentes",
    { p_limite: 50 }
  );

  if (erroReivindicar) {
    console.error("send-reminders: erro ao reivindicar jobs", erroReivindicar.message);
    return new Response(JSON.stringify({ error: "falha ao reivindicar jobs" }), { status: 500 });
  }

  const lista = (jobs ?? []) as JobReivindicado[];
  let enviados = 0;
  let expirados = 0;
  let falhas = 0;

  for (const job of lista) {
    const idadeHoras =
      (Date.now() - new Date(job.scheduled_for).getTime()) / (1000 * 60 * 60);

    if (idadeHoras > EXPIRACAO_HORAS) {
      expirados++;
      await supabase.rpc("concluir_tentativa_lembrete", {
        p_job_id: job.job_id,
        p_sucesso: false,
        p_status_final: "expired",
        p_http_status: null,
        p_erro: "Lembrete expirado: mais de 48h após o horário previsto.",
      });
      continue;
    }

    try {
      await webpush.sendNotification(
        {
          endpoint: job.endpoint,
          keys: { p256dh: job.p256dh, auth: job.auth_key },
        },
        JSON.stringify(montarPayload(job)),
        { TTL: TTL_PUSH_SEGUNDOS, urgency: "normal" }
      );

      enviados++;
      await supabase.rpc("concluir_tentativa_lembrete", {
        p_job_id: job.job_id,
        p_sucesso: true,
        p_status_final: "sent",
        p_http_status: 201,
        p_erro: null,
      });
    } catch (erro) {
      const statusCode =
        erro && typeof erro === "object" && "statusCode" in erro
          ? Number((erro as { statusCode: unknown }).statusCode)
          : null;
      const inscricaoInvalida = statusCode === 404 || statusCode === 410;
      const tentativasFeitas = job.attempts + 1;
      const statusFinal = inscricaoInvalida
        ? "failed"
        : tentativasFeitas >= MAX_TENTATIVAS
          ? "failed"
          : "pending";

      falhas++;
      await supabase.rpc("concluir_tentativa_lembrete", {
        p_job_id: job.job_id,
        p_sucesso: false,
        p_status_final: statusFinal,
        p_http_status: statusCode,
        p_erro: erro instanceof Error ? erro.message : "Erro desconhecido ao enviar push.",
      });

      if (inscricaoInvalida) {
        await supabase.rpc("remover_subscription_invalida", {
          p_subscription_id: job.subscription_id,
        });
      }
    }
  }

  return new Response(
    JSON.stringify({ processados: lista.length, enviados, expirados, falhas }),
    { headers: { "Content-Type": "application/json" } }
  );
});
