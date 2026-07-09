"use client";

import { motion, useReducedMotion } from "motion/react";
import DeckChip from "./deck-chip";
import Star from "./persona/star";
import { getPlayer, getDeck } from "@/lib/data";
import type { WeekLineup } from "@/lib/types";

/**
 * Survival-relay (kachinuki) match visualization.
 * Reconstructs the winner-stays "baton chain" from the ordered single-game rounds:
 * consecutive games by the same DS player = one stint, ending when they lose and the
 * baton passes to the next duelist. Used only when the tournament has `relay: true`.
 */

type Game = { opponent: string; opponentDeck?: string; won: boolean };
type Stint = {
  handle: string;
  deckSlug?: string;
  deckName: string;
  games: Game[];
  wins: number;
  losses: number;
  sweep: boolean;
};

const WIN = "var(--color-brand-400)";
const LOSS = "var(--color-cyber-500)";

function buildStints(week: WeekLineup): Stint[] {
  const deckOf = (handle: string) =>
    week.deckList.find((d) => d.handle === handle);

  const stints: Stint[] = [];
  for (const r of week.rounds ?? []) {
    const won = r.dsWins > r.dsLosses;
    const game: Game = { opponent: r.opponent, opponentDeck: r.opponentDeck, won };
    const last = stints[stints.length - 1];
    if (last && last.handle === r.dsPlayerHandle) {
      last.games.push(game);
    } else {
      const d = deckOf(r.dsPlayerHandle);
      stints.push({
        handle: r.dsPlayerHandle,
        deckSlug: d?.deckSlug,
        deckName: d?.deckName ?? "Unknown",
        games: [game],
        wins: 0,
        losses: 0,
        sweep: false,
      });
    }
  }
  for (const s of stints) {
    s.wins = s.games.filter((g) => g.won).length;
    s.losses = s.games.length - s.wins;
    s.sweep = s.games.length >= 3 && s.losses === 0;
  }
  return stints;
}

export default function RelayMatch({ week, index }: { week: WeekLineup; index: number }) {
  const reduce = useReducedMotion();
  const stints = buildStints(week);
  const rounds = week.rounds ?? [];
  const dsScore = rounds.filter((r) => r.dsWins > r.dsLosses).length;
  const oppScore = rounds.length - dsScore;
  const won = week.matchResult === "win";

  const resultColor = won ? WIN : LOSS;
  const enter = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 24, skewY: 1.2 }, animate: { opacity: 1, y: 0, skewY: 0 } };

  return (
    <motion.div
      {...enter}
      whileInView={enter.animate}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="clip-corner relative overflow-hidden border border-white/10 bg-ink-850"
      style={{ boxShadow: "6px 6px 0 rgba(0,0,0,0.45)" }}
    >
      <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />

      {/* header */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
        <h3 className="text-persona text-lg text-fog-100">
          {week.week}
          {week.opponentTeam && (
            <span className="ml-3 text-sm font-medium normal-case not-italic text-fog-500">
              vs <span className="text-fog-300">{week.opponentTeam}</span>
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2.5">
          <span className="font-display text-lg font-extrabold italic tabular-nums text-fog-100">
            <span style={{ color: WIN }}>{dsScore}</span>
            <span className="mx-1 text-fog-600">–</span>
            <span style={{ color: LOSS }}>{oppScore}</span>
          </span>
          <span
            className="-skew-x-12 px-3 py-1 text-xs font-bold uppercase tracking-wide"
            style={{ background: `color-mix(in oklab, ${resultColor} 82%, black)`, color: "white", boxShadow: "3px 3px 0 rgba(0,0,0,0.4)" }}
          >
            <span className="block skew-x-12">{won ? "DS Win" : "Loss"}</span>
          </span>
        </div>
      </div>

      {/* momentum bar — every game in play order */}
      <div className="relative flex items-stretch gap-1 px-5 pt-4 sm:px-6">
        {rounds.map((r, i) => (
          <motion.span
            key={i}
            initial={reduce ? false : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, delay: reduce ? 0 : 0.2 + i * 0.03, ease: "easeOut" }}
            className="h-2 flex-1 -skew-x-12 origin-bottom rounded-[1px]"
            style={{ background: r.dsWins > r.dsLosses ? WIN : LOSS }}
            title={`Game ${i + 1}: ${r.dsWins > r.dsLosses ? "Win" : "Loss"} vs ${r.opponent}`}
          />
        ))}
      </div>
      <p className="relative px-5 pb-1 pt-1.5 text-[10px] uppercase tracking-widest text-fog-600 sm:px-6">
        Relay flow · winner stays on
      </p>

      {/* baton chain of stints */}
      <div className="relative space-y-0 px-5 pb-5 sm:px-6">
        {stints.map((s, si) => {
          const player = getPlayer(s.handle);
          const deck = s.deckSlug ? getDeck(s.deckSlug) : undefined;
          const accent = deck?.accent ?? "#8E89B4";
          return (
            <div key={si}>
              <div
                className="relative flex flex-col gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-3.5 sm:flex-row sm:items-center"
                style={{ boxShadow: `inset 3px 0 0 ${accent}` }}
              >
                {/* duelist + deck */}
                <div className="flex w-full items-center justify-between gap-3 sm:w-52 sm:shrink-0 sm:flex-col sm:items-start sm:justify-start">
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold uppercase italic tracking-wide text-fog-100">
                      {player?.name ?? s.handle}
                    </p>
                    <span className="text-xs tabular-nums text-fog-500">
                      <span style={{ color: WIN }}>{s.wins}</span>–<span style={{ color: LOSS }}>{s.losses}</span> this stint
                    </span>
                  </div>
                  <DeckChip deckSlug={s.deckSlug} name={s.deckName} size="sm" />
                </div>

                {/* game pips */}
                <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                  {s.games.map((g, gi) => (
                    <motion.div
                      key={gi}
                      initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.22, delay: reduce ? 0 : gi * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-1.5 rounded-md bg-ink-900/70 py-1 pl-1 pr-2"
                      title={`${g.won ? "Win" : "Loss"} vs ${g.opponent}${g.opponentDeck ? ` · ${g.opponentDeck}` : ""}`}
                    >
                      <span
                        className="grid h-5 w-5 shrink-0 -skew-x-12 place-items-center text-[10px] font-black text-white"
                        style={{ background: g.won ? WIN : LOSS }}
                      >
                        <span className="block skew-x-12">{g.won ? "W" : "L"}</span>
                      </span>
                      <span className="min-w-0 leading-tight">
                        <span className="block max-w-[7.5rem] truncate text-[11px] text-fog-300">{g.opponent}</span>
                        {g.opponentDeck && (
                          <span className="block max-w-[7.5rem] truncate text-[10px] text-fog-600">{g.opponentDeck}</span>
                        )}
                      </span>
                    </motion.div>
                  ))}

                  {s.sweep && (
                    <span
                      className="ml-auto flex items-center gap-1 self-center px-1 text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: WIN }}
                    >
                      <Star className="h-3 w-3" /> {s.wins}-0 sweep
                    </span>
                  )}
                </div>
              </div>

              {/* baton pass connector */}
              {si < stints.length - 1 && (
                <div className="flex items-center gap-2 py-1 pl-1 text-[10px] uppercase tracking-widest text-fog-600">
                  <span className="ml-1 h-3 w-px bg-white/15" />
                  <span>baton pass</span>
                  <span aria-hidden>↓</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
