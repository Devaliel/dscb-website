import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import MatchupGrid from "@/components/matchup-grid";
import { Reveal } from "@/components/reveal";
import { getMatchupMatrix } from "@/lib/data";

export const metadata: Metadata = {
  title: "Matchups",
  description: "Deck-vs-deck win-rate matrix for the DSCB Yu-Gi-Oh! meta.",
};

export default function MatchupsPage() {
  const { decks, rows } = getMatchupMatrix();
  return (
    <>
      <PageHeader
        eyebrow="Meta analysis"
        title="Matchup grid"
        subtitle="Read a row as that deck's win rate versus each column. Cyan favours the row, pink favours the column."
      />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Reveal>
          <div className="rounded-2xl border border-white/10 bg-ink-850 p-4 sm:p-6">
            <MatchupGrid decks={decks} rows={rows} />
          </div>
        </Reveal>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-fog-500">
          <span className="flex items-center gap-2"><span className="h-3 w-6 rounded" style={{ background: "rgba(18,230,216,0.20)" }} /> Favoured (60%+)</span>
          <span className="flex items-center gap-2"><span className="h-3 w-6 rounded" style={{ background: "rgba(255,255,255,0.04)" }} /> Even</span>
          <span className="flex items-center gap-2"><span className="h-3 w-6 rounded" style={{ background: "rgba(255,46,136,0.20)" }} /> Unfavoured (40%-)</span>
        </div>
      </div>
    </>
  );
}
