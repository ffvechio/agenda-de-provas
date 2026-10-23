# Minha Agenda de Provas

Agenda pessoal de provas para atletas (corrida de rua, trail, ultramaratona,
triatlon, duatlon, aquatlon e outras). PWA em português do Brasil, mobile-first,
com autenticação por e-mail e senha (Supabase Auth) e lembretes por Web Push
cinco dias antes de cada prova confirmada.

> Nome, cores e demais itens de identidade ficam centralizados em
> `src/lib/config/brand.ts` — altere ali para rebatizar o produto.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · React
Hook Form + Zod · Supabase (Postgres, Auth, RLS, Edge Functions, Cron) · Web
Push (VAPID) · Vitest.

Veja `docs/ARQUITETURA.md` para as decisões de arquitetura e `docs/IMPLANTACAO.md`
para o passo a passo de configuração e deploy.

## Rodando localmente

Pré-requisitos: Node.js 20+, Docker Desktop (para o Supabase local) e a
Supabase CLI (`npx supabase`, sem instalação global necessária).

```bash
npm install
cp .env.example .env.local   # preencha depois de iniciar o Supabase local

# 1. Suba Postgres + Auth + Studio + Inbucket (e-mail de teste) localmente
npx supabase start
# a saída imprime API URL, anon key e service_role key — copie para .env.local

# 2. Aplique as migrations (schema, RLS, functions)
npx supabase db reset

# 3. (opcional) gere um novo par de chaves VAPID para notificações push
node scripts/generate-vapid-keys.mjs
# cole a saída em NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY no .env.local

npm run dev
```

Abra http://localhost:3000. E-mails de confirmação/recuperação enviados em
desenvolvimento ficam no Inbucket local: http://127.0.0.1:54324.

Studio do Supabase local (ver tabelas, rodar SQL): http://127.0.0.1:54323.

### Scripts disponíveis

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção |
| `npm run start` | Serve o build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Testes (Vitest) |
| `npm run test:watch` | Testes em modo watch |
| `node scripts/generate-vapid-keys.mjs` | Gera um novo par de chaves VAPID |
| `node scripts/generate-icons.mjs` | Regenera os ícones do PWA (requer `npm i -D sharp`) |
| `node scripts/verify-e2e-local.mjs` | Verificação de ponta a ponta contra o Supabase local (signup, confirmação, RLS, ciclo de lembretes) |

## Implantação

Veja `docs/IMPLANTACAO.md` para: criar o projeto Supabase hospedado,
configurar SMTP de produção, gerar e configurar as chaves VAPID, publicar a
Edge Function de lembretes e o `pg_cron`, e fazer o deploy no Vercel.

## Documentação

- `docs/ARQUITETURA.md` — visão geral de arquitetura e decisões.
- `docs/IMPLANTACAO.md` — configuração de ambiente e deploy.
- `docs/CHECKLIST.md` — testes executados e pendentes, limites dos planos gratuitos.
- `/privacidade` (no app) — página de privacidade (contém itens pendentes de preenchimento).
