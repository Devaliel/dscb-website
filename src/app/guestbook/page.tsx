"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import PageHeader from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import Star from "@/components/persona/star";
import { getBrowserSupabase, supabaseEnabled } from "@/lib/supabase";
import { EMAIL_TO_HANDLE } from "@/lib/blog-db";
import { getPlayer } from "@/lib/data";

interface GuestEntry {
  id: string;
  name: string;
  message: string;
  created_at: string;
  parent_id: string | null;
  is_team: boolean;
  author_handle: string | null;
}

type ReactionTally = Record<string, Record<string, number>>;

const MAX_NAME = 40;
const MAX_MSG = 280;
const MAX_REPLIES_PER_SESSION = 5;
const REACTIONS = ["🔥", "❤️", "😂", "👀", "GG"] as const;

const inputCls =
  "w-full border border-white/15 bg-ink-900 px-3.5 py-2.5 text-sm text-fog-100 outline-none transition-colors placeholder:text-fog-600 focus:border-brand-400";

/* ── helpers ── */

function reactedKey(entryId: string, emoji: string) {
  return `dscb-react-${entryId}-${emoji}`;
}

function replyCount(): number {
  return Number(sessionStorage.getItem("dscb-reply-count") ?? "0");
}

function bumpReplyCount() {
  sessionStorage.setItem("dscb-reply-count", String(replyCount() + 1));
}

/* ── team badge ── */

function TeamBadge() {
  return (
    <span
      className="inline-flex -skew-x-12 items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
      style={{
        background: "color-mix(in oklab, var(--color-brand-500) 25%, transparent)",
        color: "var(--color-brand-300)",
        border: "1px solid color-mix(in oklab, var(--color-brand-500) 45%, transparent)",
      }}
      title="Verified DS Celebeast member"
    >
      <span className="flex skew-x-12 items-center gap-1">
        <Star className="h-2 w-2" /> DS
      </span>
    </span>
  );
}

/* ── reaction bar ── */

function ReactionBar({
  entryId,
  tally,
  onReact,
}: {
  entryId: string;
  tally: Record<string, number>;
  onReact: (entryId: string, emoji: string) => void;
}) {
  const reduced = useReducedMotion();
  const [bursts, setBursts] = useState<{ key: number; emoji: string }[]>([]);
  const [mine, setMine] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const m: Record<string, boolean> = {};
    for (const e of REACTIONS) m[e] = localStorage.getItem(reactedKey(entryId, e)) === "1";
    setMine(m);
  }, [entryId]);

  function handleTap(emoji: string) {
    if (mine[emoji]) return;
    setMine((prev) => ({ ...prev, [emoji]: true }));
    if (!reduced) {
      const key = Date.now();
      setBursts((b) => [...b, { key, emoji }]);
      setTimeout(() => setBursts((b) => b.filter((x) => x.key !== key)), 500);
    }
    onReact(entryId, emoji);
  }

  return (
    <div className="relative mt-3 flex flex-wrap gap-1.5">
      {REACTIONS.map((emoji) => {
        const count = tally[emoji] ?? 0;
        const reacted = mine[emoji];
        return (
          <motion.button
            key={emoji}
            type="button"
            onClick={() => handleTap(emoji)}
            whileTap={reduced ? undefined : { scale: 1.25 }}
            className="-skew-x-12 border px-2 py-0.5 text-xs transition-colors"
            style={{
              background: reacted
                ? "color-mix(in oklab, var(--color-brand-500) 22%, transparent)"
                : "rgba(255,255,255,0.03)",
              borderColor: reacted
                ? "color-mix(in oklab, var(--color-brand-500) 50%, transparent)"
                : "rgba(255,255,255,0.10)",
              cursor: reacted ? "default" : "pointer",
            }}
            aria-label={`React ${emoji}`}
          >
            <span className="flex skew-x-12 items-center gap-1">
              <span className={emoji === "GG" ? "font-display text-[11px] font-extrabold italic text-cyber-400" : ""}>
                {emoji}
              </span>
              {count > 0 && (
                <span className="tabular-nums text-[11px] text-fog-400">{count}</span>
              )}
            </span>
          </motion.button>
        );
      })}
      {/* emoji burst */}
      <AnimatePresence>
        {bursts.map((b) => (
          <motion.span
            key={b.key}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -22, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="pointer-events-none absolute -top-2 left-2 text-base"
            aria-hidden
          >
            {b.emoji === "GG" ? "🏆" : b.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ── reply form ── */

function ReplyForm({
  parentId,
  defaultName,
  nameLocked,
  teamHandle,
  onPosted,
}: {
  parentId: string;
  defaultName: string;
  nameLocked: boolean;
  teamHandle: string | null;
  onPosted: (entry: GuestEntry) => void;
}) {
  const [name, setName] = useState(defaultName);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    if (replyCount() >= MAX_REPLIES_PER_SESSION) {
      setErr("Reply limit reached for this session — come back later!");
      return;
    }
    setBusy(true);
    setErr(null);
    const sb = getBrowserSupabase();
    const { data, error } = await sb
      .from("guestbook")
      .insert({
        name: name.trim().slice(0, MAX_NAME),
        message: message.trim().slice(0, MAX_MSG),
        parent_id: parentId,
        ...(teamHandle ? { is_team: true, author_handle: teamHandle } : {}),
      })
      .select("id,name,message,created_at,parent_id,is_team,author_handle")
      .single();
    setBusy(false);
    if (error || !data) {
      setErr("Couldn't post your reply — try again.");
    } else {
      bumpReplyCount();
      if (!nameLocked) localStorage.setItem("dscb-guest-name", name.trim());
      setMessage("");
      onPosted(data as GuestEntry);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <input
        className={inputCls}
        placeholder="Your name"
        maxLength={MAX_NAME}
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={busy || nameLocked}
      />
      <div className="relative">
        <textarea
          className={inputCls + " min-h-20 resize-none"}
          placeholder="Write a reply…"
          maxLength={MAX_MSG}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={busy}
        />
        <span className="absolute bottom-2 right-3 text-[11px] text-fog-600 tabular-nums">
          {message.length}/{MAX_MSG}
        </span>
      </div>
      <button
        type="submit"
        disabled={busy || !name.trim() || !message.trim()}
        className="-skew-x-12 bg-brand-500/90 px-5 py-1.5 transition-transform hover:-translate-y-0.5 hover:bg-brand-500 disabled:opacity-40"
        style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.4)" }}
      >
        <span className="block skew-x-12 font-display text-xs font-extrabold uppercase italic tracking-wide text-white">
          {busy ? "Posting…" : "Post Reply"}
        </span>
      </button>
      {err && <p className="text-xs text-cyber-400">{err}</p>}
    </form>
  );
}

/* ── entry card ── */

function EntryCard({
  entry,
  replies,
  tally,
  onReact,
  defaultName,
  nameLocked,
  teamHandle,
  onReplyPosted,
  isNew,
  showReactions,
  canReply,
}: {
  entry: GuestEntry;
  replies: GuestEntry[];
  tally: ReactionTally;
  onReact: (entryId: string, emoji: string) => void;
  defaultName: string;
  nameLocked: boolean;
  teamHandle: string | null;
  onReplyPosted: (e: GuestEntry) => void;
  isNew: boolean;
  showReactions: boolean;
  canReply: boolean;
}) {
  const reduced = useReducedMotion();
  const [showReply, setShowReply] = useState(false);

  return (
    <motion.div
      layout={!reduced}
      initial={isNew && !reduced ? { opacity: 0, scale: 1.08, skewX: -2 } : false}
      animate={{ opacity: 1, scale: 1, skewX: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      className="clip-corner relative border border-white/10 bg-ink-850 px-5 py-4"
      style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.35)" }}
    >
      <div className="halftone pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden />
      {isNew && !reduced && (
        <motion.div
          initial={{ x: "-110%" }}
          animate={{ x: "110%" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 -skew-x-12"
          style={{ background: "color-mix(in oklab, var(--color-brand-500) 25%, transparent)" }}
          aria-hidden
        />
      )}
      <div className="relative flex items-baseline justify-between gap-3">
        <p className="flex items-center gap-2 font-display text-sm font-bold italic uppercase tracking-wide" style={{ color: "var(--color-brand-300)" }}>
          {entry.name}
          {entry.is_team && <TeamBadge />}
        </p>
        <time className="shrink-0 text-[11px] text-fog-600">
          {new Date(entry.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </time>
      </div>
      <p className="relative mt-1.5 text-sm leading-relaxed text-fog-300">{entry.message}</p>

      <div className="relative flex items-end justify-between gap-3">
        {showReactions ? (
          <ReactionBar entryId={entry.id} tally={tally[entry.id] ?? {}} onReact={onReact} />
        ) : (
          <span />
        )}
        {canReply && (
          <button
            type="button"
            onClick={() => setShowReply((s) => !s)}
            className="shrink-0 text-xs font-semibold uppercase tracking-wide text-fog-500 transition-colors hover:text-fog-100"
          >
            {showReply ? "Close" : "Reply"}
          </button>
        )}
      </div>

      {/* replies */}
      {replies.length > 0 && (
        <div className="relative mt-4 space-y-3 border-l-2 pl-4" style={{ borderColor: "color-mix(in oklab, var(--color-brand-500) 35%, transparent)" }}>
          {replies.map((r) => (
            <div key={r.id}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="flex items-center gap-2 font-display text-[13px] font-bold italic uppercase tracking-wide text-fog-200">
                  {r.name}
                  {r.is_team && <TeamBadge />}
                </p>
                <time className="shrink-0 text-[10px] text-fog-600">
                  {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </time>
              </div>
              <p className="mt-0.5 text-[13px] leading-relaxed text-fog-400">{r.message}</p>
              {showReactions && <ReactionBar entryId={r.id} tally={tally[r.id] ?? {}} onReact={onReact} />}
            </div>
          ))}
        </div>
      )}

      {/* reply form */}
      <AnimatePresence initial={false}>
        {showReply && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden"
          >
            <div className="mt-4 border-t border-white/10 pt-4">
              <ReplyForm
                parentId={entry.id}
                defaultName={defaultName}
                nameLocked={nameLocked}
                teamHandle={teamHandle}
                onPosted={(e) => {
                  onReplyPosted(e);
                  setShowReply(false);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── page ── */

export default function GuestbookPage() {
  const reduced = useReducedMotion();
  const [entries, setEntries] = useState<GuestEntry[]>([]);
  const [tally, setTally] = useState<ReactionTally>({});
  const [reactionsReady, setReactionsReady] = useState(false);
  const [v2Ready, setV2Ready] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [signed, setSigned] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [sort, setSort] = useState<"new" | "hyped">("new");
  const [teamHandle, setTeamHandle] = useState<string | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  const teamName = teamHandle ? getPlayer(teamHandle)?.name ?? teamHandle : null;
  const nameLocked = Boolean(teamName);
  const effectiveName = teamName ?? name;

  const loadAll = useCallback(async () => {
    if (!supabaseEnabled) return;
    const sb = getBrowserSupabase();
    // v2 select; falls back to v1 columns if migration hasn't run yet
    let rows: GuestEntry[] | null = null;
    const v2 = await sb
      .from("guestbook")
      .select("id,name,message,created_at,parent_id,is_team,author_handle")
      .order("created_at", { ascending: false })
      .limit(200);
    if (!v2.error && v2.data) {
      rows = v2.data as GuestEntry[];
      setV2Ready(true);
    } else {
      const v1 = await sb
        .from("guestbook")
        .select("id,name,message,created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (!v1.error && v1.data) {
        rows = (v1.data as Omit<GuestEntry, "parent_id" | "is_team" | "author_handle">[]).map((r) => ({
          ...r,
          parent_id: null,
          is_team: false,
          author_handle: null,
        }));
      }
    }
    if (rows) setEntries(rows);

    const re = await sb.from("guestbook_reactions").select("entry_id,emoji");
    if (!re.error && re.data) {
      const t: ReactionTally = {};
      for (const row of re.data as { entry_id: string; emoji: string }[]) {
        t[row.entry_id] = t[row.entry_id] ?? {};
        t[row.entry_id][row.emoji] = (t[row.entry_id][row.emoji] ?? 0) + 1;
      }
      setTally(t);
      setReactionsReady(true);
    }
  }, []);

  useEffect(() => {
    setSigned(sessionStorage.getItem("dscb-signed") === "1");
    setName(localStorage.getItem("dscb-guest-name") ?? "");
    loadAll().finally(() => setLoading(false));

    if (supabaseEnabled) {
      const sb = getBrowserSupabase();
      sb.auth.getSession().then(({ data }) => {
        const email = data.session?.user?.email?.toLowerCase();
        if (email && EMAIL_TO_HANDLE[email]) setTeamHandle(EMAIL_TO_HANDLE[email]);
      });
    }
  }, [loadAll]);

  const { topLevel, repliesByParent } = useMemo(() => {
    const top = entries.filter((e) => !e.parent_id);
    const map: Record<string, GuestEntry[]> = {};
    for (const e of entries) {
      if (e.parent_id) {
        map[e.parent_id] = map[e.parent_id] ?? [];
        map[e.parent_id].push(e);
      }
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => a.created_at.localeCompare(b.created_at));
    }
    if (sort === "hyped") {
      const hype = (id: string) => Object.values(tally[id] ?? {}).reduce((s, n) => s + n, 0);
      top.sort((a, b) => hype(b.id) - hype(a.id) || b.created_at.localeCompare(a.created_at));
    }
    return { topLevel: top, repliesByParent: map };
  }, [entries, sort, tally]);

  function markNew(id: string) {
    setNewIds((prev) => new Set(prev).add(id));
  }

  async function handleReact(entryId: string, emoji: string) {
    if (localStorage.getItem(reactedKey(entryId, emoji)) === "1") return;
    localStorage.setItem(reactedKey(entryId, emoji), "1");
    // optimistic bump
    setTally((prev) => ({
      ...prev,
      [entryId]: { ...(prev[entryId] ?? {}), [emoji]: ((prev[entryId] ?? {})[emoji] ?? 0) + 1 },
    }));
    const sb = getBrowserSupabase();
    await sb.from("guestbook_reactions").insert({ entry_id: entryId, emoji });
  }

  function handleReplyPosted(reply: GuestEntry) {
    markNew(reply.id);
    setEntries((prev) => [reply, ...prev]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseEnabled) return;
    if (!effectiveName.trim() || !message.trim()) {
      setStatus({ kind: "err", msg: "Name and message are both required." });
      return;
    }
    setBusy(true);
    setStatus(null);
    const sb = getBrowserSupabase();
    const { data, error } = await sb
      .from("guestbook")
      .insert({
        name: effectiveName.trim().slice(0, MAX_NAME),
        message: message.trim().slice(0, MAX_MSG),
        ...(teamHandle ? { is_team: true, author_handle: teamHandle } : {}),
      })
      .select("id,name,message,created_at,parent_id,is_team,author_handle")
      .single();
    setBusy(false);
    if (error || !data) {
      setStatus({ kind: "err", msg: "Couldn't post your message — try again." });
    } else {
      sessionStorage.setItem("dscb-signed", "1");
      if (!nameLocked) localStorage.setItem("dscb-guest-name", effectiveName.trim());
      setSigned(true);
      setMessage("");
      setStatus({ kind: "ok", msg: "Message posted! Thanks for signing." });
      markNew((data as GuestEntry).id);
      setEntries((prev) => [data as GuestEntry, ...prev]);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Guestbook"
        subtitle="Leave a message, react, and reply — no login needed. Team members post with a verified badge."
      />

      <div className="mx-auto max-w-4xl px-6 py-12 space-y-14">

        {/* ── Form ── */}
        {!supabaseEnabled ? (
          <p className="text-sm text-fog-500">Guestbook not connected yet — check back soon.</p>
        ) : signed ? (
          <div
            className="clip-corner relative border border-white/10 bg-ink-850 p-6"
            style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.4)" }}
          >
            <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />
            <p className="relative flex items-center gap-2 text-sm font-semibold text-brand-300">
              <Star className="h-3 w-3" />
              You&apos;ve signed the guestbook this session — but you can still react and reply below!
            </p>
          </div>
        ) : (
          <Reveal>
            <div
              className="clip-corner relative border border-white/10 bg-ink-850 p-6 sm:p-8"
              style={{ boxShadow: "6px 6px 0 rgba(0,0,0,0.5)" }}
            >
              <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />
              <h2 className="text-persona relative text-xl text-fog-100">Sign the book</h2>
              {teamName && (
                <p className="relative mt-1 flex items-center gap-2 text-xs text-fog-500">
                  Posting as <span className="font-semibold" style={{ color: "var(--color-brand-300)" }}>{teamName}</span> <TeamBadge />
                </p>
              )}
              <form onSubmit={handleSubmit} className="relative mt-5 space-y-4">
                <input
                  className={inputCls}
                  placeholder="Your name (max 40 chars)"
                  maxLength={MAX_NAME}
                  value={effectiveName}
                  onChange={(e) => setName(e.target.value)}
                  disabled={busy || nameLocked}
                />
                <div className="relative">
                  <textarea
                    className={inputCls + " min-h-28 resize-none"}
                    placeholder="Leave a message… (max 280 chars)"
                    maxLength={MAX_MSG}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={busy}
                  />
                  <span className="absolute bottom-2 right-3 text-[11px] text-fog-600 tabular-nums">
                    {message.length}/{MAX_MSG}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={busy || !effectiveName.trim() || !message.trim()}
                  className="p-hover-flicker w-full -skew-x-12 bg-brand-500 py-2.5 transition-transform hover:-translate-y-0.5 disabled:opacity-40"
                  style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.5)" }}
                >
                  <span className="block skew-x-12 font-display text-sm font-extrabold uppercase italic tracking-wide text-white">
                    {busy ? "Signing…" : "Sign the Book"}
                  </span>
                </button>
                {status && (
                  <p className={`text-sm ${status.kind === "err" ? "text-cyber-400" : "text-brand-300"}`}>
                    {status.msg}
                  </p>
                )}
              </form>
            </div>
          </Reveal>
        )}

        {/* ── Entry list ── */}
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-persona text-xl text-fog-100">Messages</h2>
            {reactionsReady && (
              <div className="flex gap-1.5 text-xs">
                {([["new", "Newest"], ["hyped", "Most Hyped"]] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSort(key)}
                    className="-skew-x-12 border px-3 py-1 font-bold uppercase tracking-wide transition-colors"
                    style={{
                      background: sort === key
                        ? "color-mix(in oklab, var(--color-brand-500) 22%, transparent)"
                        : "rgba(255,255,255,0.03)",
                      borderColor: sort === key
                        ? "color-mix(in oklab, var(--color-brand-500) 50%, transparent)"
                        : "rgba(255,255,255,0.10)",
                      color: sort === key ? "var(--color-brand-300)" : "var(--color-fog-500)",
                    }}
                  >
                    <span className="block skew-x-12">{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <p className="text-sm text-fog-600">Loading…</p>
          ) : topLevel.length === 0 ? (
            <p className="text-sm text-fog-500">No messages yet — be the first to sign!</p>
          ) : (
            <motion.div layout={!reduced} className="space-y-4">
              <AnimatePresence initial={false}>
                {topLevel.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    replies={repliesByParent[entry.id] ?? []}
                    tally={tally}
                    onReact={handleReact}
                    defaultName={effectiveName}
                    nameLocked={nameLocked}
                    teamHandle={teamHandle}
                    onReplyPosted={handleReplyPosted}
                    isNew={newIds.has(entry.id)}
                    showReactions={reactionsReady}
                    canReply={v2Ready}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
