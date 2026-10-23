# Arquitetura — Minha Agenda de Provas

## Entendimento do produto

Aplicação web (PWA) para atletas organizarem seu calendário pessoal de provas
(corrida de rua, trail, ultra, triatlon, duatlon, aquatlon, outras). Não vende
inscrições nem integra organizadores. ~90% do uso é mobile. Idioma pt-BR,
datas DD/MM/AAAA, distâncias em km/m.

Autenticação: e-mail + senha (Supabase Auth), sem OTP e sem magic link.
Confirmação de e-mail e recuperação de senha usam os fluxos nativos do
Supabase Auth (e-mail com link), via SMTP configurável — Resend não é
dependência obrigatória.

Cinco dias antes de uma prova com inscrição confirmada (ou interesse com
opt-in), o atleta recebe um Web Push às 09h no fuso configurado. O
processamento roda no backend (Supabase Edge Function) via Supabase Cron,
independente do site estar aberto.

## Stack

- Next.js 16 (App Router) + TypeScript 7 + React 19
- Tailwind CSS v4 + shadcn/ui (Radix) — mobile-first
- React Hook Form + Zod (validação client e server)
- Supabase: Postgres + Auth (email/senha) + RLS + Edge Functions + Cron (pg_cron/pg_net)
- Web Push nativo (VAPID) via biblioteca `web-push`, sem serviços terceiros
- PWA manual (manifest + service worker próprio em `public/sw.js`), sem next-pwa
- Vercel para hospedagem do app Next.js
- Vitest para testes unitários/integração com relógio controlável

## Por que não next-pwa

O app precisa de um service worker com lógica própria de `push` e
`notificationclick` (abrir a prova certa, preservar destino de login). Um
service worker manual, pequeno e auditável, dá mais controle do que uma
camada de geração automática, e evita depender de um pacote de manutenção
incerta no Next 16/App Router.

## Modelo de dados (Postgres / Supabase)

- `profiles` (1:1 com `auth.users`): nome, data_nascimento, fuso_lembretes,
  notificacoes_ativas.
- `provas`: dados da prova, pertence a um `user_id`. `situacao` (interesse |
  inscrito) é separada de `resultado` (concluida | nao_largou | nao_concluiu |
  null) e de `cancelada` (bool). `schedule_version` é incrementado sempre que
  algo que afeta o lembrete muda (data, situação, cancelamento) — invalida
  jobs de lembrete antigos sem precisar apagá-los.
- `prova_etapas`: etapas ordenadas (natação/ciclismo/corrida) para provas
  multisport, FK para `provas` com `on delete cascade`.
- `push_subscriptions`: uma linha por dispositivo/navegador inscrito,
  endpoint único.
- `reminder_jobs`: um job por (prova, subscription, schedule_version) —
  chave única garante que mudar a versão do agendamento invalida jobs
  antigos e que não há duplicidade por dispositivo. Estados: pending,
  processing (reivindicado atomicamente, aguardando envio), sent, failed,
  canceled, expired.
- `reminder_attempts`: histórico de tentativas de envio (para auditoria e
  depuração, sem dados sensíveis).

Todas as tabelas de usuário têm RLS restringindo a `auth.uid() = user_id`
(diretamente ou via join). `reminder_jobs`/`reminder_attempts` têm RLS
habilitado sem políticas de leitura/escrita para usuários — só o service role
(usado exclusivamente dentro da Edge Function, nunca no navegador) acessa.

## Fluxo de lembretes (Web Push)

1. `supabase/functions/send-reminders` (Edge Function, Deno) é invocada por
   `pg_cron` a cada 15 minutos via `pg_net`.
2. A função calcula, para cada atleta, a data corrente no fuso configurado e
   busca provas cuja `data - 5 dias de calendário` seja hoje, com
   `situacao = 'inscrito'` (ou `interesse` com opt-in), não canceladas.
3. Para cada `push_subscription` ativa do atleta, faz `upsert` de um
   `reminder_job` pendente (chave: prova + subscription + schedule_version).
4. Reivindica jobs pendentes atomically (`UPDATE ... WHERE status='pending'
   RETURNING`, com `FOR UPDATE SKIP LOCKED` na seleção) para evitar
   processamento concorrente entre execuções sobrepostas.
5. Envia o push via `web-push` (VAPID) com `TTL` curto (evita entrega muito
   atrasada) e `tag` por prova (evita duplicidade visual).
6. Em erro 404/410 (subscription inválida), remove a subscription. Em erro
   transitório, incrementa `attempts` até um limite e tenta novamente na
   próxima execução.
7. Se a prova for criada/editada depois que a marca dos "5 dias antes" já
   passou, o job correspondente nasce como `expired` e não é enviado — a UI
   avisa o atleta disso ao salvar.
8. Editar a data, cancelar ou excluir a prova incrementa `schedule_version`
   (ou aciona `on delete cascade`), invalidando jobs antigos.

Limitações documentadas: Web Push não garante entrega nem exatamente uma
entrega; o MVP não reenvia retroativamente lembretes cuja janela já passou.

## Autenticação

- Cadastro e login exclusivamente e-mail + senha via `@supabase/ssr`.
- Confirmação de e-mail: link nativo do Supabase Auth → rota
  `/auth/callback` troca o código por sessão e redireciona conforme o tipo.
- Recuperação de senha: rota `/auth/reset-password` trata a sessão de
  recuperação apenas para definir a nova senha; ao concluir, todas as
  sessões são invalidadas (`signOut({ scope: 'global' })`) e o atleta é
  enviado para o login.
- Troca de senha autenticada: exige a senha atual (reautenticação leve via
  `signInWithPassword`) antes de `updateUser`.
- Exclusão de conta: rota de servidor que reautentica com a senha atual e
  usa a Admin API (service role, só no servidor) para apagar o usuário;
  `ON DELETE CASCADE` remove provas, etapas, subscriptions e jobs.

## Pendências de configuração (ambiente)

Ver `docs/IMPLANTACAO.md` para o passo a passo. Resumo do que depende de
ação humana fora deste ambiente:

1. Criar projeto Supabase (hospedado) e fornecer URL/anon key/service role
   key — ou rodar `supabase login` interativamente neste terminal.
2. Escolher e configurar um provedor SMTP para e-mails reais em produção
   (o serviço de e-mail embutido do Supabase é só para testes).
3. Gerar par de chaves VAPID (posso gerar localmente, sem conta externa).
4. Deploy no Vercel (há integração MCP disponível neste ambiente) e
   configuração das variáveis de ambiente.
5. Iniciar o Docker Desktop para desenvolvimento local do Supabase
   (`supabase start`).
