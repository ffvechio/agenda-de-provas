# Implantação — Minha Agenda de Provas

Este documento lista exatamente o que precisa ser configurado manualmente
fora deste repositório para o produto funcionar em produção: projeto
Supabase, SMTP, VAPID, Edge Function + Cron, e deploy no Vercel.

## 0. Resumo das configurações manuais pendentes

- [ ] Criar o projeto Supabase hospedado (ou confirmar qual projeto usar).
- [ ] Rodar as migrations no projeto hospedado.
- [ ] Configurar as Redirect URLs de Auth com o domínio real.
- [ ] Colocar os templates de e-mail (pt-BR, já prontos em `supabase/templates/`) no projeto.
- [ ] Configurar um provedor SMTP real (o e-mail embutido do Supabase é só para teste).
- [ ] Gerar as chaves VAPID e configurá-las no Vercel e como secret da Edge Function.
- [ ] Deploy da Edge Function `send-reminders`.
- [ ] Guardar `project_url` e `service_role_key` no Supabase Vault (para o `pg_cron` conseguir chamar a function).
- [ ] Deploy do app no Vercel com as variáveis de ambiente configuradas.
- [ ] Preencher a página `/privacidade` com os dados reais do responsável pelo produto.

## 1. Criar o projeto Supabase

1. Crie uma conta/projeto em https://supabase.com/dashboard (região recomendada: `sa-east-1`, mais próxima do Brasil).
2. Anote: **Project URL**, **anon public key** e **service_role key** (Project Settings → API).
3. Instale a CLI quando for usá-la (não precisa instalar globalmente, pode usar `npx supabase <comando>`).
4. Faça login e linke o projeto local a ele:

   ```bash
   npx supabase login
   npx supabase link --project-ref <seu-project-ref>
   ```

5. Aplique as migrations deste repositório no projeto hospedado:

   ```bash
   npx supabase db push
   ```

   Isso cria as tabelas, as policies de RLS, as funções RPC e agenda o
   `pg_cron`. Se `create extension pg_cron` / `pg_net` falhar por falta de
   permissão, habilite as extensões `pg_cron` e `pg_net` manualmente em
   **Database → Extensions** no Dashboard e rode `db push` novamente.

## 2. Templates de e-mail (pt-BR)

Os templates já estão em `supabase/templates/confirmation.html` e
`recovery.html`, referenciados em `supabase/config.toml`. Para um projeto
hospedado, tente primeiro:

```bash
npx supabase config push
```

Se a sua versão da CLI não suportar enviar `[auth.email.template.*]` para o
projeto remoto, copie o conteúdo de cada arquivo manualmente em
**Authentication → Email Templates** no Dashboard (campos "Confirm signup" e
"Reset password").

## 3. SMTP de produção

O serviço de e-mail embutido do Supabase é limitado (poucos e-mails por hora)
e destinado só a testes — **não é uma solução de produção**. Configure um
provedor SMTP em **Project Settings → Authentication → SMTP Settings**.

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

Depois de configurar o SMTP real, revise os limites de envio em
**Authentication → Rate Limits** (o valor local de teste é 2 e-mails/hora —
aumente conforme o plano do provedor SMTP permitir).

## 4. Redirect URLs de Auth

Em **Authentication → URL Configuration**, configure:

- **Site URL**: a URL de produção (ex.: `https://suaagenda.vercel.app` ou o domínio próprio).
- **Redirect URLs**: adicione, um por linha:
  - `https://<seu-dominio-de-producao>/**`
  - `https://<seu-projeto>-*.vercel.app/**` (previews do Vercel, se for usar)
  - `http://localhost:3000/**` (para continuar testando localmente contra o projeto hospedado, se desejar)

A rota `src/app/auth/confirm/route.ts` só redireciona para `/inicio` ou
`/redefinir-senha` (lista fechada no código) — o Redirect URL do Supabase é
uma camada adicional de proteção, não a única.

## 5. VAPID (Web Push)

Gere um par de chaves **novo para produção** (não reaproveite o par de
desenvolvimento):

```bash
node scripts/generate-vapid-keys.mjs
```

Configure:

- No Vercel (variáveis de ambiente do projeto): `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (um `mailto:` de contato válido).
- Como secret da Edge Function (não é a mesma coisa que env var do Next.js):

  ```bash
  npx supabase secrets set \
    VAPID_PUBLIC_KEY=<chave pública gerada> \
    VAPID_PRIVATE_KEY=<chave privada gerada> \
    VAPID_SUBJECT=mailto:contato@seudominio.com
  ```

## 6. Deploy da Edge Function de lembretes

```bash
npx supabase functions deploy send-reminders
```

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são injetadas automaticamente
pela plataforma para toda Edge Function — não precisam ser configuradas à mão.

## 7. Vault: credenciais para o `pg_cron` chamar a Edge Function

O `pg_cron` roda dentro do Postgres e não tem acesso direto às variáveis de
ambiente da aplicação — por isso a URL do projeto e a service role key ficam
no **Supabase Vault**, nunca em uma migration versionada. Rode uma vez no
SQL Editor do projeto (hospedado) e, se for testar localmente, no Studio
local também:

```sql
select vault.create_secret('https://<seu-project-ref>.supabase.co', 'project_url');
select vault.create_secret('<service_role_key>', 'service_role_key');
```

Para testar manualmente se o cron está disparando a function corretamente:

```sql
select private.invoke_send_reminders();
```

## 8. Deploy no Vercel

1. Importe o repositório no Vercel (Framework preset: Next.js — detectado automaticamente).
2. Configure as variáveis de ambiente (Production e Preview):

   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY        # nunca com prefixo NEXT_PUBLIC_
   NEXT_PUBLIC_VAPID_PUBLIC_KEY
   VAPID_PRIVATE_KEY                # nunca com prefixo NEXT_PUBLIC_
   VAPID_SUBJECT
   NEXT_PUBLIC_SITE_URL
   ```

3. Deploy. Build command e output são o padrão do Next.js — nada a customizar no `vercel.json`.
4. Depois do primeiro deploy, volte ao passo 4 (Redirect URLs) e confirme que a URL gerada pelo Vercel está na allowlist do Supabase Auth.

## 9. Domínio e DNS (opcional)

Se for usar domínio próprio: compre/configure o domínio no provedor de sua
escolha, aponte-o para o Vercel (CNAME/A conforme instruções do próprio
Vercel ao adicionar o domínio ao projeto) e atualize a Site URL/Redirect
URLs do Supabase Auth e `NEXT_PUBLIC_SITE_URL` para o novo domínio. Este
agente não registra domínios nem altera DNS sem autorização explícita.

## 10. Checklist pós-deploy

- [ ] Cadastro cria usuário e o e-mail de confirmação chega (via SMTP real).
- [ ] Login bloqueado antes da confirmação.
- [ ] Recuperação de senha funciona ponta a ponta.
- [ ] Criar/editar/excluir prova funciona e persiste.
- [ ] Um dispositivo real consegue ativar notificações e recebe um push de teste.
- [ ] `select private.invoke_send_reminders();` roda sem erro no SQL Editor.
- [ ] Página `/privacidade` com os dados reais do responsável preenchidos.

Ver `docs/CHECKLIST.md` para o checklist completo de testes e limites de
planos gratuitos.
