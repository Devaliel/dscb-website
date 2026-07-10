/** Reusable tournament rule booklets captains can attach to a War Room match. */

export interface RulePreset {
  slug: string;
  name: string;
  format: string; // one-line summary
  deckSlots: [string, string]; // labels for the two decklist upload slots
  sections: { heading: string; body: string[] }[];
}

export const RULE_PRESETS: Record<string, RulePreset> = {
  "t2-trials": {
    slug: "t2-trials",
    name: "T2 Trials",
    format: "3v3 · Swiss · 7 weeks · 2× BO9 per match",
    deckSlots: ["Deck 1 *", "Deck 2 (optional)"],
    sections: [
      {
        heading: "Teams",
        body: [
          "3–15 players per team (1 Leader + any number of Co-Leaders).",
          "Leaders/Co-Leaders may transfer, add or remove players before playoffs.",
          "On registration, submit the team logo and every player's ID for the roster.",
        ],
      },
      {
        heading: "Deck construction",
        body: [
          "Each player submits up to TWO decks and picks which to play each duel.",
          "At most 3 copies of any card across all of the team's decks — 1 or 2 if the card is Limited / Semi-Limited.",
          "Up to 3 Shared Cards may be added to each deck (not shared across the 6 decks); Limited/Semi limits still apply per deck.",
          "Submit all decks 2 hours before the match so judges can check them.",
          "Played under the Master Duel standard banlist; a new banlist only applies from its implementation date.",
        ],
      },
      {
        heading: "Match structure",
        body: [
          "Swiss format, 7 weeks. Each set = three simultaneous duels, decided by the in-game coin flip.",
          "Decks AND players lock 5 minutes before the match starts.",
          "Report every win to the Judge. Each set lasts 60 minutes; each set is worth one point.",
          "Between duels you have 3 minutes to choose your deck and rejoin your table — failure can be a game loss.",
          "Rename to the template: [TAG] (Name) {Player #} — e.g. T2 AboHmod P1.",
        ],
      },
      {
        heading: "Match set",
        body: [
          "Two sets of BO9. Player 1 faces opp P1 → P3 → P2; Player 2 faces P2 → P1 → P3; Player 3 faces P3 → P2 → P1.",
          "After the first set, players may change their deck.",
          "If the two sets tie, play a Best-of-3 3v3 tie-breaker — first team to 2 wins takes the match.",
        ],
      },
      {
        heading: "Overtime",
        body: [
          "If time is called after 4+ turns, the player with higher LP at end of turn wins.",
          "After time is called, each match is played up to turn 4.",
        ],
      },
      {
        heading: "Penalties",
        body: [
          "Playing an unsubmitted deck = automatic game loss; not calling it out = team DQ for that week (if concluded).",
          "If caught mid-match: game loss, must continue on that deck for the rest of the set, plus a 1-week suspension.",
          "Wrong ID = game loss, and a suspension if you don't notify the judge and opponent.",
        ],
      },
      {
        heading: "Substitution (no-show / AFK)",
        body: [
          "If a player can't show 5 minutes before the match, you may sub in any roster player.",
          "A player swapped out can't return for the rest of that match, even if the absent player comes back.",
          "The leader must inform the admins before the 5-minute mark.",
        ],
      },
    ],
  },
};

export function getRulePreset(slug?: string | null): RulePreset | undefined {
  return slug ? RULE_PRESETS[slug] : undefined;
}
