-- Guestbook v2 migration — run this in Supabase SQL Editor → Run.
-- Adds: replies (parent_id), team-verified posts (is_team + author_handle),
-- and an emoji reactions table. Anonymous posting still works — team login
-- only unlocks the verified badge.

-- replies
alter table guestbook add column if not exists parent_id uuid references guestbook(id) on delete cascade;

-- team-verified posts
alter table guestbook add column if not exists is_team boolean not null default false;
alter table guestbook add column if not exists author_handle text;

-- tighten anon inserts, allow team inserts only when authenticated
drop policy if exists "public sign" on guestbook;
create policy "public sign" on guestbook for insert to anon
  with check (char_length(name) > 0 and char_length(message) > 0
              and is_team = false and author_handle is null);
create policy "team sign" on guestbook for insert to authenticated
  with check (char_length(name) > 0 and char_length(message) > 0);

-- reactions (insert-only rows; counts aggregated client-side)
create table if not exists guestbook_reactions (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references guestbook(id) on delete cascade,
  emoji text not null check (emoji in ('🔥','❤️','😂','👀','GG')),
  created_at timestamptz default now()
);
create index if not exists idx_gbr_entry on guestbook_reactions(entry_id);
alter table guestbook_reactions enable row level security;
create policy "read reactions" on guestbook_reactions for select using (true);
create policy "add reactions" on guestbook_reactions for insert with check (true);
