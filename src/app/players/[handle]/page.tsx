import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import StatCard from "@/components/stat-card";
import CardArt from "@/components/card-art";
import DeckChip from "@/components/deck-chip";
import { Reveal } from "@/components/reveal";
import { getPlayer, getPlayers, getDeck, getTournaments } from "@/lib/data";
import { winRate } from "@/lib/utils";

export function generateStaticParams() {
  return getPlayers().map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const player = getPlayer(handle);
  return { title: player ? player.name : "Player" };
}

export default async function PlayerPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const player = getPlayer(handle);
  if (!player) notFound();

  const deck = getDeck(player.mainDeckSlug);
  const accent = deck?.accent ?? "var(--color-brand-400)";
  const wr = winRate(player.wins, player.losses);
  const initials = player.name.split(" ").map((w) => w[0]).join("").slice(0, 2);

  const finishes = getTournaments()
    .flatMap((t) => t.results.filter((r) => r.playerHandle === player.handle).map((r) => ({ ...r, event: t })))
    .sort((a, b) => +new Date(b.event.date) - +new Date(a.event.date));

  const teamEvents = getTournaments().filter(
    (t) => t.type === "team" && t.weeks?.some((w) => [...w.main, ...w.sub].includes(player.handle))
  );

  return (
    <>
      <div className="relative px-6 pb-6 pt-36 sm:pt-44">
        <div
          className="pointer-events-none absolute inset-x-0 top-20 -z-10 mx-auto h-64 max-w-3xl rounded-full blur-[120px]"
          style={{ background: accent, opacity: 0.18 }}
        />
        <div className="mx-auto max-w-6xl">
          <Link href="/players" className="mb-6 inline-block text-sm text-fog-300 hover:text-fog-100">
            ← Roster
          </Link>
          <Reveal>
            <div className="flex flex-wrap items-center gap-6">
              <div
                className="grid h-24 w-24 place-items-center rounded-3xl font-display text-3xl font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}55)`, boxShadow: `0 0 50px -10px ${accent}` }}
              >
                {initials}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: accent }}>{player.role}</p>
                <h1 className="font-display text-4xl font-bold text-fog-100 sm:text-6xl">{player.name}</h1>
                <p className="mt-2 text-lg text-fog-500">{player.tagline}</p>
                {player.gameId && (
                  <p className="mt-3 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-fog-500">
                    ID&nbsp;{player.gameId}
                  </p>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="max-w-3xl text-lg text-fog-300">{player.bio}</p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Win rate" value={wr} suffix="%" accent={accent} />
          <StatCard label="Titles" value={player.titles} accent={accent} />
          <StatCard label="Wins" value={player.wins} accent={accent} />
          <StatCard label="Games" value={player.wins + player.losses} accent={accent} />
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          {deck && (
            <div>
              <h2 className="mb-6 font-display text-2xl font-bold text-fog-100">Favorite deck</h2>
              <Link
                href={`/decks/${deck.slug}`}
                className="group block overflow-hidden rounded-2xl border border-white/10 bg-ink-850 transition-colors hover:border-white/20"
                style={{ borderColor: `color-mix(in oklab, ${deck.accent} 25%, transparent)`, boxShadow: `0 16px 50px -28px ${deck.accent}` }}
              >
                <div className="relative h-36 w-full">
                  <CardArt cardId={deck.signatureCardId} image={deck.image} accent={deck.accent} label={deck.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/20 to-transparent" />
                </div>
                <div className="flex items-center gap-4 p-5">
                  <div className="flex-1">
                    <p className="font-display text-lg font-semibold text-fog-100">{deck.name}</p>
                    <p className="text-sm text-fog-500">
                      {deck.wins + deck.losses > 0 ? `${winRate(deck.wins, deck.losses)}% win rate` : "No match data yet"}
                      {deck.usageCount > 0 && ` · ${deck.usageCount} lineups`}
                    </p>
                  </div>
                  <span className="text-fog-500">→</span>
                </div>
              </Link>
            </div>
          )}

          <div>
            <h2 className="mb-6 font-display text-2xl font-bold text-fog-100">Tournament history</h2>
            <div className="space-y-3">
              {/* Team tournaments */}
              {teamEvents.map((t) => {
                const playerWeeks = (t.weeks ?? []).filter((w) => [...w.main, ...w.sub].includes(player.handle));
                return (
                  <div
                    key={t.slug}
                    className="overflow-hidden rounded-2xl border bg-ink-850"
                    style={{ borderColor: "color-mix(in oklab, var(--color-brand-500) 22%, transparent)" }}
                  >
                    {/* Header row */}
                    <Link
                      href={`/tournaments/${t.slug}`}
                      className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-white/5"
                    >
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg font-display text-xs font-bold"
                        style={{ color: "var(--color-brand-400)", background: "color-mix(in oklab, var(--color-brand-500) 18%, transparent)" }}
                      >
                        DS
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-fog-100">{t.name}</p>
                        <p className="text-xs text-fog-500">
                          {new Date(t.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })} · {playerWeeks.length} phase{playerWeeks.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      {t.ourResult && (
                        <span className="shrink-0 text-sm font-semibold" style={{ color: "var(--color-brand-300)" }}>
                          {t.ourResult}
                        </span>
                      )}
                    </Link>
                    {/* Per-phase deck rows */}
                    {playerWeeks.length > 0 && (
                      <div className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
                        {playerWeeks.map((w) => {
                          const entry = w.deckList.find((d) => d.handle === player.handle);
                          const isSub = w.sub.includes(player.handle);
                          const myRounds = (w.rounds ?? []).filter((r) => r.dsPlayerHandle === player.handle);
                          const phaseWins = myRounds.reduce((s, r) => s + r.dsWins, 0);
                          const phaseLosses = myRounds.reduce((s, r) => s + r.dsLosses, 0);
                          const resultColor = w.matchResult === "win"
                            ? "var(--color-brand-400)"
                            : w.matchResult === "loss"
                            ? "var(--color-cyber-500)"
                            : "var(--color-fog-600)";
                          return (
                            <div key={w.week} className="flex items-center gap-3 px-4 py-2.5">
                              <div className="w-28 shrink-0">
                                <span className="text-xs font-medium text-fog-400">{w.week}</span>
                                {isSub && (
                                  <span className="ml-1.5 text-[10px] text-fog-600">sub</span>
                                )}
                              </div>
                              {entry ? (
                                <DeckChip deckSlug={entry.deckSlug} name={entry.deckName} size="sm" link={!!entry.deckSlug} />
                              ) : (
                                <span className="text-xs text-fog-600">—</span>
                              )}
                              <div className="ml-auto flex items-center gap-3">
                                {myRounds.length > 0 && (
                                  <span className="text-xs tabular-nums text-fog-500">
                                    {phaseWins}–{phaseLosses}
                                  </span>
                                )}
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ background: resultColor }}
                                  title={w.matchResult ?? "pending"}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Individual finishes */}
              {finishes.map((f, i) => {
                const fDeck = getDeck(f.deckSlug);
                return (
                  <Link
                    key={i}
                    href={`/tournaments/${f.event.slug}`}
                    className="flex items-center gap-4 rounded-xl border border-white/10 bg-ink-850 p-4 transition-colors hover:border-white/20"
                  >
                    <span
                      className="grid h-9 w-9 place-items-center rounded-lg font-display font-bold"
                      style={{
                        color: f.placement === 1 ? "var(--color-gold-500)" : "var(--color-fog-300)",
                        background: f.placement === 1 ? "color-mix(in oklab, var(--color-gold-500) 15%, transparent)" : "rgba(255,255,255,0.05)",
                      }}
                    >
                      {f.placement}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fog-100">{f.event.name}</p>
                      <p className="text-xs text-fog-500">
                        {new Date(f.event.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                    {fDeck && <DeckChip deckSlug={fDeck.slug} size="sm" link={false} />}
                    <span className="w-14 text-right text-xs text-fog-500">{f.wins}–{f.losses}</span>
                  </Link>
                );
              })}
              {teamEvents.length === 0 && finishes.length === 0 && (
                <p className="text-sm text-fog-500">No recorded events yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
