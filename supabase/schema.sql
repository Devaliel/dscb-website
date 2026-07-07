-- DSCB team site — Postgres schema for Supabase.
-- Run in Supabase SQL editor. RLS enabled + public read (site is read-only).

create table if not exists decks (
  slug              text primary key,
  name              text not null,
  tier              text not null check (tier in ('S','A','B','C','D')),
  accent            text not null default '#b026ff',
  signature_card_id bigint not null,
  wins              int not null default 0,
  losses            int not null default 0,
  description       text default '',
  sample_list       jsonb not null default '[]',   -- [{name,count,cardId}]
  banner_url        text
);

create table if not exists players (
  handle         text primary key,
  name           text not null,
  role           text not null default 'Member',
  tagline        text default '',
  bio            text default '',
  titles         int not null default 0,
  wins           int not null default 0,
  losses         int not null default 0,
  main_deck_slug text references decks(slug),
  socials        jsonb not null default '[]',       -- [{label,url}]
  avatar_url     text
);

create table if not exists tournaments (
  slug         text primary key,
  name         text not null,
  date         date not null,
  format       text default '',
  location     text default '',
  participants int not null default 0,
  banner_url   text
);

create table if not exists tournament_results (
  id              bigint generated always as identity primary key,
  tournament_slug text references tournaments(slug) on delete cascade,
  player_handle   text references players(handle),
  deck_slug       text references decks(slug),
  placement       int not null,
  wins            int not null default 0,
  losses          int not null default 0
);

-- Optional: raw match log powering win rates + matchup grid.
create table if not exists matches (
  id               bigint generated always as identity primary key,
  tournament_slug  text references tournaments(slug),
  player_handle    text references players(handle),
  player_deck_slug text references decks(slug),
  opp_deck_slug    text references decks(slug),
  result           text not null check (result in ('win','loss')),
  played_at        date default now()
);

-- Public read-only access
alter table decks               enable row level security;
alter table players             enable row level security;
alter table tournaments         enable row level security;
alter table tournament_results  enable row level security;
alter table matches             enable row level security;

do $$
declare t text;
begin
  foreach t in array array['decks','players','tournaments','tournament_results','matches'] loop
    execute format('drop policy if exists "public read" on %I;', t);
    execute format('create policy "public read" on %I for select using (true);', t);
  end loop;
end $$;
