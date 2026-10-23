-- Funções utilitárias reaproveitadas pelos triggers das tabelas do produto.
-- search_path fixo vazio + nomes totalmente qualificados por recomendação de
-- segurança do Supabase (evita search_path hijacking em funções SECURITY DEFINER).

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Atualiza updated_at para now() antes de qualquer UPDATE.';
