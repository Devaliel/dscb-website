-- War Room — scrim (practice-match) history. Run once in Supabase SQL Editor → Run.
-- scrims: one row per practice session vs another team; the individual games ride
-- as a jsonb array (same pattern as matches.shared_cards / lineup_entries.key_cards)
-- since the whole session is logged by one person in one form.
-- Team-only: NO anon select policy — scrim results never leak to the public site.

create table if not exists public.scrims (
  id uuid primary key default gen_random_uuid(),
  opponent_team text not null,
  played_at timestamptz not null,
  format text not null default '',          -- free text, e.g. "BO1 grind", "relay practice"
  notes text,
  logged_by text not null,                  -- player handle of whoever logged it
  games jsonb not null default '[]'::jsonb, -- [{"player":"Darkzill","deckSlug":"kewl-tune","deckName":"Kewl Tune","oppDeck":"Maliss","result":"win"}]
  created_at timestamptz not null default now()
);

alter table public.scrims enable row level security;
create policy "team read scrims"   on public.scrims for select to authenticated using (true);
create policy "team write scrims"  on public.scrims for insert to authenticated with check (true);
create policy "team update scrims" on public.scrims for update to authenticated using (true);
create policy "team delete scrims" on public.scrims for delete to authenticated using (true);

-- always finish with this so Supabase's REST layer picks up new columns immediately:
notify pgrst, 'reload schema';
