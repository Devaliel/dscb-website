"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import Star from "@/components/persona/star";
import DeckChip from "@/components/deck-chip";
import PlayerAvatar from "@/components/player-avatar";
import BlogEditor from "@/components/blog-editor";
import { getBrowserSupabase, supabaseEnabled } from "@/lib/supabase";
import { EMAIL_TO_HANDLE } from "@/lib/blog-db";
import { getPlayer, getPlayers, getAllDecks, getDeck, analyzeLineup } from "@/lib/data";
import { winRate } from "@/lib/utils";
import {
  fetchMatches, fetchEntries, fetchScrims, warroomReady, uploadDecklist, signedUrls,
  normalizeCardName, tallyCardUsage, scrimStats,
  type MatchRow, type LineupEntryRow, type KeyCard, type ScrimRow, type ScrimGame, type ScrimRecord,
} from "@/lib/warroom";
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

// scrim win/loss colors — same pair the relay-match pips use
const WIN = "var(--color-brand-400)";
const LOSS = "var(--color-cyber-500)";

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
      <button
        type="button"
        onClick={() => (url && onView ? onView() : ref.current?.click())}
        disabled={disabled}
        className="grid aspect-[4/3] w-full place-items-center overflow-hidden border border-white/15 bg-ink-900 text-[11px] text-fog-600 transition-colors hover:border-brand-400/60"
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
        <button type="button" onClick={() => ref.current?.click()} className="mt-1 text-[11px] text-fog-500 hover:text-brand-300">
          {url ? "Replace" : uploading ? "…" : "Choose"}
        </button>
      )}
    </div>
  );
}

/* ── plain card-name tag list (captain's "Shared cards" picker) ── */
function CardNameTags({
  names,
  onChange,
  max,
  placeholder,
}: {
  names: string[];
  onChange: (names: string[]) => void;
  max?: number;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  function add() {
    const v = draft.trim();
    if (!v || (max && names.length >= max)) return;
    if (names.some((n) => n.toLowerCase() === v.toLowerCase())) { setDraft(""); return; }
    onChange([...names, v]);
    setDraft("");
  }
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {names.map((n, i) => (
          <span key={i} className="flex items-center gap-1.5 rounded-full border border-brand-400/30 bg-brand-500/10 px-2.5 py-1 text-xs text-brand-200">
            {n}
            <button type="button" onClick={() => onChange(names.filter((_, idx) => idx !== i))} className="text-brand-400 hover:text-cyber-400">×</button>
          </span>
        ))}
        {names.length === 0 && <span className="text-xs italic text-fog-600">none set</span>}
      </div>
      {(!max || names.length < max) && (
        <div className="flex gap-2">
          <input
            className={inputCls}
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          />
          <button type="button" onClick={add} className="-skew-x-12 border border-brand-400/50 bg-brand-500/15 px-4 text-xs font-bold uppercase tracking-wide text-brand-300 hover:bg-brand-500/30">
            <span className="block skew-x-12">Add</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ── key-card tracker (in MySubmission) — free-text tags, live team-tally warning ── */
function KeyCardsEditor({
  cards,
  onChange,
  separateArchetypes,
  tally,
  teamCap,
}: {
  cards: KeyCard[];
  onChange: (cards: KeyCard[]) => void;
  separateArchetypes: boolean;
  tally: Record<string, { display: string; count: number; players: string[] }>;
  teamCap: number;
}) {
  const [name, setName] = useState("");
  const [count, setCount] = useState(1);
  const [deck, setDeck] = useState<1 | 2>(1);

  function add() {
    const v = name.trim();
    if (!v) return;
    onChange([...cards, { name: v, count, deck: separateArchetypes ? deck : 1 }]);
    setName("");
    setCount(1);
  }

  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-fog-600">
        Key cards <span className="normal-case text-fog-600">— staples worth tracking across the team ({teamCap}-copy cap)</span>
      </label>
      {cards.length > 0 && (
        <div className="mb-2 space-y-1.5">
          {cards.map((c, i) => {
            const existing = tally[normalizeCardName(c.name)];
            const total = (existing?.count ?? 0) + c.count;
            const over = total > teamCap;
            const at = total === teamCap;
            return (
              <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-1.5 text-xs">
                <span className="font-medium text-fog-100">{c.name}</span>
                <span className="text-fog-500">×{c.count}</span>
                {separateArchetypes && <span className="text-fog-600">Deck {c.deck}</span>}
                <span className={over ? "text-cyber-400" : at ? "text-gold-500" : "text-fog-600"}>
                  {total}/{teamCap} across team
                  {existing && existing.players.length > 0 && ` · also ${existing.players.map((h) => getPlayer(h)?.name ?? h).join(", ")}`}
                </span>
                <button type="button" onClick={() => onChange(cards.filter((_, idx) => idx !== i))} className="ml-auto text-fog-500 hover:text-cyber-400">×</button>
              </div>
            );
          })}
        </div>
      )}
      <div className="space-y-2">
        <input
          className={inputCls}
          placeholder="Card name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <div className="flex items-center gap-2">
          <input
            className={inputCls + " w-16"}
            type="number"
            min={1}
            max={3}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(3, Number(e.target.value) || 1)))}
          />
          {separateArchetypes && (
            <select className={inputCls + " w-24"} value={deck} onChange={(e) => setDeck(Number(e.target.value) as 1 | 2)}>
              <option value={1}>Deck 1</option>
              <option value={2}>Deck 2</option>
            </select>
          )}
          <button type="button" onClick={add} className="ml-auto -skew-x-12 border border-brand-400/50 bg-brand-500/15 px-4 py-2 text-xs font-bold uppercase tracking-wide text-brand-300 hover:bg-brand-500/30">
            <span className="block skew-x-12">Add</span>
          </button>
        </div>
      </div>
      <p className="mt-1 text-[10px] text-fog-600">Limited = 1 copy, Semi-Limited = 2 — set the count yourself, it isn&apos;t checked automatically.</p>
    </div>
  );
}

/* ── my-deck submission form ── */
function MySubmission({
  match,
  handle,
  entry,
  entries,
  urls,
  onSaved,
  onView,
}: {
  match: MatchRow;
  handle: string;
  entry?: LineupEntryRow;
  entries: LineupEntryRow[];
  urls: Record<string, string>;
  onSaved: () => void;
  onView: (lb: Lightbox) => void;
}) {
  const decks = useMemo(() => getAllDecks(), []);
  const preset = getRulePreset(match.rules_preset);
  const [slug, setSlug] = useState<string>(entry?.deck_slug ?? (entry && !entry.deck_slug ? CUSTOM : ""));
  const [custom, setCustom] = useState(entry && !entry.deck_slug ? entry.deck_name : "");
  const [slug2, setSlug2] = useState<string>(entry?.deck2_slug ?? (entry?.deck2_name && !entry.deck2_slug ? CUSTOM : ""));
  const [custom2, setCustom2] = useState(entry?.deck2_name && !entry.deck2_slug ? entry.deck2_name : "");
  const [role, setRole] = useState<"main" | "sub">(entry?.lineup_role ?? "main");
  const [tech, setTech] = useState(entry?.tech_note ?? "");
  const [keyCards, setKeyCards] = useState<KeyCard[]>(entry?.key_cards ?? []);
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
  const [mainLabel, sideLabel] = preset?.deckSlots ?? ["Main deck *", "Side deck (optional)"];
  const archetypeLabel = preset?.separateArchetypes ? "Deck 1 archetype" : "Archetype";

  const cardTally = useMemo(() => {
    if (!preset?.sharedCardPool) return {};
    const exclude = new Set((match.shared_cards ?? []).map((c) => normalizeCardName(c.name)));
    return tallyCardUsage(entries.filter((e) => e.player_handle !== handle), exclude);
  }, [entries, handle, match.shared_cards, preset?.sharedCardPool]);

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
    const deckName2 = preset?.separateArchetypes
      ? (slug2 === CUSTOM ? custom2.trim() : decks.find((d) => d.slug === slug2)?.name ?? "")
      : "";
    setBusy(true);
    setMsg(null);
    const row = {
      match_id: match.id,
      player_handle: handle,
      deck_slug: slug === CUSTOM ? null : slug,
      deck_name: deckName,
      deck2_slug: deckName2 ? (slug2 === CUSTOM ? null : slug2) : null,
      deck2_name: deckName2 || null,
      lineup_role: role,
      tech_note: tech.trim() || null,
      main_image: mainPath,
      side_image: sidePath,
      key_cards: keyCards,
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
          {entry ? (
            <>
              You brought <span className="text-fog-100">{entry.deck_name}</span>
              {entry.deck2_name && <> + <span className="text-fog-100">{entry.deck2_name}</span></>} ({entry.lineup_role}).
            </>
          ) : "You didn't submit for this match."}{" "}
          Lineup is {match.status}.
        </p>
        {(mainUrl || sideUrl) && (
          <button
            type="button"
            onClick={() => onView({ main: mainUrl, side: sideUrl })}
            className="-skew-x-12 border border-brand-400/50 bg-brand-500/15 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-300 hover:bg-brand-500/30"
          >
            <span className="block skew-x-12">View decklist</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-fog-600">{archetypeLabel}</label>
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

      {preset?.separateArchetypes && (
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-fog-600">Deck 2 archetype (optional)</label>
          <select className={inputCls} value={slug2} onChange={(e) => setSlug2(e.target.value)}>
            <option value="">— not bringing a second deck —</option>
            {decks.map((d) => (
              <option key={d.slug} value={d.slug}>{d.name}</option>
            ))}
            <option value={CUSTOM}>Custom / off-meta…</option>
          </select>
          {slug2 === CUSTOM && (
            <input className={inputCls + " mt-2"} placeholder="Archetype name" value={custom2} onChange={(e) => setCustom2(e.target.value)} />
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <ImageSlot label={mainLabel} url={mainUrl} uploading={upMain} onFile={(f) => pick(f, "main")} onView={() => onView({ main: mainUrl, side: sideUrl })} />
        <ImageSlot label={sideLabel} url={sideUrl} uploading={upSide} onFile={(f) => pick(f, "side")} onView={() => onView({ main: mainUrl, side: sideUrl })} />
      </div>

      {preset?.sharedCardPool && (
        <KeyCardsEditor
          cards={keyCards}
          onChange={setKeyCards}
          separateArchetypes={!!preset.separateArchetypes}
          tally={cardTally}
          teamCap={preset.sharedCardPool.teamCap}
        />
      )}

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

/* ── rule-booklet section list (shared by the match panel + Tournaments tab) ── */
function BookletBody({ preset }: { preset: NonNullable<ReturnType<typeof getRulePreset>> }) {
  return (
    <>
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
    </>
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
          <BookletBody preset={preset} />
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
              <div className="flex items-start gap-2.5">
                <div className="min-w-0 flex-1">
                  <DeckChip deckSlug={e.deck_slug ?? undefined} name={e.deck_name} size="sm" />
                  {e.deck2_name && <div className="mt-1"><DeckChip deckSlug={e.deck2_slug ?? undefined} name={e.deck2_name} size="sm" /></div>}
                  {e.tech_note && <p className="mt-1 truncate text-[11px] text-fog-500">{e.tech_note}</p>}
                  {e.key_cards && e.key_cards.length > 0 && (
                    <p className="mt-1 flex flex-wrap gap-1">
                      {e.key_cards.map((c, i) => (
                        <span key={i} className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-fog-400">
                          {c.name} ×{c.count}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
                {mainUrl && (
                  <button
                    type="button"
                    onClick={() => onView({ main: mainUrl, side: sideUrl })}
                    className="shrink-0 -skew-x-12 border border-brand-400/50 bg-brand-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-300 hover:bg-brand-500/30"
                  >
                    <span className="block skew-x-12">List</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── one match card (accordion: compact summary row → full detail) ── */
function MatchCard({
  match,
  entries,
  handle,
  isCaptain,
  urls,
  onChange,
  onView,
  expanded,
  onToggle,
  archive = false,
}: {
  match: MatchRow;
  entries: LineupEntryRow[];
  handle: string;
  isCaptain: boolean;
  urls: Record<string, string>;
  onChange: () => void;
  onView: (lb: Lightbox) => void;
  expanded: boolean;
  onToggle: () => void;
  archive?: boolean;
}) {
  const roster = useMemo(() => getPlayers().filter((p) => p.role !== "Try Out"), []);
  const myEntry = entries.find((e) => e.player_handle === handle);
  const st = STATUS_STYLE[match.status];
  const preset = getRulePreset(match.rules_preset);
  const [expected, setExpected] = useState(match.expected_opponent_decks ?? "");
  const [savingMeta, setSavingMeta] = useState(false);
  const [sharedCards, setSharedCards] = useState((match.shared_cards ?? []).map((c) => c.name));
  const [savingShared, setSavingShared] = useState(false);
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
  async function saveSharedCards(next: string[]) {
    setSharedCards(next);
    setSavingShared(true);
    await getBrowserSupabase().from("matches").update({ shared_cards: next.map((name) => ({ name })) }).eq("id", match.id);
    setSavingShared(false);
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
    <div
      className="clip-corner relative overflow-hidden border border-white/10 bg-ink-850"
      style={{ boxShadow: `6px 6px 0 rgba(0,0,0,0.45), inset 3px 0 0 ${st.color}`, opacity: archive && !expanded ? 0.75 : 1 }}
    >
      <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />

      {/* summary row — always visible, toggles the detail */}
      <button
        type="button"
        onClick={onToggle}
        className={`relative flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2 px-5 py-4 text-left transition-colors hover:bg-white/[0.02] sm:px-6 ${expanded ? "border-b border-white/10" : ""}`}
      >
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
        <span className="flex shrink-0 items-center gap-2.5">
          <span
            className="-skew-x-12 px-3 py-1 text-xs font-bold uppercase tracking-wide"
            style={{ background: `color-mix(in oklab, ${st.color} 82%, black)`, color: "white", boxShadow: "3px 3px 0 rgba(0,0,0,0.4)" }}
          >
            <span className="block skew-x-12">{st.label}</span>
          </span>
          <span className="text-xs text-fog-600">{expanded ? "▲" : "▼"}</span>
        </span>
      </button>

      {expanded && archive ? (
        <div className="relative space-y-5 p-5 sm:p-6">
          <SealedLineup entries={entries} urls={urls} onView={onView} />
          {isCaptain && (
            <button onClick={remove} className="-skew-x-12 border border-cyber-500/40 px-4 py-1.5 text-xs font-bold uppercase text-cyber-400 hover:bg-cyber-500/15">
              <span className="block skew-x-12">Delete</span>
            </button>
          )}
        </div>
      ) : expanded ? (
      <div className="relative space-y-5 p-5 sm:p-6">
        {/* tournament rules */}
        <RulesPanel slug={match.rules_preset} />

        {match.status === "open" ? (
          <>
            {/* my submission */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fog-600">My submission</p>
              <MySubmission match={match} handle={handle} entry={myEntry} entries={entries} urls={urls} onSaved={onChange} onView={onView} />
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
                      className="flex flex-col gap-1.5 rounded-lg border px-3 py-2.5"
                      style={{
                        opacity: e ? 1 : 0.55,
                        borderColor: active ? "var(--color-brand-400)" : "rgba(255,255,255,0.05)",
                        background: active ? "color-mix(in oklab, var(--color-brand-500) 8%, transparent)" : "rgba(255,255,255,0.02)",
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm text-fog-200">{p.name}</span>
                        {e?.lineup_role === "sub" && <span className="shrink-0 text-[10px] uppercase tracking-wide text-fog-600">sub</span>}
                      </div>

                      {e ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <DeckChip deckSlug={e.deck_slug ?? undefined} name={e.deck_name} size="sm" />
                          {e.deck2_name && <span className="text-[10px] uppercase tracking-wide text-brand-300">+{e.deck2_name}</span>}
                          {e.side_image && <span className="text-[10px] uppercase tracking-wide text-brand-300">+side</span>}
                          {e.key_cards && e.key_cards.length > 0 && <span className="text-[10px] uppercase tracking-wide text-gold-500">{e.key_cards.length} key</span>}
                        </div>
                      ) : (
                        <span className="text-xs italic text-fog-600">— no pick yet —</span>
                      )}

                      {(mainUrl || isCaptain) && (
                        <div className="flex justify-end gap-2">
                          {mainUrl && (
                            <button
                              type="button"
                              onClick={() => onView({ main: mainUrl, side: sideUrl })}
                              className="-skew-x-12 border border-brand-400/50 bg-brand-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-300 hover:bg-brand-500/30"
                            >
                              <span className="block skew-x-12">List</span>
                            </button>
                          )}
                          {isCaptain && (
                            <button
                              type="button"
                              onClick={() => setProxyHandle((h) => (h === p.handle ? null : p.handle))}
                              className="text-[10px] font-bold uppercase tracking-wide text-brand-300 hover:text-brand-200"
                            >
                              {active ? "Close" : e ? "Edit" : "+ Add"}
                            </button>
                          )}
                        </div>
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
                    entries={entries}
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

            {preset?.sharedCardPool && (
              <div className="mt-3">
                <label className="mb-1 block text-[11px] text-fog-600">
                  Shared cards (up to {preset.sharedCardPool.sharedSlots}) — exempt from the {preset.sharedCardPool.teamCap}-copy team cap
                </label>
                <CardNameTags
                  names={sharedCards}
                  onChange={saveSharedCards}
                  max={preset.sharedCardPool.sharedSlots}
                  placeholder="Card name"
                />
                {savingShared && <p className="mt-1 text-[10px] text-fog-600">Saving…</p>}
              </div>
            )}

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
      ) : null}
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

/* ── scrim game W/L pip (echoes the relay-match pip) ── */
function GamePip({ result }: { result: ScrimGame["result"] }) {
  const won = result === "win";
  return (
    <span
      className="grid h-5 w-5 shrink-0 -skew-x-12 place-items-center text-[10px] font-black text-white"
      style={{ background: won ? WIN : LOSS }}
    >
      <span className="block skew-x-12">{won ? "W" : "L"}</span>
    </span>
  );
}

/* ── scrim create/edit form (any member; games logged row by row) ── */
function ScrimForm({
  handle,
  existing,
  onSaved,
  onCancel,
}: {
  handle: string;
  existing?: ScrimRow;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const decks = useMemo(() => getAllDecks(), []);
  const roster = useMemo(() => getPlayers().filter((p) => p.role !== "Try Out"), []);
  const [opponent, setOpponent] = useState(existing?.opponent_team ?? "");
  const [when, setWhen] = useState(() => toLocalInput(existing?.played_at ?? new Date().toISOString()));
  const [format, setFormat] = useState(existing?.format ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [games, setGames] = useState<ScrimGame[]>(existing?.games ?? []);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // draft game row — player/deck/opponent persist after Add for fast repeat logging
  const [gPlayer, setGPlayer] = useState(handle);
  const [gSlug, setGSlug] = useState("");
  const [gCustom, setGCustom] = useState("");
  const [gOpp, setGOpp] = useState("");
  const [gResult, setGResult] = useState<ScrimGame["result"]>("win");

  function addGame() {
    const deckName = gSlug === CUSTOM ? gCustom.trim() : decks.find((d) => d.slug === gSlug)?.name ?? "";
    if (!deckName) { setMsg("Pick the deck that was played."); return; }
    setMsg(null);
    setGames([...games, {
      player: gPlayer,
      deckSlug: gSlug === CUSTOM ? null : gSlug,
      deckName,
      oppDeck: gOpp.trim(),
      result: gResult,
    }]);
  }

  async function save() {
    if (!opponent.trim() || !when) { setMsg("Opponent and date/time are required."); return; }
    if (games.length === 0) { setMsg("Log at least one game."); return; }
    setBusy(true);
    setMsg(null);
    const row = {
      opponent_team: opponent.trim(),
      played_at: new Date(when).toISOString(),
      format: format.trim(),
      notes: notes.trim() || null,
      games,
    };
    const sb = getBrowserSupabase();
    const { error } = existing
      ? await sb.from("scrims").update(row).eq("id", existing.id)
      : await sb.from("scrims").insert({ ...row, logged_by: handle });
    setBusy(false);
    if (error) setMsg(error.message);
    else onSaved();
  }

  const wins = games.filter((g) => g.result === "win").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={inputCls} placeholder="Opponent team *" value={opponent} onChange={(e) => setOpponent(e.target.value)} />
        <input className={inputCls} type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        <input className={inputCls} placeholder="Format (optional — e.g. BO1 grind, relay practice)" value={format} onChange={(e) => setFormat(e.target.value)} />
        <input className={inputCls} placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-fog-600">
          Games <span className="normal-case text-fog-600">— {games.length} logged{games.length > 0 && <> · {wins}–{games.length - wins}</>}</span>
        </label>
        {games.length > 0 && (
          <div className="mb-2 space-y-1.5">
            {games.map((g, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-1.5 text-xs">
                <GamePip result={g.result} />
                <span className="text-fog-200">{getPlayer(g.player)?.name ?? g.player}</span>
                <DeckChip deckSlug={g.deckSlug ?? undefined} name={g.deckName} size="sm" link={false} />
                {g.oppDeck && <span className="text-fog-500">vs {g.oppDeck}</span>}
                <button type="button" onClick={() => setGames(games.filter((_, idx) => idx !== i))} className="ml-auto text-fog-500 hover:text-cyber-400">×</button>
              </div>
            ))}
          </div>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          <select className={inputCls} value={gPlayer} onChange={(e) => setGPlayer(e.target.value)}>
            {roster.map((p) => (
              <option key={p.handle} value={p.handle}>{p.name}</option>
            ))}
          </select>
          <div className="min-w-0">
            <select className={inputCls} value={gSlug} onChange={(e) => setGSlug(e.target.value)}>
              <option value="">Our deck…</option>
              {decks.map((d) => (
                <option key={d.slug} value={d.slug}>{d.name}</option>
              ))}
              <option value={CUSTOM}>Custom / off-meta…</option>
            </select>
            {gSlug === CUSTOM && (
              <input className={inputCls + " mt-2"} placeholder="Archetype name" value={gCustom} onChange={(e) => setGCustom(e.target.value)} />
            )}
          </div>
          <input
            className={inputCls}
            placeholder="Opponent's deck (optional)"
            value={gOpp}
            onChange={(e) => setGOpp(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addGame(); } }}
          />
          <div className="flex gap-2">
            {(["win", "loss"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setGResult(r)}
                className="flex-1 -skew-x-12 border px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors"
                style={gResult === r
                  ? { background: r === "win" ? WIN : LOSS, borderColor: "transparent", color: "white", boxShadow: "3px 3px 0 rgba(0,0,0,0.4)" }
                  : { borderColor: "rgba(255,255,255,0.15)", color: "var(--color-fog-400)" }}
              >
                <span className="block skew-x-12">{r}</span>
              </button>
            ))}
            <button type="button" onClick={addGame} className="-skew-x-12 border border-brand-400/50 bg-brand-500/15 px-4 text-xs font-bold uppercase tracking-wide text-brand-300 hover:bg-brand-500/30">
              <span className="block skew-x-12">Add</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={busy} className="-skew-x-12 bg-brand-500 px-6 py-2 disabled:opacity-50" style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.5)" }}>
          <span className="block skew-x-12 font-display text-xs font-extrabold uppercase italic tracking-wide text-white">
            {busy ? "Saving…" : existing ? "Save changes" : "Log scrim"}
          </span>
        </button>
        <button onClick={onCancel} className="text-sm text-fog-500 hover:text-fog-100">Cancel</button>
        {msg && <span className="text-xs text-cyber-400">{msg}</span>}
      </div>
    </div>
  );
}

/* ── collapsed "+ Log scrim" → form panel ── */
function LogScrim({ handle, onSaved }: { handle: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="-skew-x-12 bg-brand-500 px-6 py-2.5" style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.5)" }}>
        <span className="block skew-x-12 font-display text-sm font-extrabold uppercase italic tracking-wide text-white">+ Log scrim</span>
      </button>
    );
  }
  return (
    <div className="clip-corner relative border border-white/10 bg-ink-850 p-6" style={{ boxShadow: "6px 6px 0 rgba(0,0,0,0.45)" }}>
      <h3 className="text-persona mb-4 text-lg text-fog-100">Log a scrim</h3>
      <ScrimForm handle={handle} onSaved={() => { setOpen(false); onSaved(); }} onCancel={() => setOpen(false)} />
    </div>
  );
}

/* ── one scrim session card (accordion, like MatchCard) ── */
function ScrimCard({
  scrim,
  handle,
  isCaptain,
  onChange,
  expanded,
  onToggle,
}: {
  scrim: ScrimRow;
  handle: string;
  isCaptain: boolean;
  onChange: () => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const games = scrim.games ?? [];
  const wins = games.filter((g) => g.result === "win").length;
  const losses = games.length - wins;
  const accent = wins > losses ? WIN : wins < losses ? LOSS : "var(--color-gold-500)";
  const canEdit = scrim.logged_by === handle || isCaptain;

  async function remove() {
    if (!window.confirm("Delete this scrim and all its games?")) return;
    await getBrowserSupabase().from("scrims").delete().eq("id", scrim.id);
    onChange();
  }

  return (
    <div
      className="clip-corner relative overflow-hidden border border-white/10 bg-ink-850"
      style={{ boxShadow: `6px 6px 0 rgba(0,0,0,0.45), inset 3px 0 0 ${accent}` }}
    >
      <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />

      <button
        type="button"
        onClick={onToggle}
        className={`relative flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2 px-5 py-4 text-left transition-colors hover:bg-white/[0.02] sm:px-6 ${expanded ? "border-b border-white/10" : ""}`}
      >
        <div className="min-w-0">
          <h3 className="text-persona text-lg text-fog-100">vs {scrim.opponent_team}</h3>
          <p className="mt-0.5 text-xs text-fog-500">
            {scrim.format ? `${scrim.format} · ` : ""}
            {new Date(scrim.played_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            <span className="ml-1 text-fog-600">· logged by {getPlayer(scrim.logged_by)?.name ?? scrim.logged_by}</span>
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-2.5">
          <span
            className="-skew-x-12 px-3 py-1 text-xs font-bold tabular-nums tracking-wide"
            style={{ background: `color-mix(in oklab, ${accent} 82%, black)`, color: "white", boxShadow: "3px 3px 0 rgba(0,0,0,0.4)" }}
          >
            <span className="block skew-x-12">{wins}–{losses}</span>
          </span>
          <span className="text-xs text-fog-600">{expanded ? "▲" : "▼"}</span>
        </span>
      </button>

      {expanded && (
        <div className="relative space-y-4 p-5 sm:p-6">
          {editing ? (
            <ScrimForm
              handle={handle}
              existing={scrim}
              onSaved={() => { setEditing(false); onChange(); }}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <>
              <div className="space-y-1.5">
                {games.map((g, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs">
                    <GamePip result={g.result} />
                    <span className="text-fog-200">{getPlayer(g.player)?.name ?? g.player}</span>
                    <DeckChip deckSlug={g.deckSlug ?? undefined} name={g.deckName} size="sm" />
                    {g.oppDeck && <span className="text-fog-500">vs {g.oppDeck}</span>}
                  </div>
                ))}
              </div>
              {scrim.notes && <p className="text-xs text-fog-500">{scrim.notes}</p>}
              {canEdit && (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setEditing(true)} className="-skew-x-12 border border-white/15 px-4 py-1.5 text-xs font-bold uppercase text-fog-300 hover:text-fog-100">
                    <span className="block skew-x-12">Edit</span>
                  </button>
                  <button onClick={remove} className="-skew-x-12 border border-cyber-500/40 px-4 py-1.5 text-xs font-bold uppercase text-cyber-400 hover:bg-cyber-500/15">
                    <span className="block skew-x-12">Delete</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── aggregate scrim insights (per deck / per player / vs archetype) ── */
function ScrimStatsPanel({ scrims }: { scrims: ScrimRow[] }) {
  const stats = useMemo(() => scrimStats(scrims), [scrims]);

  const sortRecs = <T extends ScrimRecord>(recs: Record<string, T>): T[] =>
    Object.values(recs).sort((a, b) => b.wins + b.losses - (a.wins + a.losses));

  const Row = ({ rec, chip }: { rec: ScrimRecord; chip?: React.ReactNode }) => {
    const wr = winRate(rec.wins, rec.losses);
    return (
      <div className="flex items-center gap-2 text-xs">
        {chip ?? <span className="min-w-0 truncate text-fog-200">{rec.display}</span>}
        <span className="ml-auto shrink-0 tabular-nums text-fog-500">{rec.wins}–{rec.losses}</span>
        <span className="w-9 shrink-0 text-right tabular-nums" style={{ color: wr >= 50 ? "var(--color-brand-300)" : "var(--color-cyber-400)" }}>
          {wr}%
        </span>
      </div>
    );
  };

  const cols: [string, ScrimRecord[], boolean][] = [
    ["By deck", sortRecs(stats.perDeck), true],
    ["By player", sortRecs(stats.perPlayer), false],
    ["Vs archetype", sortRecs(stats.vsArchetype), false],
  ];

  return (
    <div className="clip-corner relative overflow-hidden border border-white/10 bg-ink-850 p-5 sm:p-6" style={{ boxShadow: "6px 6px 0 rgba(0,0,0,0.45)" }}>
      <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />
      <p className="relative mb-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-300">
        <Star className="h-2.5 w-2.5" /> Scrim insights
      </p>
      <div className="relative grid gap-5 sm:grid-cols-3">
        {cols.map(([label, recs, isDeck]) => (
          <div key={label} className="min-w-0">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-fog-600">{label}</p>
            <div className="space-y-1.5">
              {recs.map((rec, i) => (
                <Row
                  key={i}
                  rec={rec}
                  chip={isDeck ? <DeckChip deckSlug={(rec as ScrimRecord & { deckSlug: string | null }).deckSlug ?? undefined} name={rec.display} size="sm" link={false} /> : (
                    <span className="min-w-0 truncate text-fog-200">
                      {label === "By player" ? getPlayer(rec.display)?.name ?? rec.display : rec.display}
                    </span>
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── portal identity header ── */
function PortalIdentity({ handle, isCaptain, onLogout }: { handle: string; isCaptain: boolean; onLogout: () => void }) {
  const player = getPlayer(handle);
  if (!player) return null;
  const deck = getDeck(player.mainDeckSlug);
  const accent = deck?.accent ?? "var(--color-brand-400)";
  const games = player.wins + player.losses;
  return (
    <div className="clip-corner relative flex items-center gap-4 overflow-hidden border border-white/10 bg-ink-850 px-4 py-3.5 sm:px-5" style={{ boxShadow: "5px 5px 0 rgba(0,0,0,0.45)" }}>
      <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-[50px]" style={{ background: `color-mix(in oklab, ${accent} 28%, transparent)` }} aria-hidden />
      <div className="relative h-12 w-12 shrink-0">
        <PlayerAvatar player={player} accent={accent} size="card" className="h-12 w-12" />
      </div>
      <div className="relative min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-persona text-lg text-fog-100">{player.name}</span>
          <span className="-skew-x-12 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white" style={{ background: `color-mix(in oklab, ${accent} 75%, black)` }}>
            <span className="block skew-x-12">{player.role}</span>
          </span>
          {isCaptain && <span className="text-[10px] uppercase tracking-wide text-brand-300">lineup manager</span>}
        </div>
        <p className="text-xs tabular-nums text-fog-500">
          {player.wins}–{player.losses} career{games > 0 && <> · {winRate(player.wins, player.losses)}% WR</>}
        </p>
        <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
          <Link href={`/players/${player.handle}`} className="text-fog-500 underline decoration-white/15 underline-offset-2 hover:text-brand-300">My page</Link>
          <Link href={`/decks/${player.mainDeckSlug}`} className="text-fog-500 underline decoration-white/15 underline-offset-2 hover:text-brand-300">My deck</Link>
          <Link href="/guestbook" className="text-fog-500 underline decoration-white/15 underline-offset-2 hover:text-brand-300">Guestbook</Link>
        </p>
      </div>
      <button onClick={onLogout} className="relative shrink-0 -skew-x-12 border border-white/15 bg-white/5 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-fog-300 hover:text-fog-100">
        <span className="block skew-x-12">Log out</span>
      </button>
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
  const [scrims, setScrims] = useState<ScrimRow[] | null>([]); // null = scrims table not migrated yet
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [lightbox, setLightbox] = useState<Lightbox>(null);
  const [tab, setTab] = useState<"matches" | "scrims" | "tournaments" | "blog" | "history">("matches");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handle = useMemo(() => {
    const e = session?.user?.email?.toLowerCase();
    return e ? EMAIL_TO_HANDLE[e] : undefined;
  }, [session]);
  const player = handle ? getPlayer(handle) : undefined;
  // Darkzill (site dev) gets lineup-manager access regardless of in-game role —
  // Cain/Sieg accounts aren't accessible to them day-to-day.
  const isCaptain = player?.role === "Captain" || player?.role === "Vice Captain" || handle === "Darkzill";

  const active = matches.filter((m) => m.status !== "done");
  const done = matches.filter((m) => m.status === "done");
  const missing = handle
    ? active.filter((m) => m.status === "open" && !entries.some((e) => e.match_id === m.id && e.player_handle === handle))
    : [];

  const load = useCallback(async () => {
    const ok = await warroomReady();
    setMigrated(ok);
    if (!ok) return;
    const ms = await fetchMatches();
    setMatches(ms);
    const es = await fetchEntries(ms.map((m) => m.id));
    setEntries(es);
    setScrims(await fetchScrims());
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
          <PortalIdentity handle={handle} isCaptain={!!isCaptain} onLogout={() => getBrowserSupabase().auth.signOut()} />

          {/* needs-your-deck alert */}
          {missing.length > 0 && (
            <button
              type="button"
              onClick={() => { setTab("matches"); setExpandedId(missing[0].id); }}
              className="flex w-full flex-wrap items-center gap-2 border border-cyber-500/40 bg-cyber-500/10 px-4 py-3 text-left text-sm text-cyber-400 transition-colors hover:bg-cyber-500/15"
            >
              <Star className="h-3 w-3 shrink-0" />
              <span className="font-bold uppercase tracking-wide">
                {missing.length} open match{missing.length > 1 ? "es" : ""} missing your deck
              </span>
              <span className="ml-auto text-xs underline decoration-cyber-500/50 underline-offset-2">Submit now →</span>
            </button>
          )}

          {/* tabs */}
          <div className="flex flex-wrap gap-2">
            {([
              ["matches", "Matches", active.length],
              ["scrims", "Scrims", scrims?.length ?? 0],
              ["tournaments", "Tournaments", Object.keys(RULE_PRESETS).length],
              ["blog", "Blog", null],
              ["history", "History", done.length],
            ] as const).map(([id, label, count]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`-skew-x-12 border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                  tab === id ? "border-brand-400 bg-brand-500 text-white" : "border-white/15 bg-white/5 text-fog-400 hover:text-fog-100"
                }`}
                style={tab === id ? { boxShadow: "3px 3px 0 rgba(0,0,0,0.4)" } : undefined}
              >
                <span className="block skew-x-12">
                  {label}{count !== null && <> <span className={tab === id ? "text-white/70" : "text-fog-600"}>({count})</span></>}
                </span>
              </button>
            ))}
          </div>

          {tab === "matches" && (
            <div className="space-y-4">
              {isCaptain && <CreateMatch onCreated={load} />}
              {active.length === 0 ? (
                <p className="text-fog-500">No upcoming matches yet.{isCaptain ? " Create one above." : " Check back soon."}</p>
              ) : (
                active.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    entries={entries.filter((e) => e.match_id === m.id)}
                    handle={handle}
                    isCaptain={!!isCaptain}
                    urls={urls}
                    onChange={load}
                    onView={setLightbox}
                    expanded={expandedId === m.id}
                    onToggle={() => setExpandedId((id) => (id === m.id ? null : m.id))}
                  />
                ))
              )}
            </div>
          )}

          {tab === "scrims" &&
            (scrims === null ? (
              <p className="text-fog-500">
                Scrim table isn&apos;t set up yet — run <code className="text-brand-300">supabase/scrims-schema.sql</code> in the Supabase SQL Editor.
              </p>
            ) : (
              <div className="space-y-4">
                <LogScrim handle={handle} onSaved={load} />
                {scrims.length === 0 ? (
                  <p className="text-fog-500">No scrims logged yet. Log the first one above.</p>
                ) : (
                  <>
                    {scrims.some((s) => (s.games ?? []).length > 0) && <ScrimStatsPanel scrims={scrims} />}
                    {scrims.map((s) => (
                      <ScrimCard
                        key={s.id}
                        scrim={s}
                        handle={handle}
                        isCaptain={!!isCaptain}
                        onChange={load}
                        expanded={expandedId === s.id}
                        onToggle={() => setExpandedId((id) => (id === s.id ? null : s.id))}
                      />
                    ))}
                  </>
                )}
              </div>
            ))}

          {tab === "tournaments" && (
            <div className="space-y-4">
              {Object.values(RULE_PRESETS).map((p) => (
                <div key={p.slug} className="clip-corner relative overflow-hidden border border-white/10 bg-ink-850" style={{ boxShadow: "6px 6px 0 rgba(0,0,0,0.45)" }}>
                  <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />
                  <div className="relative border-b border-white/10 px-5 py-4 sm:px-6">
                    <h3 className="text-persona text-xl text-fog-100">{p.name}</h3>
                    <p className="mt-1 text-xs text-fog-500">{p.format}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-wide">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-fog-400">
                        {p.deckSlots[0].replace(" *", "")} + {p.deckSlots[1].replace(" (optional)", "")}
                      </span>
                      {p.sharedCardPool && (
                        <span className="rounded-full border border-brand-400/30 bg-brand-500/10 px-2 py-0.5 text-brand-300">
                          {p.sharedCardPool.teamCap}-copy team cap · {p.sharedCardPool.sharedSlots} shared cards
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative space-y-4 px-5 py-4 sm:px-6">
                    <BookletBody preset={p} />
                  </div>
                </div>
              ))}
              <p className="text-xs text-fog-600">New tournaments are added by the dev — ping Darkzill.</p>
            </div>
          )}

          {tab === "blog" && <BlogEditor authorHandle={handle} />}

          {tab === "history" &&
            (done.length === 0 ? (
              <p className="text-fog-500">No finished matches yet.</p>
            ) : (
              <div className="space-y-4">
                {done.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    entries={entries.filter((e) => e.match_id === m.id)}
                    handle={handle}
                    isCaptain={!!isCaptain}
                    urls={urls}
                    onChange={load}
                    onView={setLightbox}
                    expanded={expandedId === m.id}
                    onToggle={() => setExpandedId((id) => (id === m.id ? null : m.id))}
                    archive
                  />
                ))}
              </div>
            ))}
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
    <div className="relative overflow-hidden px-6 pb-24 pt-10 sm:pt-14">
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
        <p className="mt-4 max-w-xl text-sm text-fog-500">Submit decks, plan matches, post to the blog — the team&apos;s internal panel. Picks stay team-private; the public only sees the countdown.</p>
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}
