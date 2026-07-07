"use client";

import Link from "next/link";
import type { Deck } from "@/lib/types";
import CardArt from "./card-art";

function DeckThumb({ deck, size = 28 }: { deck: Deck; size?: number }) {
  return (
    <span
      className="inline-block shrink-0 overflow-hidden rounded-md"
      style={{ width: size, height: size, boxShadow: `inset 0 0 0 1px ${deck.accent}55` }}
    >
      <CardArt cardId={deck.signatureCardId} image={deck.image} accent={deck.accent} label={deck.name} />
    </span>
  );
}

function cellColor(wr: number) {
  // red (low) -> neutral -> green (high)
  if (wr >= 60) return { bg: "rgba(18,230,216,0.20)", fg: "#4ff0e6" };
  if (wr >= 52) return { bg: "rgba(18,230,216,0.10)", fg: "#9beee6" };
  if (wr >= 48) return { bg: "rgba(255,255,255,0.04)", fg: "var(--color-fog-300)" };
  if (wr >= 40) return { bg: "rgba(255,46,136,0.10)", fg: "#ff8fbb" };
  return { bg: "rgba(255,46,136,0.20)", fg: "#ff62a6" };
}

export default function MatchupGrid({
  decks,
  rows,
}: {
  decks: Deck[];
  rows: (number | null)[][];
}) {
  return (
    <div className="no-scrollbar overflow-x-auto">
      <table className="w-full border-separate border-spacing-1" style={{ minWidth: 640 }}>
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-ink-950 p-2 text-left text-xs font-medium text-fog-500">
              Deck ↓ / vs →
            </th>
            {decks.map((d) => (
              <th key={d.slug} className="p-2 align-bottom">
                <span className="flex flex-col items-center gap-1.5">
                  <DeckThumb deck={d} />
                  <span className="block text-xs font-medium" style={{ color: d.accent }}>
                    {d.name}
                  </span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {decks.map((row, ri) => (
            <tr key={row.slug}>
              <th className="sticky left-0 z-10 bg-ink-950 p-2 text-left">
                <Link
                  href={`/decks/${row.slug}`}
                  className="flex items-center gap-2 text-sm font-medium hover:underline"
                  style={{ color: row.accent }}
                >
                  <DeckThumb deck={row} />
                  {row.name}
                </Link>
              </th>
              {decks.map((col, ci) => {
                const wr = rows[ri][ci];
                if (wr === null) {
                  return (
                    <td key={col.slug} className="rounded-lg bg-white/[0.02] p-0 text-center">
                      <div className="grid h-11 place-items-center text-fog-600">—</div>
                    </td>
                  );
                }
                const c = cellColor(wr);
                return (
                  <td key={col.slug} className="p-0 text-center">
                    <div
                      className="grid h-11 place-items-center rounded-lg text-sm font-semibold transition-transform hover:scale-105"
                      style={{ background: c.bg, color: c.fg }}
                      title={`${row.name} vs ${col.name}: ${wr}%`}
                    >
                      {wr}%
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
