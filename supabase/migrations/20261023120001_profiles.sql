-- Perfil do atleta, 1:1 com auth.users.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 120),
  data_nascimento date not null check (data_nascimento <= current_date),
  fuso_lembretes text not null default 'America/Sao_Paulo',
  notificacoes_ativas boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Dados de perfil do atleta associados a auth.users.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Cria automaticamente o perfil quando um usuário confirma/realiza o cadastro
-- no Supabase Auth, usando os metadados enviados em signUp({ options: { data } }).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.raw_user_meta_data ->> 'nome' is null
     or new.raw_user_meta_data ->> 'data_nascimento' is null then
    raise exception 'nome e data_nascimento são obrigatórios em signUp options.data';
  end if;

  insert into public.profiles (id, nome, data_nascimento)
  values (
    new.id,
    new.raw_user_meta_data ->> 'nome',
    (new.raw_user_meta_data ->> 'data_nascimento')::date
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
