import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import TierTile from "@/components/tier-tile";
import { getDecksByTournament } from "@/lib/data";

export const metadata: Metadata = {
  title: "Team Decks",
  description: "Decks the DSCB team runs in tournaments — grouped by event.",
};

export default function DecksPage() {
  const groups = getDecksByTournament();

  return (
    <>
      <PageHeader
        eyebrow="Performance"
        title="Team Decks"
        subtitle="Archetypes the squad brings to battle, grouped by tournament."
      />

      <div className="mx-auto max-w-6xl px-6 py-12 space-y-16">
        {groups.map((group) => (
          <section key={group.slug}>
            {/* section header */}
            <div className="mb-7 flex flex-wrap items-end gap-4 border-b border-white/10 pb-4">
              <div>
                <Link
                  href={`/tournaments/${group.slug}`}
                  className="group flex items-center gap-2"
                >
                  <h2 className="text-persona text-2xl text-fog-100 group-hover:text-white transition-colors">
                    {group.name}
                  </h2>
                  <span className="text-fog-600 text-sm group-hover:text-fog-400 transition-colors">↗</span>
                </Link>
                {group.ourResult && (
                  <p className="mt-1 text-xs text-fog-500">{group.ourResult}</p>
                )}
              </div>
              <span
                className="ml-auto shrink-0 -skew-x-12 px-3 py-1 text-xs font-bold uppercase tracking-wide"
                style={{
                  background: "color-mix(in oklab, var(--color-brand-500) 18%, transparent)",
                  color: "var(--color-brand-300)",
                  border: "1px solid color-mix(in oklab, var(--color-brand-500) 35%, transparent)",
                }}
              >
                <span className="block skew-x-12">{group.decks.length} archetypes</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.decks.map((deck, i) => (
                <TierTile key={deck.slug} deck={deck} index={i} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
