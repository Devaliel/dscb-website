"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Star from "@/components/persona/star";
import Magnetic from "@/components/magnetic";
import PButton from "@/components/persona/p-button";
import { TransitionLink } from "@/components/persona/transition-provider";
import { useCountdown } from "@/components/next-match";
import { getAllDecks } from "@/lib/data";
import type { MatchRow } from "@/lib/warroom";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Two distinct random deck-art images from the library — re-rolled fresh each visit. */
function pickRandomArt(): string[] {
  const pool = getAllDecks()
    .map((d) => d.image)
    .filter((img): img is string => Boolean(img));
  if (pool.length < 2) return pool;
  const a = Math.floor(Math.random() * pool.length);
  let b = Math.floor(Math.random() * pool.length);
  if (b === a) b = (b + 1) % pool.length;
  return [pool[a], pool[b]];
}

/** Full-bleed deck art behind a team panel. Hides itself if the file fails to load. */
function PanelArt({ src, tint }: { src: string; tint: string }) {
  const [ok, setOk] = useState(true);
  return (
    <>
      {ok && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          aria-hidden
          onError={() => setOk(false)}
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-center"
          style={{ filter: "brightness(0.95) saturate(1.05)" }}
        />
      )}
      {/* team-colour wash — legibility that never depends on the image's own luminance */}
      <div className="absolute inset-0" style={{ background: tint }} aria-hidden />
      <div className="halftone absolute inset-0 opacity-[0.06]" aria-hidden />
    </>
  );
}

/** One countdown digit slot with a scoreboard tick-flip on change. */
function DigitFlip({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="relative grid h-14 w-12 -skew-x-12 place-items-center overflow-hidden bg-ink-950/80 sm:h-20 sm:w-16"
        style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.5)" }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="absolute block skew-x-12 font-display text-2xl font-extrabold italic tabular-nums text-fog-100 sm:text-5xl"
          >
            {String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-fog-500 sm:text-xs">{label}</span>
    </div>
  );
}

export default function NextMatchHype({ match }: { match: MatchRow }) {
  const reduce = useReducedMotion();
  const cd = useCountdown(match.scheduled_at);
  // empty on first render (server + pre-hydration client agree), randomized client-side
  // right after mount — Math.random() in the initial render would desync SSR vs. hydration.
  const [art, setArt] = useState<string[]>([]);
  useEffect(() => {
    setArt(pickRandomArt());
  }, []);
  const [copied, setCopied] = useState(false);

  const label = match.public_label || match.opponent_team;
  const when = new Date(match.scheduled_at).toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  async function share() {
    const url = window.location.href;
    const shareData = { title: `DS Celebeast vs ${label}`, text: "Countdown to our next match — DS Celebeast", url };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled — no-op */
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden bg-ink-950">
      {/* ── the two art panels — stacked in portrait, side-by-side in landscape.
             Plain flex-1 boxes flush against each other: flexbox guarantees zero gap
             at any viewport width (an earlier clip-path + fixed-px-overlap version left
             a widening gap on wider screens since the clip was percentage-based but the
             overlap wasn't). Each panel ends up ~near-square, so the 1:1 deck art barely
             crops. The "seam" look now comes from a thin accent bar drawn on top, not
             from the art itself interlocking. ── */}
      <div className="absolute inset-0 flex flex-col landscape:flex-row">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative flex-1 overflow-hidden"
        >
          {art[0] && <PanelArt src={art[0]} tint="linear-gradient(160deg, color-mix(in oklab, var(--color-brand-500) 30%, transparent), color-mix(in oklab, var(--color-ink-950) 55%, transparent))" />}
        </motion.div>
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.08 }}
          className="relative flex-1 overflow-hidden"
        >
          {art[1] && <PanelArt src={art[1]} tint="linear-gradient(200deg, color-mix(in oklab, var(--color-cyber-500) 30%, transparent), color-mix(in oklab, var(--color-ink-950) 55%, transparent))" />}
        </motion.div>
      </div>

      {/* seam accent — horizontal bar in portrait (panels stacked), vertical in landscape */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.25, ease: EASE }}
        className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-1 -translate-y-1/2 landscape:hidden"
        style={{ background: "linear-gradient(90deg, var(--color-brand-400), var(--color-gold-500), var(--color-cyber-400))", boxShadow: "0 0 20px rgba(0,0,0,0.6)" }}
        aria-hidden
      />
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 0.5, delay: 0.25, ease: EASE }}
        className="pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-1 -translate-x-1/2 landscape:block"
        style={{ background: "linear-gradient(180deg, var(--color-brand-400), var(--color-gold-500), var(--color-cyber-400))", boxShadow: "0 0 20px rgba(0,0,0,0.6)" }}
        aria-hidden
      />

      {/* ── readability scrims: darken top + bottom so overlaid text always pops ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(6,4,16,0.75) 0%, transparent 22%, transparent 48%, rgba(6,4,16,0.92) 100%)" }}
        aria-hidden
      />

      {/* ── team name plates (poster-style, over the art) ── */}
      <div className="pointer-events-none absolute inset-0 flex flex-col landscape:flex-row">
        <div className="flex flex-1 items-start justify-center p-6 pt-16 sm:pt-20 landscape:items-center landscape:justify-start landscape:pl-10 landscape:pt-6">
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex items-center gap-3 text-center landscape:flex-col landscape:items-start landscape:text-left"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/celebeast-logo.png" alt="" className="h-11 w-11 shrink-0 rounded-lg object-contain sm:h-14 sm:w-14" />
            <p className="text-persona text-2xl leading-none text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] sm:text-4xl">DS Celebeast</p>
          </motion.div>
        </div>
        {/* portrait: hug the top of the lower panel (under VS, clear of the countdown);
            landscape: centered on the right */}
        <div className="flex flex-1 items-start justify-center p-6 pt-14 landscape:items-center landscape:justify-end landscape:pt-6 landscape:pr-10">
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="text-center landscape:text-right"
          >
            <p className="text-persona text-2xl leading-none text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] sm:text-4xl">{label}</p>
          </motion.div>
        </div>
      </div>

      {/* ── VS badge on the seam ── */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <motion.span
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className="grid h-16 w-16 -skew-x-12 place-items-center bg-ink-950 sm:h-20 sm:w-20"
          style={{ boxShadow: "5px 5px 0 rgba(0,0,0,0.6), 0 0 0 2px var(--color-gold-500)" }}
        >
          <span className="block skew-x-12 text-persona text-xl text-gold-500 sm:text-2xl">VS</span>
        </motion.span>
      </div>

      {/* ── top bar: brand mark + way out (no nav on this page) ── */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-8">
        <motion.span
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex -skew-x-12 items-center gap-1.5 bg-cyber-500 px-3 py-1"
        >
          <span className="flex skew-x-12 items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white">
            <Star className="h-2.5 w-2.5" /> {cd.past ? "Live now" : "Next match"}
          </span>
        </motion.span>
        <TransitionLink
          href="/"
          className="text-xs font-bold uppercase tracking-wide text-fog-400 transition-colors hover:text-fog-100"
        >
          ✕ Back to site
        </TransitionLink>
      </div>

      {/* ── bottom overlay: countdown + meta + share ── */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-4 px-6 pb-8 sm:pb-10">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-start gap-2.5 sm:gap-4"
        >
          <DigitFlip value={cd.d} label="Days" />
          <DigitFlip value={cd.h} label="Hrs" />
          <DigitFlip value={cd.m} label="Min" />
          <DigitFlip value={cd.s} label="Sec" />
        </motion.div>

        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.42 }}
          className="flex flex-wrap items-center justify-center gap-2.5 text-center"
        >
          {match.tournament_name && (
            <span className="-skew-x-12 border border-white/20 bg-white/10 px-3 py-1">
              <span className="block skew-x-12 text-[11px] font-bold uppercase tracking-wide text-fog-100">{match.tournament_name}</span>
            </span>
          )}
          <span className="text-sm text-fog-300">{when}</span>
        </motion.div>

        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.52 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Magnetic>
            <PButton onClick={share} accent="var(--color-cyber-500)">
              {copied ? "Copied!" : "Share"}
            </PButton>
          </Magnetic>
          <TransitionLink
            href="/decks"
            className="p-hover-flicker inline-block -skew-x-12 border-[1.5px] border-white/25 bg-white/5 px-7 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:bg-white/10"
            style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.45)" }}
          >
            <span className="block skew-x-12 font-display text-sm font-extrabold uppercase italic tracking-wide text-fog-100">View team decks</span>
          </TransitionLink>
        </motion.div>
      </div>
    </section>
  );
}
