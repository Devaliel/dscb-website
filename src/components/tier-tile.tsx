"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { Deck } from "@/lib/types";
import { winRate } from "@/lib/utils";
import CardArt from "./card-art";

export default function TierTile({ deck, index = 0 }: { deck: Deck; index?: number }) {
  const wr = winRate(deck.wins, deck.losses);
  const games = deck.wins + deck.losses;

  // pointer-driven 3D tilt
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 200, damping: 20 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, skewY: 1.5 }}
      whileInView={{ opacity: 1, y: 0, skewY: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 900 }}
    >
      <motion.div
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width);
          my.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => {
          mx.set(0.5);
          my.set(0.5);
        }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="group relative"
      >
        {/* offset accent sticker shadow */}
        <div
          aria-hidden
          className="clip-corner absolute inset-0 translate-x-1.5 translate-y-1.5 opacity-40 transition-all duration-200 group-hover:translate-x-2.5 group-hover:translate-y-2.5 group-hover:opacity-60"
          style={{ background: deck.accent }}
        />
        <Link
          href={`/decks/${deck.slug}`}
          className="clip-corner relative block overflow-hidden border border-white/10 bg-ink-850"
        >
          {/* art */}
          <div className="relative h-44 w-full">
            <CardArt cardId={deck.signatureCardId} image={deck.image} accent={deck.accent} label={deck.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />
            <div className="halftone absolute inset-0 opacity-[0.05]" aria-hidden />
            {deck.usageCount > 0 && (
              <div
                className="absolute left-4 top-4 -skew-x-12 px-3 py-1 backdrop-blur"
                style={{ background: `color-mix(in oklab, ${deck.accent} 85%, black)`, boxShadow: "3px 3px 0 rgba(0,0,0,0.45)" }}
              >
                <span className="block skew-x-12 text-xs font-bold uppercase tracking-wide text-white">
                  {deck.usageCount} lineup{deck.usageCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            {games > 0 && (
              <div
                className="absolute right-4 top-4 -skew-x-12 border px-3 py-1 backdrop-blur"
                style={{ background: "rgba(0,0,0,0.45)", color: deck.accent, borderColor: `${deck.accent}55` }}
              >
                <span className="block skew-x-12 text-xs font-semibold">{games} games</span>
              </div>
            )}
          </div>

          {/* meta */}
          <div className="relative -mt-8 p-4">
            <h3 className="text-persona text-xl text-fog-100">{deck.name}</h3>
            <p className="mt-1.5 line-clamp-2 text-sm text-fog-500">{deck.description}</p>

            <div className="mt-4 flex items-center gap-3">
              {games > 0 ? (
                <>
                  <div className="flex-1">
                    <div className="h-2.5 -skew-x-12 overflow-hidden bg-white/10">
                      <div
                        className="h-full"
                        style={{
                          width: `${wr}%`,
                          background: `linear-gradient(90deg, ${deck.accent}, ${deck.accent}88)`,
                          boxShadow: `0 0 12px ${deck.accent}`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="font-display text-lg font-extrabold italic" style={{ color: deck.accent }}>
                    {wr}%
                  </span>
                </>
              ) : (
                <span className="text-sm text-fog-600">No match data yet</span>
              )}
            </div>
          </div>

          {/* hover accent outline */}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            style={{ boxShadow: `inset 0 0 0 1.5px ${deck.accent}` }}
          />
        </Link>
      </motion.div>
    </motion.div>
  );
}
