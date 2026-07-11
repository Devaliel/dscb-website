"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Star from "@/components/persona/star";
import { fetchNextMatch, type MatchRow } from "@/lib/warroom";
import { getAllDecks } from "@/lib/data";

/** Deterministic 2 distinct deck-art images from a match id — stable per match, no flicker. */
function pickArt(seed: string): string[] {
  const pool = getAllDecks()
    .map((d) => d.image)
    .filter((img): img is string => Boolean(img));
  if (pool.length < 2) return pool;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const a = Math.abs(h) % pool.length;
  let b = Math.abs(Math.imul(h ^ 0x9e3779b9, 2654435761)) % pool.length;
  if (b === a) b = (b + 1) % pool.length;
  return [pool[a], pool[b]];
}

/**
 * Public "Next Match" teaser — opponent + a live countdown. NEVER shows decks or lineup.
 * Renders nothing until an upcoming (status "open", future) match exists.
 */
function useCountdown(target: string): { d: number; h: number; m: number; s: number; past: boolean } {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  const past = new Date(target).getTime() - now <= 0;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, past };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="grid min-w-[2.6rem] -skew-x-12 place-items-center bg-ink-950/70 px-2 py-1.5 font-display text-2xl font-extrabold italic tabular-nums text-fog-100 sm:text-3xl"
        style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.4)" }}
      >
        <span className="block skew-x-12">{String(value).padStart(2, "0")}</span>
      </span>
      <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-fog-600">{label}</span>
    </div>
  );
}

/** One angled, darkened deck-art accent. Hides itself if the image fails to load. */
function ArtAccent({ src, className, style }: { src: string; className?: string; style?: React.CSSProperties }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden
      onError={() => setOk(false)}
      className={`pointer-events-none absolute select-none object-cover ${className ?? ""}`}
      style={style}
    />
  );
}

export default function NextMatch() {
  const [match, setMatch] = useState<MatchRow | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    let alive = true;
    fetchNextMatch().then((m) => alive && setMatch(m));
    return () => {
      alive = false;
    };
  }, []);

  const cd = useCountdown(match?.scheduled_at ?? new Date().toISOString());
  const art = useMemo(() => (match ? pickArt(match.id) : []), [match]);
  if (!match) return null;

  const label = match.public_label || match.opponent_team;
  const when = new Date(match.scheduled_at).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="mx-auto max-w-6xl px-6 pt-8">
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20, skewY: 1 }}
        animate={{ opacity: 1, y: 0, skewY: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="clip-corner relative overflow-hidden border border-white/10 bg-ink-850"
        style={{ boxShadow: "6px 6px 0 rgba(0,0,0,0.45)" }}
      >
        {/* decorative deck-art accents (right side, behind content) */}
        {art[0] && (
          <ArtAccent
            src={art[0]}
            className="right-40 top-0 hidden h-full w-48 sm:block"
            style={{
              clipPath: "polygon(22% 0, 100% 0, 100% 100%, 0 100%)",
              opacity: 0.22,
              filter: "saturate(1.15)",
              maskImage: "linear-gradient(90deg, transparent, #000 70%)",
              WebkitMaskImage: "linear-gradient(90deg, transparent, #000 70%)",
            }}
          />
        )}
        {art[1] && (
          <ArtAccent
            src={art[1]}
            className="-right-6 top-0 hidden h-full w-52 sm:block"
            style={{
              clipPath: "polygon(28% 0, 100% 0, 100% 100%, 0 100%)",
              opacity: 0.28,
              filter: "saturate(1.15)",
              maskImage: "linear-gradient(90deg, transparent, #000 55%)",
              WebkitMaskImage: "linear-gradient(90deg, transparent, #000 55%)",
            }}
          />
        )}
        <div className="halftone pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden />
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-[80px]"
          style={{ background: "color-mix(in oklab, var(--color-cyber-500) 30%, transparent)" }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 -skew-x-12 bg-cyber-500 px-2.5 py-1">
              <span className="flex skew-x-12 items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                <Star className="h-2.5 w-2.5" /> {cd.past ? "Live now" : "Next match"}
              </span>
            </span>
            <h2 className="text-persona mt-3 text-3xl text-fog-100 sm:text-4xl">
              DS Celebeast <span className="text-fog-600">vs</span>{" "}
              <span style={{ color: "var(--color-cyber-400)" }}>{label}</span>
            </h2>
            <p className="mt-1.5 text-sm text-fog-500">
              {match.tournament_name ? `${match.tournament_name} · ` : ""}
              {when}
            </p>
          </div>

          <div className="flex shrink-0 items-start gap-2.5 sm:gap-3">
            <Unit value={cd.d} label="Days" />
            <Unit value={cd.h} label="Hrs" />
            <Unit value={cd.m} label="Min" />
            <Unit value={cd.s} label="Sec" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
