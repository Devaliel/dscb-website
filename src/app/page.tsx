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

      {/* Join the Roster */}
      <JoinSection />
    </>
  );
}

/* ── Contact constants — owner replaces these two values ── */
const DISCORD_HANDLE = "darkzill";        // ← your Discord username
const WHATSAPP_NUMBER = "60123456789";    // ← your number, digits only (no + or spaces)

function JoinSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 pt-4">
      <Reveal>
        <div
          className="clip-corner relative overflow-hidden border border-white/10 bg-ink-850 px-8 py-12 sm:px-16 sm:py-16"
          style={{ boxShadow: "6px 6px 0 rgba(0,0,0,0.5)" }}
        >
          <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />
          {/* accent glow */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-500/20 blur-[80px]" aria-hidden />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-cyber-500/15 blur-[60px]" aria-hidden />

          <div className="relative">
            {/* eyebrow */}
            <span className="inline-block -skew-x-12 bg-cyber-500 px-3 py-1">
              <span className="flex skew-x-12 items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                <svg className="h-2.5 w-2.5" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
                  <polygon points="5,0 6.5,3.5 10,3.8 7.5,6.2 8.1,10 5,8.2 1.9,10 2.5,6.2 0,3.8 3.5,3.5" />
                </svg>
                Recruitment open
              </span>
            </span>

            <h2 className="text-persona mt-4 text-4xl text-fog-100 sm:text-5xl">
              Want to duel with us?
            </h2>
            <p className="mt-4 max-w-xl text-base text-fog-400">
              Think you&apos;ve got what it takes to rep DS Celebeast? Reach out to our captain directly — we&apos;re always looking for dedicated duelists.
            </p>

            {/* Contact chips */}
            <div className="mt-8 flex flex-wrap gap-4">
              {/* Discord */}
              <div
                className="clip-corner flex items-center gap-3 border border-white/15 bg-ink-900 px-5 py-3.5"
                style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.4)" }}
              >
                {/* Discord icon */}
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#5865F2" }} aria-hidden>
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-fog-600">Discord</p>
                  <p
                    className="font-display text-sm font-bold italic tracking-wide select-all"
                    style={{ color: "var(--color-brand-300)" }}
                  >
                    {DISCORD_HANDLE}
                  </p>
                </div>
              </div>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="clip-corner flex items-center gap-3 border border-white/15 bg-ink-900 px-5 py-3.5 transition-colors hover:border-white/30"
                style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.4)" }}
              >
                {/* WhatsApp icon */}
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#25D366" }} aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-fog-600">WhatsApp</p>
                  <p
                    className="font-display text-sm font-bold italic tracking-wide"
                    style={{ color: "var(--color-brand-300)" }}
                  >
                    Tap to chat →
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
