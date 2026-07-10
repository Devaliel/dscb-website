-- War Room — upcoming-match deck submission. Run once in Supabase SQL Editor → Run.
-- matches: opponent + schedule (PUBLIC read, powers the homepage countdown).
-- lineup_entries: the decks (AUTHENTICATED read only — never exposed to anon).

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  opponent_team text not null,
  public_label text,                 -- shown publicly instead of opponent when set
  tournament_name text not null default '',
  scheduled_at timestamptz not null,
  format text not null default 'relay',
  status text not null default 'open' check (status in ('open','locked','done')),
  notes text,
  expected_opponent_decks text,      -- captain scouting input (comma-separated) for the analyzer
  created_at timestamptz not null default now()
);

alter table public.matches enable row level security;
create policy "public read matches" on public.matches for select using (true);
create policy "team write matches"  on public.matches for insert to authenticated with check (true);
create policy "team update matches" on public.matches for update to authenticated using (true);
create policy "team delete matches" on public.matches for delete to authenticated using (true);

create table if not exists public.lineup_entries (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_handle text not null,
  deck_slug text,                    -- null when it's a custom/off-meta archetype
  deck_name text not null,
  lineup_role text not null default 'main' check (lineup_role in ('main','sub')),
  tech_note text,
  main_image text,                   -- storage path in the private "decklists" bucket
  side_image text,                   -- storage path, optional (3v3 side-deck formats)
  updated_at timestamptz not null default now(),
  unique (match_id, player_handle)
);

-- safe to re-run if the table was created before decklist images existed:
alter table public.lineup_entries add column if not exists main_image text;
alter table public.lineup_entries add column if not exists side_image text;

alter table public.lineup_entries enable row level security;
-- decks are team-only: no anon select policy exists, so anon reads return nothing
create policy "team read entries"   on public.lineup_entries for select to authenticated using (true);
create policy "team write entries"  on public.lineup_entries for insert to authenticated with check (true);
create policy "team update entries" on public.lineup_entries for update to authenticated using (true);
create policy "team delete entries" on public.lineup_entries for delete to authenticated using (true);
