import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CardArt from "@/components/card-art";
import StatCard from "@/components/stat-card";
import PlayerAvatar from "@/components/player-avatar";
import { Reveal } from "@/components/reveal";
import TierBadge from "@/components/tier-badge";
import { getDeck, getAllDecks, getDeckUsage, getDeckPilots } from "@/lib/data";
import { cardImageSmall } from "@/lib/ygoprodeck";
import { winRate, TIER_LABEL } from "@/lib/utils";

export function generateStaticParams() {
  return getAllDecks().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const deck = getDeck(slug);
  return { title: deck ? `${deck.name} deck` : "Deck" };
}

export default async function DeckPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const deck = getDeck(slug);
  if (!deck) notFound();

  const wr = winRate(deck.wins, deck.losses);
  const pilots = getDeckPilots(deck.slug);
  const usage = getDeckUsage(deck.slug);

  return (
    <>
      {/* banner */}
      <div className="relative h-[42vh] min-h-72 w-full overflow-hidden">
        <CardArt cardId={deck.signatureCardId} image={deck.image} accent={deck.accent} label={deck.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/30" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-6xl px-6 pb-8">
            <Link href="/decks" className="mb-4 inline-block text-sm text-fog-300 hover:text-fog-100">
              ← Team Decks
            </Link>
            <div className="flex flex-wrap items-center gap-4">
              <TierBadge tier={deck.tier} size="lg" />
              <h1 className="text-persona text-4xl text-fog-100 sm:text-6xl">{deck.name}</h1>
              {deck.tier && (
                <span
                  className="rounded-full px-3 py-1 text-sm font-medium"
                  style={{ background: `${deck.accent}22`, color: deck.accent }}
                >
                  {TIER_LABEL[deck.tier]}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="max-w-3xl text-lg text-fog-300">{deck.description}</p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Win rate" value={wr} suffix="%" accent={deck.accent} />
          <StatCard label="Wins" value={deck.wins} accent={deck.accent} />
          <StatCard label="Losses" value={deck.losses} accent={deck.accent} />
          <StatCard label="Games" value={deck.wins + deck.losses} accent={deck.accent} />
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          {/* pilots */}
          <div>
            <h2 className="text-persona mb-6 text-2xl text-fog-100">Pilots</h2>
            <div className="space-y-3">
              {pilots.length === 0 && <p className="text-sm text-fog-500">No pilots recorded yet.</p>}
              {pilots.map(({ player, wins, losses, phases }) => (
                <Link
                  key={player!.handle}
                  href={`/players/${player!.handle}`}
                  className="clip-corner group relative flex items-center gap-4 border border-white/10 bg-ink-850 p-4 transition-transform hover:-translate-y-0.5"
                  style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.45)" }}
                >
                  <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />
                  <div className="h-12 w-12 shrink-0 overflow-hidden">
                    <PlayerAvatar player={player!} accent={deck.accent} size="card" className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-persona truncate text-base text-fog-100 group-hover:text-white">
                      {player!.name}
                    </p>
                    <p className="text-xs text-fog-500">
                      {phases} phase{phases !== 1 ? "s" : ""} piloted
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-lg font-extrabold italic" style={{ color: deck.accent }}>
                      {wins}–{losses}
                    </p>
                    {wins + losses > 0 && (
                      <p className="text-[11px] text-fog-500">{winRate(wins, losses)}% WR</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* tournament history — every phase this deck was fielded */}
          <div>
            <h2 className="text-persona mb-6 text-2xl text-fog-100">Tournament history</h2>
            {usage.length === 0 ? (
              <p className="text-sm text-fog-500">Not fielded in a recorded tournament yet.</p>
            ) : (
              <div className="clip-corner relative overflow-hidden border border-white/10 bg-ink-850">
                <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />
                <div className="relative divide-y divide-white/[0.06]">
                  {usage.map((u, i) => (
                    <Link
                      key={i}
                      href={`/tournaments/${u.tournamentSlug}`}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="w-28 shrink-0">
                        <p className="text-persona text-sm text-fog-100">{u.week}</p>
                        <p className="truncate text-[11px] text-fog-600">{u.tournamentName}</p>
                      </div>
                      <div className="min-w-0 flex-1 text-xs text-fog-500">
                        <span className="text-fog-300">{u.playerHandle && (u.isSub ? "sub · " : "")}{pilots.find((p) => p.player!.handle === u.playerHandle)?.player!.name ?? u.playerHandle}</span>
                        {u.opponentTeam && <span> vs {u.opponentTeam}</span>}
                      </div>
                      <span className="shrink-0 text-sm font-bold tabular-nums" style={{ color: deck.accent }}>
                        {u.wins}–{u.losses}
                      </span>
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        title={u.matchResult ?? "pending"}
                        style={{
                          background:
                            u.matchResult === "win"
                              ? "var(--color-brand-400)"
                              : u.matchResult === "loss"
                              ? "var(--color-cyber-500)"
                              : "var(--color-fog-600)",
                        }}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* sample list — only when cards are provided */}
        {deck.sampleList.length > 0 && (
          <div className="mt-14">
            <h2 className="text-persona mb-6 text-2xl text-fog-100">Sample decklist</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {deck.sampleList.map((card, i) => (
                <Reveal key={card.name} delay={i * 0.05}>
                  <div className="clip-corner group overflow-hidden border border-white/10 bg-ink-850">
                    <div className="relative aspect-[3/4] overflow-hidden bg-ink-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cardImageSmall(card.cardId)}
                        alt={card.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <span
                        className="absolute right-2 top-2 grid h-7 w-7 -skew-x-6 place-items-center text-sm font-bold text-white backdrop-blur"
                        style={{ background: `${deck.accent}cc` }}
                      >
                        <span className="skew-x-6">{card.count}</span>
                      </span>
                    </div>
                    <p className="truncate px-3 py-2 text-xs text-fog-300">{card.name}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
