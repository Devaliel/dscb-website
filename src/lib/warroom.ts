import { getBrowserSupabase, getSupabase, supabaseEnabled } from "./supabase";

/** A card the captain has designated as team-shared for a match — exempt from the team-wide copy cap. */
export interface SharedCard {
  name: string;
}

/** A tracked "key card" on a lineup entry — free-text name, not id-matched. */
export interface KeyCard {
  name: string;
  count: number;
  deck: 1 | 2; // which of the player's (up to two) decks it's in
}

/** An upcoming (or locked/done) team match. Non-deck fields are publicly readable. */
export interface MatchRow {
  id: string;
  opponent_team: string;
  public_label: string | null;
  tournament_name: string;
  scheduled_at: string; // ISO
  format: string;
  status: "open" | "locked" | "done";
  notes: string | null;
  expected_opponent_decks: string | null;
  rules_preset: string | null;
  shared_cards: SharedCard[];
  created_at: string;
}

/** A member's deck submission for a match. Team-only (never exposed to anon). */
export interface LineupEntryRow {
  id: string;
  match_id: string;
  player_handle: string;
  deck_slug: string | null;
  deck_name: string;
  deck2_slug: string | null; // Deck 2's archetype (presets with separateArchetypes, e.g. T2 Trials)
  deck2_name: string | null;
  lineup_role: "main" | "sub";
  tech_note: string | null;
  main_image: string | null; // storage path in the private "decklists" bucket
  side_image: string | null; // storage path, optional (side deck)
  key_cards: KeyCard[];
  updated_at: string;
}

const MATCH_COLS = "id,opponent_team,public_label,tournament_name,scheduled_at,format,status,notes,expected_opponent_decks,rules_preset,shared_cards,created_at";
const ENTRY_COLS = "id,match_id,player_handle,deck_slug,deck_name,deck2_slug,deck2_name,lineup_role,tech_note,main_image,side_image,key_cards,updated_at";

/** trim + lowercase, for matching card names typed slightly differently across submissions */
export function normalizeCardName(s: string): string {
  return s.trim().toLowerCase();
}

/**
 * Sums key-card usage across a set of lineup entries, skipping any name in `excludeNames`
 * (the match's designated Shared Cards, which are exempt from the team-wide cap).
 */
export function tallyCardUsage(
  entries: LineupEntryRow[],
  excludeNames: Set<string>
): Record<string, { display: string; count: number; players: string[] }> {
  const out: Record<string, { display: string; count: number; players: string[] }> = {};
  for (const e of entries) {
    for (const c of e.key_cards ?? []) {
      const norm = normalizeCardName(c.name);
      if (!norm || excludeNames.has(norm)) continue;
      if (!out[norm]) out[norm] = { display: c.name.trim(), count: 0, players: [] };
      out[norm].count += c.count;
      if (!out[norm].players.includes(e.player_handle)) out[norm].players.push(e.player_handle);
    }
  }
  return out;
}

const DECKLISTS = "decklists";

/** Upload a decklist screenshot to the private bucket; returns the storage path. */
export async function uploadDecklist(file: File): Promise<{ path?: string; error?: string }> {
  if (!file.type.startsWith("image/")) return { error: "That's not an image file." };
  if (file.size > 4 * 1024 * 1024) return { error: "Max 4MB — resize the image first." };
  try {
    const sb = getBrowserSupabase();
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safeName}`;
    const { error } = await sb.storage.from(DECKLISTS).upload(path, file);
    if (error) return { error: "Upload failed — is the decklists bucket set up?" };
    return { path };
  } catch {
    return { error: "Upload failed." };
  }
}

/** Batch signed URLs (1h) for private decklist thumbnails. Missing paths are skipped. */
export async function signedUrls(paths: string[]): Promise<Record<string, string>> {
  const clean = [...new Set(paths.filter(Boolean))];
  if (clean.length === 0) return {};
  try {
    const { data, error } = await getBrowserSupabase().storage.from(DECKLISTS).createSignedUrls(clean, 3600);
    if (error || !data) return {};
    const out: Record<string, string> = {};
    for (const d of data) if (d.path && d.signedUrl) out[d.path] = d.signedUrl;
    return out;
  } catch {
    return {};
  }
}

/** Public: the soonest open match (for the homepage countdown). Anon read of `matches` only. */
export async function fetchNextMatch(): Promise<MatchRow | null> {
  if (!supabaseEnabled) return null;
  try {
    const { data, error } = await getSupabase()
      .from("matches")
      .select(MATCH_COLS)
      .eq("status", "open")
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return data as unknown as MatchRow;
  } catch {
    return null;
  }
}

/** Team: all matches, soonest first. */
export async function fetchMatches(): Promise<MatchRow[]> {
  try {
    const { data, error } = await getBrowserSupabase()
      .from("matches")
      .select(MATCH_COLS)
      .order("scheduled_at", { ascending: true });
    if (error || !data) return [];
    return data as unknown as MatchRow[];
  } catch {
    return [];
  }
}

/** Team: all lineup entries for a set of match ids. */
export async function fetchEntries(matchIds: string[]): Promise<LineupEntryRow[]> {
  if (matchIds.length === 0) return [];
  try {
    const { data, error } = await getBrowserSupabase()
      .from("lineup_entries")
      .select(ENTRY_COLS)
      .in("match_id", matchIds);
    if (error || !data) return [];
    return data as unknown as LineupEntryRow[];
  } catch {
    return [];
  }
}

/** One recorded game inside a scrim session. */
export interface ScrimGame {
  player: string; // our player's handle
  deckSlug: string | null; // null for custom/off-meta archetypes
  deckName: string;
  oppDeck: string; // opponent's archetype (display name)
  oppPlayer?: string | null; // opponent's handle when they're also a team member (internal scrim)
  oppDeckSlug?: string | null; // catalog slug for the opponent's deck, when known
  result: "win" | "loss"; // from `player`'s perspective
}

/** A practice session vs another team. Team-only (no anon read policy). */
export interface ScrimRow {
  id: string;
  opponent_team: string;
  played_at: string; // ISO
  format: string;
  notes: string | null;
  logged_by: string; // player handle
  games: ScrimGame[];
  created_at: string;
}

const SCRIM_COLS = "id,opponent_team,played_at,format,notes,logged_by,games,created_at";

/**
 * Team: all scrims, newest first.
 * Returns null when the query errors (scrims table not migrated yet) so the tab
 * can show the run-the-SQL hint; [] just means no scrims logged.
 */
export async function fetchScrims(): Promise<ScrimRow[] | null> {
  try {
    const { data, error } = await getBrowserSupabase()
      .from("scrims")
      .select(SCRIM_COLS)
      .order("played_at", { ascending: false });
    if (error) return null;
    return (data ?? []) as unknown as ScrimRow[];
  } catch {
    return null;
  }
}

export interface ScrimRecord {
  display: string;
  wins: number;
  losses: number;
}

/** Aggregates scrim games into per-deck / per-player / vs-archetype W-L records. */
export function scrimStats(scrims: ScrimRow[]): {
  perDeck: Record<string, ScrimRecord & { deckSlug: string | null }>;
  perPlayer: Record<string, ScrimRecord>;
  vsArchetype: Record<string, ScrimRecord>;
} {
  const perDeck: Record<string, ScrimRecord & { deckSlug: string | null }> = {};
  const perPlayer: Record<string, ScrimRecord> = {};
  const vsArchetype: Record<string, ScrimRecord> = {};
  const bump = (rec: ScrimRecord, result: ScrimGame["result"]) => {
    if (result === "win") rec.wins += 1;
    else rec.losses += 1;
  };
  const flip = (r: ScrimGame["result"]): ScrimGame["result"] => (r === "win" ? "loss" : "win");
  for (const s of scrims) {
    for (const g of s.games ?? []) {
      const deckKey = g.deckSlug ?? normalizeCardName(g.deckName);
      if (!perDeck[deckKey]) perDeck[deckKey] = { display: g.deckName, deckSlug: g.deckSlug, wins: 0, losses: 0 };
      bump(perDeck[deckKey], g.result);

      if (!perPlayer[g.player]) perPlayer[g.player] = { display: g.player, wins: 0, losses: 0 };
      bump(perPlayer[g.player], g.result);

      const oppKey = normalizeCardName(g.oppDeck);
      if (oppKey) {
        if (!vsArchetype[oppKey]) vsArchetype[oppKey] = { display: g.oppDeck.trim(), wins: 0, losses: 0 };
        bump(vsArchetype[oppKey], g.result);
      }

      // internal scrim: the opponent is a team member too — credit their side of the
      // same game (inverse result) so one row yields both players' stats, no mirror rows
      if (g.oppPlayer) {
        if (!perPlayer[g.oppPlayer]) perPlayer[g.oppPlayer] = { display: g.oppPlayer, wins: 0, losses: 0 };
        bump(perPlayer[g.oppPlayer], flip(g.result));

        if (oppKey) {
          const oppDeckKey = g.oppDeckSlug ?? oppKey;
          if (!perDeck[oppDeckKey]) perDeck[oppDeckKey] = { display: g.oppDeck.trim(), deckSlug: g.oppDeckSlug ?? null, wins: 0, losses: 0 };
          bump(perDeck[oppDeckKey], flip(g.result));
        }

        const ourKey = normalizeCardName(g.deckName);
        if (ourKey) {
          if (!vsArchetype[ourKey]) vsArchetype[ourKey] = { display: g.deckName.trim(), wins: 0, losses: 0 };
          bump(vsArchetype[ourKey], flip(g.result));
        }
      }
    }
  }
  return { perDeck, perPlayer, vsArchetype };
}

/** True when the War Room tables aren't migrated yet (graceful pre-migration UI). */
export async function warroomReady(): Promise<boolean> {
  try {
    const { error } = await getBrowserSupabase().from("matches").select("id").limit(1);
    return !error;
  } catch {
    return false;
  }
}
