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

/* jagged diagonal seam — identical interior vertices so the two panels tile with no gap */
const SEAM_LEFT = "polygon(0 0, 56% 0, 50% 25%, 58% 50%, 48% 75%, 54% 100%, 0 100%)";
const SEAM_RIGHT = "polygon(100% 0, 56% 0, 50% 25%, 58% 50%, 48% 75%, 54% 100%, 100% 100%)";

/** One countdown digit slot with a scoreboard tick-flip on change. */
function DigitFlip({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="relative grid h-16 w-14 -skew-x-12 place-items-center overflow-hidden bg-ink-950/70 sm:h-20 sm:w-16"
        style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.45)" }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="absolute block skew-x-12 font-display text-3xl font-extrabold italic tabular-nums text-fog-100 sm:text-5xl"
          >
            {String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="mt-2 text-[11px] font-bold uppercase tracking-widest text-fog-600 sm:text-xs">{label}</span>
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
    <section className="relative flex min-h-[100dvh] flex-col overflow-hidden px-6 pb-16 pt-28 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-brand-500/20 blur-[110px]" />
        <div className="absolute right-1/4 top-24 h-72 w-72 rounded-full bg-cyber-500/20 blur-[110px]" />
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 inline-flex -skew-x-12 items-center gap-2 self-center bg-cyber-500 px-3 py-1.5"
        >
          <span className="flex skew-x-12 items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
            <Star className="h-2.5 w-2.5" /> {cd.past ? "Live now" : "Next match"}
          </span>
        </motion.div>

        {/* desktop: split fight-card panels */}
        <div className="relative mx-auto hidden aspect-[21/9] w-full max-w-4xl sm:block">
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: SEAM_LEFT }}
          >
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, var(--color-ink-800), var(--color-brand-500) 160%)" }} />
            {art[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={art[0]} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay" />
            )}
            <div className="halftone absolute inset-0 opacity-[0.05]" aria-hidden />
            <div className="relative flex h-full flex-col items-start justify-end p-6 sm:p-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/celebeast-logo.png" alt="" className="mb-3 h-10 w-10 rounded-lg object-contain sm:h-14 sm:w-14" />
              <p className="text-persona text-2xl text-white sm:text-4xl">DS Celebeast</p>
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: SEAM_RIGHT }}
          >
            <div className="absolute inset-0" style={{ background: "linear-gradient(225deg, var(--color-ink-800), var(--color-cyber-500) 160%)" }} />
            {art[1] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={art[1]} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay" />
            )}
            <div className="halftone absolute inset-0 opacity-[0.05]" aria-hidden />
            <div className="relative flex h-full flex-col items-end justify-end p-6 text-right sm:p-8">
              <span className="mb-2 font-display text-6xl font-black italic text-white/25 sm:text-8xl" aria-hidden>
                {label.charAt(0)}
              </span>
              <p className="text-persona text-2xl text-white sm:text-4xl">{label}</p>
            </div>
          </motion.div>

          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <motion.span
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
              className="grid h-16 w-16 -skew-x-12 place-items-center bg-ink-950"
              style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.6), 0 0 0 2px var(--color-gold-500)" }}
            >
              <span className="block skew-x-12 text-persona text-lg text-gold-500">VS</span>
            </motion.span>
          </div>
        </div>

        {/* mobile: stacked cards, no split — the diagonal seam doesn't read well this narrow */}
        <div className="mx-auto flex w-full max-w-xs flex-col items-stretch gap-2 sm:hidden">
          <div className="clip-corner relative flex items-center gap-3 overflow-hidden border border-white/10 bg-ink-850 p-4" style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.4)" }}>
            {art[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={art[0]} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-overlay" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/celebeast-logo.png" alt="" className="relative h-9 w-9 shrink-0 rounded-lg object-contain" />
            <p className="text-persona relative truncate text-lg text-fog-100">DS Celebeast</p>
          </div>
          <span className="mx-auto text-persona text-sm text-fog-600">vs</span>
          <div className="clip-corner relative flex items-center gap-3 overflow-hidden border border-white/10 bg-ink-850 p-4" style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.4)" }}>
            {art[1] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={art[1]} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-overlay" />
            )}
            <div
              className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg font-display text-base font-bold text-cyber-400"
              style={{ background: "color-mix(in oklab, var(--color-cyber-500) 25%, transparent)" }}
              aria-hidden
            >
              {label.charAt(0)}
            </div>
            <p className="text-persona relative truncate text-lg text-fog-100">{label}</p>
          </div>
        </div>

        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-10 flex items-start gap-3 sm:mt-14 sm:gap-5"
        >
          <DigitFlip value={cd.d} label="Days" />
          <DigitFlip value={cd.h} label="Hrs" />
          <DigitFlip value={cd.m} label="Min" />
          <DigitFlip value={cd.s} label="Sec" />
        </motion.div>

        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.42 }}
          className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-3 text-center"
        >
          {match.tournament_name && (
            <span className="-skew-x-12 border border-white/15 bg-white/5 px-3 py-1.5">
              <span className="block skew-x-12 text-[11px] font-bold uppercase tracking-wide text-fog-300">{match.tournament_name}</span>
            </span>
          )}
          <span className="text-sm text-fog-500">{when}</span>
        </motion.div>

        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.52 }}
          className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-3"
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
