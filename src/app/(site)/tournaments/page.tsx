import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { getTournaments, getPlayer, getDeck } from "@/lib/data";

export const metadata: Metadata = {
  title: "Tournaments",
  description: "Events DSCB has participated in — results, lineups, and standings.",
};

export default function TournamentsPage() {
  const tournaments = getTournaments();
  return (
    <>
      <PageHeader
        eyebrow="Results"
        title="Tournaments"
        subtitle="Every event the team has played in, with full results and lineup data."
      />
      <div className="mx-auto max-w-6xl space-y-5 px-6 py-12">
        {tournaments.map((t, i) => {
          const isTeam = t.type === "team";
          const winner = !isTeam && t.results[0];
          const winPlayer = winner ? getPlayer(winner.playerHandle) : null;
          const winDeck = winner ? getDeck(winner.deckSlug) : null;

          return (
            <Reveal key={t.slug} delay={i * 0.05}>
              <Link
                href={`/tournaments/${t.slug}`}
                className="clip-corner group relative flex flex-col gap-4 border border-white/10 bg-ink-850 p-6 transition-all hover:-translate-y-0.5 hover:border-white/25 sm:flex-row sm:items-center"
                style={{ boxShadow: "5px 5px 0 rgba(0,0,0,0.45)" }}
              >
                <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fog-500">
                    <span>
                      {new Date(t.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span>·</span>
                    <span>{t.location}</span>
                    <span>·</span>
                    <span>{t.participants} participants</span>
                    {isTeam && (
                      <>
                        <span>·</span>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{
                            background: "color-mix(in oklab, var(--color-brand-500) 18%, transparent)",
                            color: "var(--color-brand-400)",
                            border: "1px solid color-mix(in oklab, var(--color-brand-500) 35%, transparent)",
                          }}
                        >
                          Team
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="text-persona mt-1 text-2xl text-fog-100">{t.name}</h2>
                  <p className="mt-1 text-sm text-fog-500">{t.format}</p>
                </div>

                {/* Badge: ourResult for team, winner for individual */}
                {isTeam && t.ourResult ? (
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: "color-mix(in oklab, var(--color-brand-500) 14%, transparent)", border: "1px solid color-mix(in oklab, var(--color-brand-500) 28%, transparent)" }}
                  >
                    <span
                      className="grid h-8 w-8 place-items-center rounded-lg font-display text-sm font-bold"
                      style={{ color: "var(--color-brand-400)", background: "color-mix(in oklab, var(--color-brand-500) 22%, transparent)" }}
                    >
                      DS
                    </span>
                    <div>
                      <p className="text-xs text-fog-500">Our result</p>
                      <p className="text-sm font-semibold" style={{ color: "var(--color-brand-300)" }}>
                        {t.ourResult}
                      </p>
                    </div>
                  </div>
                ) : winPlayer ? (
                  <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
                    <span
                      className="grid h-8 w-8 place-items-center rounded-lg font-display text-sm font-bold"
                      style={{ color: "var(--color-gold-500)", background: "color-mix(in oklab, var(--color-gold-500) 15%, transparent)" }}
                    >
                      1
                    </span>
                    <div>
                      <p className="text-sm font-medium text-fog-100">{winPlayer.name}</p>
                      <p className="text-xs" style={{ color: winDeck?.accent }}>{winDeck?.name}</p>
                    </div>
                  </div>
                ) : null}
              </Link>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
