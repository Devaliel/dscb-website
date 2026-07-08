"use client";

import { useEffect, useRef, useState } from "react";
import type { Player } from "@/lib/types";

/**
 * Player portrait with drop-in file convention:
 *   public/players/<handle>.png  (transparent-bg character art works best)
 * Falls back to an initials tile when the file is missing.
 */
export default function PlayerAvatar({
  player,
  accent,
  size = "card",
  className = "",
}: {
  player: Player;
  accent: string;
  size?: "card" | "hero";
  className?: string;
}) {
  const [ok, setOk] = useState(true);
  const ref = useRef<HTMLImageElement>(null);
  const initials = player.name.split(" ").map((w) => w[0]).join("").slice(0, 2);

  // catch images that already failed before hydration (onError won't re-fire)
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth === 0) setOk(false);
  }, []);

  if (ok) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={ref}
        src={`/players/${player.handle}.png`}
        alt=""
        draggable={false}
        onError={() => setOk(false)}
        className={`select-none object-contain object-bottom ${className}`}
        style={{
          filter: `drop-shadow(0 0 28px color-mix(in oklab, ${accent} 55%, transparent))`,
        }}
      />
    );
  }

  // initials fallback — angular Persona-style tile centered in the slot
  return (
    <div className={`grid place-items-center ${className}`}>
      <div
        className={`grid place-items-center font-display font-extrabold italic text-white ${
          size === "hero" ? "h-32 w-32 text-5xl" : "h-20 w-20 text-2xl"
        }`}
        style={{
          background: `linear-gradient(135deg, ${accent}, ${accent}55)`,
          clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
          boxShadow: `0 0 40px -10px ${accent}`,
        }}
      >
        {initials}
      </div>
    </div>
  );
}
