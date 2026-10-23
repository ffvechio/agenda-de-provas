create table public.provas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  nome text not null check (char_length(nome) between 1 and 160),
  data date not null,
  modalidade text not null check (
    modalidade in (
      'corrida_rua', 'trail_running', 'ultramaratona',
      'triatlon', 'duatlon', 'aquatlon', 'outra'
    )
  ),
  modalidade_outra text check (char_length(modalidade_outra) <= 80),

  -- Distância única (modalidades de etapa só); provas multisport guardam a
  -- distância por etapa em prova_etapas e podem deixar estes campos nulos.
  distancia_valor numeric(8, 3) check (distancia_valor is null or distancia_valor > 0),
  distancia_unidade text check (distancia_unidade is null or distancia_unidade in ('km', 'm')),

  cidade text not null check (char_length(cidade) between 1 and 120),
  estado text not null check (char_length(estado) between 1 and 80),
  pais text not null default 'Brasil' check (char_length(pais) between 1 and 80),

  situacao text not null default 'interesse' check (situacao in ('interesse', 'inscrito')),
  cancelada boolean not null default false,
  resultado text check (resultado is null or resultado in ('concluida', 'nao_largou', 'nao_concluiu')),

  horario_largada time,
  local text check (local is null or char_length(local) <= 200),
  link_oficial text check (
    link_oficial is null
    or (char_length(link_oficial) <= 500 and link_oficial ~* '^https?://')
  ),
  observacoes text check (observacoes is null or char_length(observacoes) <= 2000),
  desnivel_positivo_m integer check (desnivel_positivo_m is null or desnivel_positivo_m >= 0),

  -- Provas de "interesse" só recebem lembrete se o atleta ativar por prova.
  notificar_interesse boolean not null default false,

  -- Incrementada sempre que data/situação/cancelamento mudam de um jeito que
  -- invalida lembretes já agendados (ver trigger abaixo e reminder_jobs).
  schedule_version integer not null default 1,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint modalidade_outra_preenchida check (
    modalidade <> 'outra' or (modalidade_outra is not null and char_length(modalidade_outra) > 0)
  ),
  constraint distancia_unica_exigida check (
    modalidade in ('triatlon', 'duatlon', 'aquatlon')
    or (distancia_valor is not null and distancia_unidade is not null)
  )
);

comment on table public.provas is 'Provas pessoais cadastradas por um atleta (interesse, inscrito ou histórico).';

create index provas_user_id_data_idx on public.provas (user_id, data desc);
create index provas_user_id_situacao_idx on public.provas (user_id, situacao);

create trigger provas_set_updated_at
  before update on public.provas
  for each row
  execute function public.set_updated_at();

create or replace function public.bump_schedule_version()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.data is distinct from old.data
     or new.situacao is distinct from old.situacao
     or new.cancelada is distinct from old.cancelada then
    new.schedule_version = old.schedule_version + 1;
  end if;
  return new;
end;
$$;

comment on function public.bump_schedule_version() is
  'Invalida lembretes agendados anteriormente quando data, situação ou cancelamento mudam.';

create trigger provas_bump_schedule_version
  before update on public.provas
  for each row
  execute function public.bump_schedule_version();

alter table public.provas enable row level security;

create policy "provas_select_own"
  on public.provas for select
  using (auth.uid() = user_id);

create policy "provas_insert_own"
  on public.provas for insert
  with check (auth.uid() = user_id);

create policy "provas_update_own"
  on public.provas for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "provas_delete_own"
  on public.provas for delete
  using (auth.uid() = user_id);
