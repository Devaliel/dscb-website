import { getBrowserSupabase, getSupabase, supabaseEnabled } from "./supabase";

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
  created_at: string;
}

/** A member's deck submission for a match. Team-only (never exposed to anon). */
export interface LineupEntryRow {
  id: string;
  match_id: string;
  player_handle: string;
  deck_slug: string | null;
  deck_name: string;
  lineup_role: "main" | "sub";
  tech_note: string | null;
  main_image: string | null; // storage path in the private "decklists" bucket
  side_image: string | null; // storage path, optional (side deck)
  updated_at: string;
}

const MATCH_COLS = "id,opponent_team,public_label,tournament_name,scheduled_at,format,status,notes,expected_opponent_decks,created_at";
const ENTRY_COLS = "id,match_id,player_handle,deck_slug,deck_name,lineup_role,tech_note,main_image,side_image,updated_at";

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

/** True when the War Room tables aren't migrated yet (graceful pre-migration UI). */
export async function warroomReady(): Promise<boolean> {
  try {
    const { error } = await getBrowserSupabase().from("matches").select("id").limit(1);
    return !error;
  } catch {
    return false;
  }
}
