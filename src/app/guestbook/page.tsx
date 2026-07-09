"use client";

import { useEffect, useRef, useState } from "react";
import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import Star from "@/components/persona/star";
import { getBrowserSupabase, supabaseEnabled } from "@/lib/supabase";

interface GuestEntry {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

const MAX_NAME = 40;
const MAX_MSG = 280;

const inputCls =
  "w-full border border-white/15 bg-ink-900 px-3.5 py-2.5 text-sm text-fog-100 outline-none transition-colors placeholder:text-fog-600 focus:border-brand-400";

export default function GuestbookPage() {
  const [entries, setEntries] = useState<GuestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [signed, setSigned] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  async function loadEntries() {
    if (!supabaseEnabled) return;
    const sb = getBrowserSupabase();
    const { data } = await sb
      .from("guestbook")
      .select("id,name,message,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setEntries(data as GuestEntry[]);
  }

  useEffect(() => {
    const alreadySigned = sessionStorage.getItem("dscb-signed") === "1";
    setSigned(alreadySigned);
    loadEntries().finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseEnabled) return;
    if (!name.trim() || !message.trim()) {
      setStatus({ kind: "err", msg: "Name and message are both required." });
      return;
    }
    setBusy(true);
    setStatus(null);
    const sb = getBrowserSupabase();
    const { error } = await sb.from("guestbook").insert({
      name: name.trim().slice(0, MAX_NAME),
      message: message.trim().slice(0, MAX_MSG),
    });
    setBusy(false);
    if (error) {
      setStatus({ kind: "err", msg: "Couldn't post your message — try again." });
    } else {
      sessionStorage.setItem("dscb-signed", "1");
      setSigned(true);
      setName("");
      setMessage("");
      setStatus({ kind: "ok", msg: "Message posted! Thanks for signing." });
      await loadEntries();
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Guestbook"
        subtitle="Leave a message for the squad. No login needed — just your name and a shoutout."
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
              You&apos;ve already signed the guestbook this session. Come back later!
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
              <form onSubmit={handleSubmit} className="relative mt-5 space-y-4">
                <input
                  className={inputCls}
                  placeholder="Your name (max 40 chars)"
                  maxLength={MAX_NAME}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={busy}
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
                  disabled={busy || !name.trim() || !message.trim()}
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
        <div ref={listRef}>
          <h2 className="text-persona mb-6 text-xl text-fog-100">Messages</h2>
          {loading ? (
            <p className="text-sm text-fog-600">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-fog-500">No messages yet — be the first to sign!</p>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, i) => (
                <Reveal key={entry.id} delay={i * 0.04}>
                  <div
                    className="clip-corner relative border border-white/10 bg-ink-850 px-5 py-4"
                    style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.35)" }}
                  >
                    <div className="halftone pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden />
                    <div className="relative flex items-baseline justify-between gap-3">
                      <p
                        className="font-display text-sm font-bold italic uppercase tracking-wide"
                        style={{ color: "var(--color-brand-300)" }}
                      >
                        {entry.name}
                      </p>
                      <time className="shrink-0 text-[11px] text-fog-600">
                        {new Date(entry.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </time>
                    </div>
                    <p className="relative mt-1.5 text-sm leading-relaxed text-fog-300">{entry.message}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
