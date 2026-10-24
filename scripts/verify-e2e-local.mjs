// Verificação de ponta a ponta contra o Supabase LOCAL (supabase start).
// Usa as chaves de demonstração padrão da CLI local (não são segredos reais
// — são fixas em qualquer instalação local do Supabase CLI).
//
// Uso: npx supabase start && node scripts/verify-e2e-local.mjs
//
// Testa: signup (sem e-mail — enable_confirmations=false, sessão ativa
// direto), CRUD de prova via RPC, isolamento de RLS entre dois usuários
// (leitura/escrita/exclusão cruzada), o ciclo de vida completo de um
// reminder_job (claim atômico → envio → tentativa registrada), a
// revalidação ao cancelar uma prova, e a exclusão de conta em cascata.
import { createClient } from "@supabase/supabase-js";

const URL = "http://127.0.0.1:54321";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const SERVICE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

function ok(nome) {
  console.log(`✅ ${nome}`);
}
function falha(nome, detalhe) {
  console.error(`❌ ${nome}`, detalhe ?? "");
  process.exitCode = 1;
}

async function main() {
  const admin = createClient(URL, SERVICE);
  const emailA = `atleta-a-${Date.now()}@teste.local`;
  const emailB = `atleta-b-${Date.now()}@teste.local`;
  const senha = "uma-frase-senha-bem-longa-123";

  // --- Signup (sem e-mail: já volta com sessão ativa) — usuário A ---
  const clienteA = createClient(URL, ANON);
  const { data: signupA, error: erroSignupA } = await clienteA.auth.signUp({
    email: emailA,
    password: senha,
    options: { data: { nome: "Atleta A", data_nascimento: "1990-01-01" } },
  });
  if (erroSignupA) return falha("signup A", erroSignupA.message);
  if (!signupA.session) return falha("signup A não retornou sessão ativa (enable_confirmations deveria estar false)");
  ok("signup A cria conta com sessão ativa, sem e-mail de confirmação");

  // --- Login A (confere que a senha realmente foi salva como enviada) ---
  const { error: erroLoginA } = await clienteA.auth.signInWithPassword({
    email: emailA,
    password: senha,
  });
  if (erroLoginA) return falha("login A", erroLoginA.message);
  ok("login A com e-mail + senha");

  // Perfil criado automaticamente pelo trigger?
  const { data: perfilA, error: erroPerfilA } = await clienteA
    .from("profiles")
    .select("*")
    .single();
  if (erroPerfilA || perfilA?.nome !== "Atleta A") {
    return falha("trigger de criação de perfil", erroPerfilA?.message ?? perfilA);
  }
  ok("profiles criado automaticamente via trigger on_auth_user_created");

  // --- Criar prova via RPC (A) ---
  const { data: provaId, error: erroProva } = await clienteA.rpc("salvar_prova_com_etapas", {
    p_id: null,
    p_dados: {
      nome: "Ultra de Paraty",
      data: "2026-12-20",
      modalidade: "ultramaratona",
      modalidade_outra: "",
      distancia_valor: 100,
      distancia_unidade: "km",
      cidade: "Paraty",
      estado: "RJ",
      pais: "Brasil",
      situacao: "inscrito",
      horario_largada: "",
      local: "",
      link_oficial: "",
      observacoes: "",
      desnivel_positivo_m: null,
      notificar_interesse: false,
    },
    p_etapas: [],
  });
  if (erroProva) return falha("criar prova via RPC", erroProva.message);
  ok(`prova criada via RPC (id=${provaId})`);

  const { data: provaLida } = await clienteA.from("provas").select("*").eq("id", provaId).single();
  if (provaLida?.nome !== "Ultra de Paraty") return falha("leitura da prova recém-criada");
  ok("prova lida de volta corretamente");

  // --- Signup (B) ---
  const clienteB = createClient(URL, ANON);
  const { data: signupB, error: erroSignupB } = await clienteB.auth.signUp({
    email: emailB,
    password: senha,
    options: { data: { nome: "Atleta B", data_nascimento: "1992-02-02" } },
  });
  if (erroSignupB) return falha("signup B", erroSignupB.message);
  if (!signupB.session) return falha("signup B não retornou sessão ativa");
  ok("usuário B criado com sessão ativa");

  // --- Isolamento de RLS: B tenta ler/editar/excluir prova de A ---
  const { data: leituraCruzada } = await clienteB.from("provas").select("*").eq("id", provaId);
  if (leituraCruzada && leituraCruzada.length > 0) {
    return falha("RLS FALHOU: usuário B conseguiu LER prova de A", leituraCruzada);
  }
  ok("RLS bloqueia B de ler prova de A (select retorna vazio)");

  const { count } = await clienteB
    .from("provas")
    .update({ nome: "hackeado" })
    .eq("id", provaId)
    .select("*", { count: "exact" });
  if (count && count > 0) {
    return falha("RLS FALHOU: usuário B conseguiu ATUALIZAR prova de A");
  }
  ok("RLS bloqueia B de atualizar prova de A");

  await clienteB.from("provas").delete().eq("id", provaId);
  const { data: aindaExiste } = await admin.from("provas").select("id").eq("id", provaId).single();
  if (!aindaExiste) {
    return falha("RLS FALHOU: usuário B conseguiu EXCLUIR prova de A");
  }
  ok("RLS bloqueia B de excluir prova de A (prova ainda existe)");

  // --- Reservation/claim de reminder_jobs (via service role, direto) ---
  const { data: subA } = await admin
    .from("push_subscriptions")
    .insert({
      user_id: perfilA.id,
      endpoint: `https://fake.push/${Date.now()}`,
      p256dh: "fake-p256dh",
      auth_key: "fake-auth",
    })
    .select()
    .single();

  const { data: jobInserido, error: erroJobInsert } = await admin
    .from("reminder_jobs")
    .insert({
      prova_id: provaId,
      subscription_id: subA.id,
      schedule_version: 1,
      scheduled_for: new Date(Date.now() - 60_000).toISOString(),
      status: "pending",
    })
    .select()
    .single();
  if (erroJobInsert) return falha("inserir reminder_job de teste", erroJobInsert.message);
  ok("reminder_job de teste inserido (service role, RLS bypass esperado)");

  const { data: reivindicados, error: erroClaim } = await admin.rpc(
    "reivindicar_lembretes_pendentes",
    { p_limite: 10 }
  );
  if (erroClaim) return falha("reivindicar_lembretes_pendentes", erroClaim.message);
  const achado = reivindicados?.find((j) => j.job_id === jobInserido.id);
  if (!achado) return falha("job de teste não foi reivindicado", reivindicados);
  ok(`job reivindicado atomicamente (prova_nome="${achado.prova_nome}")`);

  const { data: statusProcessing } = await admin
    .from("reminder_jobs")
    .select("status")
    .eq("id", jobInserido.id)
    .single();
  if (statusProcessing.status !== "processing") {
    return falha("status não mudou para processing após claim", statusProcessing);
  }
  ok("status do job = processing após claim");

  const { error: erroConcluir } = await admin.rpc("concluir_tentativa_lembrete", {
    p_job_id: jobInserido.id,
    p_sucesso: true,
    p_status_final: "sent",
    p_http_status: 201,
    p_erro: null,
  });
  if (erroConcluir) return falha("concluir_tentativa_lembrete", erroConcluir.message);

  const { data: jobFinal } = await admin.from("reminder_jobs").select("status, attempts").eq("id", jobInserido.id).single();
  const { data: tentativas } = await admin.from("reminder_attempts").select("*").eq("reminder_job_id", jobInserido.id);
  if (jobFinal.status !== "sent" || jobFinal.attempts !== 1 || tentativas.length !== 1) {
    return falha("estado final do job/tentativa incorreto", { jobFinal, tentativas });
  }
  ok("job marcado como sent + 1 tentativa registrada em reminder_attempts");

  // --- Revalidação: cancelar a prova deve cancelar reminder_jobs pendentes ---
  const { data: subA2 } = await admin
    .from("push_subscriptions")
    .insert({
      user_id: perfilA.id,
      endpoint: `https://fake.push/${Date.now()}-2`,
      p256dh: "fake-p256dh-2",
      auth_key: "fake-auth-2",
    })
    .select()
    .single();
  const { data: job2 } = await admin
    .from("reminder_jobs")
    .insert({
      prova_id: provaId,
      subscription_id: subA2.id,
      schedule_version: 1,
      scheduled_for: new Date(Date.now() + 3600_000).toISOString(),
      status: "pending",
    })
    .select()
    .single();

  await admin.from("provas").update({ cancelada: true }).eq("id", provaId);

  const { data: job2Depois } = await admin.from("reminder_jobs").select("status").eq("id", job2.id).single();
  if (job2Depois.status !== "canceled") {
    return falha("cancelar prova não cancelou reminder_job pendente (trigger bump_schedule_version)", job2Depois);
  }
  ok("cancelar a prova cancela automaticamente o reminder_job pendente (trigger)");

  // --- Exclusão de conta (admin API) remove dados em cascata ---
  await admin.auth.admin.deleteUser(perfilA.id);
  const { data: provaApósExclusao } = await admin.from("provas").select("id").eq("id", provaId);
  if (provaApósExclusao && provaApósExclusao.length > 0) {
    return falha("exclusão de conta não removeu provas em cascata");
  }
  ok("excluir usuário remove provas/subscriptions em cascata (ON DELETE CASCADE)");

  await admin.auth.admin.deleteUser(signupB.user.id);

  console.log("\nTudo verificado com sucesso.");
}

main().catch((e) => {
  console.error("Erro inesperado:", e);
  process.exitCode = 1;
});
