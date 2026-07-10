"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Star from "@/components/persona/star";
import DeckChip from "@/components/deck-chip";
import { getBrowserSupabase, supabaseEnabled } from "@/lib/supabase";
import { EMAIL_TO_HANDLE } from "@/lib/blog-db";
import { getPlayer, getPlayers, getAllDecks, analyzeLineup } from "@/lib/data";
import { fetchMatches, fetchEntries, warroomReady, type MatchRow, type LineupEntryRow } from "@/lib/warroom";

const inputCls =
  "w-full border border-white/15 bg-ink-900 px-3.5 py-2.5 text-sm text-fog-100 outline-none transition-colors placeholder:text-fog-600 focus:border-brand-400";

const CUSTOM = "__custom__";

function relative(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "now / past";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `in ${d}d ${h}h`;
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

const STATUS_STYLE: Record<MatchRow["status"], { label: string; color: string }> = {
  open: { label: "Open", color: "var(--color-brand-400)" },
  locked: { label: "Locked", color: "var(--color-gold-500)" },
  done: { label: "Done", color: "var(--color-fog-500)" },
};

/* ── my-deck submission form ── */
function MySubmission({
  match,
  handle,
  entry,
  onSaved,
}: {
  match: MatchRow;
  handle: string;
  entry?: LineupEntryRow;
  onSaved: () => void;
}) {
  const decks = useMemo(() => getAllDecks(), []);
  const [slug, setSlug] = useState<string>(entry?.deck_slug ?? (entry && !entry.deck_slug ? CUSTOM : ""));
  const [custom, setCustom] = useState(entry && !entry.deck_slug ? entry.deck_name : "");
  const [role, setRole] = useState<"main" | "sub">(entry?.lineup_role ?? "main");
  const [tech, setTech] = useState(entry?.tech_note ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const locked = match.status !== "open";

  async function save() {
    const deckName = slug === CUSTOM ? custom.trim() : decks.find((d) => d.slug === slug)?.name ?? "";
    if (!deckName) {
      setMsg("Pick a deck or type a custom archetype.");
      return;
    }
    setBusy(true);
    setMsg(null);
    const row = {
      match_id: match.id,
      player_handle: handle,
      deck_slug: slug === CUSTOM ? null : slug,
      deck_name: deckName,
      lineup_role: role,
      tech_note: tech.trim() || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await getBrowserSupabase()
      .from("lineup_entries")
      .upsert(row, { onConflict: "match_id,player_handle" });
    setBusy(false);
    if (error) setMsg(error.message);
    else onSaved();
  }

  async function withdraw() {
    setBusy(true);
    await getBrowserSupabase().from("lineup_entries").delete().eq("match_id", match.id).eq("player_handle", handle);
    setBusy(false);
    onSaved();
  }

  if (locked) {
    return (
      <p className="text-sm text-fog-500">
        {entry ? (
          <>You brought <span className="text-fog-100">{entry.deck_name}</span> ({entry.lineup_role}).</>
        ) : (
          "You didn't submit for this match."
        )}{" "}
        Lineup is {match.status}.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-fog-600">My deck</label>
          <select className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)}>
            <option value="">Select a deck…</option>
            {decks.map((d) => (
              <option key={d.slug} value={d.slug}>{d.name}</option>
            ))}
            <option value={CUSTOM}>Custom / off-meta…</option>
          </select>
          {slug === CUSTOM && (
            <input
              className={inputCls + " mt-2"}
              placeholder="Archetype name"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
            />
          )}
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-fog-600">Role</label>
          <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value as "main" | "sub")}>
            <option value="main">Main</option>
            <option value="sub">Sub</option>
          </select>
        </div>
      </div>
      <input
        className={inputCls}
        placeholder="Tech / side-deck note (optional)"
        value={tech}
        onChange={(e) => setTech(e.target.value)}
      />
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={busy}
          className="-skew-x-12 bg-brand-500 px-6 py-2 transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.5)" }}
        >
          <span className="block skew-x-12 font-display text-xs font-extrabold uppercase italic tracking-wide text-white">
            {busy ? "Saving…" : entry ? "Update pick" : "Submit deck"}
          </span>
        </button>
        {entry && (
          <button onClick={withdraw} disabled={busy} className="text-xs text-fog-500 hover:text-cyber-400">
            Withdraw
          </button>
        )}
        {msg && <span className="text-xs text-cyber-400">{msg}</span>}
      </div>
    </div>
  );
}

/* ── captain: meta analyst panel ── */
function MetaAnalyst({ entries, expected }: { entries: LineupEntryRow[]; expected: string[] }) {
  const analysis = useMemo(
    () => analyzeLineup(entries.map((e) => ({ handle: e.player_handle, deckSlug: e.deck_slug ?? undefined, deckName: e.deck_name })), expected),
    [entries, expected]
  );
  if (entries.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
      <span
        className="mb-3 inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
        style={{ color: "var(--color-brand-300)", background: "color-mix(in oklab, var(--color-brand-500) 18%, transparent)" }}
      >
        Meta Analyst
      </span>
      {analysis.duplicates.length > 0 && (
        <p className="mb-2 text-cyber-400">⚠ Duplicate deck{analysis.duplicates.length > 1 ? "s" : ""}: {analysis.duplicates.join(", ")}</p>
      )}
      {expected.length > 0 && analysis.coverageGaps.length > 0 && (
        <p className="mb-2 text-gold-500">⚠ No winning history vs: {analysis.coverageGaps.join(", ")}</p>
      )}
      <div className="space-y-1.5">
        {analysis.perDeck.map((d, i) => (
          <div key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-fog-400">
            <span className="text-fog-200">{getPlayer(d.handle)?.name ?? d.handle}</span>
            <span className="text-fog-500">{d.deckName}</span>
            {d.overall ? (
              <span className="text-xs tabular-nums text-fog-500">career {d.overall.wins}–{d.overall.losses} ({d.overall.wr}%)</span>
            ) : (
              <span className="text-xs text-fog-600">no career data</span>
            )}
            {d.vsExpected.filter((v) => v.wr !== null).map((v, vi) => (
              <span key={vi} className="text-xs tabular-nums" style={{ color: v.wr! >= 50 ? "var(--color-brand-300)" : "var(--color-cyber-400)" }}>
                vs {v.opponent} {v.wr}%
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── one match card ── */
function MatchCard({
  match,
  entries,
  handle,
  isCaptain,
  onChange,
}: {
  match: MatchRow;
  entries: LineupEntryRow[];
  handle: string;
  isCaptain: boolean;
  onChange: () => void;
}) {
  const roster = useMemo(() => getPlayers().filter((p) => p.role !== "Try Out"), []);
  const myEntry = entries.find((e) => e.player_handle === handle);
  const st = STATUS_STYLE[match.status];
  const [expected, setExpected] = useState(match.expected_opponent_decks ?? "");
  const [savingMeta, setSavingMeta] = useState(false);
  const expectedList = expected.split(",").map((s) => s.trim()).filter(Boolean);

  async function setStatus(status: MatchRow["status"]) {
    await getBrowserSupabase().from("matches").update({ status }).eq("id", match.id);
    onChange();
  }
  async function saveExpected() {
    setSavingMeta(true);
    await getBrowserSupabase().from("matches").update({ expected_opponent_decks: expected.trim() || null }).eq("id", match.id);
    setSavingMeta(false);
    onChange();
  }
  async function remove() {
    if (!window.confirm("Delete this match and all its submissions?")) return;
    await getBrowserSupabase().from("matches").delete().eq("id", match.id);
    onChange();
  }

  return (
    <div className="clip-corner relative overflow-hidden border border-white/10 bg-ink-850" style={{ boxShadow: "6px 6px 0 rgba(0,0,0,0.45)" }}>
      <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />

      {/* header */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h3 className="text-persona text-lg text-fog-100">
            vs {match.opponent_team}
            {match.public_label && <span className="ml-2 text-xs normal-case not-italic text-fog-600">(public: {match.public_label})</span>}
          </h3>
          <p className="mt-0.5 text-xs text-fog-500">
            {match.tournament_name ? `${match.tournament_name} · ` : ""}
            {new Date(match.scheduled_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            {match.status === "open" && <span className="ml-1 text-brand-300">· {relative(match.scheduled_at)}</span>}
          </p>
        </div>
        <span
          className="-skew-x-12 px-3 py-1 text-xs font-bold uppercase tracking-wide"
          style={{ background: `color-mix(in oklab, ${st.color} 82%, black)`, color: "white", boxShadow: "3px 3px 0 rgba(0,0,0,0.4)" }}
        >
          <span className="block skew-x-12">{st.label}</span>
        </span>
      </div>

      <div className="relative space-y-5 p-5 sm:p-6">
        {/* my submission */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fog-600">My submission</p>
          <MySubmission match={match} handle={handle} entry={myEntry} onSaved={onChange} />
        </div>

        {/* lineup board */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fog-600">
            Lineup board · {entries.length}/{roster.length} in
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {roster.map((p) => {
              const e = entries.find((x) => x.player_handle === p.handle);
              return (
                <div
                  key={p.handle}
                  className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                  style={{ opacity: e ? 1 : 0.55 }}
                >
                  <span className="w-20 shrink-0 truncate text-sm text-fog-200">{p.name}</span>
                  {e ? (
                    <>
                      <DeckChip deckSlug={e.deck_slug ?? undefined} name={e.deck_name} size="sm" />
                      {e.lineup_role === "sub" && <span className="text-[10px] uppercase tracking-wide text-fog-600">sub</span>}
                    </>
                  ) : (
                    <span className="text-xs italic text-fog-600">— no pick yet —</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* captain tools */}
        {isCaptain && (
          <div className="rounded-xl border border-white/10 bg-ink-900/50 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-300">
              <Star className="h-2.5 w-2.5" /> Captain tools
            </p>
            <label className="mb-1 block text-[11px] text-fog-600">Expected opponent decks (comma-separated) — feeds the analyst</label>
            <div className="flex flex-wrap gap-2">
              <input className={inputCls + " flex-1"} placeholder="e.g. Snake Eyes, Labrynth, Tenpai" value={expected} onChange={(e) => setExpected(e.target.value)} />
              <button onClick={saveExpected} disabled={savingMeta} className="-skew-x-12 border border-brand-400/50 bg-brand-500/15 px-4 text-xs font-bold uppercase tracking-wide text-brand-300 hover:bg-brand-500/30 disabled:opacity-40">
                <span className="block skew-x-12">{savingMeta ? "…" : "Save"}</span>
              </button>
            </div>

            <MetaAnalyst entries={entries} expected={expectedList} />

            <div className="mt-4 flex flex-wrap gap-2">
              {match.status === "open" && (
                <button onClick={() => setStatus("locked")} className="-skew-x-12 bg-gold-500/80 px-4 py-1.5 text-xs font-bold uppercase text-ink-950 hover:bg-gold-500">
                  <span className="block skew-x-12">Lock lineup</span>
                </button>
              )}
              {match.status === "locked" && (
                <>
                  <button onClick={() => setStatus("open")} className="-skew-x-12 border border-white/15 px-4 py-1.5 text-xs font-bold uppercase text-fog-300 hover:text-fog-100">
                    <span className="block skew-x-12">Unlock</span>
                  </button>
                  <button onClick={() => setStatus("done")} className="-skew-x-12 border border-white/15 px-4 py-1.5 text-xs font-bold uppercase text-fog-300 hover:text-fog-100">
                    <span className="block skew-x-12">Mark done</span>
                  </button>
                </>
              )}
              <button onClick={remove} className="-skew-x-12 border border-cyber-500/40 px-4 py-1.5 text-xs font-bold uppercase text-cyber-400 hover:bg-cyber-500/15">
                <span className="block skew-x-12">Delete</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── create-match form (captain) ── */
function CreateMatch({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [opponent, setOpponent] = useState("");
  const [publicLabel, setPublicLabel] = useState("");
  const [tournament, setTournament] = useState("");
  const [when, setWhen] = useState("");
  const [format, setFormat] = useState("relay");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function create() {
    if (!opponent.trim() || !when) {
      setMsg("Opponent and date/time are required.");
      return;
    }
    setBusy(true);
    setMsg(null);
    const { error } = await getBrowserSupabase().from("matches").insert({
      opponent_team: opponent.trim(),
      public_label: publicLabel.trim() || null,
      tournament_name: tournament.trim(),
      scheduled_at: new Date(when).toISOString(),
      format,
    });
    setBusy(false);
    if (error) setMsg(error.message);
    else {
      setOpponent(""); setPublicLabel(""); setTournament(""); setWhen(""); setOpen(false);
      onCreated();
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="-skew-x-12 bg-brand-500 px-6 py-2.5" style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.5)" }}>
        <span className="block skew-x-12 font-display text-sm font-extrabold uppercase italic tracking-wide text-white">+ New match</span>
      </button>
    );
  }

  return (
    <div className="clip-corner relative border border-white/10 bg-ink-850 p-6" style={{ boxShadow: "6px 6px 0 rgba(0,0,0,0.45)" }}>
      <h3 className="text-persona mb-4 text-lg text-fog-100">New upcoming match</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={inputCls} placeholder="Opponent team *" value={opponent} onChange={(e) => setOpponent(e.target.value)} />
        <input className={inputCls} placeholder="Public label (optional — hides opponent)" value={publicLabel} onChange={(e) => setPublicLabel(e.target.value)} />
        <input className={inputCls} placeholder="Tournament name" value={tournament} onChange={(e) => setTournament(e.target.value)} />
        <input className={inputCls} type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        <select className={inputCls} value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="relay">Survival relay</option>
          <option value="bo3">Best of 3 babak</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={create} disabled={busy} className="-skew-x-12 bg-brand-500 px-6 py-2 disabled:opacity-50" style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.5)" }}>
          <span className="block skew-x-12 font-display text-xs font-extrabold uppercase italic tracking-wide text-white">{busy ? "Creating…" : "Create match"}</span>
        </button>
        <button onClick={() => setOpen(false)} className="text-sm text-fog-500 hover:text-fog-100">Cancel</button>
        {msg && <span className="text-xs text-cyber-400">{msg}</span>}
      </div>
    </div>
  );
}

/* ── page ── */
export default function WarRoomPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [migrated, setMigrated] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [entries, setEntries] = useState<LineupEntryRow[]>([]);

  const handle = useMemo(() => {
    const e = session?.user?.email?.toLowerCase();
    return e ? EMAIL_TO_HANDLE[e] : undefined;
  }, [session]);
  const player = handle ? getPlayer(handle) : undefined;
  const isCaptain = player?.role === "Captain" || player?.role === "Vice Captain";

  const load = useCallback(async () => {
    const ok = await warroomReady();
    setMigrated(ok);
    if (!ok) return;
    const ms = await fetchMatches();
    setMatches(ms);
    setEntries(await fetchEntries(ms.map((m) => m.id)));
  }, []);

  useEffect(() => {
    if (!supabaseEnabled) { setReady(true); return; }
    const sb = getBrowserSupabase();
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
      if (data.session) load();
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) load();
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    const { error } = await getBrowserSupabase().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setStatus(error.message);
  }

  if (!ready) return null;

  return (
    <Shell>
      {!supabaseEnabled ? (
        <p className="text-fog-500">Backend not configured.</p>
      ) : !session ? (
        <div className="clip-corner relative mx-auto max-w-sm border border-white/10 bg-ink-850 p-8" style={{ boxShadow: "6px 6px 0 rgba(0,0,0,0.5)" }}>
          <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />
          <h2 className="text-persona relative text-2xl text-fog-100">Team login</h2>
          <form onSubmit={signIn} className="relative mt-6 space-y-4">
            <input className={inputCls} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <input className={inputCls} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            <button type="submit" disabled={busy} className="w-full -skew-x-12 bg-brand-500 py-2.5 disabled:opacity-50" style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.5)" }}>
              <span className="block skew-x-12 font-display text-sm font-extrabold uppercase italic tracking-wide text-white">{busy ? "Signing in…" : "Sign in"}</span>
            </button>
          </form>
          {status && <p className="relative mt-4 text-sm text-cyber-400">{status}</p>}
        </div>
      ) : !migrated ? (
        <p className="text-fog-500">War Room tables aren&apos;t set up yet — run <code className="text-brand-300">supabase/warroom-schema.sql</code> in the Supabase SQL Editor.</p>
      ) : !handle ? (
        <p className="text-fog-500">Signed in as {session.user.email}, but this email isn&apos;t mapped to a team member yet.</p>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-fog-500">
              Signed in as <span className="text-fog-100">{player?.name ?? handle}</span>
              {isCaptain && <span className="ml-2 text-brand-300">· lineup manager</span>}
            </p>
            <div className="flex items-center gap-3">
              {isCaptain && <CreateMatch onCreated={load} />}
              <button onClick={() => getBrowserSupabase().auth.signOut()} className="-skew-x-12 border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wide text-fog-300 hover:text-fog-100">
                <span className="block skew-x-12">Log out</span>
              </button>
            </div>
          </div>

          {matches.length === 0 ? (
            <p className="text-fog-500">No upcoming matches yet.{isCaptain ? " Create one above." : " Check back soon."}</p>
          ) : (
            <div className="space-y-5">
              {matches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  entries={entries.filter((e) => e.match_id === m.id)}
                  handle={handle}
                  isCaptain={!!isCaptain}
                  onChange={load}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden px-6 pb-24 pt-36 sm:pt-44">
      <div className="pointer-events-none absolute inset-x-0 top-16 -z-10 mx-auto h-64 max-w-3xl rounded-full bg-brand-500/15 blur-[110px]" />
      <div className="mx-auto max-w-5xl">
        <span className="inline-block -skew-x-12 bg-cyber-500 px-3 py-1">
          <span className="flex skew-x-12 items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
            <Star className="h-2.5 w-2.5" />
            Team only
          </span>
        </span>
        <h1 className="text-persona mt-4 -rotate-1 text-5xl text-fog-100 sm:text-6xl">War Room</h1>
        <div className="mt-3 h-2 w-36 -skew-x-12" style={{ background: "linear-gradient(90deg, var(--color-cyber-500), var(--color-brand-500) 70%, transparent)" }} />
        <p className="mt-4 max-w-xl text-sm text-fog-500">Submit your deck for upcoming matches. Picks stay team-private — the public only sees the countdown.</p>
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}
