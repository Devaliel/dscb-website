"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Star from "@/components/persona/star";
import { getBrowserSupabase, supabaseEnabled } from "@/lib/supabase";
import { EMAIL_TO_HANDLE } from "@/lib/blog-db";
import { getPlayer } from "@/lib/data";

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

const emptyDraft = { id: "", title: "", slug: "", tag: "Team News", cover: "/deck-art/kewl-tune.jpg", excerpt: "", bodyText: "" };

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [slugTouched, setSlugTouched] = useState(false);

  const authorHandle = useMemo(() => {
    const e = session?.user?.email?.toLowerCase();
    return e ? EMAIL_TO_HANDLE[e] : undefined;
  }, [session]);
  const authorName = authorHandle ? getPlayer(authorHandle)?.name ?? authorHandle : undefined;

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
      slug: draft.slug || slugify(draft.title),
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim(),
      tag: draft.tag,
      cover: draft.cover.trim() || "/deck-art/kewl-tune.jpg",
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
      setSlugTouched(false);
      loadPosts();
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this post permanently?")) return;
    const sb = getBrowserSupabase();
    const { error } = await sb.from("posts").delete().eq("id", id);
    if (error) setStatus({ kind: "err", msg: error.message });
    else {
      if (draft.id === id) { setDraft(emptyDraft); setSlugTouched(false); }
      loadPosts();
    }
  }

  function edit(p: PostRow) {
    setDraft({ id: p.id, title: p.title, slug: p.slug, tag: p.tag, cover: p.cover, excerpt: p.excerpt, bodyText: bodyToText(p.body) });
    setSlugTouched(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const inputCls =
    "w-full border border-white/15 bg-ink-900 px-3.5 py-2.5 text-sm text-fog-100 outline-none transition-colors placeholder:text-fog-600 focus:border-brand-400";

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

  return (
    <Shell>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-fog-500">
          Signed in as <span className="text-fog-100">{session.user.email}</span>
          {authorName && <> — posting as <span className="font-semibold" style={{ color: "var(--color-brand-300)" }}>{authorName}</span></>}
        </p>
        <button
          onClick={() => getBrowserSupabase().auth.signOut()}
          className="-skew-x-12 border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-fog-300 hover:bg-white/10"
        >
          <span className="block skew-x-12">Log out</span>
        </button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        {/* editor */}
        <div className="clip-corner relative border border-white/10 bg-ink-850 p-6" style={{ boxShadow: "6px 6px 0 rgba(0,0,0,0.5)" }}>
          <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />
          <h2 className="text-persona relative text-xl text-fog-100">{draft.id ? "Edit post" : "New post"}</h2>
          <form onSubmit={publish} className="relative mt-5 space-y-4">
            <input
              className={inputCls}
              placeholder="Title"
              value={draft.title}
              onChange={(e) => {
                const title = e.target.value;
                setDraft((d) => ({ ...d, title, slug: slugTouched ? d.slug : slugify(title) }));
              }}
            />
            <div className="flex gap-3">
              <input
                className={inputCls}
                placeholder="slug-url"
                value={draft.slug}
                onChange={(e) => { setSlugTouched(true); setDraft((d) => ({ ...d, slug: slugify(e.target.value) })); }}
              />
              <select className={inputCls + " w-44"} value={draft.tag} onChange={(e) => setDraft((d) => ({ ...d, tag: e.target.value }))}>
                {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <input
              className={inputCls}
              placeholder="Cover image URL (or /deck-art/kewl-tune.jpg)"
              value={draft.cover}
              onChange={(e) => setDraft((d) => ({ ...d, cover: e.target.value }))}
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
                  onClick={() => { setDraft(emptyDraft); setSlugTouched(false); }}
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
        <div>
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
