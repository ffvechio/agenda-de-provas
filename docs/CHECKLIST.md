# Checklist de testes e limites — Minha Agenda de Provas

## 1. Testes automatizados executados

`npm run lint`, `npm run typecheck`, `npm run test` e `npm run build` rodam
limpos neste repositório (verificado em 2026-10-23). Cobertura por `npm run test`
(Vitest, relógio controlável via `vi.useFakeTimers`/`vi.setSystemTime`):

- [x] Normalização de e-mail (trim + minúsculas, sem remover pontos/sufixos).
- [x] Política de senha (mínimo 12, máximo 72 caracteres documentado).
- [x] Validação de data de nascimento (rejeita data futura, aceita hoje e passado).
- [x] `cadastroSchema`: dados válidos, senha curta, confirmação divergente, e-mail inválido, data futura.
- [x] `loginSchema`: e-mail/senha obrigatórios.
- [x] `destinoSeguro` (proteção contra open redirect no `?redirect=` pós-login).
- [x] Formatação de data DD/MM/AAAA sem passar por `Date`/UTC.
- [x] `diasEntre`/`diasRestantes`/`hojeNoFuso`: virada de mês, virada de ano, e data de calendário calculada no fuso do atleta (não em UTC) — inclui o caso em que o dia em UTC e no fuso do atleta diferem.
- [x] `provaSchema`: distância obrigatória para modalidade única, nome obrigatório quando modalidade "outra", mínimo de 2 etapas para modalidades multisport, validação do link oficial (precisa de `http(s)://`).

Dois bugs reais foram encontrados e corrigidos graças aos testes/validação
real (não apareceriam só com lint/typecheck):

1. A validação de e-mail rodava **antes** da normalização (trim), então um
   e-mail digitado com espaço nas pontas era rejeitado por formato em vez de
   normalizado. Corrigido em `src/lib/auth/schemas.ts`.
2. Em `reivindicar_lembretes_pendentes`, a subquery de claim referenciava
   `scheduled_for`/`status` sem alias, ambíguo com a tabela alvo do UPDATE —
   só aparece ao rodar de verdade contra Postgres. Corrigido nas migrations
   de `reminder_jobs`.

## 2. Testes manuais/ponta-a-ponta — executados neste ambiente (2026-10-23)

Docker foi iniciado e `npx supabase start` rodou com sucesso, então foi
possível validar vários itens de ponta a ponta contra o Supabase **local**
(Postgres + Auth + Mailpit reais) e contra o dev server real do Next.js,
inclusive em um navegador headless (Playwright, viewport 375×812 — mobile).

**Verificado com sucesso** (`scripts/verify-e2e-local.mjs`, rodado e com
saída 100% ✅ — reproduzível a qualquer momento com `supabase start` ativo):

- [x] Cadastro cria o usuário e o e-mail de confirmação chega no Mailpit local.
- [x] O link de confirmação (rota real `/auth/confirm` do Next.js, não só a API do Supabase) confirma a conta e cria sessão.
- [x] `profiles` é criado automaticamente pelo trigger `on_auth_user_created` com os dados do cadastro.
- [x] Login funciona após a confirmação.
- [x] Criar prova via RPC `salvar_prova_com_etapas` e lê-la de volta.
- [x] **Isolamento de RLS entre dois usuários**: usuário B não consegue **ler**, **atualizar** nem **excluir** uma prova do usuário A via API direta (3 tentativas, 3 bloqueios confirmados).
- [x] Ciclo completo de um `reminder_job`: claim atômico (`reivindicar_lembretes_pendentes`, status vira `processing`) → `concluir_tentativa_lembrete` (status `sent`) → 1 linha criada em `reminder_attempts`.
- [x] Cancelar uma prova cancela automaticamente (trigger `bump_schedule_version`) um `reminder_job` pendente associado a ela.
- [x] Excluir a conta (Admin API) remove provas e subscriptions em cascata.

**Verificado visualmente** (Playwright headless, mobile 375px, screenshots
em `/tmp/shots/` durante a sessão — não versionadas):

- [x] Tela de Início após login (saudação, resumo, próximas provas).
- [x] Formulário de nova prova multisport (Triatlon) com 3 etapas (natação/ciclismo/corrida).
- [x] Detalhe da prova com etapas, contagem de dias e ações.
- [x] Lista de Minhas Provas com busca e filtros.
- [x] Calendário mensal — **bug encontrado e corrigido**: o `Calendar` (react-day-picker) não recebia `locale`, então mês e dias da semana apareciam em inglês ("October", "Su Mo Tu..."). Corrigido passando `locale={ptBR}` de `react-day-picker/locale` em `ProvasCalendario`; confirmado depois mostrando "outubro 2026" e "dom seg ter...".
- [x] Tela de Perfil (dados pessoais, e-mail, troca de senha, preferências).
- [x] Nenhum erro de console/página JS em nenhuma das telas acima.
- [x] Sem rolagem horizontal em 375px em nenhuma das telas visitadas.

**Limitação observada, não é bug**: o campo nativo `<input type="date">`
exibe a data no formato do locale do **navegador/SO** do usuário, não do
`lang="pt-BR"` da página — é um comportamento padrão de todos os
navegadores para esse tipo de input (fora do controle da aplicação). Em um
navegador/SO configurado em pt-BR (o caso da grande maioria dos usuários
reais do produto), o campo já mostra DD/MM/AAAA nativamente. O valor
armazenado e qualquer data renderizada pelo próprio app (cards, detalhe,
calendário, lembretes) usa sempre `formatarDataBr` e está em DD/MM/AAAA
como pedido.

**Segue pendente** (depende de credenciais de produção, dispositivo físico,
ou tempo de execução fora do controle deste ambiente):

- [ ] Reenvio de confirmação e cenário de link expirado/já usado (o fluxo existe e foi lido no código, mas não forçamos um token expirado de propósito).
- [ ] Retomar um cadastro interrompido sem duplicar conta (comportamento documentado e decorre do próprio Supabase Auth; não forçamos esse cenário específico).
- [ ] Fluxo completo de recuperação de senha ponta a ponta (login → esqueci senha → e-mail → nova senha → outras sessões invalidadas).
- [ ] Sessão persistente entre reloads reais do navegador e em mais de um dispositivo simultâneo.
- [ ] Alertas de duplicidade de prova (nome + data) — implementado e coberto por `buscarPossiveisDuplicatas`, não exercido no teste de navegador.
- [ ] `criar_lembretes_do_dia()` realmente criando jobs na janela das 09:00 locais (o teste validou o restante do pipeline inserindo um `reminder_job` manualmente; a criação automática depende do horário real do servidor Postgres bater com a janela, não controlável facilmente em um teste local pontual).
- [ ] Concorrência real: duas invocações simultâneas da Edge Function não processam o mesmo job duas vezes (a garantia é do `FOR UPDATE SKIP LOCKED`, testada estruturalmente mas não sob carga).
- [ ] Push negado pelo usuário / navegador sem suporte — UI foi lida no código, não clicada de propósito negando a permissão.
- [ ] **Recebimento real de um push** em um dispositivo físico (Chrome/Edge Android, Chrome/Edge/Firefox desktop, Safari iOS 16.4+ com o PWA instalado).
- [ ] Troca de conta no mesmo dispositivo com push ativo.
- [ ] Teste visual em tablet e desktop (só mobile 375px foi verificado visualmente).
- [ ] Navegação por teclado e leitor de tela nos formulários.
- [ ] `prefers-reduced-motion` respeitado (confirmar visualmente; nenhuma animação do app é essencial).

Dados fictícios de teste: usar apenas o Supabase **local**. Não criar
contas/provas de teste no projeto de produção. `scripts/verify-e2e-local.mjs`
limpa os usuários de teste que cria (exclusão em cascata) ao final.

## 3. Limitações conhecidas e documentadas (por design)

- Web Push não garante entrega, nem exatamente uma entrega — é uma
  limitação do protocolo, não um bug. TTL de 3 dias e deduplicação por
  `tag` reduzem o impacto de reenvios.
- Lembretes não são enviados retroativamente: se a prova for cadastrada
  depois da janela das 09:00 locais do dia em que o lembrete de 5 dias
  deveria disparar, aquele lembrete específico não é criado.
- O MVP assume conexão com a internet (nenhum dado privado é armazenado em
  cache); offline mostra uma página estática de aviso, sem funcionalidade.
- iOS exige o PWA instalado na tela de início para notificações push
  funcionarem (Safari não oferece push para abas normais do navegador).

## 4. Limites dos planos gratuitos (verificado em supabase.com/pricing e vercel.com/docs/plans/hobby, 2026-10-23)

### Supabase Free

| Recurso | Limite |
| --- | --- |
| Banco de dados | 500 MB |
| Armazenamento de arquivos | 1 GB |
| Egress | 5 GB (+ 5 GB egress em cache) |
| Usuários ativos mensais (Auth) | 50.000 |
| Invocações de Edge Functions | 500.000/mês |
| Realtime | 200 conexões simultâneas, 2M mensagens/mês |
| Projetos ativos | 2 por organização |
| **Pausa automática** | **projetos gratuitos pausam após 1 semana sem requisições à API** |

O ponto mais relevante para este produto é a **pausa por inatividade**: um
projeto pessoal com pouco uso pode pausar sozinho, o que também interrompe o
`pg_cron` de lembretes. Para um produto em uso real, mesmo que pequeno, vale
considerar o plano pago (Pro) justamente para evitar a pausa e ter mais
margem de banco de dados/egress.

### Vercel Hobby

| Recurso | Limite |
| --- | --- |
| Fast Data Transfer | 100 GB incluídos |
| Invocações de função | 1.000.000 incluídas |
| Duração máxima de função | 300s |
| Deployments por dia | 100 |
| Logs de runtime | retidos por 1 hora |
| **Uso** | **restrito a uso pessoal/não comercial pelos termos do plano Hobby** |

Se este produto deixar de ser um projeto pessoal (ex.: passar a ter usuários
reais de forma contínua ou qualquer modelo de monetização), o plano Hobby da
Vercel deixa de ser apropriado pelos próprios termos de uso — migrar para o
plano Pro nesse momento.

### Pontos de revisão ao crescer

- Banco de dados perto de 500 MB ou egress perto de 5 GB/mês → avaliar Supabase Pro.
- Mais de ~500k invocações de Edge Function/mês (lembretes + uso do app) → avaliar Supabase Pro.
- Uso deixa de ser pessoal/hobby → migrar a Vercel para o plano Pro (exigência contratual, não só técnica).
- Volume de e-mail transacional (confirmação/recuperação) perto do limite do plano gratuito do provedor SMTP escolhido → avaliar plano pago do provedor.
