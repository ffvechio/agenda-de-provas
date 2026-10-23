-- Cria ou atualiza uma prova e substitui suas etapas em uma única
-- transação (evita registros órfãos se a escrita de etapas falhasse em
-- chamadas separadas). SECURITY INVOKER: roda com o papel de quem chama,
-- então as policies de RLS de provas/prova_etapas continuam valendo
-- normalmente — esta função não é um jeito de contornar RLS.
create or replace function public.salvar_prova_com_etapas(
  p_id uuid,
  p_dados jsonb,
  p_etapas jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_id is null then
    insert into public.provas (
      user_id, nome, data, modalidade, modalidade_outra,
      distancia_valor, distancia_unidade, cidade, estado, pais,
      situacao, horario_largada, local, link_oficial, observacoes,
      desnivel_positivo_m, notificar_interesse
    ) values (
      auth.uid(),
      p_dados ->> 'nome',
      (p_dados ->> 'data')::date,
      p_dados ->> 'modalidade',
      nullif(p_dados ->> 'modalidade_outra', ''),
      (p_dados ->> 'distancia_valor')::numeric,
      nullif(p_dados ->> 'distancia_unidade', ''),
      p_dados ->> 'cidade',
      p_dados ->> 'estado',
      p_dados ->> 'pais',
      p_dados ->> 'situacao',
      nullif(p_dados ->> 'horario_largada', '')::time,
      nullif(p_dados ->> 'local', ''),
      nullif(p_dados ->> 'link_oficial', ''),
      nullif(p_dados ->> 'observacoes', ''),
      (p_dados ->> 'desnivel_positivo_m')::integer,
      coalesce((p_dados ->> 'notificar_interesse')::boolean, false)
    )
    returning id into v_id;
  else
    update public.provas set
      nome = p_dados ->> 'nome',
      data = (p_dados ->> 'data')::date,
      modalidade = p_dados ->> 'modalidade',
      modalidade_outra = nullif(p_dados ->> 'modalidade_outra', ''),
      distancia_valor = (p_dados ->> 'distancia_valor')::numeric,
      distancia_unidade = nullif(p_dados ->> 'distancia_unidade', ''),
      cidade = p_dados ->> 'cidade',
      estado = p_dados ->> 'estado',
      pais = p_dados ->> 'pais',
      situacao = p_dados ->> 'situacao',
      horario_largada = nullif(p_dados ->> 'horario_largada', '')::time,
      local = nullif(p_dados ->> 'local', ''),
      link_oficial = nullif(p_dados ->> 'link_oficial', ''),
      observacoes = nullif(p_dados ->> 'observacoes', ''),
      desnivel_positivo_m = (p_dados ->> 'desnivel_positivo_m')::integer,
      notificar_interesse = coalesce((p_dados ->> 'notificar_interesse')::boolean, false)
    where id = p_id and user_id = auth.uid()
    returning id into v_id;

    if v_id is null then
      raise exception 'Prova não encontrada ou sem permissão.';
    end if;

    delete from public.prova_etapas where prova_id = v_id;
  end if;

  insert into public.prova_etapas (prova_id, ordem, modalidade, distancia_valor, distancia_unidade)
  select
    v_id,
    (etapa ->> 'ordem')::smallint,
    etapa ->> 'modalidade',
    (etapa ->> 'distancia_valor')::numeric,
    etapa ->> 'distancia_unidade'
  from jsonb_array_elements(coalesce(p_etapas, '[]'::jsonb)) as etapa;

  return v_id;
end;
$$;

revoke execute on function public.salvar_prova_com_etapas(uuid, jsonb, jsonb) from public;
grant execute on function public.salvar_prova_com_etapas(uuid, jsonb, jsonb) to authenticated;
