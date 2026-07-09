-- Site visit counter — run this in Supabase SQL Editor → Run.
-- Single-row table; visitors bump it via the SECURITY DEFINER RPC below,
-- so no write policy is ever exposed to the anon key.

create table if not exists site_visits (
  id int primary key default 1 check (id = 1),
  count bigint not null default 0
);
insert into site_visits (id, count) values (1, 0) on conflict do nothing;

alter table site_visits enable row level security;
create policy "read visits" on site_visits for select using (true);
-- no insert/update/delete policies — writes only via the RPC below

create or replace function increment_visits()
returns bigint
language sql
security definer
set search_path = public
as $$
  update site_visits set count = count + 1 where id = 1
  returning count;
$$;

grant execute on function increment_visits() to anon;
