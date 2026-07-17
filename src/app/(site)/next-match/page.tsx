import { cache } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { fetchNextMatch } from "@/lib/warroom";
import NextMatchHype from "@/components/next-match-hype";

export const revalidate = 60;

const getMatch = cache(fetchNextMatch);

export async function generateMetadata(): Promise<Metadata> {
  const match = await getMatch();
  if (!match) return { title: "Next Match" };
  const label = match.public_label || match.opponent_team;
  const when = new Date(match.scheduled_at).toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
  return {
    title: `DS Celebeast vs ${label}`,
    description: `Countdown to DS Celebeast's next match${match.tournament_name ? ` — ${match.tournament_name}` : ""}, ${when}.`,
  };
}

export default async function NextMatchPage() {
  const match = await getMatch();
  if (!match) redirect("/");
  return <NextMatchHype match={match} />;
}
