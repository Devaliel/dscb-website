import type { Tier } from "./utils";

export interface Deck {
  slug: string;
  name: string;
  tier?: Tier;          // optional — only set when used in a tier-list context
  accent: string;       // hex accent driving tile glow
  signatureCardId: number; // YGOPRODeck passcode (0 = use gradient fallback)
  image?: string;       // local high-res art, e.g. /deck-art/kewl-tune.jpg (wins over passcode)
  wins: number;
  losses: number;
  usageCount: number;   // times this deck appeared in a team lineup
  description: string;
  pilotHandles: string[]; // player handles who play this deck
  sampleList: { name: string; count: number; cardId: number }[];
}

export interface Player {
  handle: string;
  name: string;
  role: "Captain" | "Vice Captain" | "Member" | "Try Out";
  tagline: string;
  bio: string;
  gameId?: string;      // Master Duel friend ID e.g. "331-001-777"
  titles: number;
  wins: number;
  losses: number;
  mainDeckSlug: string;
  socials: { label: string; url: string }[];
}

export interface TournamentResult {
  placement: number;
  playerHandle: string;
  deckSlug: string;
  wins: number;
  losses: number;
}

/** One individual match in a team-tournament round */
export interface RoundMatch {
  dsPlayerHandle: string; // our player's handle
  opponent: string;       // opponent player name (free text)
  opponentDeck?: string;  // opponent's deck archetype, e.g. "Odion Albaz"
  dsWins: number;
  dsLosses: number;
}

/** One week / stage in a team tournament */
export interface WeekLineup {
  week: string;           // "Week 1", "Semi-Final", "Final" …
  opponentTeam?: string;  // enemy team name, e.g. "Black EOS"
  main: string[];         // player handles (main roster)
  sub: string[];          // player handles (substitutes)
  deckList: { handle: string; deckName: string; deckSlug?: string }[];
  rounds?: RoundMatch[];  // populated when round-result data is available
  matchResult?: "win" | "loss"; // DS Celebeast's result for this week
}

export interface Tournament {
  slug: string;
  name: string;
  date: string;           // ISO date
  format: string;
  location: string;
  participants: number;
  type?: "individual" | "team";
  ourResult?: string;     // e.g. "Finalists", "Semi-finalists"
  weeks?: WeekLineup[];   // team-tournament weekly data
  results: TournamentResult[]; // individual-tournament results
}
