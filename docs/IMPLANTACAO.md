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
| Templates de e-mail pt-BR | ⚠️ **Bloqueados pelo plano Free** — ver seção 2 |
| SMTP de produção | ❌ Pendente — ver seção 3 |
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

## 2. Templates de e-mail (pt-BR) — bloqueado pelo plano Free

Os templates já estão prontos em `supabase/templates/confirmation.html` e
`recovery.html`, referenciados em `supabase/config.toml`. Ao tentar
`supabase config push`, o Supabase recusou com:

> `Email template modification is not available for free tier projects
> using the default email provider. Please upgrade your plan or configure
> a custom SMTP provider.`

Ou seja: **customizar o conteúdo dos e-mails de Auth exige um provedor SMTP
próprio configurado primeiro** (não existe exceção manual pelo Dashboard no
Free). Assim que o SMTP da seção 3 estiver configurado:

```bash
npx supabase config push --project-ref xbafwscxqcmualenwsuu
```

Isso envia `[auth.email.template.confirmation]` e `[auth.email.template.recovery]`
junto com o restante da config de Auth. Até lá, os e-mails de confirmação e
recuperação são enviados pelo Supabase com o template padrão em inglês —
funcionais, porém não com a marca/idioma do produto.

## 3. SMTP de produção (pendente)

O serviço de e-mail embutido do Supabase, além de limitado a poucos
e-mails/hora, **não permite customizar o conteúdo dos templates** (ver
seção 2) — não é uma solução de produção. Configure um provedor SMTP em
**Project Settings → Authentication → SMTP Settings** no Dashboard
(não há endpoint de API/CLI para isso — é uma credencial de terceiro,
preenchida manualmente por decisão de quem administra o projeto).

Qualquer provedor SMTP funciona. Sugestão para começar com baixo custo:
[Brevo](https://www.brevo.com) (ex-Sendinblue) tem plano gratuito com limite
diário de envio, suficiente para um MVP. Alternativas: Amazon SES, Postmark,
Mailjet, SMTP2GO.

Campos típicos a preencher no Dashboard:

| Campo | Valor |
| --- | --- |
| Host | ex.: `smtp-relay.brevo.com` |
| Porta | `587` |
| Usuário | fornecido pelo provedor |
| Senha | fornecido pelo provedor (segredo — não commitar) |
| E-mail do remetente | ex.: `contato@seudominio.com` (idealmente de um domínio verificado) |
| Nome do remetente | `Minha Agenda de Provas` |

Depois de configurar o SMTP real:
1. Rode `npx supabase config push --project-ref xbafwscxqcmualenwsuu` para aplicar os templates pt-BR (seção 2).
2. Revise os limites de envio em **Authentication → Rate Limits** (o valor atual, herdado do padrão, é baixo — aumente conforme o plano do provedor SMTP permitir).

## 4. Redirect URLs de Auth — já configurado

`site_url` e `additional_redirect_urls` do projeto hospedado já apontam
para `https://agenda-de-provas.vercel.app`. Isso foi feito via
`supabase config push`, **não** editando `supabase/config.toml` permanentemente
(esse arquivo fica com valores de `localhost` para desenvolvimento local).

Para reconfigurar (ex.: trocar de domínio): edite temporariamente
`site_url`/`additional_redirect_urls` em `supabase/config.toml` para os
valores de produção, rode `supabase config push --project-ref xbafwscxqcmualenwsuu`,
e depois reverta o arquivo para os valores de `localhost` (ou mantenha um
branch/cópia separada se preferir não fazer essa troca manual toda vez).

A rota `src/app/auth/confirm/route.ts` só redireciona para `/inicio` ou
`/redefinir-senha` (lista fechada no código) — o Redirect URL do Supabase é
uma camada adicional de proteção, não a única.

## 5. VAPID (Web Push) — já configurado

Par de produção gerado com `node scripts/generate-vapid-keys.mjs` e configurado em:
- Vercel (env vars `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT=mailto:ffvechio@gmail.com`).
- Secrets da Edge Function: `npx supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=... --project-ref xbafwscxqcmualenwsuu`.

Para gerar um novo par (ex.: rotação de chave), repita o processo — lembre
que trocar a chave pública invalida as subscriptions já registradas pelos
atletas (eles precisarão reativar as notificações).

## 6. Edge Function de lembretes — já implantada

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

## 7. Vault — já configurado

```sql
select vault.create_secret('https://xbafwscxqcmualenwsuu.supabase.co', 'project_url');
select vault.create_secret('<service_role_key>', 'service_role_key');
```

Testado com sucesso via `select private.invoke_send_reminders();` no SQL
Editor do projeto hospedado (dispara a Edge Function via `pg_net`, que por
sua vez cria os `reminder_jobs` do dia e processa os pendentes).

O `pg_cron` já está agendado (a cada 15 minutos) desde a aplicação das
migrations — nenhuma ação adicional necessária.

## 8. Deploy no Vercel — já feito

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

URL de produção: **https://agenda-de-provas.vercel.app** (verificado:
HTTP 200, sem proteção de acesso, landing page renderizando corretamente).

Para um novo deploy manual: `npx vercel deploy --prod`. Pushes em `main`
no GitHub também disparam deploy automaticamente.

## 9. Domínio e DNS (opcional, não feito)

Continua usando o domínio padrão `agenda-de-provas.vercel.app`. Se for usar
domínio próprio: compre/configure o domínio no provedor de sua escolha,
aponte-o para o Vercel (CNAME/A conforme instruções do próprio Vercel ao
adicionar o domínio ao projeto) e atualize a Site URL/Redirect URLs do
Supabase Auth (seção 4) e `NEXT_PUBLIC_SITE_URL` no Vercel para o novo
domínio. Este agente não registra domínios nem altera DNS sem autorização
explícita.

## 10. O que falta fazer

- [ ] Configurar SMTP de produção (seção 3) — sem isso, e-mails de auth
      funcionam mas em inglês e com o rate limit baixo padrão.
- [ ] Depois do SMTP: `supabase config push` para aplicar os templates pt-BR.
- [ ] Preencher `/privacidade` com os dados reais do responsável pelo produto
      (nome/empresa, CNPJ se aplicável, e-mail de contato) — atualmente tem
      um aviso `[PENDENTE]` explícito no lugar desses dados.
- [ ] Testar o cadastro/confirmação/push ponta a ponta com um e-mail e
      dispositivo reais contra a URL de produção.
- [ ] (Opcional) domínio próprio.

Ver `docs/CHECKLIST.md` para o checklist completo de testes e limites de
planos gratuitos.
