# Arquitetura — Minha Agenda de Provas

## Entendimento do produto

Aplicação web (PWA) para atletas organizarem seu calendário pessoal de provas
(corrida de rua, trail, ultra, triatlon, duatlon, aquatlon, outras). Não vende
inscrições nem integra organizadores. ~90% do uso é mobile. Idioma pt-BR,
datas DD/MM/AAAA, distâncias em km/m.

Autenticação: e-mail + senha (Supabase Auth), sem OTP e sem magic link, sem
confirmação de e-mail e sem recuperação de senha por e-mail — decisão de
produto para não depender de nenhum provedor de envio de e-mail. O cadastro
já cria a conta ativa e com sessão. Quem esquece a senha não tem um fluxo de
autorrecuperação no MVP; a única forma de trocar senha é autenticado, em
Perfil, informando a senha atual.

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

## Identidade visual — "endurance tech" (2026-10-23)

Restyle pedido pelo usuário: visual tecnológico com tema de esporte de
endurance, mantendo todas as funcionalidades. Direção:

- Grafite quase preto (`#0f1115` claro / `#f2f4f7` escuro) + laranja de alta
  performance como única cor de ação (`--primary`) — todos os pares de
  contraste texto/fundo verificados (WCAG AA ≥ 4.5:1) em `globals.css`.
- Um segundo tom, `--stat` (teal no claro, ciano no escuro), reservado
  só para números de desempenho (contagem regressiva, estatísticas, provas
  "de interesse") — nunca usado em controles interativos, pra não brigar
  com "laranja como única cor de ação".
- `font-mono` (Geist Mono, já carregada) em números/distâncias/contadores
  para reforçar a leitura "telemetria esportiva".
- Textura de grade sutil (`.bg-grid-tech`) e glow radial (`.bg-glow-primary`)
  em `globals.css`, usados nas telas de marketing/auth — decorativos,
  `aria-hidden`, sem animação (não conflita com `prefers-reduced-motion`).
- **Bug real encontrado durante a validação visual**: `--font-sans` em
  `@theme inline` apontava pra si mesma (`var(--font-sans)`, circular), não
  para a fonte Geist carregada em `layout.tsx` — todo o app renderizava
  títulos numa serif de fallback do navegador. Corrigido apontando para
  `var(--font-geist-sans)`.
- Dark mode estava declarado em CSS mas nunca era ativado — faltava o
  `ThemeProvider` do `next-themes` (`attribute="class"`, `enableSystem`) no
  layout raiz. Adicionado; agora o tema segue a preferência do sistema de
  verdade.

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
- `enable_confirmations = false` no Supabase Auth: `signUp()` já retorna uma
  sessão ativa, sem enviar e-mail nenhum — elimina tanto a dependência de
  SMTP quanto o rate limit de envio do mailer padrão do Supabase, que
  bloqueava cadastros repetidos em teste.
- Sem recuperação de senha por e-mail. Esqueceu a senha, não tem como
  recuperar sozinho no MVP — ver `/perfil` para trocar a senha autenticado.
- Senha é normalizada para Unicode NFC (`normalizarSenha`) antes de
  qualquer chamada ao Supabase Auth — evita que o mesmo caractere acentuado
  digitado/colado de formas diferentes (NFC vs. NFD) seja tratado como uma
  senha diferente pelo GoTrue, que compara bytes sem normalizar.
- Troca de senha autenticada: exige a senha atual (reautenticação leve via
  `signInWithPassword`) antes de `updateUser`.
- Exclusão de conta: rota de servidor que reautentica com a senha atual e
  usa a Admin API (service role, só no servidor) para apagar o usuário;
  `ON DELETE CASCADE` remove provas, etapas, subscriptions e jobs.

## Pendências de configuração (ambiente)

Ver `docs/IMPLANTACAO.md` para o passo a passo e para o estado atual real
(projeto Supabase e deploy no Vercel já existem). Resumo do que ainda
depende de ação humana:

1. Gerar um novo par de chaves VAPID para produção quando for rotacionar.
2. Deploy no Vercel (automático a cada push em `main`).
3. Iniciar o Docker Desktop para desenvolvimento local do Supabase
   (`supabase start`).

SMTP deixou de ser uma pendência de configuração — o produto não depende
mais de envio de e-mail para nenhum fluxo de autenticação.
