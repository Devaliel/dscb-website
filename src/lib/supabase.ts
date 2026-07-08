import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Read-only Supabase client for server components.
 * Fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 * to switch the data layer from src/lib/data.ts (mock) to live queries.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && anon);

export function getSupabase() {
  if (!supabaseEnabled) {
    throw new Error(
      "Supabase env vars missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
    );
  }
  return createClient(url!, anon!, { auth: { persistSession: false } });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let browserClient: SupabaseClient<any, "public", any> | null = null;

/** Browser client with a persisted auth session — used by the /admin page. */
export function getBrowserSupabase() {
  if (!supabaseEnabled) {
    throw new Error("Supabase env vars missing.");
  }
  if (!browserClient) {
    browserClient = createClient(url!, anon!, { auth: { persistSession: true } });
  }
  return browserClient;
}
