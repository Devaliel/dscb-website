"use client";

import { useState } from "react";
import { cardArt } from "@/lib/ygoprodeck";

/**
 * Deck artwork with an ordered fallback chain:
 * local /deck-art image → YGOPRODeck card art → neon gradient + initial.
 * Advances to the next source on load error.
 */
export default function CardArt({
  cardId,
  image,
  accent,
  label,
  className = "",
}: {
  cardId: number;
  image?: string;
  accent: string;
  label: string;
  className?: string;
}) {
  const sources = [
    ...(image ? [image] : []),
    ...(cardId > 0 ? [cardArt(cardId)] : []),
  ];
  const [idx, setIdx] = useState(0);
  const src = sources[idx];

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 120% at 20% 0%, ${accent}55, transparent 55%), linear-gradient(160deg, #14141f, #060608)`,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={label}
          loading="lazy"
          onError={() => setIdx((i) => i + 1)}
          className="h-full w-full object-cover object-top opacity-90 transition duration-700 group-hover:scale-110"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-display text-6xl font-bold opacity-30"
          style={{ color: accent }}
        >
          {label.charAt(0)}
        </div>
      )}
    </div>
  );
}
