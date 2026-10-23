create table public.prova_etapas (
  id uuid primary key default gen_random_uuid(),
  prova_id uuid not null references public.provas (id) on delete cascade,
  ordem smallint not null check (ordem >= 1),
  modalidade text not null check (char_length(modalidade) between 1 and 60),
  distancia_valor numeric(8, 3) not null check (distancia_valor > 0),
  distancia_unidade text not null check (distancia_unidade in ('km', 'm')),
  created_at timestamptz not null default now(),
  unique (prova_id, ordem)
);

comment on table public.prova_etapas is
  'Etapas ordenadas de provas multisport (ex.: natação, ciclismo, corrida).';

create index prova_etapas_prova_id_idx on public.prova_etapas (prova_id);

alter table public.prova_etapas enable row level security;

create policy "prova_etapas_select_own"
  on public.prova_etapas for select
  using (
    exists (
      select 1 from public.provas p
      where p.id = prova_etapas.prova_id and p.user_id = auth.uid()
    )
  );

create policy "prova_etapas_insert_own"
  on public.prova_etapas for insert
  with check (
    exists (
      select 1 from public.provas p
      where p.id = prova_etapas.prova_id and p.user_id = auth.uid()
    )
  );

create policy "prova_etapas_update_own"
  on public.prova_etapas for update
  using (
    exists (
      select 1 from public.provas p
      where p.id = prova_etapas.prova_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.provas p
      where p.id = prova_etapas.prova_id and p.user_id = auth.uid()
    )
  );

create policy "prova_etapas_delete_own"
  on public.prova_etapas for delete
  using (
    exists (
      select 1 from public.provas p
      where p.id = prova_etapas.prova_id and p.user_id = auth.uid()
    )
  );
