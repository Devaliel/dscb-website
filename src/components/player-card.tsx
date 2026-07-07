"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Player } from "@/lib/types";
import { getDeck } from "@/lib/data";
import { winRate } from "@/lib/utils";
import CardArt from "./card-art";

export default function PlayerCard({ player, index = 0 }: { player: Player; index?: number }) {
  const deck = getDeck(player.mainDeckSlug);
  const accent = deck?.accent ?? "var(--color-brand-400)";
  const wr = winRate(player.wins, player.losses);
  const initials = player.name.split(" ").map((w) => w[0]).join("").slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/players/${player.handle}`}
        className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-ink-850 transition-colors hover:border-white/20"
        style={{ boxShadow: `0 18px 50px -32px ${accent}` }}
      >
        {/* favorite deck art banner */}
        {deck && (
          <div className="relative h-24 w-full">
            <CardArt cardId={deck.signatureCardId} image={deck.image} accent={accent} label={deck.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-850 via-ink-850/40 to-transparent" />
            <span
              className="absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur"
              style={{ background: `${accent}28`, color: accent, border: `1px solid ${accent}44` }}
            >
              ♥ {deck.name}
            </span>
          </div>
        )}

        <div className="relative p-5 pt-0">
          <div
            className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-3xl transition-opacity group-hover:opacity-60"
            style={{ background: accent }}
          />
          <div className="relative -mt-7 flex items-end gap-4">
            <div
              className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-display text-lg font-bold text-white ring-4 ring-ink-850"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}66)`, boxShadow: `0 0 24px -6px ${accent}` }}
            >
              {initials}
            </div>
            <div className="min-w-0 pb-0.5">
              <p className="truncate font-display text-lg font-semibold text-fog-100">{player.name}</p>
              <p className="text-sm" style={{ color: accent }}>{player.role}</p>
            </div>
          </div>

          <p className="relative mt-4 text-sm text-fog-500">{player.tagline}</p>

          <div className="relative mt-5 grid grid-cols-3 gap-2 text-center">
            <Stat v={`${wr}%`} l="Win rate" />
            <Stat v={player.titles} l="Titles" />
            <Stat v={player.wins + player.losses} l="Games" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function Stat({ v, l }: { v: string | number; l: string }) {
  return (
    <div className="rounded-xl bg-white/5 py-2">
      <p className="font-display text-lg font-bold text-fog-100">{v}</p>
      <p className="text-[11px] text-fog-500">{l}</p>
    </div>
  );
}
