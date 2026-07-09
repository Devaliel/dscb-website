"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Star from "@/components/persona/star";
import PlayerAvatar from "@/components/player-avatar";
import { getBrowserSupabase, supabaseEnabled } from "@/lib/supabase";
import { EMAIL_TO_HANDLE } from "@/lib/blog-db";
import { getPlayer, getDeck, getAllDecks } from "@/lib/data";
import { winRate } from "@/lib/utils";

const TAGS = ["Meta", "Tournament", "Team News", "Guide"] as const;

interface PostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  cover: string;
  author_handle: string;
  body: { type: "p" | "h2"; text: string }[];
  created_at: string;
}

/* body jsonb ↔ editor text: blank line = new paragraph, "## " prefix = heading */
function bodyToText(body: PostRow["body"]): string {
  return body.map((b) => (b.type === "h2" ? `## ${b.text}` : b.text)).join("\n\n");
}
function textToBody(text: string): PostRow["body"] {
  return text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) =>
      s.startsWith("## ") ? { type: "h2" as const, text: s.slice(3).trim() } : { type: "p" as const, text: s }
    );
}
function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "").slice(0, 60);
}

const DEFAULT_COVER = "/deck-art/kewl-tune.jpg";
const emptyDraft = { id: "", title: "", slug: "", tag: "Team News", cover: DEFAULT_COVER, excerpt: "", bodyText: "" };

const inputCls =
  "w-full border border-white/15 bg-ink-900 px-3.5 py-2.5 text-sm text-fog-100 outline-none transition-colors placeholder:text-fog-600 focus:border-brand-400";

/* ── cover picker: upload / deck-art gallery / URL fallback ── */

function CoverPicker({ value, onChange, disabled }: { value: string; onChange: (url: string) => void; disabled: boolean }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);
  const [broken, setBroken] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const gallery = useMemo(() => getAllDecks().filter((d) => d.image), []);

  useEffect(() => setBroken(false), [value]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr("That's not an image file.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setErr("Max 4MB — resize the image first.");
      return;
    }
    setUploading(true);
    setErr(null);
    const sb = getBrowserSupabase();
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    const path = `${Date.now()}-${safeName}`;
    const { error } = await sb.storage.from("blog-covers").upload(path, file);
    setUploading(false);
    if (error) {
      setErr("Upload failed — ask Darkzill if the blog-covers bucket is set up.");
      return;
    }
    onChange(sb.storage.from("blog-covers").getPublicUrl(path).data.publicUrl);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-fog-600">Cover image</p>

      <div className="flex items-start gap-4">
        {/* preview */}
        <div
          className="relative h-20 w-36 shrink-0 overflow-hidden border border-white/15 bg-ink-900"
          style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
        >
          {broken ? (
            <div className="grid h-full w-full place-items-center text-[10px] text-fog-600">no preview</div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" onError={() => setBroken(true)} />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={disabled || uploading}
            className="-skew-x-12 border border-brand-400/50 bg-brand-500/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-300 transition-colors hover:bg-brand-500/30 disabled:opacity-40"
          >
            <span className="block skew-x-12">{uploading ? "Uploading…" : "Upload image"}</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button
            type="button"
            onClick={() => setShowUrl((s) => !s)}
            className="block text-[11px] text-fog-600 underline decoration-white/20 underline-offset-2 hover:text-fog-300"
          >
            {showUrl ? "hide URL field" : "or paste an image URL instead"}
          </button>
          {showUrl && (
            <input
              className={inputCls}
              placeholder="https://… image URL"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
            />
          )}
          {err && <p className="text-xs text-cyber-400">{err}</p>}
        </div>
      </div>

      {/* deck-art gallery */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {gallery.map((d) => {
          const active = value === d.image;
          return (
            <button
              key={d.slug}
              type="button"
              onClick={() => onChange(d.image!)}
              disabled={disabled}
              className="relative h-12 w-20 shrink-0 overflow-hidden border transition-all"
              style={{
                borderColor: active ? "var(--color-brand-400)" : "rgba(255,255,255,0.12)",
                boxShadow: active ? "0 0 0 1px var(--color-brand-400)" : "none",
                opacity: active ? 1 : 0.65,
              }}
              title={d.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.image} alt={d.name} className="h-full w-full object-cover" loading="lazy" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── member identity card ── */

function MemberCard({ handle, email, onLogout }: { handle: string; email: string; onLogout: () => void }) {
  const player = getPlayer(handle);
  if (!player) return null;
  const deck = getDeck(player.mainDeckSlug);
  const accent = deck?.accent ?? "var(--color-brand-400)";
  const games = player.wins + player.losses;
  const wr = winRate(player.wins, player.losses);

  const linkCls =
    "-skew-x-12 border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wide text-fog-300 transition-colors hover:border-brand-400/60 hover:bg-brand-500/15 hover:text-brand-300 text-center";

  return (
    <div
      className="clip-corner relative mb-10 overflow-hidden border border-white/10 bg-ink-850 p-6"
      style={{ boxShadow: "6px 6px 0 rgba(0,0,0,0.5)" }}
    >
      <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full blur-[70px]"
        style={{ background: `color-mix(in oklab, ${accent} 30%, transparent)` }}
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* avatar */}
        <div className="h-28 w-28 shrink-0 self-center sm:self-auto">
          <PlayerAvatar player={player} accent={accent} size="card" className="h-28 w-28" />
        </div>

        {/* identity */}
        <div className="min-w-0 flex-1">
          <span
            className="inline-block -skew-x-12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
            style={{ background: `color-mix(in oklab, ${accent} 75%, black)` }}
          >
            <span className="block skew-x-12">{player.role}</span>
          </span>
          <h2 className="text-persona mt-1.5 text-3xl text-fog-100">{player.name}</h2>
          <p className="mt-0.5 text-sm text-fog-500">{player.tagline}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fog-500">
            <span>
              <span className="font-bold tabular-nums" style={{ color: accent }}>{player.wins}–{player.losses}</span>
              {" "}career{games > 0 && <> · <span className="tabular-nums">{wr}%</span> WR</>}
            </span>
            {player.gameId && <span>ID {player.gameId}</span>}
            <span className="truncate">{email}</span>
          </p>
        </div>

        {/* quick links */}
        <div className="grid shrink-0 grid-cols-1 gap-2 sm:w-44">
          <a href={`/players/${player.handle}`} className={linkCls}>
            <span className="block skew-x-12">My Player Page</span>
          </a>
          <a href={`/decks/${player.mainDeckSlug}`} className={linkCls}>
            <span className="block skew-x-12">{deck ? `My ${deck.name}` : "My Deck"}</span>
          </a>
          <a href="/guestbook" className={linkCls}>
            <span className="block skew-x-12">Guestbook ✦</span>
          </a>
          <button
            onClick={onLogout}
            className="-skew-x-12 border border-white/10 bg-transparent px-4 py-2 text-center text-xs font-bold uppercase tracking-wide text-fog-600 transition-colors hover:border-cyber-500/50 hover:text-cyber-400"
          >
            <span className="block skew-x-12">Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── page ── */

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [draft, setDraft] = useState(emptyDraft);

  const authorHandle = useMemo(() => {
    const e = session?.user?.email?.toLowerCase();
    return e ? EMAIL_TO_HANDLE[e] : undefined;
  }, [session]);

  const loadPosts = useCallback(async () => {
    const sb = getBrowserSupabase();
    const { data, error } = await sb
      .from("posts")
      .select("id,slug,title,excerpt,tag,cover,author_handle,body,created_at")
      .order("created_at", { ascending: false });
    if (!error && data) setPosts(data as unknown as PostRow[]);
  }, []);

  useEffect(() => {
    if (!supabaseEnabled) {
      setReady(true);
      return;
    }
    const sb = getBrowserSupabase();
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
      if (data.session) loadPosts();
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) loadPosts();
    });
    return () => sub.subscription.unsubscribe();
  }, [loadPosts]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    const sb = getBrowserSupabase();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setStatus({ kind: "err", msg: error.message });
  }

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!authorHandle) {
      setStatus({ kind: "err", msg: "Your email isn't mapped to a team member — ask Darkzill to add it." });
      return;
    }
    if (!draft.title.trim() || !draft.bodyText.trim()) {
      setStatus({ kind: "err", msg: "Title and body are required." });
      return;
    }
    setBusy(true);
    setStatus(null);
    const sb = getBrowserSupabase();
    const row = {
      // editing keeps the stored slug; new posts derive it from the title
      slug: draft.id ? draft.slug : slugify(draft.title),
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim(),
      tag: draft.tag,
      cover: draft.cover.trim() || DEFAULT_COVER,
      author_handle: authorHandle,
      body: textToBody(draft.bodyText),
      published: true,
    };
    const q = draft.id
      ? sb.from("posts").update(row).eq("id", draft.id)
      : sb.from("posts").insert(row);
    const { error } = await q;
    setBusy(false);
    if (error) {
      setStatus({ kind: "err", msg: error.message });
    } else {
      setStatus({ kind: "ok", msg: draft.id ? "Post updated." : "Post published! It appears on /blog within a minute." });
      setDraft(emptyDraft);
      loadPosts();
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this post permanently?")) return;
    const sb = getBrowserSupabase();
    const { error } = await sb.from("posts").delete().eq("id", id);
    if (error) setStatus({ kind: "err", msg: error.message });
    else {
      if (draft.id === id) setDraft(emptyDraft);
      loadPosts();
    }
  }

  function edit(p: PostRow) {
    setDraft({ id: p.id, title: p.title, slug: p.slug, tag: p.tag, cover: p.cover, excerpt: p.excerpt, bodyText: bodyToText(p.body) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!ready) return null;

  if (!supabaseEnabled) {
    return (
      <Shell>
        <p className="text-fog-500">Backend not configured — add the Supabase environment variables and redeploy.</p>
      </Shell>
    );
  }

  if (!session) {
    return (
      <Shell>
        <div className="clip-corner relative mx-auto max-w-sm border border-white/10 bg-ink-850 p-8" style={{ boxShadow: "6px 6px 0 rgba(0,0,0,0.5)" }}>
          <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />
          <h2 className="text-persona relative text-2xl text-fog-100">Team login</h2>
          <form onSubmit={signIn} className="relative mt-6 space-y-4">
            <input className={inputCls} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <input className={inputCls} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            <button
              type="submit"
              disabled={busy}
              className="p-hover-flicker w-full -skew-x-12 bg-brand-500 py-2.5 transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.5)" }}
            >
              <span className="block skew-x-12 font-display text-sm font-extrabold uppercase italic tracking-wide text-white">
                {busy ? "Signing in…" : "Sign in"}
              </span>
            </button>
          </form>
          {status && <p className={`relative mt-4 text-sm ${status.kind === "err" ? "text-cyber-400" : "text-brand-300"}`}>{status.msg}</p>}
        </div>
      </Shell>
    );
  }

  const slugPreview = draft.id ? draft.slug : slugify(draft.title);

  return (
    <Shell>
      {authorHandle ? (
        <MemberCard
          handle={authorHandle}
          email={session.user.email ?? ""}
          onLogout={() => getBrowserSupabase().auth.signOut()}
        />
      ) : (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-fog-500">
            Signed in as <span className="text-fog-100">{session.user.email}</span> — this email isn&apos;t mapped to a team member yet.
          </p>
          <button
            onClick={() => getBrowserSupabase().auth.signOut()}
            className="-skew-x-12 border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-fog-300 hover:bg-white/10"
          >
            <span className="block skew-x-12">Log out</span>
          </button>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        {/* editor */}
        <div className="clip-corner relative min-w-0 border border-white/10 bg-ink-850 p-6" style={{ boxShadow: "6px 6px 0 rgba(0,0,0,0.5)" }}>
          <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />
          <h2 className="text-persona relative text-xl text-fog-100">{draft.id ? "Edit post" : "New post"}</h2>
          <form onSubmit={publish} className="relative mt-5 space-y-4">
            <div>
              <input
                className={inputCls}
                placeholder="Title"
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              />
              {slugPreview && (
                <p className="mt-1 truncate text-[11px] text-fog-600">/blog/{slugPreview}</p>
              )}
            </div>
            <select className={inputCls} value={draft.tag} onChange={(e) => setDraft((d) => ({ ...d, tag: e.target.value }))}>
              {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            <CoverPicker
              value={draft.cover}
              onChange={(url) => setDraft((d) => ({ ...d, cover: url }))}
              disabled={busy}
            />

            <input
              className={inputCls}
              placeholder="Short excerpt (shown on the blog list)"
              value={draft.excerpt}
              onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
            />
            <textarea
              className={inputCls + " min-h-64 resize-y font-mono text-[13px] leading-relaxed"}
              placeholder={"Write your post…\n\nBlank line = new paragraph.\n\n## Lines starting like this become section headings"}
              value={draft.bodyText}
              onChange={(e) => setDraft((d) => ({ ...d, bodyText: e.target.value }))}
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={busy}
                className="p-hover-flicker -skew-x-12 bg-brand-500 px-7 py-2.5 transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.5)" }}
              >
                <span className="block skew-x-12 font-display text-sm font-extrabold uppercase italic tracking-wide text-white">
                  {busy ? "Saving…" : draft.id ? "Save changes" : "Publish"}
                </span>
              </button>
              {draft.id && (
                <button
                  type="button"
                  onClick={() => setDraft(emptyDraft)}
                  className="text-sm text-fog-500 hover:text-fog-100"
                >
                  Cancel edit
                </button>
              )}
            </div>
            {status && <p className={`text-sm ${status.kind === "err" ? "text-cyber-400" : "text-brand-300"}`}>{status.msg}</p>}
          </form>
        </div>

        {/* post list */}
        <div className="min-w-0">
          <h2 className="text-persona mb-4 text-xl text-fog-100">Published posts</h2>
          <div className="space-y-3">
            {posts.length === 0 && <p className="text-sm text-fog-500">No posts in the database yet.</p>}
            {posts.map((p) => (
              <div
                key={p.id}
                className="clip-corner relative border border-white/10 bg-ink-850 p-4"
                style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.4)" }}
              >
                <p className="text-persona text-base text-fog-100">{p.title}</p>
                <p className="mt-0.5 text-xs text-fog-500">
                  {p.tag} · {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · {p.author_handle}
                </p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => edit(p)} className="-skew-x-12 bg-brand-500/80 px-3 py-1 text-xs font-bold uppercase text-white hover:bg-brand-500">
                    <span className="block skew-x-12">Edit</span>
                  </button>
                  <button onClick={() => remove(p.id)} className="-skew-x-12 bg-cyber-500/70 px-3 py-1 text-xs font-bold uppercase text-white hover:bg-cyber-500">
                    <span className="block skew-x-12">Delete</span>
                  </button>
                  <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="ml-auto self-center text-xs text-fog-500 hover:text-fog-100">
                    View →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden px-6 pb-24 pt-36 sm:pt-44">
      <div className="pointer-events-none absolute inset-x-0 top-16 -z-10 mx-auto h-64 max-w-3xl rounded-full bg-brand-500/15 blur-[110px]" />
      <div className="mx-auto max-w-5xl">
        <span className="inline-block -skew-x-12 bg-brand-500 px-3 py-1">
          <span className="flex skew-x-12 items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
            <Star className="h-2.5 w-2.5" />
            Team only
          </span>
        </span>
        <h1 className="text-persona mt-4 -rotate-1 text-5xl text-fog-100 sm:text-6xl">Admin</h1>
        <div className="mt-3 h-2 w-36 -skew-x-12" style={{ background: "linear-gradient(90deg, var(--color-brand-500), var(--color-cyber-500) 70%, transparent)" }} />
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}
