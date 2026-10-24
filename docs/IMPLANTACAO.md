# Implantação — Minha Agenda de Provas

Este documento registra o que já foi implantado nesta sessão e o que ainda
precisa de ação manual. Projeto Supabase hospedado e deploy no Vercel **já
existem e estão no ar** — os passos abaixo documentam como foram feitos
(para reproduzir em outro ambiente) e o que falta.

## 0. Status atual (2026-10-23)

| Item | Status |
| --- | --- |
| Projeto Supabase hospedado | ✅ Criado — `xbafwscxqcmualenwsuu`, região `sa-east-1` |
| Migrations aplicadas no projeto hospedado | ✅ `supabase db push` rodado com sucesso |
| Auth: Site URL / Redirect URLs | ✅ Configurados para `https://agenda-de-provas.vercel.app` |
| Auth: política de senha (mínimo 12) | ✅ Aplicada no projeto hospedado |
| Auth: confirmação de e-mail / recuperação por e-mail | ❌ **Removidas do produto** — cadastro já ativa a conta direto, sem enviar e-mail nenhum |
| SMTP de produção | N/A — o produto não depende mais de envio de e-mail |
| VAPID (produção) | ✅ Gerado e configurado (Vercel + secrets da Edge Function) |
| Edge Function `send-reminders` | ✅ Deployed e testada (`{"processados":0,...}` em produção) |
| Vault (`project_url`, `service_role_key`) | ✅ Configurado — `pg_cron` já dispara a function a cada 15 min |
| Deploy no Vercel | ✅ No ar: **https://agenda-de-provas.vercel.app** |
| Variáveis de ambiente no Vercel | ✅ Configuradas (Production/Preview/Development) |
| Página `/privacidade` | ⚠️ Pendente preencher dados reais do responsável |
| Domínio próprio | Não configurado (usa o domínio `.vercel.app` padrão) |

Repositório: https://github.com/ffvechio/agenda-de-provas
Dashboard Supabase: https://supabase.com/dashboard/project/xbafwscxqcmualenwsuu
Dashboard Vercel: https://vercel.com/felipe-bessa-s-projects/agenda-de-provas

## 1. Projeto Supabase — como foi criado

```bash
npx supabase login                 # ou: npx supabase login --token <PAT>
npx supabase orgs list             # pegar o org-id
npx supabase projects create agenda-de-provas \
  --org-id <org-id> --region sa-east-1 --db-password <senha gerada>
npx supabase link --project-ref xbafwscxqcmualenwsuu --password <senha>
npx supabase db push               # aplica todas as migrations
```

Para criar um **novo** ambiente (staging, outro projeto), repita esses
comandos com um `project-ref` novo — todo o schema/RLS/RPCs/cron vem das
migrations versionadas neste repositório.

## 2. Por que não há mais fluxo de e-mail

O produto decidiu não depender de nenhum provedor de e-mail. Isso eliminou
duas pendências reais que apareceram durante o uso: o mailer padrão do
Supabase (gratuito, sem SMTP próprio) tem um limite de envio muito baixo
por hora, e bloqueava cadastros repetidos em teste com "muitas tentativas";
além disso, customizar o conteúdo dos templates de e-mail exige SMTP
próprio configurado (não há exceção no plano Free), então os e-mails
ficariam em inglês de qualquer forma.

`auth.email.enable_confirmations = false` no Supabase Auth faz `signUp()`
retornar uma sessão ativa direto, sem nenhuma tentativa de envio de e-mail.
Recuperação de senha por e-mail foi removida do produto — quem esquece a
senha não tem como recuperar sozinho no MVP (só trocar autenticado, em
Perfil). Isso está documentado para o usuário em `docs/ARQUITETURA.md`.

## 3. Redirect URLs de Auth — já configurado

`site_url` e `additional_redirect_urls` do projeto hospedado apontam para
`https://agenda-de-provas.vercel.app`. Isso foi feito via
`supabase config push`, **não** editando `supabase/config.toml` permanentemente
(esse arquivo fica com valores de `localhost` para desenvolvimento local).
Hoje em dia essas URLs não protegem nenhum fluxo de e-mail (não existe
mais), mas continuam corretas caso algum fluxo baseado em redirect seja
reintroduzido no futuro.

Para reconfigurar (ex.: trocar de domínio): edite temporariamente
`site_url`/`additional_redirect_urls` em `supabase/config.toml` para os
valores de produção, rode `supabase config push --project-ref xbafwscxqcmualenwsuu`,
e depois reverta o arquivo para os valores de `localhost`.

## 4. VAPID (Web Push) — já configurado

Par de produção gerado com `node scripts/generate-vapid-keys.mjs` e configurado em:
- Vercel (env vars `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT=mailto:ffvechio@gmail.com`).
- Secrets da Edge Function: `npx supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=... --project-ref xbafwscxqcmualenwsuu`.

Para gerar um novo par (ex.: rotação de chave), repita o processo — lembre
que trocar a chave pública invalida as subscriptions já registradas pelos
atletas (eles precisarão reativar as notificações).

## 5. Edge Function de lembretes — já implantada

```bash
npx supabase functions deploy send-reminders --project-ref xbafwscxqcmualenwsuu
```

Testada diretamente em produção:

```bash
curl -X POST "https://xbafwscxqcmualenwsuu.supabase.co/functions/v1/send-reminders" \
  -H "Authorization: Bearer <service_role_key>" -H "Content-Type: application/json" -d '{}'
# {"processados":0,"enviados":0,"expirados":0,"falhas":0}
```

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são injetadas automaticamente
pela plataforma para toda Edge Function — não precisam ser configuradas à mão.

## 6. Vault — já configurado

```sql
select vault.create_secret('https://xbafwscxqcmualenwsuu.supabase.co', 'project_url');
select vault.create_secret('<service_role_key>', 'service_role_key');
```

Testado com sucesso via `select private.invoke_send_reminders();` no SQL
Editor do projeto hospedado (dispara a Edge Function via `pg_net`, que por
sua vez cria os `reminder_jobs` do dia e processa os pendentes).

O `pg_cron` já está agendado (a cada 15 minutos) desde a aplicação das
migrations — nenhuma ação adicional necessária.

## 7. Deploy no Vercel — já feito

Projeto `agenda-de-provas` criado no time `felipe-bessa-s-projects`,
conectado ao repositório GitHub (deploys automáticos a cada push em `main`).
Variáveis de ambiente configuradas via `vercel env add` para Production,
Preview e Development:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # nunca com prefixo NEXT_PUBLIC_
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY                # nunca com prefixo NEXT_PUBLIC_
VAPID_SUBJECT
NEXT_PUBLIC_SITE_URL             # só Production (= https://agenda-de-provas.vercel.app)
```

URL de produção: **https://agenda-de-provas.vercel.app**.

Para um novo deploy manual: `npx vercel deploy --prod`. Pushes em `main`
no GitHub também disparam deploy automaticamente.

## 8. Domínio e DNS (opcional, não feito)

Continua usando o domínio padrão `agenda-de-provas.vercel.app`. Se for usar
domínio próprio: compre/configure o domínio no provedor de sua escolha,
aponte-o para o Vercel (CNAME/A conforme instruções do próprio Vercel ao
adicionar o domínio ao projeto) e atualize a Site URL/Redirect URLs do
Supabase Auth (seção 3) e `NEXT_PUBLIC_SITE_URL` no Vercel para o novo
domínio. Este agente não registra domínios nem altera DNS sem autorização
explícita.

## 9. O que falta fazer

- [ ] Preencher `/privacidade` com os dados reais do responsável pelo produto
      (nome/empresa, CNPJ se aplicável, e-mail de contato) — atualmente tem
      um aviso `[PENDENTE]` explícito no lugar desses dados.
- [ ] Testar o cadastro/push ponta a ponta com um dispositivo real contra a
      URL de produção.
- [ ] (Opcional) domínio próprio.
- [ ] Se algum dia precisar reintroduzir recuperação de senha, será preciso
      reavaliar a dependência de e-mail (ou um canal alternativo).

Ver `docs/CHECKLIST.md` para o checklist completo de testes e limites de
planos gratuitos.
