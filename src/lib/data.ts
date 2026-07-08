import type { Deck, Player, Tournament } from "./types";
import { winRate } from "./utils";

/**
 * Real DSCB team data — Jawir 2026 (all 8 phases fully recorded).
 *
 * Bracket (user-confirmed):
 *   W1    vs Alter EOS      → Loss 1-2   (3 babaks)
 *   W2    vs DS Strongholds → Win  2-0   (2 babaks, B3 not played)
 *   W3    vs UXma Musume    → Win  2-1   (3 babaks)
 *   W4    vs Rose Mansion   → Win  2-0   (2 babaks, B3 not played)
 *   W5    vs Black EOS      → Loss 1-2   (3 babaks)
 *   QF    vs DS Trishula    → Win  2-0   (2 babaks, B3 not played)
 *   SF    vs Black EOS      → Win  2-1   (3 babaks)
 *   Final vs DS Celestial   → Loss 1-2   (3 babaks)
 *
 * All W/L totals are summed per-game from the babak scores below.
 * Cross-check: Σ deck wins = Σ player wins = 90 · Σ losses = 70.
 * Card IDs of 0 use the CardArt gradient fallback until a local image exists.
 */

export const decks: Deck[] = [
  {
    slug: "kewl-tune",
    name: "Kewl Tune",
    accent: "#A855F7",
    signatureCardId: 0,
    image: "/deck-art/kewl-tune.jpg",
    wins: 33,
    losses: 21,
    usageCount: 8,
    description:
      "Cain's signature — deployed in every single phase of Jawir 2026. 33W–21L across 54 recorded games, the undisputed backbone of the DS Celebeast lineup.",
    pilotHandles: ["cain00"],
    sampleList: [],
  },
  {
    slug: "branded-despia",
    name: "Branded Despia",
    accent: "#EC4899",
    signatureCardId: 64174898,
    image: "/deck-art/branded-despia.jpg",
    wins: 15,
    losses: 6,
    usageCount: 4,
    description:
      "The team's highest win-rate tournament pick. Yuryevna went 10–2 with it across the Quarter-Final and the Final; Lonts added 5–4 in the Semi-Final. 15W–6L total.",
    pilotHandles: ["yuryevna", "Lonts94"],
    sampleList: [
      { name: "Aluber the Jester of Despia", count: 3, cardId: 64174898 },
    ],
  },
  {
    slug: "radiant-typhoon",
    name: "Radiant Typhoon",
    accent: "#F472B6",
    signatureCardId: 0,
    image: "/deck-art/radiant-typhoon.jpg",
    wins: 11,
    losses: 13,
    usageCount: 5,
    description:
      "The team's most-travelled archetype — Lonts brought it in W1, W5, the QF and the Final; Sieg piloted it in the Semi-Final. 11W–13L across 24 games.",
    pilotHandles: ["Lonts94", "sieg121"],
    sampleList: [],
  },
  {
    slug: "yummy",
    name: "Yummy",
    accent: "#FB923C",
    signatureCardId: 0,
    image: "/deck-art/yummy.jpg",
    wins: 8,
    losses: 8,
    usageCount: 3,
    description:
      "Darkzill's aggressive pick in W1, W3 and W5 — including a dominant 6–2 run against UXma Musume in Week 3. Dead even at 8W–8L.",
    pilotHandles: ["Darkzill"],
    sampleList: [],
  },
  {
    slug: "vanquish-soul",
    name: "Vanquish Soul",
    accent: "#6366F1",
    signatureCardId: 0,
    image: "/deck-art/vanquish-soul.jpg",
    wins: 11,
    losses: 9,
    usageCount: 5,
    description:
      "The team's evergreen stun-midrange engine. Darkzill and Lonts shared the VS K9 variant across Jawir 2026, and Lonts went 4–1 with it subbing into Week 5 of WMGR 2024. 11W–9L overall.",
    pilotHandles: ["Darkzill", "Lonts94"],
    sampleList: [],
  },
  {
    slug: "magnet-warrior",
    name: "Magnet Warrior",
    accent: "#EF4444",
    signatureCardId: 75347539,
    image: "/deck-art/magnet-warrior.jpg",
    wins: 7,
    losses: 5,
    usageCount: 2,
    description:
      "Sieg's calling card, deployed in W1 and W4 — including a 4–1 sweep of Rose Mansion with the Fiendsmith build. A resilient combo/control hybrid. 7W–5L.",
    pilotHandles: ["sieg121"],
    sampleList: [
      { name: "Valkyrion the Magna Warrior", count: 1, cardId: 75347539 },
    ],
  },
  {
    slug: "azamina-mitsurugi",
    name: "Azamina Mitsurugi",
    accent: "#8B5CF6",
    signatureCardId: 0,
    image: "/deck-art/azamina-mitsurugi.jpg",
    wins: 4,
    losses: 3,
    usageCount: 2,
    description:
      "Yuryevna's Sinful Spoils combo pick for Weeks 2 and 3 — 4–1 against DS Strongholds before running into SE Millenium. 4W–3L.",
    pilotHandles: ["yuryevna"],
    sampleList: [],
  },
  {
    slug: "enneacraft",
    name: "Enneacraft",
    accent: "#22D3EE",
    signatureCardId: 0,
    image: "/deck-art/enneacraft.jpg",
    wins: 3,
    losses: 2,
    usageCount: 2,
    description:
      "Sieg's late-tournament tech, on standby in the Quarter-Final and fielded in the Final — where it went 3–2 against DS Celestial's best.",
    pilotHandles: ["sieg121"],
    sampleList: [],
  },
  {
    slug: "exosister",
    name: "Exosister",
    accent: "#E2E8F0",
    signatureCardId: 0,
    image: "/deck-art/exosister.jpg",
    wins: 2,
    losses: 4,
    usageCount: 1,
    description:
      "Mev's tournament debut deck — subbed into Week 5 against Black EOS for a hard-fought 2W–4L. The GY-hating nuns will be back.",
    pilotHandles: ["mev7901"],
    sampleList: [],
  },
  /* ── WMGR 2024 archetypes ─────────────────────────────────────────── */
  {
    slug: "swordsoul",
    name: "Swordsoul",
    accent: "#67E8F9",
    signatureCardId: 0,
    image: "/deck-art/swordsoul.jpg",
    wins: 11,
    losses: 12,
    usageCount: 4,
    description:
      "Cain's WMGR 2024 workhorse — Weeks 2, 3, 4 and the Top 8 for 11W–12L, including a clean 4–1 sweep of Exclusion. Synchro midrange with an answer for everything.",
    pilotHandles: ["cain00"],
    sampleList: [],
  },
  {
    slug: "mannadium",
    name: "Mannadium",
    accent: "#34D399",
    signatureCardId: 0,
    image: "/deck-art/mannadium.jpg",
    wins: 8,
    losses: 3,
    usageCount: 2,
    description:
      "Yuryevna's WMGR 2024 pick for Weeks 2 and 3 — 8W–3L, dropping only three games across two team wins. The Visas Starfrost engine at its peak.",
    pilotHandles: ["yuryevna"],
    sampleList: [],
  },
  {
    slug: "labrynth",
    name: "Labrynth",
    accent: "#E11D48",
    signatureCardId: 0,
    image: "/deck-art/labrynth.jpg",
    wins: 7,
    losses: 6,
    usageCount: 2,
    description:
      "Shared between Lonts (a perfect 3-0 match run vs YD(A) in Week 2) and DSmajinboo (Week 4). Trap-heavy furniture control — 7W–6L in WMGR 2024.",
    pilotHandles: ["Lonts94", "awarix"],
    sampleList: [],
  },
  {
    slug: "mathmech",
    name: "Mathmech",
    accent: "#38BDF8",
    signatureCardId: 0,
    image: "/deck-art/mathmech.jpg",
    wins: 6,
    losses: 4,
    usageCount: 2,
    description:
      "Mev's WMGR 2024 opener — a flawless 3-0 match sweep of 珍獣戦線 in Week 1. Cyberse combo with one-card starters. 6W–4L overall.",
    pilotHandles: ["mev7901"],
    sampleList: [],
  },
  {
    slug: "gishiki",
    name: "Gishiki",
    accent: "#F43F5E",
    signatureCardId: 0,
    image: "/deck-art/gishiki.jpg",
    wins: 5,
    losses: 3,
    usageCount: 1,
    description:
      "Mev's ritual tech for Week 4 of WMGR 2024 — 5W–3L against YD(B), taking two of three rounds against Vanquish Soul.",
    pilotHandles: ["mev7901"],
    sampleList: [],
  },
  {
    slug: "phantom-knight",
    name: "Phantom Knight",
    accent: "#818CF8",
    signatureCardId: 0,
    image: "/deck-art/phantom-knight.jpg",
    wins: 4,
    losses: 1,
    usageCount: 1,
    description:
      "Sieg's Week 3 pick in WMGR 2024 — a 4–1 run that helped sweep Exclusion 2-0. Ghost-fiend grind with Xyz flexibility.",
    pilotHandles: ["sieg121"],
    sampleList: [],
  },
  {
    slug: "dragon-link",
    name: "Dragon Link",
    accent: "#F97316",
    signatureCardId: 0,
    image: "/deck-art/dragon-link.jpg",
    wins: 4,
    losses: 5,
    usageCount: 1,
    description:
      "Sieg's Week 1 combo pick in WMGR 2024 — clutched the deciding round against Kashtira after two narrow losses. 4W–5L.",
    pilotHandles: ["sieg121"],
    sampleList: [],
  },
  {
    slug: "branded-bystial",
    name: "Branded Bystial",
    accent: "#B45309",
    signatureCardId: 0,
    image: "/deck-art/branded-despia.jpg",
    wins: 4,
    losses: 9,
    usageCount: 2,
    description:
      "The Bystial-flavoured Branded variant. Lonts ran it in Week 1; Yuryevna took it into the Top 8 against MUGITY's Branded wall. 4W–9L across WMGR 2024.",
    pilotHandles: ["Lonts94", "yuryevna"],
    sampleList: [],
  },
  {
    slug: "snake-eyes",
    name: "Snake Eyes",
    accent: "#FB923C",
    signatureCardId: 0,
    image: "/deck-art/snake-eyes.jpg",
    wins: 5,
    losses: 10,
    usageCount: 3,
    description:
      "Fielded by Mev in Week 5 and the Top 8, and Yuryevna in Week 5. Mev won the Snake Eyes mirror in Week 5; the Top 8 vs MUGITY's Branded wall was a rougher road. 5W–10L.",
    pilotHandles: ["mev7901", "yuryevna"],
    sampleList: [],
  },
  {
    slug: "tearlaments",
    name: "Tearlaments",
    accent: "#60A5FA",
    signatureCardId: 0,
    image: "/deck-art/tearlaments.jpg",
    wins: 2,
    losses: 0,
    usageCount: 1,
    description:
      "Yuryevna's perfect cameo — subbed into Week 4, Babak 3 of WMGR 2024 and swept Labrynth 2-0 to close out the match against YD(B).",
    pilotHandles: ["yuryevna"],
    sampleList: [],
  },
  {
    slug: "tri-zoodiac",
    name: "Tri Zoodiac",
    accent: "#FACC15",
    signatureCardId: 0,
    image: "/deck-art/tri-zoodiac.jpg",
    wins: 2,
    losses: 4,
    usageCount: 1,
    description:
      "Cain's Week 5 experiment in WMGR 2024 — the Tri-Brigade Zoodiac hybrid. 2W–4L in a tough matchup spread against Stellar Trace.",
    pilotHandles: ["cain00"],
    sampleList: [],
  },
  {
    slug: "blue-eyes",
    name: "Blue-Eyes White Dragon",
    accent: "#60A5FA",
    signatureCardId: 89631139,
    image: "/deck-art/blue-eyes.jpg",
    wins: 0,
    losses: 0,
    usageCount: 0,
    description:
      "Mev's iconic archetype. The legendary Dragon towers over the field with overwhelming ATK and a battle-tested support engine.",
    pilotHandles: ["mev7901"],
    sampleList: [
      { name: "Blue-Eyes White Dragon", count: 3, cardId: 89631139 },
    ],
  },
  {
    slug: "orcust",
    name: "Orcust",
    accent: "#34D399",
    signatureCardId: 0,
    image: "/deck-art/orcust.jpg",
    wins: 0,
    losses: 0,
    usageCount: 0,
    description:
      "Lonts's favourite archetype. A machine-type grind engine that recycles resources from the GY and disrupts opponents through the Extra Deck.",
    pilotHandles: ["Lonts94"],
    sampleList: [],
  },
  {
    slug: "punk",
    name: "P.U.N.K.",
    accent: "#F59E0B",
    signatureCardId: 18221390,
    image: "/deck-art/punk.jpg",
    wins: 0,
    losses: 0,
    usageCount: 0,
    description:
      "DSmajinboo's chaotic combo deck. P.U.N.K. Special Summons from the hand and GY at minimal cost, building devastating boards in a single turn.",
    pilotHandles: ["awarix"],
    sampleList: [],
  },
  {
    slug: "ryzeal",
    name: "Ryzeal",
    accent: "#C084FC",
    signatureCardId: 0,
    image: "/deck-art/ryzeal.jpg",
    wins: 0,
    losses: 0,
    usageCount: 0,
    description:
      "Darkzill's current main outside the team tournament meta. A newer aggressive archetype that Darkzill has been pioneering within the squad.",
    pilotHandles: ["Darkzill"],
    sampleList: [],
  },
];

export const players: Player[] = [
  {
    handle: "sieg121",
    name: "DS Sieg",
    role: "Captain",
    tagline: "Magnet combo architect",
    bio: "Team captain and founding member. Sieg's deck versatility stands out — Dragon Link and Phantom Knight in WMGR 2024, then Magnet Warrior, Radiant Typhoon and Enneacraft across Jawir 2026. 22W–16L overall.",
    gameId: "331-001-777",
    titles: 0,
    wins: 22,
    losses: 16,
    mainDeckSlug: "magnet-warrior",
    socials: [],
  },
  {
    handle: "yuryevna",
    name: "DS Yuryevna",
    role: "Member",
    tagline: "Branded control specialist",
    bio: "The team's most efficient player — 25W–14L across two tournaments, from Mannadium and Tearlaments in WMGR 2024 to a dominant 10–2 Branded Despia run in the Jawir 2026 playoffs. A win rate that speaks for itself.",
    gameId: "498-595-485",
    titles: 0,
    wins: 25,
    losses: 14,
    mainDeckSlug: "branded-despia",
    socials: [],
  },
  {
    handle: "cain00",
    name: "DS Cain",
    role: "Vice Captain",
    tagline: "Team ace — never misses",
    bio: "Cain played every phase of Jawir 2026 with Kewl Tune (33W–21L across 54 games) after grinding Swordsoul and Tri Zoodiac through WMGR 2024. The squad's iron man — 46W–37L career.",
    gameId: "798-514-613",
    titles: 0,
    wins: 46,
    losses: 37,
    mainDeckSlug: "kewl-tune",
    socials: [],
  },
  {
    handle: "mev7901",
    name: "DS Mev",
    role: "Member",
    tagline: "Blue-Eyes tactician",
    bio: "A WMGR 2024 mainstay — Mathmech, Gishiki and Snake Eyes across the group stage and Top 8, including a flawless Week 1 sweep. Returned in Jawir 2026 with an Exosister cameo. 18W–19L career.",
    gameId: "411-280-170",
    titles: 0,
    wins: 18,
    losses: 19,
    mainDeckSlug: "blue-eyes",
    socials: [],
  },
  {
    handle: "Lonts94",
    name: "Lonts",
    role: "Member",
    tagline: "Orcust grind machine",
    bio: "An Orcust main who adapts to whatever the team needs — Labrynth and Branded Bystial in WMGR 2024, then Radiant Typhoon, Vanquish Soul and Branded Despia across Jawir 2026. 28W–25L across all recorded rounds.",
    gameId: "603-946-920",
    titles: 0,
    wins: 28,
    losses: 25,
    mainDeckSlug: "orcust",
    socials: [],
  },
  {
    handle: "awarix",
    name: "DSmajinboo",
    role: "Member",
    tagline: "P.U.N.K. chaos engine",
    bio: "DSmajinboo's P.U.N.K. deck defies convention — a one-turn combo specialist who builds intimidating boards. Made his tournament debut on Labrynth in Week 4 of WMGR 2024.",
    gameId: "434-385-335",
    titles: 0,
    wins: 1,
    losses: 4,
    mainDeckSlug: "punk",
    socials: [],
  },
  {
    handle: "Darkzill",
    name: "Darkzill",
    role: "Member",
    tagline: "Ryzeal pioneer",
    bio: "Darkzill adapts every week — Yummy in W1/W3/W5, Vanquish Soul K9 in W2 and W4. His 6–2 Yummy rampage carried Week 3 against UXma Musume. 12W–13L in recorded games.",
    gameId: "694-725-759",
    titles: 0,
    wins: 12,
    losses: 13,
    mainDeckSlug: "ryzeal",
    socials: [],
  },
];

export const tournaments: Tournament[] = [
  {
    slug: "jawir-2026",
    name: "Jawir 2026",
    date: "2026-07-01",
    format: "Team · Best of 3 babaks per match",
    location: "Online (DS Guild)",
    participants: 8,
    type: "team",
    ourResult: "Finalists",
    results: [],
    weeks: [
      /* ── Week 1 · vs Alter EOS · Loss 1-2 ────────────────────────── */
      {
        week: "Week 1",
        opponentTeam: "Alter EOS",
        main: ["sieg121", "cain00", "Darkzill"],
        sub: ["Lonts94"],
        deckList: [
          { handle: "sieg121",  deckName: "Magnet Warrior",  deckSlug: "magnet-warrior" },
          { handle: "cain00",   deckName: "Kewl Tune",       deckSlug: "kewl-tune" },
          { handle: "Darkzill", deckName: "Yummy",           deckSlug: "yummy" },
          { handle: "Lonts94",  deckName: "Radiant Typhoon", deckSlug: "radiant-typhoon" },
        ],
        matchResult: "loss",
        rounds: [
          // Babak 1 — DS Celebeast Win
          { dsPlayerHandle: "sieg121",  opponent: "Dino",    opponentDeck: "Radian Typhoon", dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "Darkzill", opponent: "Xycross", opponentDeck: "VS K9",          dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "cain00",   opponent: "Hann",    opponentDeck: "LunaLight",      dsWins: 2, dsLosses: 0 },
          // Babak 2 — Alter EOS Win
          { dsPlayerHandle: "sieg121",  opponent: "Xycross", opponentDeck: "VS K9",          dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "Darkzill", opponent: "Hann",    opponentDeck: "LunaLight",      dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "cain00",   opponent: "Dino",    opponentDeck: "Radian Typhoon", dsWins: 2, dsLosses: 1 },
          // Babak 3 — Alter EOS Win (Lonts subs in)
          { dsPlayerHandle: "Lonts94",  opponent: "Xycross", opponentDeck: "VS K9",          dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "cain00",   opponent: "Hann",    opponentDeck: "LunaLight",      dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "sieg121",  opponent: "Dino",    opponentDeck: "Radian Typhoon", dsWins: 0, dsLosses: 2 },
        ],
      },

      /* ── Week 2 · vs DS Strongholds · Win 2-0 ────────────────────── */
      {
        week: "Week 2",
        opponentTeam: "DS Strongholds",
        main: ["Darkzill", "yuryevna", "cain00"],
        sub: ["sieg121"],
        deckList: [
          { handle: "Darkzill", deckName: "VS K9",              deckSlug: "vanquish-soul" },
          { handle: "yuryevna", deckName: "Azamina Mitsurugi",  deckSlug: "azamina-mitsurugi" },
          { handle: "cain00",   deckName: "Kewl Tune",          deckSlug: "kewl-tune" },
          { handle: "sieg121",  deckName: "Magnet Warrior",     deckSlug: "magnet-warrior" },
        ],
        matchResult: "win",
        rounds: [
          // Babak 1 — DS Celebeast Win
          { dsPlayerHandle: "Darkzill", opponent: "Firewall",  opponentDeck: "VS K9",       dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "yuryevna", opponent: "Painmaker", opponentDeck: "Yummy Solfa", dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "cain00",   opponent: "Lisheru",   opponentDeck: "Sky Striker", dsWins: 2, dsLosses: 1 },
          // Babak 2 — DS Celebeast Win (match clinched 2-0, B3 not played)
          { dsPlayerHandle: "Darkzill", opponent: "Painmaker", opponentDeck: "Yummy Solfa", dsWins: 0, dsLosses: 2 },
          { dsPlayerHandle: "yuryevna", opponent: "Lisheru",   opponentDeck: "Sky Striker", dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "cain00",   opponent: "Firewall",  opponentDeck: "VS K9",       dsWins: 2, dsLosses: 1 },
        ],
      },

      /* ── Week 3 · vs UXma Musume · Win 2-1 ───────────────────────── */
      {
        week: "Week 3",
        opponentTeam: "UXma Musume",
        main: ["yuryevna", "Darkzill", "cain00"],
        sub: ["Lonts94"],
        deckList: [
          { handle: "yuryevna", deckName: "Azamina Mitsurugi", deckSlug: "azamina-mitsurugi" },
          { handle: "Darkzill", deckName: "Yummy",             deckSlug: "yummy" },
          { handle: "cain00",   deckName: "Kewl Tune",         deckSlug: "kewl-tune" },
          { handle: "Lonts94",  deckName: "VS K9",             deckSlug: "vanquish-soul" },
        ],
        matchResult: "win",
        rounds: [
          // Babak 1 — UXma Musume Win
          { dsPlayerHandle: "yuryevna", opponent: "Lucky Lilac", opponentDeck: "SE Millenium",    dsWins: 0, dsLosses: 2 },
          { dsPlayerHandle: "Darkzill", opponent: "Qiqik",       opponentDeck: "Ryzeal Mitsu",    dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "cain00",   opponent: "Annova",      opponentDeck: "VS K9",           dsWins: 1, dsLosses: 2 },
          // Babak 2 — DS Celebeast Win (Lonts subs in for Yuryevna)
          { dsPlayerHandle: "cain00",   opponent: "Lucky Lilac", opponentDeck: "SE Millenium",    dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94",  opponent: "Qiqik",       opponentDeck: "Ryzeal Mitsu",    dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "Darkzill", opponent: "Annova",      opponentDeck: "VS K9",           dsWins: 2, dsLosses: 0 },
          // Babak 3 — DS Celebeast Win
          { dsPlayerHandle: "cain00",   opponent: "Annova",      opponentDeck: "VS K9",           dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "Lonts94",  opponent: "Qiqik",       opponentDeck: "Ryzeal Mitsu",    dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "Darkzill", opponent: "KingDL",      opponentDeck: "Radiant Typhoon", dsWins: 2, dsLosses: 1 },
        ],
      },

      /* ── Week 4 · vs Rose Mansion · Win 2-0 ──────────────────────── */
      {
        week: "Week 4",
        opponentTeam: "Rose Mansion",
        main: ["sieg121", "Darkzill", "cain00"],
        sub: ["yuryevna"],
        deckList: [
          { handle: "sieg121",  deckName: "Magnet FS",      deckSlug: "magnet-warrior" },
          { handle: "Darkzill", deckName: "VS K9",          deckSlug: "vanquish-soul" },
          { handle: "cain00",   deckName: "Kewl Tune",      deckSlug: "kewl-tune" },
          { handle: "yuryevna", deckName: "Branded Albaz",  deckSlug: "branded-despia" },
        ],
        matchResult: "win",
        rounds: [
          // Babak 1 — DS Celebeast Win
          { dsPlayerHandle: "sieg121",  opponent: "[RM] NDL",     opponentDeck: "SS Tenpai",   dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "Darkzill", opponent: "[RM] Kurnn",   opponentDeck: "Elfnote",     dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "cain00",   opponent: "[RM] Sterben", opponentDeck: "Morphtronic", dsWins: 2, dsLosses: 0 },
          // Babak 2 — DS Celebeast Win (match clinched 2-0, B3 not played)
          { dsPlayerHandle: "sieg121",  opponent: "[RM] NVRL",    opponentDeck: "VS K9",       dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "Darkzill", opponent: "[RM] NDL",     opponentDeck: "SS Tenpai",   dsWins: 0, dsLosses: 2 },
          { dsPlayerHandle: "cain00",   opponent: "[RM] Kurnn",   opponentDeck: "Elfnote",     dsWins: 2, dsLosses: 0 },
        ],
      },

      /* ── Week 5 · vs Black EOS · Loss 1-2 ────────────────────────── */
      {
        week: "Week 5",
        opponentTeam: "Black EOS",
        main: ["cain00", "Lonts94", "Darkzill"],
        sub: ["mev7901"],
        deckList: [
          { handle: "cain00",   deckName: "Kewl Tune",  deckSlug: "kewl-tune" },
          { handle: "Lonts94",  deckName: "SS Radiant", deckSlug: "radiant-typhoon" },
          { handle: "Darkzill", deckName: "Yummy",      deckSlug: "yummy" },
          { handle: "mev7901",  deckName: "Exosister",  deckSlug: "exosister" },
        ],
        matchResult: "loss",
        rounds: [
          // Babak 1 — Black EOS Win
          { dsPlayerHandle: "cain00",   opponent: "Akasaka", opponentDeck: "Kewl Tune",  dsWins: 0, dsLosses: 2 },
          { dsPlayerHandle: "Lonts94",  opponent: "Fosca",   opponentDeck: "Odion",      dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "Darkzill", opponent: "Mofoo",   opponentDeck: "Radiant SS", dsWins: 0, dsLosses: 2 },
          // Babak 2 — DS Celebeast Win (Mev subs in for Darkzill)
          { dsPlayerHandle: "Lonts94",  opponent: "Akasaka", opponentDeck: "Kewl Tune",  dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "cain00",   opponent: "Fosca",   opponentDeck: "Odion",      dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "mev7901",  opponent: "Mofoo",   opponentDeck: "Radiant SS", dsWins: 1, dsLosses: 2 },
          // Babak 3 — Black EOS Win
          { dsPlayerHandle: "Lonts94",  opponent: "AMW01",   opponentDeck: "Magnet",     dsWins: 0, dsLosses: 2 },
          { dsPlayerHandle: "cain00",   opponent: "Mofoo",   opponentDeck: "Radiant SS", dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "mev7901",  opponent: "Akasaka", opponentDeck: "Kewl Tune",  dsWins: 1, dsLosses: 2 },
        ],
      },

      /* ── Quarter-Final · vs DS Trishula · Win 2-0 ────────────────── */
      {
        week: "Quarter-Final",
        opponentTeam: "DS Trishula",
        main: ["yuryevna", "cain00", "Lonts94"],
        sub: ["sieg121"],
        deckList: [
          { handle: "yuryevna", deckName: "Branded Albaz",  deckSlug: "branded-despia" },
          { handle: "cain00",   deckName: "Kewl Tune",      deckSlug: "kewl-tune" },
          { handle: "Lonts94",  deckName: "Sky Striker RT", deckSlug: "radiant-typhoon" },
          { handle: "sieg121",  deckName: "Enneacraft",     deckSlug: "enneacraft" },
        ],
        matchResult: "win",
        rounds: [
          // Babak 1 — DS Celebeast Win
          { dsPlayerHandle: "yuryevna", opponent: "Jozuu",  opponentDeck: "FS-WF-Azamina", dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "cain00",   opponent: "Durian", opponentDeck: "Kewl Tune",     dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94",  opponent: "Envoee", opponentDeck: "Branded Albaz", dsWins: 1, dsLosses: 0 },
          // Babak 2 — DS Celebeast Win (match clinched 2-0, B3 not played)
          { dsPlayerHandle: "yuryevna", opponent: "Sibey",  opponentDeck: "P.U.N.K K9",    dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "cain00",   opponent: "Envoee", opponentDeck: "Branded Albaz", dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94",  opponent: "Durian", opponentDeck: "Kewl Tune",     dsWins: 0, dsLosses: 2 },
        ],
      },

      /* ── Semi-Final · vs Black EOS · Win 2-1 ─────────────────────── */
      {
        week: "Semi-Final",
        opponentTeam: "Black EOS",
        main: ["sieg121", "Lonts94", "cain00"],
        sub: ["Darkzill"],
        deckList: [
          { handle: "sieg121",  deckName: "Radiant Typhoon", deckSlug: "radiant-typhoon" },
          { handle: "Lonts94",  deckName: "Branded Albaz",   deckSlug: "branded-despia" },
          { handle: "cain00",   deckName: "Kewl Tune",       deckSlug: "kewl-tune" },
          { handle: "Darkzill", deckName: "VS K9",           deckSlug: "vanquish-soul" },
        ],
        matchResult: "win",
        rounds: [
          // Babak 1 — Black EOS Win
          { dsPlayerHandle: "sieg121", opponent: "Fosca",     opponentDeck: "Odion Albaz", dsWins: 0, dsLosses: 2 },
          { dsPlayerHandle: "Lonts94", opponent: "Aoruakasa", opponentDeck: "Kewl Tune",   dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "cain00",  opponent: "Pemtrik",   opponentDeck: "VS K9",       dsWins: 1, dsLosses: 2 },
          // Babak 2 — DS Celebeast Win
          { dsPlayerHandle: "sieg121", opponent: "Fosca",     opponentDeck: "Odion Albaz", dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94", opponent: "Aoruakasa", opponentDeck: "Kewl Tune",   dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "cain00",  opponent: "Pemtrik",   opponentDeck: "VS K9",       dsWins: 2, dsLosses: 1 },
          // Babak 3 — DS Celebeast Win
          { dsPlayerHandle: "sieg121", opponent: "Aoruakasa", opponentDeck: "Kewl Tune",   dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "Lonts94", opponent: "Pemtrik",   opponentDeck: "VS K9",       dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "cain00",  opponent: "Mofoo",     opponentDeck: "Sky Striker", dsWins: 0, dsLosses: 2 },
        ],
      },

      /* ── Final · vs DS Celestial · Loss 1-2 ──────────────────────── */
      {
        week: "Final",
        opponentTeam: "DS Celestial",
        main: ["cain00", "yuryevna", "Lonts94"],
        sub: ["sieg121"],
        deckList: [
          { handle: "cain00",   deckName: "Kewl Tune",       deckSlug: "kewl-tune" },
          { handle: "yuryevna", deckName: "Branded Albaz",   deckSlug: "branded-despia" },
          { handle: "Lonts94",  deckName: "Radiant Typhoon", deckSlug: "radiant-typhoon" },
          { handle: "sieg121",  deckName: "Enneacraft",      deckSlug: "enneacraft" },
        ],
        matchResult: "loss",
        rounds: [
          // Babak 1 — DS Celestial Win
          { dsPlayerHandle: "cain00",   opponent: "Codename87", opponentDeck: "Kewl Tune Elfnote", dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "yuryevna", opponent: "Arcy",       opponentDeck: "Branded Albaz",     dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94",  opponent: "Pegasus",    opponentDeck: "RT Zoodiac",        dsWins: 1, dsLosses: 2 },
          // Babak 2 — DS Celebeast Win (Sieg subs in for Lonts)
          { dsPlayerHandle: "yuryevna", opponent: "Codename87", opponentDeck: "Kewl Tune Elfnote", dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "sieg121",  opponent: "Arcy",       opponentDeck: "Branded Albaz",     dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "cain00",   opponent: "Pegasus",    opponentDeck: "RT Zoodiac",        dsWins: 1, dsLosses: 2 },
          // Babak 3 — DS Celestial Win
          { dsPlayerHandle: "yuryevna", opponent: "Codename87", opponentDeck: "Kewl Tune Elfnote", dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "sieg121",  opponent: "Pegasus",    opponentDeck: "RT Zoodiac",        dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "cain00",   opponent: "Septiner",   opponentDeck: "Yubel FS",          dsWins: 1, dsLosses: 2 },
        ],
      },
    ],
  },

  /* ════════════════════════════════════════════════════════════════════
   * WMGR 2024 — World Master Duel Grand Prix (5 group-stage weeks recorded;
   * playoff scorecards pending from the owner).
   * Cross-check: Σ deck wins = Σ player wins = 59 · Σ losses = 46.
   * ════════════════════════════════════════════════════════════════════ */
  {
    slug: "wmgr-2024",
    name: "WMGR 2024",
    date: "2024-01-19",
    format: "Team · Best of 3 babaks per match",
    location: "Online (World Master Duel Grand Prix)",
    participants: 8,
    type: "team",
    ourResult: "Group stage 4–1 · Top 8 (0–2 vs MUGITY)",
    results: [],
    weeks: [
      /* ── Week 1 · vs 珍獣戦線 · Win 2-1 ──────────────────────────── */
      {
        week: "Week 1",
        opponentTeam: "珍獣戦線",
        main: ["mev7901", "Lonts94", "sieg121"],
        sub: ["yuryevna"],
        deckList: [
          { handle: "mev7901", deckName: "Mathmech",        deckSlug: "mathmech" },
          { handle: "Lonts94", deckName: "Branded Bystial", deckSlug: "branded-bystial" },
          { handle: "sieg121", deckName: "Dragon Link",     deckSlug: "dragon-link" },
        ],
        matchResult: "win",
        rounds: [
          // Babak 1 — 珍獣戦線 Win
          { dsPlayerHandle: "mev7901", opponent: "のりさん",  opponentDeck: "Vanquish Soul",   dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "Lonts94", opponent: "クマガ",    opponentDeck: "SHS",             dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "sieg121", opponent: "Rexcrooz",  opponentDeck: "Branded Bystial", dsWins: 1, dsLosses: 2 },
          // Babak 2 — Celebeast Win
          { dsPlayerHandle: "Lonts94", opponent: "のりさん",  opponentDeck: "Vanquish Soul",   dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "mev7901", opponent: "クマガ",    opponentDeck: "SHS",             dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "sieg121", opponent: "Rexcrooz",  opponentDeck: "Branded Bystial", dsWins: 1, dsLosses: 2 },
          // Babak 3 — Celebeast Win
          { dsPlayerHandle: "Lonts94", opponent: "Rexcrooz",  opponentDeck: "Branded Bystial", dsWins: 0, dsLosses: 2 },
          { dsPlayerHandle: "mev7901", opponent: "のりさん",  opponentDeck: "Vanquish Soul",   dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "sieg121", opponent: "反転",      opponentDeck: "Kashtira",        dsWins: 2, dsLosses: 1 },
        ],
      },

      /* ── Week 2 · vs YD(A) · Win 2-1 ─────────────────────────────── */
      {
        week: "Week 2",
        opponentTeam: "YD(A)",
        main: ["Lonts94", "mev7901", "yuryevna"],
        sub: ["cain00"],
        deckList: [
          { handle: "Lonts94",  deckName: "Labrynth",  deckSlug: "labrynth" },
          { handle: "mev7901",  deckName: "Mathmech",  deckSlug: "mathmech" },
          { handle: "yuryevna", deckName: "Mannadium", deckSlug: "mannadium" },
          { handle: "cain00",   deckName: "Swordsoul", deckSlug: "swordsoul" },
        ],
        matchResult: "win",
        rounds: [
          // Babak 1 — YD(A) Win (Yuryevna's B1 deck unrecorded on the scorecard)
          { dsPlayerHandle: "Lonts94",  opponent: "Monder",   opponentDeck: "Labrynth", dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "mev7901",  opponent: "Stardust", opponentDeck: "Labrynth", dsWins: 0, dsLosses: 2 },
          { dsPlayerHandle: "yuryevna", opponent: "virus",                              dsWins: 0, dsLosses: 2 },
          // Babak 2 — Celebeast Win (Cain subs in for Mev)
          { dsPlayerHandle: "cain00",   opponent: "Monder",   opponentDeck: "Labrynth",        dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "yuryevna", opponent: "Stardust", opponentDeck: "Labrynth",        dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94",  opponent: "virus",    opponentDeck: "Branded Bystial", dsWins: 2, dsLosses: 0 },
          // Babak 3 — Celebeast Win
          { dsPlayerHandle: "cain00",   opponent: "Monder",   opponentDeck: "Labrynth",        dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "yuryevna", opponent: "virus",    opponentDeck: "Branded Bystial", dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94",  opponent: "Stardust", opponentDeck: "Labrynth",        dsWins: 2, dsLosses: 1 },
        ],
      },

      /* ── Week 3 · vs Exclusion · Win 2-0 ─────────────────────────── */
      {
        week: "Week 3",
        opponentTeam: "Exclusion",
        main: ["sieg121", "yuryevna", "cain00"],
        sub: ["mev7901"],
        deckList: [
          { handle: "sieg121",  deckName: "Phantom Knight", deckSlug: "phantom-knight" },
          { handle: "yuryevna", deckName: "Mannadium",      deckSlug: "mannadium" },
          { handle: "cain00",   deckName: "Swordsoul",      deckSlug: "swordsoul" },
        ],
        matchResult: "win",
        rounds: [
          // Babak 1 — Celebeast Win
          { dsPlayerHandle: "sieg121",  opponent: "チェダッカ〜!",   opponentDeck: "Tearlaments", dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "yuryevna", opponent: "じょがい",       opponentDeck: "Mannadium",   dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "cain00",   opponent: "純白のちくわ",   opponentDeck: "Dark World",  dsWins: 2, dsLosses: 0 },
          // Babak 2 — Celebeast Win (match clinched 2-0, B3 not played)
          { dsPlayerHandle: "sieg121",  opponent: "じょがい",       opponentDeck: "Mannadium",   dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "yuryevna", opponent: "純白のちくわ",   opponentDeck: "Dark World",  dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "cain00",   opponent: "チェダッカ〜!",   opponentDeck: "Tearlaments", dsWins: 2, dsLosses: 1 },
        ],
      },

      /* ── Week 4 · vs YD(B) · Win 2-1 ─────────────────────────────── */
      {
        week: "Week 4",
        opponentTeam: "YD(B)",
        main: ["awarix", "mev7901", "cain00"],
        sub: ["yuryevna"],
        deckList: [
          { handle: "awarix",   deckName: "Labrynth",    deckSlug: "labrynth" },
          { handle: "mev7901",  deckName: "Gishiki",     deckSlug: "gishiki" },
          { handle: "cain00",   deckName: "Swordsoul",   deckSlug: "swordsoul" },
          { handle: "yuryevna", deckName: "Tearlaments", deckSlug: "tearlaments" },
        ],
        matchResult: "win",
        rounds: [
          // Babak 1 — Celebeast Win
          { dsPlayerHandle: "awarix",   opponent: "DARK",    opponentDeck: "Labrynth",         dsWins: 0, dsLosses: 2 },
          { dsPlayerHandle: "mev7901",  opponent: "Aban",    opponentDeck: "Vanquish Soul",    dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "cain00",   opponent: "Diavolo", opponentDeck: "Snake Eyes R-ACE", dsWins: 2, dsLosses: 0 },
          // Babak 2 — YD(B) Win
          { dsPlayerHandle: "awarix",   opponent: "MSB",     opponentDeck: "Vanquish Soul",    dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "mev7901",  opponent: "DARK",    opponentDeck: "Labrynth",         dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "cain00",   opponent: "Aban",    opponentDeck: "Vanquish Soul",    dsWins: 1, dsLosses: 2 },
          // Babak 3 — Celebeast Win (Yuryevna subs in for Awarix)
          { dsPlayerHandle: "cain00",   opponent: "MSB",     opponentDeck: "Vanquish Soul",    dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "yuryevna", opponent: "DARK",    opponentDeck: "Labrynth",         dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "mev7901",  opponent: "Aban",    opponentDeck: "Vanquish Soul",    dsWins: 2, dsLosses: 0 },
        ],
      },

      /* ── Week 5 · vs Stellar Trace · Loss 1-2 ────────────────────── */
      {
        week: "Week 5",
        opponentTeam: "Stellar Trace",
        main: ["mev7901", "cain00", "yuryevna"],
        sub: ["Lonts94"],
        deckList: [
          { handle: "mev7901",  deckName: "Snake Eyes",    deckSlug: "snake-eyes" },
          { handle: "cain00",   deckName: "Tri Zoodiac",   deckSlug: "tri-zoodiac" },
          { handle: "yuryevna", deckName: "Snake Eyes",    deckSlug: "snake-eyes" },
          { handle: "Lonts94",  deckName: "Vanquish Soul", deckSlug: "vanquish-soul" },
        ],
        matchResult: "loss",
        rounds: [
          // Babak 1 — Stellar Trace Win
          { dsPlayerHandle: "mev7901",  opponent: "暗星破碎",  opponentDeck: "Snake Eyes",      dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "cain00",   opponent: "Tang",      opponentDeck: "Labrynth",        dsWins: 0, dsLosses: 2 },
          { dsPlayerHandle: "yuryevna", opponent: "Nightmare", opponentDeck: "Branded Bystial", dsWins: 0, dsLosses: 2 },
          // Babak 2 — Celebeast Win (Lonts subs in for Yuryevna)
          { dsPlayerHandle: "cain00",   opponent: "暗星破碎",  opponentDeck: "Snake Eyes",      dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94",  opponent: "Tang",      opponentDeck: "Labrynth",        dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "mev7901",  opponent: "Nightmare", opponentDeck: "Branded Bystial", dsWins: 0, dsLosses: 2 },
          // Babak 3 — Stellar Trace Win
          { dsPlayerHandle: "cain00",   opponent: "Tang",      opponentDeck: "Labrynth",        dsWins: 0, dsLosses: 2 },
          { dsPlayerHandle: "Lonts94",  opponent: "Nightmare", opponentDeck: "Branded Bystial", dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "mev7901",  opponent: "小米粥",    opponentDeck: "Fusion GS",       dsWins: 1, dsLosses: 2 },
        ],
      },

      /* ── Top 8 · vs MUGITY · Loss 0-2 ────────────────────────────── */
      {
        week: "Top 8",
        opponentTeam: "MUGITY",
        main: ["mev7901", "yuryevna", "cain00"],
        sub: [],
        deckList: [
          { handle: "mev7901",  deckName: "Snake Eyes",      deckSlug: "snake-eyes" },
          { handle: "yuryevna", deckName: "Branded Bystial", deckSlug: "branded-bystial" },
          { handle: "cain00",   deckName: "Swordsoul",       deckSlug: "swordsoul" },
        ],
        matchResult: "loss",
        rounds: [
          // Babak 1 — MUGITY Win
          { dsPlayerHandle: "mev7901",  opponent: "あずにゃん", opponentDeck: "SHS",             dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "yuryevna", opponent: "Rain",      opponentDeck: "Branded Bystial", dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "cain00",   opponent: "くまだい",  opponentDeck: "Branded Bystial", dsWins: 0, dsLosses: 2 },
          // Babak 2 — MUGITY Win (match clinched 0-2, B3 not played)
          { dsPlayerHandle: "cain00",   opponent: "あずにゃん", opponentDeck: "SHS",             dsWins: 0, dsLosses: 2 },
          { dsPlayerHandle: "mev7901",  opponent: "Rain",      opponentDeck: "Branded Bystial", dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "yuryevna", opponent: "くまだい",  opponentDeck: "Branded Bystial", dsWins: 0, dsLosses: 2 },
        ],
      },
    ],
  },
];

/* ------- accessors ------- */

/** Tournament decks only (used in at least one lineup) — usageCount desc, then winRate desc */
export function getDecks() {
  return decks
    .filter((d) => d.usageCount > 0)
    .sort((a, b) => {
      if (b.usageCount !== a.usageCount) return b.usageCount - a.usageCount;
      return winRate(b.wins, b.losses) - winRate(a.wins, a.losses);
    });
}
/** Decks grouped by tournament (newest first). Each section only includes decks
 *  that appeared in that tournament's lineups, sorted by per-tournament lineup slots. */
export function getDecksByTournament(): { slug: string; name: string; ourResult?: string; decks: import("./types").Deck[] }[] {
  return getTournaments()
    .filter((t) => t.weeks && t.weeks.length > 0)
    .map((t) => {
      // count lineup slots per deck within this tournament
      const localCount: Record<string, number> = {};
      for (const w of t.weeks!)
        for (const d of w.deckList)
          if (d.deckSlug) localCount[d.deckSlug] = (localCount[d.deckSlug] ?? 0) + 1;

      const tDecks = decks
        .filter((d) => d.slug in localCount)
        .sort((a, b) => {
          const diff = (localCount[b.slug] ?? 0) - (localCount[a.slug] ?? 0);
          return diff !== 0 ? diff : winRate(b.wins, b.losses) - winRate(a.wins, a.losses);
        });

      return { slug: t.slug, name: t.name, ourResult: t.ourResult, decks: tDecks };
    });
}

/** Every deck, including player favorites never fielded in a lineup */
export function getAllDecks() {
  return decks;
}
export function getDeck(slug: string) {
  return decks.find((d) => d.slug === slug);
}
export function getPlayers() {
  return players;
}
export function getPlayer(handle: string) {
  return players.find((p) => p.handle === handle);
}
export function getTournaments() {
  return [...tournaments].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}
export function getTournament(slug: string) {
  return tournaments.find((t) => t.slug === slug);
}

/** Maps free-text opponent deck strings → our deck slugs */
const opponentAlias: Record<string, string> = {
  "vs k9":             "vanquish-soul",
  "radian typhoon":    "radiant-typhoon",
  "radiant ss":        "radiant-typhoon",
  "rt zoodiac":        "radiant-typhoon",
  "kewl tune":         "kewl-tune",
  "kewl tune elfnote": "kewl-tune",
  "yummy solfa":       "yummy",
  "branded albaz":     "branded-despia",
  "magnet":            "magnet-warrior",
  // WMGR 2024 opponents
  "vanquish soul":     "vanquish-soul",
  "labrynth":          "labrynth",
  "branded bystial":   "branded-bystial",
  "mannadium":         "mannadium",
  "tearlaments":       "tearlaments",
  "snake eyes":        "snake-eyes",
};

/** Builds the deck list + head-to-head W/L tally for a tournament, from real round data. */
function buildTournamentTally(slug: string) {
  const t = getTournament(slug);
  if (!t?.weeks) return null;

  // collect deck slugs fielded in this tournament + how many lineup slots each filled
  const localUsage: Record<string, number> = {};
  for (const w of t.weeks)
    for (const d of w.deckList)
      if (d.deckSlug) localUsage[d.deckSlug] = (localUsage[d.deckSlug] ?? 0) + 1;

  const list = getAllDecks().filter((d) => d.slug in localUsage);
  if (list.length < 2) return null;

  const tally: Record<string, Record<string, { w: number; l: number }>> = {};
  for (const a of list) {
    tally[a.slug] = {};
    for (const b of list) tally[a.slug][b.slug] = { w: 0, l: 0 };
  }

  for (const w of t.weeks) {
    for (const r of w.rounds ?? []) {
      const ourSlug   = w.deckList.find((d) => d.handle === r.dsPlayerHandle)?.deckSlug;
      const theirSlug = r.opponentDeck ? opponentAlias[r.opponentDeck.toLowerCase()] : undefined;
      if (!ourSlug || !theirSlug) continue;
      if (!tally[ourSlug] || !tally[theirSlug]) continue;
      if (ourSlug === theirSlug) {
        // mirror match — add once, not twice
        tally[ourSlug][theirSlug].w += r.dsWins;
        tally[ourSlug][theirSlug].l += r.dsLosses;
      } else {
        tally[ourSlug][theirSlug].w += r.dsWins;
        tally[ourSlug][theirSlug].l += r.dsLosses;
        tally[theirSlug][ourSlug].w += r.dsLosses;
        tally[theirSlug][ourSlug].l += r.dsWins;
      }
    }
  }

  return { list, tally, localUsage };
}

/** Real head-to-head win rates computed from recorded rounds in a specific tournament. */
export function getTournamentMatchupMatrix(slug: string) {
  const built = buildTournamentTally(slug);
  if (!built) return null;
  const { list, tally } = built;

  const rows: (number | null)[][] = list.map((a) =>
    list.map((b) => {
      const { w, l } = tally[a.slug][b.slug];
      return w + l === 0 ? null : Math.round((w / (w + l)) * 100);
    })
  );
  return { decks: list, rows };
}

/** Short, real-data-driven meta summary for a tournament's most-fielded deck. */
export function getTournamentMetaAnalyst(slug: string) {
  const built = buildTournamentTally(slug);
  if (!built) return null;
  const { list, tally, localUsage } = built;

  // most-fielded within THIS tournament, not by career usage
  const topDeck = [...list].sort((a, b) => (localUsage[b.slug] ?? 0) - (localUsage[a.slug] ?? 0))[0];
  if (!topDeck) return null;

  const matchups = list
    .filter((d) => d.slug !== topDeck.slug)
    .map((d) => {
      const { w, l } = tally[topDeck.slug][d.slug];
      return { deck: d, wr: w + l === 0 ? null : Math.round((w / (w + l)) * 100), games: w + l };
    })
    .filter((m) => m.wr !== null && m.games >= 2) as { deck: Deck; wr: number; games: number }[];

  const best = matchups.length ? matchups.reduce((a, b) => (b.wr > a.wr ? b : a)) : null;
  const worst = matchups.length ? matchups.reduce((a, b) => (b.wr < a.wr ? b : a)) : null;
  const sameMatchup = best && worst && best.deck.slug === worst.deck.slug;

  return { topDeck, topDeckUsage: localUsage[topDeck.slug] ?? 0, best, worst: sameMatchup ? null : worst };
}

/** Every phase a deck was fielded in, across all team tournaments — with pilot and W/L. */
export function getDeckUsage(deckSlug: string) {
  const usage: {
    tournamentSlug: string;
    tournamentName: string;
    week: string;
    opponentTeam?: string;
    playerHandle: string;
    isSub: boolean;
    wins: number;
    losses: number;
    matchResult?: "win" | "loss";
  }[] = [];

  for (const t of getTournaments()) {
    if (!t.weeks) continue;
    for (const w of t.weeks) {
      for (const entry of w.deckList) {
        if (entry.deckSlug !== deckSlug) continue;
        const myRounds = (w.rounds ?? []).filter((r) => r.dsPlayerHandle === entry.handle);
        usage.push({
          tournamentSlug: t.slug,
          tournamentName: t.name,
          week: w.week,
          opponentTeam: w.opponentTeam,
          playerHandle: entry.handle,
          isSub: w.sub.includes(entry.handle),
          wins: myRounds.reduce((s, r) => s + r.dsWins, 0),
          losses: myRounds.reduce((s, r) => s + r.dsLosses, 0),
          matchResult: w.matchResult,
        });
      }
    }
  }
  return usage;
}

/** Aggregated per-pilot record on a deck, from real round data. */
export function getDeckPilots(deckSlug: string) {
  const byHandle = new Map<string, { wins: number; losses: number; phases: number }>();
  for (const u of getDeckUsage(deckSlug)) {
    const cur = byHandle.get(u.playerHandle) ?? { wins: 0, losses: 0, phases: 0 };
    cur.wins += u.wins;
    cur.losses += u.losses;
    cur.phases += 1;
    byHandle.set(u.playerHandle, cur);
  }
  return [...byHandle.entries()]
    .map(([handle, rec]) => ({ player: getPlayer(handle), ...rec }))
    .filter((p) => p.player)
    .sort((a, b) => b.wins + b.losses - (a.wins + a.losses));
}
