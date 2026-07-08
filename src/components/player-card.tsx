"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Player } from "@/lib/types";
import { getDeck } from "@/lib/data";
import { winRate } from "@/lib/utils";
import CardArt from "./card-art";
import PlayerAvatar from "./player-avatar";

export default function PlayerCard({ player, index = 0 }: { player: Player; index?: number }) {
  const deck = getDeck(player.mainDeckSlug);
  const accent = deck?.accent ?? "var(--color-brand-400)";
  const wr = winRate(player.wins, player.losses);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/players/${player.handle}`}
        className="group relative block transition-transform duration-200 hover:-rotate-[0.6deg] hover:-translate-y-1"
      >
        {/* offset accent shape behind the card — P5 sticker look */}
        <div
          aria-hidden
          className="clip-corner absolute inset-0 translate-x-1.5 translate-y-1.5 opacity-50 transition-transform duration-200 group-hover:translate-x-2.5 group-hover:translate-y-2.5"
          style={{ background: accent }}
        />

        {/* the card */}
        <div className="clip-corner relative overflow-hidden border border-white/10 bg-ink-850">
          {/* deck art background layer */}
          {deck && (
            <div className="absolute inset-0 opacity-25 saturate-[1.2] transition-opacity duration-200 group-hover:opacity-40">
              <CardArt cardId={deck.signatureCardId} image={deck.image} accent={accent} label={deck.name} />
            </div>
          )}
          {/* diagonal gradient wipe */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(115deg, var(--color-ink-900) 30%, color-mix(in oklab, var(--color-ink-900) 68%, transparent) 60%, color-mix(in oklab, ${accent} 14%, var(--color-ink-900)) 100%)`,
            }}
          />
          {/* halftone texture */}
          <div className="halftone absolute inset-0 opacity-[0.05]" aria-hidden />

          <div className="relative flex min-h-[15rem] flex-col p-5">
            {/* role tag — slanted chip */}
            <div className="flex items-start justify-between">
              <span
                className="-skew-x-12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
                style={{ background: `color-mix(in oklab, ${accent} 80%, black)` }}
              >
                <span className="block skew-x-12">{player.role}</span>
              </span>
              {deck && (
                <span
                  className="-skew-x-12 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ background: "rgba(0,0,0,0.45)", color: accent, border: `1px solid ${accent}55` }}
                >
                  <span className="block skew-x-12">♥ {deck.name}</span>
                </span>
              )}
            </div>

            {/* avatar cutout — bottom right */}
            <div className="pointer-events-none absolute -bottom-1 -right-2 h-40 w-36">
              <PlayerAvatar player={player} accent={accent} size="card" className="h-full w-full" />
            </div>

            {/* name on skewed accent band */}
            <div className="relative mt-auto max-w-[70%]">
              <div
                className="-rotate-2 -skew-x-6 px-3 py-1.5 transition-transform duration-200 group-hover:-translate-x-0.5"
                style={{ background: accent, boxShadow: `4px 4px 0 rgba(0,0,0,0.45)` }}
              >
                <p className="skew-x-6 truncate font-display text-xl font-extrabold uppercase italic tracking-tight text-ink-950">
                  {player.name}
                </p>
              </div>
              <p className="mt-2.5 pl-1 text-xs text-fog-500">{player.tagline}</p>
            </div>

            {/* slanted stat chips */}
            <div className="relative mt-4 flex max-w-[72%] gap-2">
              <Stat v={`${wr}%`} l="Win rate" />
              <Stat v={player.titles} l="Titles" />
              <Stat v={player.wins + player.losses} l="Games" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function Stat({ v, l }: { v: string | number; l: string }) {
  return (
    <div className="-skew-x-12 flex-1 border border-white/10 bg-black/40 py-1.5 text-center backdrop-blur-sm">
      <div className="skew-x-12">
        <p className="font-display text-base font-bold leading-tight text-fog-100">{v}</p>
        <p className="text-[10px] uppercase tracking-wider text-fog-600">{l}</p>
      </div>
    </div>
  );
}
