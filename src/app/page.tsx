import Link from "next/link";
import Hero from "@/components/hero";
import SectionHeading from "@/components/section-heading";
import TierTile from "@/components/tier-tile";
import PlayerCard from "@/components/player-card";
import { Reveal } from "@/components/reveal";
import DeckChip from "@/components/deck-chip";
import { getDecks, getPlayers, getTournaments, getPlayer } from "@/lib/data";
import { winRate } from "@/lib/utils";

export default function Home() {
  const decks = getDecks();
  const players = getPlayers();
  const tournaments = getTournaments();
  const latest = tournaments[0];
  const isTeam = latest?.type === "team";

  const topWr = winRate(decks[0].wins, decks[0].losses);
  const totalTitles = players.reduce((s, p) => s + p.titles, 0);

  return (
    <>
      <Hero topDeckWr={topWr} titles={totalTitles} players={players.length} />

      {/* Team Decks */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          eyebrow="Performance"
          title="Team Decks"
          action={
            <Link href="/decks" className="hidden text-sm text-fog-300 hover:text-fog-100 sm:block">
              All decks →
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {decks.slice(0, 6).map((deck, i) => (
            <TierTile key={deck.slug} deck={deck} index={i} />
          ))}
        </div>
      </section>

      {/* Latest tournament */}
      {latest && (
        <section className="mx-auto max-w-6xl px-6 py-10">
          <SectionHeading
            eyebrow="Latest event"
            title={latest.name}
            action={
              <Link href={`/tournaments/${latest.slug}`} className="hidden text-sm text-fog-300 hover:text-fog-100 sm:block">
                Full results →
              </Link>
            }
          />
          <Reveal>
            {isTeam && latest.weeks ? (
              /* Team tournament: show week-by-week summary */
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-850">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-white/10 px-6 py-4 text-sm text-fog-500">
                  <span>
                    {new Date(latest.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  <span>{latest.format}</span>
                  <span>{latest.location}</span>
                  {latest.ourResult && (
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{
                        background: "color-mix(in oklab, var(--color-brand-500) 18%, transparent)",
                        color: "var(--color-brand-300)",
                        border: "1px solid color-mix(in oklab, var(--color-brand-500) 35%, transparent)",
                      }}
                    >
                      {latest.ourResult}
                    </span>
                  )}
                </div>
                <div className="divide-y divide-white/5">
                  {latest.weeks.map((week) => {
                    const resultColor = week.matchResult === "win"
                      ? "var(--color-brand-400)"
                      : week.matchResult === "loss"
                      ? "var(--color-cyber-500)"
                      : "var(--color-fog-600)";
                    const resultLabel = week.matchResult === "win" ? "Win" : week.matchResult === "loss" ? "Loss" : "—";
                    return (
                      <div key={week.week} className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-white/[0.03]">
                        <span className="w-24 shrink-0 font-display text-sm font-semibold text-fog-100">{week.week}</span>
                        <div className="flex min-w-0 flex-1 flex-wrap gap-x-4 gap-y-1.5">
                          {week.deckList
                            .filter((e) => week.main.includes(e.handle))
                            .map((e) => (
                              <DeckChip key={e.handle} deckSlug={e.deckSlug} name={e.deckName} size="sm" link={false} />
                            ))}
                        </div>
                        <span className="shrink-0 text-sm font-bold" style={{ color: resultColor }}>{resultLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Individual tournament: standings table */
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-850">
                <div className="flex flex-wrap gap-x-6 gap-y-1 border-b border-white/10 px-6 py-4 text-sm text-fog-500">
                  <span>
                    {new Date(latest.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  <span>{latest.format}</span>
                  <span>{latest.location}</span>
                  <span>{latest.participants} players</span>
                </div>
                <div className="divide-y divide-white/5">
                  {latest.results.map((r) => {
                    const player = getPlayer(r.playerHandle);
                    return (
                      <div key={r.placement} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white/5">
                        <span
                          className="grid h-8 w-8 place-items-center rounded-lg font-display text-sm font-bold"
                          style={{
                            color: r.placement === 1 ? "var(--color-gold-500)" : "var(--color-fog-300)",
                            background:
                              r.placement === 1
                                ? "color-mix(in oklab, var(--color-gold-500) 15%, transparent)"
                                : "rgba(255,255,255,0.05)",
                          }}
                        >
                          {r.placement}
                        </span>
                        <span className="flex-1 font-medium text-fog-100">{player?.name}</span>
                        <span className="w-16 text-right text-sm text-fog-500">
                          {r.wins}–{r.losses}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Reveal>
        </section>
      )}

      {/* Featured players */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          eyebrow="The roster"
          title="Featured players"
          action={
            <Link href="/players" className="hidden text-sm text-fog-300 hover:text-fog-100 sm:block">
              All players →
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {players.map((p, i) => (
            <PlayerCard key={p.handle} player={p} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
