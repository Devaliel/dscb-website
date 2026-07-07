import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import PlayerCard from "@/components/player-card";
import { getPlayers } from "@/lib/data";

export const metadata: Metadata = {
  title: "Players",
  description: "The DSCB Yu-Gi-Oh! roster — player profiles, win rates and titles.",
};

export default function PlayersPage() {
  const players = getPlayers();
  return (
    <>
      <PageHeader
        eyebrow="The roster"
        title="Players"
        subtitle="The pilots behind the results — win rates, titles and the decks they main."
      />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((p, i) => (
            <PlayerCard key={p.handle} player={p} index={i} />
          ))}
        </div>
      </div>
    </>
  );
}
