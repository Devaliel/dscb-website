"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Star from "@/components/persona/star";
import DeckChip from "@/components/deck-chip";
import { getBrowserSupabase, supabaseEnabled } from "@/lib/supabase";
import { EMAIL_TO_HANDLE } from "@/lib/blog-db";
import { getPlayer, getPlayers, getAllDecks, analyzeLineup } from "@/lib/data";
import { fetchMatches, fetchEntries, warroomReady, uploadDecklist, signedUrls, type MatchRow, type LineupEntryRow } from "@/lib/warroom";
import { getRulePreset, RULE_PRESETS } from "@/lib/tournament-rules";

type Lightbox = { main?: string; side?: string } | null;

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

/** ISO timestamp → local `datetime-local` input value (for pre-filling the edit form). */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const STATUS_STYLE: Record<MatchRow["status"], { label: string; color: string }> = {
  open: { label: "Open", color: "var(--color-brand-400)" },
  locked: { label: "Locked", color: "var(--color-gold-500)" },
  done: { label: "Done", color: "var(--color-fog-500)" },
};

/* ── decklist image upload slot ── */
function ImageSlot({
  label,
  url,
  uploading,
  onFile,
  onView,
  disabled,
}: {
  label: string;
  url?: string;
  uploading: boolean;
  onFile: (f: File) => void;
  onView?: () => void;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-fog-600">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => (url && onView ? onView() : ref.current?.click())}
          disabled={disabled}
          className="grid h-24 w-36 shrink-0 place-items-center overflow-hidden border border-white/15 bg-ink-900 text-[11px] text-fog-600 transition-colors hover:border-brand-400/60"
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span>{uploading ? "Uploading…" : "+ Upload"}</span>
          )}
        </button>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onFile(f); }} />
        {!disabled && (
          <button type="button" onClick={() => ref.current?.click()} className="text-[11px] text-fog-500 hover:text-brand-300">
            {url ? "Replace" : uploading ? "…" : "Choose"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── my-deck submission form ── */
function MySubmission({
  match,
  handle,
  entry,
  urls,
  onSaved,
  onView,
}: {
  match: MatchRow;
  handle: string;
  entry?: LineupEntryRow;
  urls: Record<string, string>;
  onSaved: () => void;
  onView: (lb: Lightbox) => void;
}) {
  const decks = useMemo(() => getAllDecks(), []);
  const [slug, setSlug] = useState<string>(entry?.deck_slug ?? (entry && !entry.deck_slug ? CUSTOM : ""));
  const [custom, setCustom] = useState(entry && !entry.deck_slug ? entry.deck_name : "");
  const [role, setRole] = useState<"main" | "sub">(entry?.lineup_role ?? "main");
  const [tech, setTech] = useState(entry?.tech_note ?? "");
  const [mainPath, setMainPath] = useState<string | null>(entry?.main_image ?? null);
  const [sidePath, setSidePath] = useState<string | null>(entry?.side_image ?? null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [sidePreview, setSidePreview] = useState<string | null>(null);
  const [upMain, setUpMain] = useState(false);
  const [upSide, setUpSide] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const locked = match.status !== "open";

  const mainUrl = mainPreview ?? (mainPath ? urls[mainPath] : undefined);
  const sideUrl = sidePreview ?? (sidePath ? urls[sidePath] : undefined);
  const [mainLabel, sideLabel] = getRulePreset(match.rules_preset)?.deckSlots ?? ["Main deck *", "Side deck (optional)"];

  async function pick(file: File, which: "main" | "side") {
    (which === "main" ? setUpMain : setUpSide)(true);
    setMsg(null);
    const { path, error } = await uploadDecklist(file);
    (which === "main" ? setUpMain : setUpSide)(false);
    if (error || !path) { setMsg(error ?? "Upload failed."); return; }
    const preview = URL.createObjectURL(file);
    if (which === "main") { setMainPath(path); setMainPreview(preview); }
    else { setSidePath(path); setSidePreview(preview); }
  }

  async function save() {
    const deckName = slug === CUSTOM ? custom.trim() : decks.find((d) => d.slug === slug)?.name ?? "";
    if (!deckName) { setMsg("Pick a deck or type a custom archetype."); return; }
    if (!mainPath) { setMsg("Upload your main deck image."); return; }
    setBusy(true);
    setMsg(null);
    const row = {
      match_id: match.id,
      player_handle: handle,
      deck_slug: slug === CUSTOM ? null : slug,
      deck_name: deckName,
      lineup_role: role,
      tech_note: tech.trim() || null,
      main_image: mainPath,
      side_image: sidePath,
      updated_at: new Date().toISOString(),
    };
    const { error } = await getBrowserSupabase().from("lineup_entries").upsert(row, { onConflict: "match_id,player_handle" });
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
      <div className="space-y-2 text-sm text-fog-500">
        <p>
          {entry ? (<>You brought <span className="text-fog-100">{entry.deck_name}</span> ({entry.lineup_role}).</>) : "You didn't submit for this match."}{" "}
          Lineup is {match.status}.
        </p>
        {(mainUrl || sideUrl) && (
          <div className="flex gap-2">
            {mainUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mainUrl} alt="main deck" onClick={() => onView({ main: mainUrl, side: sideUrl })} className="h-20 w-32 cursor-pointer border border-white/10 object-cover" />
            )}
            {sideUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sideUrl} alt="side deck" onClick={() => onView({ main: mainUrl, side: sideUrl })} className="h-20 w-32 cursor-pointer border border-white/10 object-cover" />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-fog-600">Archetype</label>
          <select className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)}>
            <option value="">Select a deck…</option>
            {decks.map((d) => (
              <option key={d.slug} value={d.slug}>{d.name}</option>
            ))}
            <option value={CUSTOM}>Custom / off-meta…</option>
          </select>
          {slug === CUSTOM && (
            <input className={inputCls + " mt-2"} placeholder="Archetype name" value={custom} onChange={(e) => setCustom(e.target.value)} />
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

      <div className="flex flex-wrap gap-5">
        <ImageSlot label={mainLabel} url={mainUrl} uploading={upMain} onFile={(f) => pick(f, "main")} onView={() => onView({ main: mainUrl, side: sideUrl })} />
        <ImageSlot label={sideLabel} url={sideUrl} uploading={upSide} onFile={(f) => pick(f, "side")} onView={() => onView({ main: mainUrl, side: sideUrl })} />
      </div>

      <input className={inputCls} placeholder="Tech note (optional)" value={tech} onChange={(e) => setTech(e.target.value)} />
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={busy || upMain || upSide} className="-skew-x-12 bg-brand-500 px-6 py-2 transition-transform hover:-translate-y-0.5 disabled:opacity-50" style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.5)" }}>
          <span className="block skew-x-12 font-display text-xs font-extrabold uppercase italic tracking-wide text-white">
            {busy ? "Saving…" : entry ? "Update pick" : "Submit deck"}
          </span>
        </button>
        {entry && (
          <button onClick={withdraw} disabled={busy} className="text-xs text-fog-500 hover:text-cyber-400">Withdraw</button>
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

/* ── collapsible tournament-rules booklet ── */
function RulesPanel({ slug }: { slug: string | null }) {
  const preset = getRulePreset(slug);
  const [open, setOpen] = useState(false);
  if (!preset) return null;
  return (
    <div className="rounded-xl border border-brand-500/25 bg-brand-500/[0.06]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2">
          <Star className="h-3 w-3 text-brand-300" />
          <span className="font-display text-sm font-extrabold uppercase italic tracking-wide text-fog-100">{preset.name} rules</span>
          <span className="hidden text-xs text-fog-500 sm:inline">· {preset.format}</span>
        </span>
        <span className="text-xs text-brand-300">{open ? "Hide ▲" : "Read ▼"}</span>
      </button>
      {open && (
        <div className="space-y-4 border-t border-white/10 px-4 py-4">
          <p className="text-xs text-fog-500 sm:hidden">{preset.format}</p>
          {preset.sections.map((s) => (
            <div key={s.heading}>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-brand-300">{s.heading}</p>
              <ul className="space-y-1">
                {s.body.map((line, i) => (
                  <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-fog-300">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-fog-600" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── sealed lineup reveal (locked / done matches) ── */
function SealedLineup({
  entries,
  urls,
  onView,
}: {
  entries: LineupEntryRow[];
  urls: Record<string, string>;
  onView: (lb: Lightbox) => void;
}) {
  const roster = useMemo(() => getPlayers().filter((p) => p.role !== "Try Out"), []);
  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-500">
        <Star className="h-3 w-3" /> Sealed lineup · locked
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {roster.map((p) => {
          const e = entries.find((x) => x.player_handle === p.handle);
          const mainUrl = e?.main_image ? urls[e.main_image] : undefined;
          const sideUrl = e?.side_image ? urls[e.side_image] : undefined;
          if (!e) {
            return (
              <div key={p.handle} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-3 opacity-45">
                <span className="text-sm text-fog-200">{p.name}</span>
                <span className="text-xs italic text-fog-600">did not submit</span>
              </div>
            );
          }
          return (
            <div
              key={p.handle}
              className="relative overflow-hidden rounded-lg border border-white/10 bg-ink-900/60 p-3"
              style={{ boxShadow: "inset 3px 0 0 var(--color-gold-500)" }}
            >
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <span className="font-display text-sm font-bold uppercase italic tracking-wide text-fog-100">{p.name}</span>
                {e.lineup_role === "sub" && <span className="text-[10px] uppercase tracking-wide text-fog-600">sub</span>}
              </div>
              <div className="flex items-center gap-2.5">
                {mainUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mainUrl} alt="" onClick={() => onView({ main: mainUrl, side: sideUrl })} className="h-14 w-20 shrink-0 cursor-pointer border border-white/10 object-cover" />
                ) : (
                  <div className="grid h-14 w-20 shrink-0 place-items-center border border-white/10 text-[10px] text-fog-600">no image</div>
                )}
                {sideUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sideUrl} alt="" onClick={() => onView({ main: mainUrl, side: sideUrl })} className="h-14 w-20 shrink-0 cursor-pointer border border-white/10 object-cover" />
                )}
                <div className="min-w-0">
                  <DeckChip deckSlug={e.deck_slug ?? undefined} name={e.deck_name} size="sm" />
                  {e.tech_note && <p className="mt-1 truncate text-[11px] text-fog-500">{e.tech_note}</p>}
                </div>
              </div>
            </div>
          );
        })}
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
  urls,
  onChange,
  onView,
}: {
  match: MatchRow;
  entries: LineupEntryRow[];
  handle: string;
  isCaptain: boolean;
  urls: Record<string, string>;
  onChange: () => void;
  onView: (lb: Lightbox) => void;
}) {
  const roster = useMemo(() => getPlayers().filter((p) => p.role !== "Try Out"), []);
  const myEntry = entries.find((e) => e.player_handle === handle);
  const st = STATUS_STYLE[match.status];
  const [expected, setExpected] = useState(match.expected_opponent_decks ?? "");
  const [savingMeta, setSavingMeta] = useState(false);
  const [proxyHandle, setProxyHandle] = useState<string | null>(null);
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
  async function setRules(slug: string) {
    const preset = RULE_PRESETS[slug];
    await getBrowserSupabase()
      .from("matches")
      .update({ rules_preset: slug || null, ...(preset ? { tournament_name: preset.name } : {}) })
      .eq("id", match.id);
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
        {/* tournament rules */}
        <RulesPanel slug={match.rules_preset} />

        {match.status === "open" ? (
          <>
            {/* my submission */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fog-600">My submission</p>
              <MySubmission match={match} handle={handle} entry={myEntry} urls={urls} onSaved={onChange} onView={onView} />
            </div>

            {/* live lineup board */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fog-600">
                Lineup board · {entries.length}/{roster.length} in
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {roster.map((p) => {
                  const e = entries.find((x) => x.player_handle === p.handle);
                  const mainUrl = e?.main_image ? urls[e.main_image] : undefined;
                  const sideUrl = e?.side_image ? urls[e.side_image] : undefined;
                  const active = proxyHandle === p.handle;
                  return (
                    <div
                      key={p.handle}
                      className="flex items-center gap-2.5 rounded-lg border px-3 py-2"
                      style={{
                        opacity: e ? 1 : 0.55,
                        borderColor: active ? "var(--color-brand-400)" : "rgba(255,255,255,0.05)",
                        background: active ? "color-mix(in oklab, var(--color-brand-500) 8%, transparent)" : "rgba(255,255,255,0.02)",
                      }}
                    >
                      <span className="w-16 shrink-0 truncate text-sm text-fog-200">{p.name}</span>
                      {e ? (
                        <>
                          {mainUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={mainUrl}
                              alt=""
                              onClick={() => onView({ main: mainUrl, side: sideUrl })}
                              className="h-9 w-14 shrink-0 cursor-pointer border border-white/10 object-cover"
                            />
                          )}
                          <DeckChip deckSlug={e.deck_slug ?? undefined} name={e.deck_name} size="sm" />
                          {e.side_image && <span className="text-[10px] uppercase tracking-wide text-brand-300">+side</span>}
                          {e.lineup_role === "sub" && <span className="text-[10px] uppercase tracking-wide text-fog-600">sub</span>}
                        </>
                      ) : (
                        <span className="text-xs italic text-fog-600">— no pick yet —</span>
                      )}
                      {isCaptain && (
                        <button
                          type="button"
                          onClick={() => setProxyHandle((h) => (h === p.handle ? null : p.handle))}
                          className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-wide text-brand-300 hover:text-brand-200"
                        >
                          {active ? "Close" : e ? "Edit" : "+ Add"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {isCaptain && proxyHandle && (
                <div className="mt-3 rounded-lg border border-brand-500/25 bg-brand-500/[0.05] p-4">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-300">
                    Captain entry — on behalf of {getPlayer(proxyHandle)?.name ?? proxyHandle}
                  </p>
                  <MySubmission
                    match={match}
                    handle={proxyHandle}
                    entry={entries.find((x) => x.player_handle === proxyHandle)}
                    urls={urls}
                    onSaved={() => { onChange(); setProxyHandle(null); }}
                    onView={onView}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <SealedLineup entries={entries} urls={urls} onView={onView} />
        )}

        {/* captain tools */}
        {isCaptain && (
          <div className="rounded-xl border border-white/10 bg-ink-900/50 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-300">
              <Star className="h-2.5 w-2.5" /> Captain tools
            </p>
            <label className="mb-1 block text-[11px] text-fog-600">Tournament — attaches its rules booklet members read before submitting</label>
            <select className={inputCls + " mb-3"} value={match.rules_preset ?? ""} onChange={(e) => setRules(e.target.value)}>
              <option value="">No tournament attached</option>
              {Object.values(RULE_PRESETS).map((r) => (
                <option key={r.slug} value={r.slug}>{r.name} — {r.format}</option>
              ))}
            </select>

            <label className="mb-1 block text-[11px] text-fog-600">Expected opponent decks (comma-separated) — feeds the analyst</label>
            <div className="flex flex-wrap gap-2">
              <input className={inputCls + " flex-1"} placeholder="e.g. Snake Eyes, Labrynth, Tenpai" value={expected} onChange={(e) => setExpected(e.target.value)} />
              <button onClick={saveExpected} disabled={savingMeta} className="-skew-x-12 border border-brand-400/50 bg-brand-500/15 px-4 text-xs font-bold uppercase tracking-wide text-brand-300 hover:bg-brand-500/30 disabled:opacity-40">
                <span className="block skew-x-12">{savingMeta ? "…" : "Save"}</span>
              </button>
            </div>

            <MetaAnalyst entries={entries} expected={expectedList} />

            <div className="mt-4 flex flex-wrap gap-2">
              <EditMatch match={match} onSaved={onChange} />
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

/* ── shared match fields (create + edit) ── */
function MatchFields({
  opponent, setOpponent,
  publicLabel, setPublicLabel,
  tourSel, setTourSel,
  customName, setCustomName,
  when, setWhen,
  format, setFormat,
}: {
  opponent: string; setOpponent: (v: string) => void;
  publicLabel: string; setPublicLabel: (v: string) => void;
  tourSel: string; setTourSel: (v: string) => void;
  customName: string; setCustomName: (v: string) => void;
  when: string; setWhen: (v: string) => void;
  format: string; setFormat: (v: string) => void;
}) {
  const preset = RULE_PRESETS[tourSel];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <input className={inputCls} placeholder="Opponent team *" value={opponent} onChange={(e) => setOpponent(e.target.value)} />
      <input className={inputCls} placeholder="Public label (optional — hides opponent)" value={publicLabel} onChange={(e) => setPublicLabel(e.target.value)} />
      <div>
        <select className={inputCls} value={tourSel} onChange={(e) => setTourSel(e.target.value)}>
          <option value="">Tournament — none / friendly</option>
          {Object.values(RULE_PRESETS).map((r) => (
            <option key={r.slug} value={r.slug}>{r.name} — {r.format}</option>
          ))}
          <option value={CUSTOM}>Other (custom)…</option>
        </select>
        {tourSel === CUSTOM && (
          <input className={inputCls + " mt-2"} placeholder="Tournament name" value={customName} onChange={(e) => setCustomName(e.target.value)} />
        )}
        {preset && <p className="mt-1 text-[11px] text-brand-300">Attaches the {preset.name} rules booklet · slots: {preset.deckSlots[0].replace(" *", "")} + {preset.deckSlots[1].replace(" (optional)", "")}</p>}
      </div>
      <input className={inputCls} type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
      <select className={inputCls} value={format} onChange={(e) => setFormat(e.target.value)}>
        <option value="relay">Survival relay</option>
        <option value="bo3">Best of 3 babak</option>
        <option value="other">Other</option>
      </select>
    </div>
  );
}

/* ── create-match form (captain) ── */
function CreateMatch({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [opponent, setOpponent] = useState("");
  const [publicLabel, setPublicLabel] = useState("");
  const [tourSel, setTourSel] = useState(""); // "" none · preset slug · CUSTOM
  const [customName, setCustomName] = useState("");
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
    // the tournament dropdown drives the display name AND the attached rules booklet
    const preset = RULE_PRESETS[tourSel];
    const tournamentName = preset ? preset.name : tourSel === CUSTOM ? customName.trim() : "";
    const { error } = await getBrowserSupabase().from("matches").insert({
      opponent_team: opponent.trim(),
      public_label: publicLabel.trim() || null,
      tournament_name: tournamentName,
      scheduled_at: new Date(when).toISOString(),
      format,
      rules_preset: preset ? preset.slug : null,
    });
    setBusy(false);
    if (error) setMsg(error.message);
    else {
      setOpponent(""); setPublicLabel(""); setTourSel(""); setCustomName(""); setWhen(""); setOpen(false);
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
      <MatchFields
        opponent={opponent} setOpponent={setOpponent}
        publicLabel={publicLabel} setPublicLabel={setPublicLabel}
        tourSel={tourSel} setTourSel={setTourSel}
        customName={customName} setCustomName={setCustomName}
        when={when} setWhen={setWhen}
        format={format} setFormat={setFormat}
      />
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

/* ── edit-match form (captain) ── */
function EditMatch({ match, onSaved }: { match: MatchRow; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [opponent, setOpponent] = useState(match.opponent_team);
  const [publicLabel, setPublicLabel] = useState(match.public_label ?? "");
  const [tourSel, setTourSel] = useState(match.rules_preset ?? (match.tournament_name ? CUSTOM : ""));
  const [customName, setCustomName] = useState(match.rules_preset ? "" : match.tournament_name);
  const [when, setWhen] = useState(() => toLocalInput(match.scheduled_at));
  const [format, setFormat] = useState(match.format);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    if (!opponent.trim() || !when) {
      setMsg("Opponent and date/time are required.");
      return;
    }
    setBusy(true);
    setMsg(null);
    const preset = RULE_PRESETS[tourSel];
    const tournamentName = preset ? preset.name : tourSel === CUSTOM ? customName.trim() : "";
    const { error } = await getBrowserSupabase()
      .from("matches")
      .update({
        opponent_team: opponent.trim(),
        public_label: publicLabel.trim() || null,
        tournament_name: tournamentName,
        scheduled_at: new Date(when).toISOString(),
        format,
        rules_preset: preset ? preset.slug : null,
      })
      .eq("id", match.id);
    setBusy(false);
    if (error) setMsg(error.message);
    else { setOpen(false); onSaved(); }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="-skew-x-12 border border-white/15 px-4 py-1.5 text-xs font-bold uppercase text-fog-300 hover:text-fog-100">
        <span className="block skew-x-12">Edit match</span>
      </button>
    );
  }

  return (
    <div className="mt-3 w-full rounded-lg border border-brand-500/25 bg-ink-900/60 p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-300">Edit match details</p>
      <MatchFields
        opponent={opponent} setOpponent={setOpponent}
        publicLabel={publicLabel} setPublicLabel={setPublicLabel}
        tourSel={tourSel} setTourSel={setTourSel}
        customName={customName} setCustomName={setCustomName}
        when={when} setWhen={setWhen}
        format={format} setFormat={setFormat}
      />
      <div className="mt-3 flex items-center gap-3">
        <button onClick={save} disabled={busy} className="-skew-x-12 bg-brand-500 px-5 py-1.5 text-xs font-bold uppercase text-white disabled:opacity-50">
          <span className="block skew-x-12">{busy ? "Saving…" : "Save changes"}</span>
        </button>
        <button onClick={() => setOpen(false)} className="text-xs text-fog-500 hover:text-fog-100">Cancel</button>
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
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [lightbox, setLightbox] = useState<Lightbox>(null);

  const handle = useMemo(() => {
    const e = session?.user?.email?.toLowerCase();
    return e ? EMAIL_TO_HANDLE[e] : undefined;
  }, [session]);
  const player = handle ? getPlayer(handle) : undefined;
  // Darkzill (site dev) gets lineup-manager access regardless of in-game role —
  // Cain/Sieg accounts aren't accessible to them day-to-day.
  const isCaptain = player?.role === "Captain" || player?.role === "Vice Captain" || handle === "Darkzill";

  const load = useCallback(async () => {
    const ok = await warroomReady();
    setMigrated(ok);
    if (!ok) return;
    const ms = await fetchMatches();
    setMatches(ms);
    const es = await fetchEntries(ms.map((m) => m.id));
    setEntries(es);
    const paths = es.flatMap((e) => [e.main_image, e.side_image]).filter(Boolean) as string[];
    setUrls(await signedUrls(paths));
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
                  urls={urls}
                  onChange={load}
                  onView={setLightbox}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {lightbox && (lightbox.main || lightbox.side) && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[100] grid place-items-center overflow-auto bg-black/85 p-6"
        >
          <div className="flex max-h-[90vh] flex-col items-center gap-3 sm:flex-row sm:items-start" onClick={(e) => e.stopPropagation()}>
            {lightbox.main && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lightbox.main} alt="main deck" className="max-h-[85vh] max-w-full border border-white/15 object-contain" />
            )}
            {lightbox.side && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lightbox.side} alt="side deck" className="max-h-[85vh] max-w-full border border-white/15 object-contain" />
            )}
          </div>
          <button
            onClick={() => setLightbox(null)}
            className="fixed right-5 top-5 -skew-x-12 border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-white/20"
          >
            <span className="block skew-x-12">Close</span>
          </button>
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
