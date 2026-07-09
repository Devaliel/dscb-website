-- Guestbook table — run this in Supabase SQL Editor → Run.
-- Visitors can insert (anonymous); anon key cannot update or delete rows.
-- Delete spam via the Supabase Table Editor or dashboard.

create table if not exists guestbook (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  message text not null check (char_length(message) between 1 and 280),
  created_at timestamptz default now()
);

alter table guestbook enable row level security;

create policy "public read" on guestbook for select using (true);
create policy "public sign" on guestbook for insert
  with check (char_length(name) > 0 and char_length(message) > 0);
