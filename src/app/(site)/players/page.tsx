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
  const roster = players.filter((p) => p.role !== "Try Out");
  const tryouts = players.filter((p) => p.role === "Try Out");

  return (
    <>
      <PageHeader
        eyebrow="The roster"
        title="Players"
        subtitle="The pilots behind the results — win rates, titles and the decks they main."
      />
      <div className="mx-auto max-w-6xl px-6 py-12 space-y-16">
        {/* Main roster */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {roster.map((p, i) => (
            <PlayerCard key={p.handle} player={p} index={i} />
          ))}
        </div>

        {/* Try Out section */}
        {tryouts.length > 0 && (
          <section>
            <div className="mb-7 flex items-center gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-fog-600">On Trial</p>
                <h2 className="text-persona text-2xl text-fog-100">Try Outs</h2>
              </div>
              <span
                className="ml-auto -skew-x-12 px-3 py-1 text-xs font-bold uppercase tracking-wide"
                style={{
                  background: "color-mix(in oklab, var(--color-cyber-500) 15%, transparent)",
                  color: "var(--color-cyber-400)",
                  border: "1px solid color-mix(in oklab, var(--color-cyber-500) 30%, transparent)",
                }}
              >
                <span className="block skew-x-12">{tryouts.length} on trial</span>
              </span>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tryouts.map((p, i) => (
                <PlayerCard key={p.handle} player={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
