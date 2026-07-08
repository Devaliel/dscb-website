-- DSCB blog backend — run this once in Supabase SQL Editor.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null default '',
  tag text not null default 'Team News',
  cover text not null default '/deck-art/kewl-tune.jpg',
  author_handle text not null,
  body jsonb not null default '[]'::jsonb, -- [{ "type": "p" | "h2", "text": "..." }]
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

-- anyone can read published posts
create policy "public read published"
  on public.posts for select
  using (published);

-- only logged-in team members can write
create policy "authenticated insert"
  on public.posts for insert
  to authenticated
  with check (true);

create policy "authenticated update"
  on public.posts for update
  to authenticated
  using (true);

create policy "authenticated delete"
  on public.posts for delete
  to authenticated
  using (true);
