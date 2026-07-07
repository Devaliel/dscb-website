# Duel Standby · North Celebeast (DSCB)

Competitive Yu-Gi-Oh! team hub — deck tier list, player stats, tournament results
and a deck-vs-deck matchup grid. Dark, neon, card-art-forward.

Built with Next.js 16 (App Router) + Tailwind v4, motion (Framer Motion), GSAP,
Lenis smooth scroll. Card art via the free [YGOPRODeck](https://ygoprodeck.com/api-guide/)
image API. Designed to host free on Vercel with Supabase Postgres.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Pages

| Route | What it is |
|-------|------------|
| `/` | Home — hero, power-ranking tiles, latest event, featured players |
| `/decks` | Deck tier list grouped S→D |
| `/decks/[slug]` | Deck page — banner, stats, sample decklist, recent finishes |
| `/players` · `/players/[handle]` | Roster + player profiles |
| `/tournaments` · `/tournaments/[slug]` | Event list + standings |
| `/matchups` | Deck-vs-deck win-rate grid |

## Where the data lives

Right now every page reads from `src/lib/data.ts` (typed sample data). The UI only
depends on the accessor functions there (`getDecks`, `getPlayer`, …), so switching to
a live database is a drop-in.

### Connect Supabase (free)

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Add your data via the Table editor (or SQL / CSV import).
4. Copy `.env.example` → `.env.local` and fill:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
5. Replace the bodies of the accessors in `src/lib/data.ts` with queries using
   `getSupabase()` from `src/lib/supabase.ts` (client + helper already wired).

## Deck art

`src/lib/ygoprodeck.ts` builds image URLs from a card's passcode (the `signatureCardId`
on each deck, and `cardId` on each decklist entry). Cropped artwork drives the tiles
and banners; `CardArt` falls back to a neon gradient if an image fails to load.

## Deploy to Vercel (free)

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — it auto-detects Next.js.
3. Add the two `NEXT_PUBLIC_SUPABASE_*` env vars in the Vercel project settings.
4. Deploy.

Not affiliated with Konami. Card data and images © their respective owners, served via YGOPRODeck.
