# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Duel Standby · North Celebeast (DSCB) — a Yu-Gi-Oh! competitive team's public site
(deck tier list, player stats, tournament results, matchup grid) plus **War Room**,
a private internal portal for the team. Next.js 16 (App Router) + React 19 + Tailwind v4,
Supabase (Postgres + Storage + Auth) as the optional live backend, deployed to Vercel.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build — run this before claiming a change works
npm run lint      # eslint (flat config, eslint-config-next)
```

There is no test suite configured. Treat `npm run build` + `npm run lint` as the
correctness bar, and check the affected route in the browser for anything visual.

## Architecture

### Two route groups, deliberately separate chrome

- `src/app/(site)/…` — the public site. Uses the shared nav/footer from
  `src/app/(site)/layout.tsx`.
- `src/app/(portal)/warroom/…` — the private team portal. `src/app/(portal)/layout.tsx`
  renders its own slim header with **zero** public nav/footer chrome — it's a
  standalone internal tool, not a themed sub-page of the site.
- `/admin` (`src/app/(site)/admin/page.tsx`) is a permanent redirect to `/warroom` —
  the blog editor used to live there and is now a tab inside War Room. Keep the
  redirect; don't resurrect a separate admin UI.

### Data layer: static fallback, Supabase-backed when configured

`src/lib/data.ts` is the historical, typed sample/real data (decks, players,
tournaments — currently ~2000 lines of hand-entered Jawir 2026 / TDC S1 2025 /
Legend Cup S2 results). Every public page reads through the accessor functions
there, not through Supabase directly, so pages don't care whether data is static
or live.

`src/lib/supabase.ts` exports `getSupabase()` (server, anon key, no session) and
`getBrowserSupabase()` (browser, persisted session — used by War Room auth).
`supabaseEnabled` gates every DB-backed feature; when env vars are absent the app
falls back to static data instead of throwing. War Room's own data
(`src/lib/warroom.ts`: matches, lineup entries, scrims, key-card tallies) and blog posts
(`src/lib/blog-db.ts`, DB rows merged over static placeholders in `src/lib/blog.ts`,
DB wins on slug collision) both follow this same "DB if present, static otherwise"
pattern — preserve it when touching either.

SQL migrations live in `supabase/*.sql` as flat, additive files (`schema.sql`,
`warroom-schema.sql`, `blog-schema.sql`, `decklists-storage.sql`, …) — there's no
migration runner, they're applied by hand in the Supabase SQL editor. Add new
tables/columns as a new file rather than editing an already-applied one.

### War Room auth model

Team members sign in via Supabase Auth (email); `EMAIL_TO_HANDLE` in
`src/lib/blog-db.ts` maps auth emails to player handles used everywhere else in
the data model. There's no separate admin role — the captain has extra UI
(proxy-submit for teammates without logins, edit/delete matches) gated in the
War Room page itself, not by a DB role. Decklist images go to a **private**
Storage bucket (`decklists`); always serve them via `signedUrls()` in
`src/lib/warroom.ts`, never a public URL.

### Tournament formats are not uniform

`src/lib/types.ts`'s `Tournament.relay` flag distinguishes two structurally
different formats: standard best-of-3 "babak" team tournaments (`weeks[].rounds`)
vs. survival-relay "kachinuki" tournaments (winner stays on, first to 5 game wins),
rendered by the bespoke `src/components/relay-match.tsx` baton-chain component
instead of the standard round table. When adding a new tournament, check which
format it actually is before reusing an existing renderer.

### Card art

`src/lib/ygoprodeck.ts` builds card-art image URLs from a YGOPRODeck passcode
(`Deck.signatureCardId` / decklist `cardId`). A `signatureCardId` of `0` means
"no known passcode" — `CardArt` (`src/components/card-art.tsx`) falls back to a
neon gradient rather than a broken image. Decks also support a local high-res
`image` path (`/deck-art/*.jpg`, in `public/`) which wins over the passcode URL
when present — new archetypes should get a real uploaded image, not just rely on
the API crop.

### Design system

`src/components/persona/*` (P-Button, P-Panel, Star, TransitionProvider) is a
shared visual language reused across both route groups — prefer composing with
these over ad hoc buttons/panels. Tier colors (`TIER_COLOR`, `TIER_ORDER` in
`src/lib/utils.ts`) are CSS custom properties defined in `src/app/globals.css`,
not hex literals in components. The owner has a strong bar for bespoke, non-template
visual design — see project conventions before defaulting to generic UI.
