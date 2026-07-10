-- War Room decklist images — run once in Supabase SQL Editor → Run.
-- PRIVATE bucket: only logged-in team members can upload or view (via signed URLs).
-- Anon has no select policy, so decklist screenshots are never public.

insert into storage.buckets (id, name, public)
values ('decklists', 'decklists', false)
on conflict (id) do nothing;

create policy "team upload decklists" on storage.objects
  for insert to authenticated with check (bucket_id = 'decklists');
create policy "team read decklists" on storage.objects
  for select to authenticated using (bucket_id = 'decklists');
create policy "team update decklists" on storage.objects
  for update to authenticated using (bucket_id = 'decklists');
create policy "team delete decklists" on storage.objects
  for delete to authenticated using (bucket_id = 'decklists');
