-- Jobs e tentativas de envio de lembretes push. Nunca acessados pelo
-- navegador do atleta: RLS fica habilitado SEM políticas, o que nega
-- select/insert/update/delete para os papéis anon/authenticated. Somente a
-- Edge Function, autenticada com a service role key (que ignora RLS),
-- consegue ler e escrever aqui.

create table public.reminder_jobs (
  id uuid primary key default gen_random_uuid(),
  prova_id uuid not null references public.provas (id) on delete cascade,
  subscription_id uuid not null references public.push_subscriptions (id) on delete cascade,
  schedule_version integer not null,
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'sent', 'failed', 'canceled', 'expired')
  ),
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (prova_id, subscription_id, schedule_version)
);

comment on table public.reminder_jobs is
  'Um job por (prova, dispositivo, versão do agendamento). A chave única evita duplicidade e invalida jobs antigos quando schedule_version muda.';

create index reminder_jobs_status_scheduled_for_idx
  on public.reminder_jobs (status, scheduled_for)
  where status = 'pending';

create trigger reminder_jobs_set_updated_at
  before update on public.reminder_jobs
  for each row
  execute function public.set_updated_at();

create table public.reminder_attempts (
  id uuid primary key default gen_random_uuid(),
  reminder_job_id uuid not null references public.reminder_jobs (id) on delete cascade,
  attempted_at timestamptz not null default now(),
  success boolean not null,
  http_status integer,
  error text,
  created_at timestamptz not null default now()
);

comment on table public.reminder_attempts is
  'Histórico de tentativas de envio de cada reminder_job, sem dados sensíveis (sem payload de notificação).';

create index reminder_attempts_job_id_idx on public.reminder_attempts (reminder_job_id);

alter table public.reminder_jobs enable row level security;
alter table public.reminder_attempts enable row level security;
