create table public.trace_production_presets (
 id uuid primary key default gen_random_uuid(),
 name text not null check (btrim(name) <> ''),
 conservation text not null check (conservation in ('AMBIENTE','FRIGO','GELO')),
 suppliers text[] not null check (cardinality(suppliers)>0),
 supplier_lot_counts jsonb not null default '{}'::jsonb check (jsonb_typeof(supplier_lot_counts)='object'),
 created_at timestamptz not null default now()
);
create unique index trace_production_presets_name on public.trace_production_presets(lower(btrim(name)));
alter table public.trace_production_presets enable row level security;
grant select,insert,update on public.trace_production_presets to authenticated;
create policy presets_read on public.trace_production_presets for select to authenticated using ((select trace_private.is_active_account()));
create policy presets_insert on public.trace_production_presets for insert to authenticated with check ((select trace_private.is_active_account()));
create policy presets_update on public.trace_production_presets for update to authenticated using ((select trace_private.is_active_account())) with check ((select trace_private.is_active_account()));
insert into public.trace_production_presets(name,conservation,suppliers)
select p.name,p.conservation,s.names from
 (select distinct on(lower(btrim(name))) * from public.trace_productions where conservation in ('AMBIENTE','FRIGO','GELO') order by lower(btrim(name)),created_at desc,id desc) p
cross join lateral (select array_agg(distinct btrim(a.supplier)) names from public.trace_production_arrivals l join public.trace_arrivals a on a.id=l.arrival_id where l.production_id=p.id and nullif(btrim(a.supplier),'') is not null)s
where cardinality(s.names)>0;

create function public.trace_produce_preset(preset_id uuid)
returns public.trace_productions language plpgsql security invoker set search_path = '' as $$
declare preset public.trace_production_presets; result public.trace_productions; arrival_ids uuid[]; supplier_name text; picked uuid[]; day date := (now() at time zone 'Europe/Rome')::date;
begin
 if not coalesce(trace_private.is_active_account(),false) then raise exception 'Account non attivo'; end if;
 select * into strict preset from public.trace_production_presets where id=preset_id;
 arrival_ids := array[]::uuid[];
 foreach supplier_name in array preset.suppliers loop
  select array_agg(a.id) into picked from (select id from public.trace_arrivals where lower(btrim(supplier))=lower(btrim(supplier_name)) and coalesce(delivery_date,created_at::date)<=day order by coalesce(delivery_date,created_at::date) desc,created_at desc,id desc limit greatest(1,least(100,coalesce((preset.supplier_lot_counts->>supplier_name)::integer,2))))a;
  if coalesce(cardinality(picked),0)=0 then raise exception 'Nessun lotto disponibile per il fornitore %',supplier_name; end if;
  arrival_ids := arrival_ids || picked;
 end loop;
 insert into public.trace_productions(production_lot,name,production_date,expiry_date,conservation)
 values('',preset.name,day,day+case preset.conservation when 'AMBIENTE' then 120 when 'FRIGO' then 7 else 90 end,preset.conservation) returning * into result;
 insert into public.trace_production_arrivals(production_id,arrival_id) select result.id,id from (select distinct unnest(arrival_ids) id)a;
 return result;
end $$;
revoke all on function public.trace_produce_preset(uuid) from public,anon;
grant execute on function public.trace_produce_preset(uuid) to authenticated;
