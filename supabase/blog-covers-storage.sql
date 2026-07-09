-- Blog cover image storage — run this in Supabase SQL Editor → Run.
-- Creates a public bucket; team members (authenticated) can upload,
-- everyone can view. Anon key cannot upload.

insert into storage.buckets (id, name, public)
values ('blog-covers', 'blog-covers', true)
on conflict (id) do nothing;

create policy "team upload covers" on storage.objects
  for insert to authenticated with check (bucket_id = 'blog-covers');
create policy "public read covers" on storage.objects
  for select using (bucket_id = 'blog-covers');
