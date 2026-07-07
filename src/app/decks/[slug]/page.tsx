import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CardArt from "@/components/card-art";
import StatCard from "@/components/stat-card";
import { Reveal } from "@/components/reveal";
import TierBadge from "@/components/tier-badge";
import { getDeck, getAllDecks, getTournaments, getPlayer } from "@/lib/data";
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
  const pilots = getTournaments()
    .flatMap((t) => t.results.filter((r) => r.deckSlug === deck.slug).map((r) => ({ ...r, event: t })))
    .slice(0, 5);

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
              <h1 className="font-display text-4xl font-bold text-fog-100 sm:text-6xl">{deck.name}</h1>
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

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          {/* sample list */}
          <div>
            <h2 className="mb-6 font-display text-2xl font-bold text-fog-100">Sample decklist</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {deck.sampleList.map((card, i) => (
                <Reveal key={card.name} delay={i * 0.05}>
                  <div className="group overflow-hidden rounded-xl border border-white/10 bg-ink-850">
                    <div className="relative aspect-[3/4] overflow-hidden bg-ink-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cardImageSmall(card.cardId)}
                        alt={card.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <span
                        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg text-sm font-bold text-white backdrop-blur"
                        style={{ background: `${deck.accent}cc` }}
                      >
                        {card.count}
                      </span>
                    </div>
                    <p className="truncate px-3 py-2 text-xs text-fog-300">{card.name}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* pilots */}
          <div>
            <h2 className="mb-6 font-display text-2xl font-bold text-fog-100">Recent finishes</h2>
            <div className="space-y-3">
              {pilots.length === 0 && <p className="text-sm text-fog-500">No recorded finishes yet.</p>}
              {pilots.map((p, i) => {
                const player = getPlayer(p.playerHandle);
                return (
                  <Link
                    key={i}
                    href={`/tournaments/${p.event.slug}`}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-850 p-4 transition-colors hover:border-white/20"
                  >
                    <span
                      className="grid h-9 w-9 place-items-center rounded-lg font-display font-bold"
                      style={{ color: deck.accent, background: `${deck.accent}1f` }}
                    >
                      {p.placement}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fog-100">{player?.name}</p>
                      <p className="truncate text-xs text-fog-500">{p.event.name}</p>
                    </div>
                    <span className="text-xs text-fog-500">{p.wins}–{p.losses}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
