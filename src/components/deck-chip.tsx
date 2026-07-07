import Link from "next/link";
import CardArt from "./card-art";
import { getDeck } from "@/lib/data";

/**
 * Small deck thumbnail + name, used wherever an archetype is mentioned.
 * Resolves the deck by slug for art/accent; unknown decks (no slug) fall back
 * to a neutral gradient chip with the name's initial.
 */
export default function DeckChip({
  deckSlug,
  name,
  size = "md",
  link = true,
}: {
  deckSlug?: string;
  name?: string; // display override (e.g. full lineup deck name); defaults to deck.name
  size?: "sm" | "md";
  link?: boolean;
}) {
  const deck = deckSlug ? getDeck(deckSlug) : undefined;
  const label = name ?? deck?.name ?? "Unknown";
  const accent = deck?.accent ?? "#8E89B4";
  const dim = size === "sm" ? "h-6 w-6 rounded-md" : "h-9 w-9 rounded-lg";
  const text = size === "sm" ? "text-xs" : "text-sm";

  const inner = (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span
        className={`${dim} shrink-0 overflow-hidden`}
        style={{ boxShadow: `inset 0 0 0 1px ${accent}55` }}
      >
        <CardArt
          cardId={deck?.signatureCardId ?? 0}
          image={deck?.image}
          accent={accent}
          label={label}
          className="[&_div]:text-base"
        />
      </span>
      <span className={`${text} truncate`} style={{ color: accent }}>
        {label}
      </span>
    </span>
  );

  if (link && deck) {
    return (
      <Link href={`/decks/${deck.slug}`} className="min-w-0 transition-opacity hover:opacity-80">
        {inner}
      </Link>
    );
  }
  return inner;
}
