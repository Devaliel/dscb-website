"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";
import { getAllDecks } from "@/lib/data";

/**
 * Team blog editor — New Post form + Published Posts list.
 * Lifted from the old /admin page; lives in the War Room's Blog tab now.
 * Assumes an authenticated session with a mapped author handle.
 */

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

/* ── editor + published list ── */

export default function BlogEditor({ authorHandle }: { authorHandle: string }) {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const loadPosts = useCallback(async () => {
    const sb = getBrowserSupabase();
    const { data, error } = await sb
      .from("posts")
      .select("id,slug,title,excerpt,tag,cover,author_handle,body,created_at")
      .order("created_at", { ascending: false });
    if (!error && data) setPosts(data as unknown as PostRow[]);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  async function publish(e: React.FormEvent) {
    e.preventDefault();
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

  const slugPreview = draft.id ? draft.slug : slugify(draft.title);

  return (
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
  );
}
