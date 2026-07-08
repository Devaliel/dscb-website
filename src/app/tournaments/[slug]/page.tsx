import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import TierBadge from "@/components/tier-badge";
import DeckChip from "@/components/deck-chip";
import { getTournament, getTournaments, getPlayer, getDeck, getTournamentMatchupMatrix, getTournamentMetaAnalyst } from "@/lib/data";
import MatchupGrid from "@/components/matchup-grid";
import { winRate } from "@/lib/utils";
import type { WeekLineup } from "@/lib/types";

export function generateStaticParams() {
  return getTournaments().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = getTournament(slug);
  return { title: t ? t.name : "Tournament" };
}

/* -------- Team weekly lineup block -------- */
function WeekBlock({ week, index }: { week: WeekLineup; index: number }) {
  const resultColor = week.matchResult === "win"
    ? "var(--color-brand-400)"
    : week.matchResult === "loss"
    ? "var(--color-cyber-500)"
    : "var(--color-fog-600)";
  const resultLabel = week.matchResult === "win" ? "DS Win" : week.matchResult === "loss" ? "Loss" : "Pending";

  return (
    <Reveal delay={index * 0.07}>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-850">
        {/* week header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
          <h3 className="font-display text-lg font-bold text-fog-100">
            {week.week}
            {week.opponentTeam && (
              <span className="ml-3 text-sm font-medium text-fog-500">
                vs <span className="text-fog-300">{week.opponentTeam}</span>
              </span>
            )}
          </h3>
          <span
            className="rounded-full px-3 py-0.5 text-xs font-semibold"
            style={{
              background: `color-mix(in oklab, ${resultColor} 18%, transparent)`,
              color: resultColor,
              border: `1px solid color-mix(in oklab, ${resultColor} 35%, transparent)`,
            }}
          >
            {resultLabel}
          </span>
        </div>

        <div className="grid gap-px sm:grid-cols-2">
          {/* lineup */}
          <div className="p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-fog-600">Lineup</p>
            <div className="space-y-2.5">
              {week.deckList.map((entry) => {
                const p = getPlayer(entry.handle);
                return (
                  <div key={entry.handle} className="flex items-center gap-3">
                    <div className="w-24 shrink-0">
                      <p className="truncate text-sm font-medium text-fog-100">{p?.name ?? entry.handle}</p>
                      {week.sub.includes(entry.handle) && (
                        <span className="text-[10px] text-fog-600">substitute</span>
                      )}
                    </div>
                    <DeckChip deckSlug={entry.deckSlug} name={entry.deckName} size="md" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* round results */}
          <div className="border-t border-white/10 p-5 sm:border-l sm:border-t-0">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-fog-600">Round Results</p>
            {week.rounds && week.rounds.length > 0 ? (
              <div className="space-y-2">
                {week.rounds.map((r, ri) => {
                  const p = getPlayer(r.dsPlayerHandle);
                  const won = r.dsWins > r.dsLosses;
                  const color = won ? "var(--color-brand-400)" : "var(--color-cyber-500)";
                  return (
                    <div key={ri} className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2">
                      <span className="w-24 shrink-0 truncate text-sm text-fog-100">{p?.name ?? r.dsPlayerHandle}</span>
                      <span className="min-w-0 truncate text-xs text-fog-600">
                        vs {r.opponent}
                        {r.opponentDeck && <span className="text-fog-500"> · {r.opponentDeck}</span>}
                      </span>
                      <span className="ml-auto shrink-0 text-sm font-bold tabular-nums" style={{ color }}>
                        {r.dsWins}–{r.dsLosses}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-fog-600">Match data not yet uploaded.</p>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* -------- Page -------- */
export default async function TournamentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = getTournament(slug);
  if (!t) notFound();

  const isTeam = t.type === "team";

  return (
    <>
      <div className="relative px-6 pb-6 pt-36 sm:pt-44">
        <div className="pointer-events-none absolute inset-x-0 top-16 -z-10 mx-auto h-56 max-w-3xl rounded-full bg-brand-500/10 blur-[110px]" />
        <div className="mx-auto max-w-6xl">
          <Link href="/tournaments" className="mb-5 inline-block text-sm text-fog-300 hover:text-fog-100">
            ← Tournaments
          </Link>
          <Reveal>
            <p className="text-sm text-fog-500">
              {new Date(t.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} ·{" "}
              {t.location}
            </p>
            <h1 className="mt-1 font-display text-4xl font-bold text-fog-100 sm:text-6xl">{t.name}</h1>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-fog-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{t.format}</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{t.participants} participants</span>
              {isTeam && t.ourResult && (
                <span
                  className="rounded-full px-3 py-1 text-sm font-semibold"
                  style={{
                    background: "color-mix(in oklab, var(--color-brand-500) 18%, transparent)",
                    color: "var(--color-brand-300)",
                    border: "1px solid color-mix(in oklab, var(--color-brand-500) 35%, transparent)",
                  }}
                >
                  {t.ourResult}
                </span>
              )}
            </div>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {isTeam && t.weeks ? (
          <>
            <h2 className="mb-8 font-display text-2xl font-bold text-fog-100">Weekly Lineups</h2>
            <div className="space-y-5">
              {t.weeks.map((week, i) => (
                <WeekBlock key={week.week} week={week} index={i} />
              ))}
            </div>
            {(() => {
              const matrix = getTournamentMatchupMatrix(t.slug);
              const meta = getTournamentMetaAnalyst(t.slug);
              if (!matrix) return null;
              return (
                <section className="mt-14">
                  <h2 className="mb-2 font-display text-2xl font-bold text-fog-100">Matchup data</h2>
                  <p className="mb-6 text-sm text-fog-500">
                    Real head-to-head win rates from recorded rounds. — means no games between those archetypes in this tournament.
                  </p>
                  {meta && (
                    <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-fog-300">
                      <span
                        className="mr-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ color: "var(--color-brand-300)", background: "color-mix(in oklab, var(--color-brand-500) 18%, transparent)" }}
                      >
                        Meta Analyst
                      </span>
                      {meta.topDeck.name} was DS Celebeast&apos;s most-fielded archetype this tournament ({meta.topDeck.usageCount} phases).
                      {meta.best && ` Its strongest matchup was vs ${meta.best.deck.name} at ${meta.best.wr}% (${meta.best.games} games).`}
                      {meta.worst && ` Its toughest was vs ${meta.worst.deck.name} at ${meta.worst.wr}% (${meta.worst.games} games).`}
                    </div>
                  )}
                  <Reveal>
                    <div className="rounded-2xl border border-white/10 bg-ink-850 p-4 sm:p-6">
                      <MatchupGrid decks={matrix.decks} rows={matrix.rows} />
                    </div>
                  </Reveal>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-fog-500">
                    <span className="flex items-center gap-2"><span className="h-3 w-6 rounded" style={{ background: "rgba(18,230,216,0.20)" }} /> Favoured (60%+)</span>
                    <span className="flex items-center gap-2"><span className="h-3 w-6 rounded" style={{ background: "rgba(255,255,255,0.04)" }} /> Even</span>
                    <span className="flex items-center gap-2"><span className="h-3 w-6 rounded" style={{ background: "rgba(255,46,136,0.20)" }} /> Unfavoured (40%-)</span>
                  </div>
                </section>
              );
            })()}
          </>
        ) : (
          <>
            <h2 className="mb-6 font-display text-2xl font-bold text-fog-100">Standings</h2>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-850">
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 border-b border-white/10 px-6 py-3 text-xs uppercase tracking-wider text-fog-500">
                <span>#</span>
                <span>Player</span>
                <span className="hidden sm:block">Deck</span>
                <span className="text-right">Record</span>
              </div>
              <div className="divide-y divide-white/5">
                {t.results.map((r) => {
                  const player = getPlayer(r.playerHandle);
                  const deck = getDeck(r.deckSlug);
                  return (
                    <div
                      key={r.placement}
                      className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-white/5"
                    >
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
                      <Link href={`/players/${r.playerHandle}`} className="font-medium text-fog-100 hover:text-white">
                        {player?.name}
                      </Link>
                      <Link
                        href={`/decks/${r.deckSlug}`}
                        className="hidden items-center gap-2 text-sm sm:flex"
                        style={{ color: deck?.accent }}
                      >
                        {deck && <TierBadge tier={deck.tier} size="sm" />}
                        {deck?.name}
                      </Link>
                      <span className="text-right text-sm text-fog-500">
                        {r.wins}–{r.losses}
                        <span className="ml-2 text-xs text-fog-600">({winRate(r.wins, r.losses)}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
