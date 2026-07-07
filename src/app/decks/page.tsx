import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import TierTile from "@/components/tier-tile";
import { getDecks } from "@/lib/data";

export const metadata: Metadata = {
  title: "Team Decks",
  description: "Decks the DSCB team runs in tournaments — ranked by lineup appearances and win rate.",
};

export default function DecksPage() {
  const decks = getDecks();

  return (
    <>
      <PageHeader
        eyebrow="Performance"
        title="Team Decks"
        subtitle="Archetypes the squad brings to battle, ranked by lineup appearances and win rate."
      />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck, i) => (
            <TierTile key={deck.slug} deck={deck} index={i} />
          ))}
        </div>
      </div>
    </>
  );
}
