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
    losses: 4,
    usageCount: 3,
    description:
      "Yuryevna's WMGR 2024 pick for Weeks 2 and 3 — 8W–3L, dropping only three games across two team wins, then a one-off in the TDC S1 2025 relay. The Visas Starfrost engine at its peak. 8W–4L.",
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
      "Shared between Lonts (a perfect 3-0 match run vs YD(A) in Week 2) and DS Awarix (Week 4). Trap-heavy furniture control — 7W–6L in WMGR 2024.",
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
    losses: 5,
    usageCount: 3,
    description:
      "Mev's Cyberse combo pick — a flawless 3-0 match sweep of 珍獣戦線 to open WMGR 2024, with a brief TDC S1 2025 cameo against BTD Omegas. One-card starters into explosive boards. 6W–5L overall.",
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
    wins: 14,
    losses: 18,
    usageCount: 8,
    description:
      "The team's most-travelled Fire archetype — Mev and Yuryevna ran it across WMGR 2024 (W5 + Top 8), Lonts and Cain added it in WMGPxA 2024 W2, Mev brought it back in WMGPxA W3, and Lonts fielded it again in TDC S1 2025. 14W–18L career.",
    pilotHandles: ["mev7901", "yuryevna", "Lonts94", "cain00"],
    sampleList: [],
  },
  {
    slug: "tearlaments",
    name: "Tearlaments",
    accent: "#60A5FA",
    signatureCardId: 0,
    image: "/deck-art/tearlaments.jpg",
    wins: 6,
    losses: 1,
    usageCount: 2,
    description:
      "Yuryevna's perfect cameo in WMGR 2024 — swept Labrynth 2-0 in a Week 4 relief spot. Lonts then took it on a 4-1 tear through the TDC S1 2025 Upper Bracket against Teameeps. 6W–1L.",
    pilotHandles: ["yuryevna", "Lonts94"],
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
  /* ── WMGPxA 2024 archetypes ──────────────────────────────────────── */
  {
    slug: "snake-race",
    name: "Snake Race",
    accent: "#FB923C",
    signatureCardId: 0,
    image: "/deck-art/snake-race.jpg",
    wins: 4,
    losses: 3,
    usageCount: 1,
    description:
      "Mev's hybrid Snake-Eyes build for WMGPxA 2024 Week 1 — swept the Snake Race mirror in Babak 1 and ground out 4W–3L including two 1-1 draws against Nugget knights.",
    pilotHandles: ["mev7901"],
    sampleList: [],
  },
  {
    slug: "r-ace",
    name: "R-ACE",
    accent: "#38BDF8",
    signatureCardId: 0,
    image: "/deck-art/r-ace.jpg",
    wins: 1,
    losses: 2,
    usageCount: 1,
    description:
      "Mev's tech pick for WMGPxA 2024 Week 2 against Stellar Trace — the Rescue-ACE control engine. 1W–2L in a tough 0-2 match loss.",
    pilotHandles: ["mev7901"],
    sampleList: [],
  },
  {
    slug: "branded-chimera",
    name: "Branded Chimera",
    accent: "#EC4899",
    signatureCardId: 0,
    image: "/deck-art/branded-chimera.jpg",
    wins: 3,
    losses: 4,
    usageCount: 2,
    description:
      "Yuryevna's Branded variant for WMGPxA 2024 — the Chimera Fusion build. A perfect 2-0 sweep in Week 2 Babak 1 before running into tougher matchups. 3W–4L total.",
    pilotHandles: ["yuryevna"],
    sampleList: [],
  },
  {
    slug: "purrely",
    name: "Purrely",
    accent: "#A78BFA",
    signatureCardId: 0,
    image: "/deck-art/purrely.jpg",
    wins: 5,
    losses: 6,
    usageCount: 3,
    description:
      "Lonts's WMGPxA 2024 Week 1 pick and Cain's Week 4 selection — the Purrely Xyz engine. Lonts carried the B3 decider against Nugget knights, then opened the TDC S1 2025 relay with it. 5W–6L total.",
    pilotHandles: ["Lonts94", "cain00"],
    sampleList: [],
  },
  {
    slug: "unchained",
    name: "Unchained",
    accent: "#F97316",
    signatureCardId: 0,
    image: "/deck-art/unchained.jpg",
    wins: 3,
    losses: 3,
    usageCount: 1,
    description:
      "Sieg's WMGPxA 2024 Week 3 weapon — the Unchained destruction-trigger engine. Dead-even at 3W–3L across two babaks against スーパーこめかみブラザーズ.",
    pilotHandles: ["sieg121"],
    sampleList: [],
  },
  {
    slug: "fire-king",
    name: "Fire King",
    accent: "#EF4444",
    signatureCardId: 0,
    image: "/deck-art/fire-king.jpg",
    wins: 19,
    losses: 10,
    usageCount: 8,
    description:
      "Mev's TDC S1 2025 anchor — the Snake-Eyes Fire King hybrid he rode to two 5-0 solo sweeps (Roseweisse Mansion in Week 2, DS Trishula in the Upper Bracket). First seen double-fielded with Lonts in WMGPxA 2024. 19W–10L across three tournaments.",
    pilotHandles: ["mev7901", "Lonts94"],
    sampleList: [],
  },
  // ── TDC S1 2025 archetypes ──
  {
    slug: "tri-brigade",
    name: "Tri-Brigade",
    accent: "#F97316",
    signatureCardId: 0,
    image: "/deck-art/tri-brigade.jpg",
    wins: 10,
    losses: 3,
    usageCount: 5,
    description:
      "Cain's TDC S1 2025 workhorse — the Tri-Brigade Spright link engine. Anchored five relay matches including a 5-0 solo sweep of BTD Omegas. Beast-warrior swarm that links into disruption from an empty board. 10W–3L.",
    pilotHandles: ["cain00"],
    sampleList: [],
  },
  {
    slug: "yubel",
    name: "Yubel",
    accent: "#A21CAF",
    signatureCardId: 0,
    image: "/deck-art/yubel.jpg",
    wins: 7,
    losses: 3,
    usageCount: 4,
    description:
      "The team's TDC S1 2025 fiend pillar — Sieg's Unchained-flavoured Yubel build across the group stage, with Mev picking it up against Evolushine. Nightmare-throne control that punishes every interaction. 7W–3L.",
    pilotHandles: ["sieg121", "mev7901"],
    sampleList: [],
  },
  {
    slug: "ritual-beast",
    name: "Ritual Beast",
    accent: "#22C55E",
    signatureCardId: 0,
    image: "/deck-art/ritual-beast.jpg",
    wins: 4,
    losses: 1,
    usageCount: 2,
    description:
      "Lonts's TDC S1 2025 grind engine — the Ritual Beast Nemeses toolbox. Went 4-0 tearing through Hydra in Week 3 before a lone Mannadium loss. Contact-fusion value that never runs dry. 4W–1L.",
    pilotHandles: ["Lonts94"],
    sampleList: [],
  },
  {
    slug: "tenpai-dragon",
    name: "Tenpai Dragon",
    accent: "#FBBF24",
    signatureCardId: 0,
    image: "/deck-art/tenpai-dragon.jpg",
    wins: 1,
    losses: 3,
    usageCount: 3,
    description:
      "The team's TDC S1 2025 aggro gamble — Cain and Lonts both took the Tenpai Dragon OTK into the relay. Explosive but fragile: 1W–3L, all against the mirror and grindier decks.",
    pilotHandles: ["cain00", "Lonts94"],
    sampleList: [],
  },
  {
    slug: "centur-ion",
    name: "Centur-ion",
    accent: "#6366F1",
    signatureCardId: 0,
    image: "/deck-art/centur-ion.jpg",
    wins: 2,
    losses: 1,
    usageCount: 2,
    description:
      "Shared between Lonts (Week 5) and Yuryevna (Upper Bracket clincher vs Teameeps) in TDC S1 2025 — the White Wood Centur-ion trap-monster engine. Resilient stun-control. 2W–1L.",
    pilotHandles: ["Lonts94", "yuryevna"],
    sampleList: [],
  },
  {
    slug: "voiceless-voice",
    name: "Voiceless Voice",
    accent: "#38BDF8",
    signatureCardId: 0,
    image: "/deck-art/voiceless-voice.jpg",
    wins: 1,
    losses: 2,
    usageCount: 2,
    description:
      "Darkzill's TDC S1 2025 ritual project — the Voiceless Voice hand-trap-heavy control shell. Ground out a win against R.O.T.A's True-Draco. 1W–2L in its debut league.",
    pilotHandles: ["Darkzill"],
    sampleList: [],
  },
  {
    slug: "goblin-biker",
    name: "Goblin Biker",
    accent: "#EAB308",
    signatureCardId: 0,
    image: "/deck-art/goblin-biker.jpg",
    wins: 1,
    losses: 1,
    usageCount: 1,
    description:
      "Awarix's TDC S1 2025 wildcard — the Goblin Biker rush-aggro deck. Took down a Yubel before bowing out to Mathmech in Week 5. 1W–1L.",
    pilotHandles: ["awarix"],
    sampleList: [],
  },
  {
    slug: "runick",
    name: "Runick",
    accent: "#14B8A6",
    signatureCardId: 0,
    image: "/deck-art/runick.jpg",
    wins: 0,
    losses: 1,
    usageCount: 1,
    description:
      "Yuryevna's TDC S1 2025 mill-control experiment — the Runick White Forest Fountain package. A single tough game against Evolushine's Fire King. 0W–1L, more to prove.",
    pilotHandles: ["yuryevna"],
    sampleList: [],
  },
  // ── Legend Cup S2 archetypes ──
  {
    slug: "mitsurugi",
    name: "Mitsurugi",
    accent: "#0891B2",
    signatureCardId: 0,
    image: "/deck-art/mitsurugi.jpg",
    wins: 10,
    losses: 9,
    usageCount: 10,
    description:
      "DS Celebeast's signature engine of Legend Cup S2 — the WATER sword-god Mitsurugi core, splashed a dozen ways (Ryzeal, Ogdoadic, Gem Millennium, White Forest, GS). Darkzill, Yuryevna and Mev all piloted a build; Yuryevna's Ogdoadic FS went 3-1 against opc team. 10W–9L.",
    pilotHandles: ["Darkzill", "yuryevna", "mev7901"],
    sampleList: [],
  },
  {
    slug: "malice",
    name: "Malice",
    accent: "#7E22CE",
    signatureCardId: 0,
    image: "/deck-art/malice.jpg",
    wins: 5,
    losses: 5,
    usageCount: 5,
    description:
      "The team's Legend Cup S2 workhorse — the Malice Bystial toolbox shared by Lonts, Yuryevna and Cain. Lonts went 2-1 with it against pilk. Dead-even at 5W–5L.",
    pilotHandles: ["Lonts94", "yuryevna", "cain00"],
    sampleList: [],
  },
  {
    slug: "spright",
    name: "Spright",
    accent: "#FDE047",
    signatureCardId: 0,
    image: "/deck-art/spright.jpg",
    wins: 2,
    losses: 2,
    usageCount: 3,
    description:
      "Cain's rank-2 tempo pick across Legend Cup S2 — the Spright link-climbing engine. Clutch closer against opc team in Week 4. 2W–2L.",
    pilotHandles: ["cain00"],
    sampleList: [],
  },
  {
    slug: "gem-knight",
    name: "Gem-Knight",
    accent: "#E879F9",
    signatureCardId: 0,
    image: "/deck-art/gem-knight.jpg",
    wins: 0,
    losses: 1,
    usageCount: 1,
    description:
      "Mev's Legend Cup S2 opener against SCS — the Gem-Knight Fiendsmith fusion pile. A single hard-fought game. 0W–1L.",
    pilotHandles: ["mev7901"],
    sampleList: [],
  },
  {
    slug: "lunalight",
    name: "Lunalight",
    accent: "#FB7185",
    signatureCardId: 0,
    image: "/deck-art/lunalight.jpg",
    wins: 1,
    losses: 1,
    usageCount: 1,
    description:
      "Lonts's Legend Cup S2 Playoff pick — the Lunalight moonlight beast-warrior fusion. Opened the bracket with a win over 41cs before the baton passed. 1W–1L.",
    pilotHandles: ["Lonts94"],
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
    losses: 1,
    usageCount: 1,
    description:
      "DS Awarix's chaotic combo deck — P.U.N.K. Special Summons from the hand and GY at minimal cost, building devastating boards in a single turn. Made its tournament debut as the P.U.N.K. Fiendsmith build in Legend Cup S2 against pilk. 0W–1L.",
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
    losses: 1,
    usageCount: 1,
    description:
      "Darkzill's aggressive Xyz archetype — pioneered within the squad and brought to the team stage in Legend Cup S2 against SCS. 0W–1L in its tournament debut, with plenty left to prove.",
    pilotHandles: ["Darkzill"],
    sampleList: [],
  },
  {
    slug: "ryuge",
    name: "Ryuge",
    accent: "#F59E0B",
    signatureCardId: 0,
    image: "/deck-art/ryuge.jpg",
    wins: 0,
    losses: 0,
    usageCount: 0,
    description:
      "OPENBO500's weapon of choice. Ryuge is an aggressive Dragon archetype that thrives on overwhelming boards and explosive combos.",
    pilotHandles: ["OPENBO500"],
    sampleList: [],
  },
];

export const players: Player[] = [
  {
    handle: "sieg121",
    name: "DS Sieg",
    role: "Captain",
    tagline: "Magnet combo architect",
    bio: "Team captain and founding member. Dragon Link and Phantom Knight in WMGR 2024, Unchained in WMGPxA 2024, a steady Yubel run through TDC S1 2025, then Magnet Warrior, Radiant Typhoon and Enneacraft across Jawir 2026. 30W–21L career.",
    gameId: "331-001-777",
    titles: 0,
    wins: 30,
    losses: 21,
    mainDeckSlug: "magnet-warrior",
    socials: [],
  },
  {
    handle: "yuryevna",
    name: "DS Yuryevna",
    role: "Member",
    tagline: "Branded control specialist",
    bio: "The team's most versatile deck-builder — Mannadium and Tearlaments in WMGR 2024, Branded Chimera in WMGPxA 2024, a five-archetype tour of TDC S1 2025, a Mitsurugi-heavy run through Legend Cup S2, and a dominant Branded Despia run in Jawir 2026. 34W–26L career.",
    gameId: "498-595-485",
    titles: 0,
    wins: 34,
    losses: 26,
    mainDeckSlug: "branded-despia",
    socials: [],
  },
  {
    handle: "cain00",
    name: "DS Cain",
    role: "Vice Captain",
    tagline: "Team ace — never misses",
    bio: "The squad's iron man — Swordsoul and Tri Zoodiac through WMGR 2024, Snake Eyes and Purrely in WMGPxA 2024, a Tri-Brigade run headlined by a 5-0 relay sweep in TDC S1 2025, a Spright relay campaign in Legend Cup S2, then every phase of Jawir 2026 on Kewl Tune. 63W–48L career.",
    gameId: "798-514-613",
    titles: 0,
    wins: 63,
    losses: 48,
    mainDeckSlug: "kewl-tune",
    socials: [],
  },
  {
    handle: "mev7901",
    name: "DS Mev",
    role: "Member",
    tagline: "Blue-Eyes tactician",
    bio: "The team's relay closer — Mathmech/Gishiki/Snake Eyes in WMGR 2024, Snake Race/R-ACE/Fire King in WMGPxA 2024, a monster TDC S1 2025 on Fire King with two 5-0 solo sweeps, Gem-Knight and Mitsurugi in Legend Cup S2, plus an Exosister cameo in Jawir 2026. 44W–38L career.",
    gameId: "411-280-170",
    titles: 0,
    wins: 44,
    losses: 38,
    mainDeckSlug: "blue-eyes",
    socials: [],
  },
  {
    handle: "Lonts94",
    name: "Lonts",
    role: "Member",
    tagline: "Orcust grind machine",
    bio: "An Orcust main who adapts to whatever the team needs — Labrynth and Branded Bystial in WMGR 2024, Snake Eyes/Purrely/Fire King in WMGPxA 2024, a seven-deck grind through TDC S1 2025 capped by a 4-1 Tearlaments playoff run, a Malice/Lunalight relay tour in Legend Cup S2, then Radiant Typhoon and Branded Despia in Jawir 2026. 53W–45L career.",
    gameId: "603-946-920",
    titles: 0,
    wins: 53,
    losses: 45,
    mainDeckSlug: "orcust",
    socials: [],
  },
  {
    handle: "awarix",
    name: "DS Awarix",
    role: "Member",
    tagline: "P.U.N.K. chaos engine",
    bio: "DS Awarix's P.U.N.K. deck defies convention — a one-turn combo specialist who builds intimidating boards. Made his debut on Labrynth in Week 4 of WMGR 2024, rode Goblin Biker into the TDC S1 2025 relay, and finally fielded his beloved P.U.N.K. in Legend Cup S2. 2W–6L.",
    gameId: "434-385-335",
    titles: 0,
    wins: 2,
    losses: 6,
    mainDeckSlug: "punk",
    socials: [],
  },
  {
    handle: "Darkzill",
    name: "Darkzill",
    role: "Member",
    tagline: "Ryzeal pioneer",
    bio: "Darkzill adapts every week — Yummy in W1/W3/W5 and Vanquish Soul K9 in W2/W4 of Jawir 2026, a Voiceless Voice ritual project in TDC S1 2025, then his own Ryzeal and Mitsurugi builds in Legend Cup S2. His 6–2 Yummy rampage carried the Week 3 win against UXma Musume. 15W–19L in recorded games.",
    gameId: "694-725-759",
    titles: 0,
    wins: 15,
    losses: 19,
    mainDeckSlug: "ryzeal",
    socials: [],
  },
  {
    handle: "Antares",
    name: "Antares",
    role: "Try Out",
    tagline: "Vanquish Soul tactician",
    bio: "Antares is on trial with DS Celebeast, bringing Vanquish Soul — a newcomer proving their worth against the roster's veterans. Watch this space.",
    titles: 0,
    wins: 0,
    losses: 0,
    mainDeckSlug: "vanquish-soul",
    socials: [],
  },
  {
    handle: "OPENBO500",
    name: "OPENBO500",
    role: "Try Out",
    tagline: "Ryuge Dragon pilot",
    bio: "OPENBO500 is on trial with DS Celebeast, running Ryuge — a newcomer proving their worth against the roster's veterans. Watch this space.",
    titles: 0,
    wins: 0,
    losses: 0,
    mainDeckSlug: "ryuge",
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
   * WMGPxA 2024 — WMCR × AWARS collaboration tournament (4 weeks, group stage).
   * Cross-check: Σ deck W = Σ player W = 29 · Σ L = 30. ✓
   * ════════════════════════════════════════════════════════════════════ */
  {
    slug: "wmgpxa-2024",
    name: "WMGPxA 2024",
    date: "2024-05-07",
    format: "Team · Best of 3 babaks per match",
    location: "Online (AWARS — Yu-Gi-Oh Master Duel)",
    participants: 8,
    type: "team",
    ourResult: "Group stage 2–2",
    results: [],
    weeks: [
      /* ── Week 1 · vs Nugget knights · Win 2-1 ───────────────────── */
      {
        week: "Week 1",
        opponentTeam: "Nugget knights",
        main: ["mev7901", "Lonts94"],
        sub: ["cain00"],
        deckList: [
          { handle: "mev7901", deckName: "Snake Race", deckSlug: "snake-race" },
          { handle: "Lonts94", deckName: "Purrely",    deckSlug: "purrely" },
          { handle: "cain00",  deckName: "Snake Eyes", deckSlug: "snake-eyes" },
        ],
        matchResult: "win",
        rounds: [
          // Babak 1 — Nugget knights Win
          { dsPlayerHandle: "Lonts94", opponent: "BASALA",    opponentDeck: "Snake eye",  dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "mev7901", opponent: "Meta Mani VAPR", opponentDeck: "Snake Race", dsWins: 2, dsLosses: 1 },
          // Babak 2 — Nugget knights Win
          { dsPlayerHandle: "Lonts94", opponent: "neZu",   opponentDeck: "Snake eye",  dsWins: 0, dsLosses: 2 },
          { dsPlayerHandle: "mev7901", opponent: "BASALA", opponentDeck: "Snake eye",  dsWins: 1, dsLosses: 1 },
          // Babak 3 — DS Celebeast Win (Cain subs in)
          { dsPlayerHandle: "Lonts94", opponent: "shurit", opponentDeck: "kash VS",    dsWins: 2, dsLosses: 1 },
          { dsPlayerHandle: "mev7901", opponent: "neZu",   opponentDeck: "Snake Race", dsWins: 1, dsLosses: 1 },
          { dsPlayerHandle: "cain00",  opponent: "BASALA", opponentDeck: "Snake eye",  dsWins: 2, dsLosses: 0 },
        ],
      },

      /* ── Week 2 · vs Stellar Trace · Loss 0-2 ───────────────────── */
      {
        week: "Week 2",
        opponentTeam: "Stellar Trace",
        main: ["mev7901", "yuryevna", "Lonts94"],
        sub: ["cain00"],
        deckList: [
          { handle: "mev7901",  deckName: "R-ACE",           deckSlug: "r-ace" },
          { handle: "yuryevna", deckName: "Branded Chimera", deckSlug: "branded-chimera" },
          { handle: "Lonts94",  deckName: "Snake Eyes",      deckSlug: "snake-eyes" },
          { handle: "cain00",   deckName: "Snake Eyes",      deckSlug: "snake-eyes" },
        ],
        matchResult: "loss",
        rounds: [
          // Babak 1 — Stellar Trace Win
          { dsPlayerHandle: "mev7901",  opponent: "sakana",    opponentDeck: "SE",       dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "yuryevna", opponent: "Tang",      opponentDeck: "Labrynth", dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94",  opponent: "Nightmare", opponentDeck: "SE",       dsWins: 1, dsLosses: 2 },
          // Babak 2 — Stellar Trace Win (Cain subs in for Lonts)
          { dsPlayerHandle: "Lonts94",  opponent: "sakana",    opponentDeck: "SE",       dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "yuryevna", opponent: "Tang",      opponentDeck: "Labrynth", dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "cain00",   opponent: "Nightmare", opponentDeck: "SE",       dsWins: 2, dsLosses: 1 },
        ],
      },

      /* ── Week 3 · vs スーパーこめかみブラザーズ · Win 2-0 ─────────── */
      {
        week: "Week 3",
        opponentTeam: "スーパーこめかみブラザーズ",
        main: ["mev7901", "sieg121"],
        sub: [],
        deckList: [
          { handle: "mev7901", deckName: "Snake Eyes", deckSlug: "snake-eyes" },
          { handle: "sieg121", deckName: "Unchained",  deckSlug: "unchained" },
        ],
        matchResult: "win",
        rounds: [
          // Babak 1 — DS Celebeast Win
          { dsPlayerHandle: "mev7901", opponent: "剣闘獣神", opponentDeck: "Labrynth",     dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "sieg121", opponent: "こめかみ", opponentDeck: "Salamangreat", dsWins: 2, dsLosses: 1 },
          // Babak 2 — DS Celebeast Win
          { dsPlayerHandle: "mev7901", opponent: "スラリン", opponentDeck: "Purrely",  dsWins: 2, dsLosses: 0 },
          { dsPlayerHandle: "sieg121", opponent: "ゆるしゅ", opponentDeck: "Branded",  dsWins: 1, dsLosses: 2 },
        ],
      },

      /* ── Week 4 · vs Black Material · Loss 0-2 ──────────────────── */
      {
        week: "Week 4",
        opponentTeam: "Black Material",
        main: ["yuryevna", "mev7901", "Lonts94"],
        sub: ["cain00"],
        deckList: [
          { handle: "yuryevna", deckName: "Branded Chimera", deckSlug: "branded-chimera" },
          { handle: "mev7901",  deckName: "Fire King",       deckSlug: "fire-king" },
          { handle: "Lonts94",  deckName: "Fire King",       deckSlug: "fire-king" },
          { handle: "cain00",   deckName: "Purrely",         deckSlug: "purrely" },
        ],
        matchResult: "loss",
        rounds: [
          // Babak 1 — Black Material Win
          { dsPlayerHandle: "yuryevna", opponent: "エアーマン鈴木", opponentDeck: "R-ACE",        dsWins: 0, dsLosses: 2 },
          { dsPlayerHandle: "mev7901",  opponent: "OZ",            opponentDeck: "Purrely",       dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "Lonts94",  opponent: "cilnof",        opponentDeck: "Salamangreat",  dsWins: 2, dsLosses: 0 },
          // Babak 2 — Black Material Win (Cain subs in for Yuryevna)
          { dsPlayerHandle: "cain00",   opponent: "エアーマン鈴木", opponentDeck: "R-ACE",        dsWins: 0, dsLosses: 2 },
          { dsPlayerHandle: "Lonts94",  opponent: "OZ",            opponentDeck: "Purrely",       dsWins: 1, dsLosses: 2 },
          { dsPlayerHandle: "mev7901",  opponent: "cilnof",        opponentDeck: "Salamangreat",  dsWins: 1, dsLosses: 2 },
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

  /* ═══════════════ TDC S1 2025 — survival relay ═══════════════ */
  {
    slug: "tdc-s1-2025",
    name: "TDC S1 2025",
    date: "2025-08-01",
    format: "Team · Survival relay · first to 5 game wins",
    location: "Online (Duel Standby — True Duel List)",
    participants: 8,
    type: "team",
    relay: true,
    ourResult: "Prelim 5–3 · Upper Bracket 2–0",
    results: [],
    weeks: [
      /* ── Week 1 · vs DS Secret Shadow · Win 5-3 ──────────────────── */
      {
        week: "Week 1",
        opponentTeam: "DS Secret Shadow",
        main: ["Lonts94", "cain00", "yuryevna", "sieg121"],
        sub: [],
        deckList: [
          { handle: "Lonts94",  deckName: "Purrely",     deckSlug: "purrely" },
          { handle: "cain00",   deckName: "Tri-Brigade", deckSlug: "tri-brigade" },
          { handle: "yuryevna", deckName: "Unknown" },
          { handle: "sieg121",  deckName: "Yubel",       deckSlug: "yubel" },
        ],
        matchResult: "win",
        rounds: [
          { dsPlayerHandle: "Lonts94",  opponent: "Saila",    opponentDeck: "Yubel",      dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94",  opponent: "Fosca",    opponentDeck: "Labrynth",   dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "cain00",   opponent: "Fosca",    opponentDeck: "Labrynth",   dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "cain00",   opponent: "Al Ahmed", opponentDeck: "Mathmech",   dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "cain00",   opponent: "Sutenha",  opponentDeck: "Fire King",  dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "yuryevna", opponent: "Sutenha",  opponentDeck: "Fire King",  dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "sieg121",  opponent: "Sutenha",  opponentDeck: "Fire King",  dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "sieg121",  opponent: "A2x",      opponentDeck: "Ritual Beast", dsWins: 1, dsLosses: 0 },
        ],
      },

      /* ── Week 2 · vs Roseweisse Mansion · Win 5-0 ────────────────── */
      {
        week: "Week 2",
        opponentTeam: "Roseweisse Mansion",
        main: ["mev7901"],
        sub: [],
        deckList: [
          { handle: "mev7901", deckName: "Fire King", deckSlug: "fire-king" },
        ],
        matchResult: "win",
        rounds: [
          { dsPlayerHandle: "mev7901", opponent: "Shcro",    opponentDeck: "Dogmatika",  dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "mev7901", opponent: "Winn",     opponentDeck: "HERO",       dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "mev7901", opponent: "NDL100",   opponentDeck: "Centur-ion", dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "mev7901", opponent: "Kurosaki", opponentDeck: "Kashtira",   dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "mev7901", opponent: "Smirnove", opponentDeck: "Vaylantz",   dsWins: 1, dsLosses: 0 },
        ],
      },

      /* ── Week 3 · vs Hydra · Win 5-1 ─────────────────────────────── */
      {
        week: "Week 3",
        opponentTeam: "Hydra",
        main: ["cain00", "Lonts94"],
        sub: [],
        deckList: [
          { handle: "cain00",  deckName: "Tenpai Dragon", deckSlug: "tenpai-dragon" },
          { handle: "Lonts94", deckName: "Ritual Beast",  deckSlug: "ritual-beast" },
        ],
        matchResult: "win",
        rounds: [
          { dsPlayerHandle: "cain00",  opponent: "Gallant",   opponentDeck: "Tenpai Dragon", dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "cain00",  opponent: "Esther",    opponentDeck: "Yubel",         dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "Lonts94", opponent: "Esther",    opponentDeck: "Yubel",         dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94", opponent: "Girsu",     opponentDeck: "Rescue-ACE",    dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94", opponent: "Rudy Bae",  opponentDeck: "Suship",        dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94", opponent: "Yung Kruu", opponentDeck: "Runick",        dsWins: 1, dsLosses: 0 },
        ],
      },

      /* ── Week 5 · vs DKS · Loss 4-5 ──────────────────────────────── */
      {
        week: "Week 5",
        opponentTeam: "DKS",
        main: ["mev7901", "Darkzill", "Lonts94", "awarix", "cain00"],
        sub: [],
        deckList: [
          { handle: "mev7901",  deckName: "Fire King",       deckSlug: "fire-king" },
          { handle: "Darkzill", deckName: "Voiceless Voice", deckSlug: "voiceless-voice" },
          { handle: "Lonts94",  deckName: "Centur-ion",      deckSlug: "centur-ion" },
          { handle: "awarix",   deckName: "Goblin Biker",    deckSlug: "goblin-biker" },
          { handle: "cain00",   deckName: "Tri-Brigade",     deckSlug: "tri-brigade" },
        ],
        matchResult: "loss",
        rounds: [
          { dsPlayerHandle: "mev7901",  opponent: "Tear",          opponentDeck: "White Forest", dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "mev7901",  opponent: "Plantchildren", opponentDeck: "Plant Pile",   dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "Darkzill", opponent: "Plantchildren", opponentDeck: "Plant Pile",   dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "Lonts94",  opponent: "Plantchildren", opponentDeck: "Plant Pile",   dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94",  opponent: "Wide",          opponentDeck: "Yubel",        dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "awarix",   opponent: "Wide",          opponentDeck: "Yubel",        dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "awarix",   opponent: "ReRuLu",        opponentDeck: "Mathmech",     dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "cain00",   opponent: "ReRuLu",        opponentDeck: "Mathmech",     dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "cain00",   opponent: "Yusei Fudo",    opponentDeck: "Synchron",     dsWins: 0, dsLosses: 1 },
        ],
      },

      /* ── Week 6 · vs R.O.T.A · Loss 4-5 ──────────────────────────── */
      {
        week: "Week 6",
        opponentTeam: "R.O.T.A",
        main: ["cain00", "mev7901", "Darkzill", "sieg121", "Lonts94"],
        sub: [],
        deckList: [
          { handle: "cain00",   deckName: "Tenpai Dragon",   deckSlug: "tenpai-dragon" },
          { handle: "mev7901",  deckName: "Fire King",       deckSlug: "fire-king" },
          { handle: "Darkzill", deckName: "Voiceless Voice", deckSlug: "voiceless-voice" },
          { handle: "sieg121",  deckName: "Yubel",           deckSlug: "yubel" },
          { handle: "Lonts94",  deckName: "Ritual Beast",    deckSlug: "ritual-beast" },
        ],
        matchResult: "loss",
        rounds: [
          { dsPlayerHandle: "cain00",   opponent: "ROTA.A13",     opponentDeck: "Tenpai Dragon", dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "mev7901",  opponent: "ROTA.A14",     opponentDeck: "Tenpai Dragon", dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "mev7901",  opponent: "ROTA.Mifumin", opponentDeck: "True-Draco",    dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "Darkzill", opponent: "ROTA.Mifumin", opponentDeck: "True-Draco",    dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "Darkzill", opponent: "ROTA.Ichi",    opponentDeck: "Chimera",       dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "sieg121",  opponent: "ROTA.Ichi",    opponentDeck: "Chimera",       dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "sieg121",  opponent: "ROTA.Maker",   opponentDeck: "Centur-ion",    dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "sieg121",  opponent: "ROTA.Zxin",    opponentDeck: "Mannadium",     dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "Lonts94",  opponent: "ROTA.Zxin",    opponentDeck: "Mannadium",     dsWins: 0, dsLosses: 1 },
        ],
      },

      /* ── Week 7 · vs UX Dino Rampage · Loss 2-5 ──────────────────── */
      {
        week: "Week 7",
        opponentTeam: "UX Dino Rampage",
        main: ["Lonts94", "yuryevna", "mev7901", "cain00", "sieg121"],
        sub: [],
        deckList: [
          { handle: "Lonts94",  deckName: "Tenpai Dragon", deckSlug: "tenpai-dragon" },
          { handle: "yuryevna", deckName: "Mannadium",     deckSlug: "mannadium" },
          { handle: "mev7901",  deckName: "Fire King",     deckSlug: "fire-king" },
          { handle: "cain00",   deckName: "Tri-Brigade",   deckSlug: "tri-brigade" },
          { handle: "sieg121",  deckName: "Yubel",         deckSlug: "yubel" },
        ],
        matchResult: "loss",
        rounds: [
          { dsPlayerHandle: "Lonts94",  opponent: "Zeizen", opponentDeck: "Ritual Beast",    dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "yuryevna", opponent: "Zeizen", opponentDeck: "Ritual Beast",    dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "mev7901",  opponent: "Zeizen", opponentDeck: "Ritual Beast",    dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "mev7901",  opponent: "rbt",    opponentDeck: "Voiceless Voice", dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "cain00",   opponent: "rbt",    opponentDeck: "Voiceless Voice", dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "sieg121",  opponent: "rbt",    opponentDeck: "Voiceless Voice", dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "sieg121",  opponent: "Root",   opponentDeck: "Labrynth",        dsWins: 0, dsLosses: 1 },
        ],
      },

      /* ── Week 8 · vs BTD Omegas · Win 5-2 ────────────────────────── */
      {
        week: "Week 8",
        opponentTeam: "BTD Omegas",
        main: ["mev7901", "Lonts94", "cain00"],
        sub: [],
        deckList: [
          { handle: "mev7901", deckName: "Mathmech",    deckSlug: "mathmech" },
          { handle: "Lonts94", deckName: "Snake-Eyes",  deckSlug: "snake-eyes" },
          { handle: "cain00",  deckName: "Tri-Brigade", deckSlug: "tri-brigade" },
        ],
        matchResult: "win",
        rounds: [
          { dsPlayerHandle: "mev7901", opponent: "Orco",       opponentDeck: "Centur-ion", dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "Lonts94", opponent: "Orco",       opponentDeck: "Centur-ion", dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "cain00",  opponent: "Orco",       opponentDeck: "Centur-ion", dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "cain00",  opponent: "UwUFateBTD", opponentDeck: "Mathmech",   dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "cain00",  opponent: "Victiny",    opponentDeck: "Infernoble", dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "cain00",  opponent: "Atrox",      opponentDeck: "Labrynth",   dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "cain00",  opponent: "Iwano",      opponentDeck: "Snake-Eyes", dsWins: 1, dsLosses: 0 },
        ],
      },

      /* ── Week 9 · vs Evolushine · Win 5-3 ────────────────────────── */
      {
        week: "Week 9",
        opponentTeam: "Evolushine",
        main: ["Lonts94", "mev7901", "yuryevna", "cain00"],
        sub: [],
        deckList: [
          { handle: "Lonts94",  deckName: "Fire King",   deckSlug: "fire-king" },
          { handle: "mev7901",  deckName: "Yubel",       deckSlug: "yubel" },
          { handle: "yuryevna", deckName: "Runick",      deckSlug: "runick" },
          { handle: "cain00",   deckName: "Tri-Brigade", deckSlug: "tri-brigade" },
        ],
        matchResult: "win",
        rounds: [
          { dsPlayerHandle: "Lonts94",  opponent: "Gadyra",  opponentDeck: "Tenpai Dragon",   dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94",  opponent: "Draco",   opponentDeck: "P.U.N.K",         dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "mev7901",  opponent: "Draco",   opponentDeck: "P.U.N.K",         dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "mev7901",  opponent: "Fect",    opponentDeck: "Voiceless Voice", dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "mev7901",  opponent: "Monarch", opponentDeck: "Fire King",       dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "yuryevna", opponent: "Monarch", opponentDeck: "Fire King",       dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "cain00",   opponent: "Monarch", opponentDeck: "Fire King",       dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "cain00",   opponent: "RiasDxD", opponentDeck: "Tearlament",      dsWins: 1, dsLosses: 0 },
        ],
      },

      /* ── Playoff · Upper R1 · vs Teameeps · Win 5-1 ──────────────── */
      {
        week: "Playoff · Upper R1",
        opponentTeam: "Teameeps",
        main: ["Lonts94", "yuryevna"],
        sub: [],
        deckList: [
          { handle: "Lonts94",  deckName: "Tearlaments", deckSlug: "tearlaments" },
          { handle: "yuryevna", deckName: "Centur-ion",  deckSlug: "centur-ion" },
        ],
        matchResult: "win",
        rounds: [
          { dsPlayerHandle: "Lonts94",  opponent: "Shadow",  opponentDeck: "Tenpai Dragon",   dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94",  opponent: "Best_cj", opponentDeck: "Gimmick Puppet",  dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94",  opponent: "Suzu",    opponentDeck: "Centur-ion",      dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94",  opponent: "Rentoz",  opponentDeck: "Voiceless Voice", dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94",  opponent: "Nick",    opponentDeck: "Fire King",       dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "yuryevna", opponent: "Nick",    opponentDeck: "Fire King",       dsWins: 1, dsLosses: 0 },
        ],
      },

      /* ── Playoff · Upper R2 · vs DS Trishula Predator · Win 5-0 ──── */
      {
        week: "Playoff · Upper R2",
        opponentTeam: "DS Trishula Predator",
        main: ["mev7901"],
        sub: [],
        deckList: [
          { handle: "mev7901", deckName: "Fire King", deckSlug: "fire-king" },
        ],
        matchResult: "win",
        rounds: [
          { dsPlayerHandle: "mev7901", opponent: "Dkonn",    opponentDeck: "Centur-ion",      dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "mev7901", opponent: "Sugar",    opponentDeck: "Labrynth",        dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "mev7901", opponent: "Jofx",     opponentDeck: "Voiceless Voice", dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "mev7901", opponent: "Painmaker", opponentDeck: "Yubel",          dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "mev7901", opponent: "Duriann",  opponentDeck: "Snake-Eyes",      dsWins: 1, dsLosses: 0 },
        ],
      },
    ],
  },

  /* ═══════════════ Legend Cup S2 — survival relay ═══════════════ */
  {
    slug: "legend-cup-s2",
    name: "Legend Cup S2",
    date: "2025-10-03",
    format: "Team · Survival relay · first to 5 game wins",
    location: "Online (Legend Cup — Master Duel)",
    participants: 8,
    type: "team",
    relay: true,
    ourResult: "Prelim 2–2 · Playoffs: R1 exit",
    results: [],
    weeks: [
      /* ── Week 1 · vs SCS · Loss 2-5 ──────────────────────────────── */
      {
        week: "Week 1",
        opponentTeam: "SCS",
        main: ["Darkzill", "Lonts94", "yuryevna", "mev7901", "cain00"],
        sub: [],
        deckList: [
          { handle: "Darkzill", deckName: "Ryzeal",       deckSlug: "ryzeal" },
          { handle: "Lonts94",  deckName: "Malice",       deckSlug: "malice" },
          { handle: "yuryevna", deckName: "Malice",       deckSlug: "malice" },
          { handle: "mev7901",  deckName: "Gem-Knight FS", deckSlug: "gem-knight" },
          { handle: "cain00",   deckName: "Malice",       deckSlug: "malice" },
        ],
        matchResult: "loss",
        rounds: [
          { dsPlayerHandle: "Darkzill", opponent: "秋枫",      opponentDeck: "Memento",       dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "Lonts94",  opponent: "秋枫",      opponentDeck: "Memento",       dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94",  opponent: "总兵器",    opponentDeck: "Gem-Knight FS", dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "yuryevna", opponent: "总兵器",    opponentDeck: "Gem-Knight FS", dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "yuryevna", opponent: "Greyghost", opponentDeck: "FS Ryzeal",     dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "mev7901",  opponent: "Greyghost", opponentDeck: "FS Ryzeal",     dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "cain00",   opponent: "Greyghost", opponentDeck: "FS Ryzeal",     dsWins: 0, dsLosses: 1 },
        ],
      },

      /* ── Week 3 · vs pilk · Loss 3-5 ─────────────────────────────── */
      {
        week: "Week 3",
        opponentTeam: "pilk",
        main: ["Darkzill", "Lonts94", "yuryevna", "awarix", "cain00"],
        sub: [],
        deckList: [
          { handle: "Darkzill", deckName: "Mitsurugi Ryzeal",                 deckSlug: "mitsurugi" },
          { handle: "Lonts94",  deckName: "Malice",                           deckSlug: "malice" },
          { handle: "yuryevna", deckName: "SHS Gem Millennium Mitsurugi Orcust", deckSlug: "mitsurugi" },
          { handle: "awarix",   deckName: "P.U.N.K. FS",                      deckSlug: "punk" },
          { handle: "cain00",   deckName: "Spright",                          deckSlug: "spright" },
        ],
        matchResult: "loss",
        rounds: [
          { dsPlayerHandle: "Darkzill", opponent: "Snkage",   opponentDeck: "Kash Orcust FS",   dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "Lonts94",  opponent: "Snkage",   opponentDeck: "Kash Orcust FS",   dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94",  opponent: "Slayzan",  opponentDeck: "Mitsurugi Ryzeal", dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94",  opponent: "Slayzan",  opponentDeck: "Mitsurugi Ryzeal", dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "yuryevna", opponent: "Slayzan",  opponentDeck: "Mitsurugi",        dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "awarix",   opponent: "Slayzan",  opponentDeck: "Mitsurugi",        dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "cain00",   opponent: "Slayzan",  opponentDeck: "Mitsurugi",        dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "cain00",   opponent: "Pandalex", opponentDeck: "Mitsurugi Ryzeal", dsWins: 0, dsLosses: 1 },
        ],
      },

      /* ── Week 4 · vs opc team · Win 5-3 ──────────────────────────── */
      {
        week: "Week 4",
        opponentTeam: "opc team",
        main: ["mev7901", "yuryevna", "Darkzill", "cain00"],
        sub: [],
        deckList: [
          { handle: "mev7901",  deckName: "Mitsurugi",            deckSlug: "mitsurugi" },
          { handle: "yuryevna", deckName: "Mitsurugi Ogdoadic FS", deckSlug: "mitsurugi" },
          { handle: "Darkzill", deckName: "Ryzeal Mitsurugi",     deckSlug: "mitsurugi" },
          { handle: "cain00",   deckName: "Spright",              deckSlug: "spright" },
        ],
        matchResult: "win",
        rounds: [
          { dsPlayerHandle: "mev7901",  opponent: "zizian",    opponentDeck: "Branded",          dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "yuryevna", opponent: "zizian",    opponentDeck: "Branded",          dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "yuryevna", opponent: "Rinka",     opponentDeck: "Malice",           dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "yuryevna", opponent: "bluefire",  opponentDeck: "Ryzeal Mitsurugi", dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "yuryevna", opponent: "Asterisk",  opponentDeck: "Mathmech",         dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "Darkzill", opponent: "Asterisk",  opponentDeck: "Mathmech",         dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "Darkzill", opponent: "The Nomad", opponentDeck: "Orcust",           dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "cain00",   opponent: "The Nomad", opponentDeck: "Orcust",           dsWins: 1, dsLosses: 0 },
        ],
      },

      /* ── Week 5 · vs Rogue of the Abyss · Win 5-2 ────────────────── */
      {
        week: "Week 5",
        opponentTeam: "Rogue of the Abyss",
        main: ["Lonts94", "yuryevna", "Re"],
        sub: [],
        deckList: [
          { handle: "Lonts94",  deckName: "Malice",             deckSlug: "malice" },
          { handle: "yuryevna", deckName: "Mitsurugi GS",       deckSlug: "mitsurugi" },
          { handle: "Re",       deckName: "Mitsurugi Ryzeal FS", deckSlug: "mitsurugi" },
        ],
        matchResult: "win",
        rounds: [
          { dsPlayerHandle: "Lonts94",  opponent: "TARO",    opponentDeck: "Orcust",              dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94",  opponent: "EX",      opponentDeck: "Mannadium",           dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "yuryevna", opponent: "EX",      opponentDeck: "Mannadium",           dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "yuryevna", opponent: "A13",     opponentDeck: "Voiceless",           dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "Re",       opponent: "A13",     opponentDeck: "Voiceless",           dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "Re",       opponent: "Mifumin", opponentDeck: "Paleozoic",           dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "Re",       opponent: "Sakarep", opponentDeck: "Cyber Dragon Orcust", dsWins: 1, dsLosses: 0 },
        ],
      },

      /* ── Playoff · Stage Round 1 · vs 41cs · Loss 3-5 ────────────── */
      {
        week: "Playoff · Stage Round 1",
        opponentTeam: "41cs",
        main: ["Lonts94", "Darkzill", "cain00", "mev7901", "yuryevna"],
        sub: [],
        deckList: [
          { handle: "Lonts94",  deckName: "Lunalight",          deckSlug: "lunalight" },
          { handle: "Darkzill", deckName: "Mitsurugi Ryzeal",   deckSlug: "mitsurugi" },
          { handle: "cain00",   deckName: "Spright",            deckSlug: "spright" },
          { handle: "mev7901",  deckName: "Mitsurugi",          deckSlug: "mitsurugi" },
          { handle: "yuryevna", deckName: "Mitsurugi WF 60gs",  deckSlug: "mitsurugi" },
        ],
        matchResult: "loss",
        rounds: [
          { dsPlayerHandle: "Lonts94",  opponent: "naisa2786", opponentDeck: "Mitsurugi Ryzeal", dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "Lonts94",  opponent: "Tan",       opponentDeck: "Malice",           dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "Darkzill", opponent: "Tan",       opponentDeck: "Malice",           dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "Darkzill", opponent: "Zozozoe",   opponentDeck: "Mitsurugi",        dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "cain00",   opponent: "Zozozoe",   opponentDeck: "Mitsurugi",        dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "mev7901",  opponent: "Zozozoe",   opponentDeck: "Mitsurugi",        dsWins: 1, dsLosses: 0 },
          { dsPlayerHandle: "mev7901",  opponent: "_blue",     opponentDeck: "Malice",           dsWins: 0, dsLosses: 1 },
          { dsPlayerHandle: "yuryevna", opponent: "_blue",     opponentDeck: "Malice",           dsWins: 0, dsLosses: 1 },
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
  // WMGPxA 2024 opponents
  "snake eye":         "snake-eyes",
  "se":                "snake-eyes",
  "snake race":        "snake-race",
  "purrely":           "purrely",
  "r-ace":             "r-ace",
  "branded":           "branded-chimera",
  // TDC S1 2025 opponents (only decks we also field get a page)
  "mathmech":          "mathmech",
  "tenpai dragon":     "tenpai-dragon",
  "centur-ion":        "centur-ion",
  "voiceless voice":   "voiceless-voice",
  "fire king":         "fire-king",
  "yubel":             "yubel",
  "ritual beast":      "ritual-beast",
  "snake-eyes":        "snake-eyes",
  "tearlament":        "tearlaments",
  // Legend Cup S2 opponents (only decks we also field get a page)
  "malice":            "malice",
  "mitsurugi":         "mitsurugi",
  "mitsurugi ryzeal":  "mitsurugi",
  "ryzeal mitsurugi":  "mitsurugi",
  "gem-knight fs":     "gem-knight",
  "fs ryzeal":         "ryzeal",
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

/* ═══════════════ War Room — lineup analyzer ═══════════════ */

/** Normalize any opponent/deck free-text to a comparable key (our slug when aliased). */
function normalizeOpponentKey(name: string): string {
  const low = name.trim().toLowerCase();
  return opponentAlias[low] ?? low;
}

/**
 * Global head-to-head tally across every recorded tournament round:
 *   ourDeckSlug → opponentKey → { w, l }
 * opponentKey is our slug when the opponent's deck aliases to one, else the raw lowercased name.
 */
export function getGlobalMatchupTally(): Record<string, Record<string, { w: number; l: number }>> {
  const tally: Record<string, Record<string, { w: number; l: number }>> = {};
  for (const t of tournaments) {
    if (!t.weeks) continue;
    for (const w of t.weeks) {
      for (const r of w.rounds ?? []) {
        const ourSlug = w.deckList.find((d) => d.handle === r.dsPlayerHandle)?.deckSlug;
        if (!ourSlug || !r.opponentDeck) continue;
        const oppKey = normalizeOpponentKey(r.opponentDeck);
        (tally[ourSlug] ??= {});
        (tally[ourSlug][oppKey] ??= { w: 0, l: 0 });
        tally[ourSlug][oppKey].w += r.dsWins;
        tally[ourSlug][oppKey].l += r.dsLosses;
      }
    }
  }
  return tally;
}

export interface LineupPick {
  handle: string;
  deckSlug?: string;
  deckName: string;
}

export interface LineupAnalysis {
  duplicates: string[]; // deck names fielded by more than one player
  perDeck: {
    handle: string;
    deckName: string;
    deckSlug?: string;
    overall: { wins: number; losses: number; wr: number } | null; // career record of that deck
    vsExpected: { opponent: string; w: number; l: number; wr: number | null }[];
  }[];
  coverageGaps: string[]; // expected archetypes no submitted deck has a winning record against
}

/**
 * Advise a submitted lineup using real historical data.
 * `expected` = archetype names the captain expects to face (optional).
 */
export function analyzeLineup(picks: LineupPick[], expected: string[] = []): LineupAnalysis {
  const tally = getGlobalMatchupTally();

  // duplicate decks in the lineup
  const nameCount = new Map<string, number>();
  for (const p of picks) nameCount.set(p.deckName, (nameCount.get(p.deckName) ?? 0) + 1);
  const duplicates = [...nameCount.entries()].filter(([, n]) => n > 1).map(([name]) => name);

  const expectedKeys = expected.map((e) => ({ raw: e.trim(), key: normalizeOpponentKey(e) })).filter((e) => e.raw);

  const perDeck = picks.map((p) => {
    const deck = p.deckSlug ? getDeck(p.deckSlug) : undefined;
    const overall = deck
      ? { wins: deck.wins, losses: deck.losses, wr: deck.wins + deck.losses === 0 ? 0 : Math.round((deck.wins / (deck.wins + deck.losses)) * 100) }
      : null;
    const vsExpected = expectedKeys.map(({ raw, key }) => {
      const rec = p.deckSlug ? tally[p.deckSlug]?.[key] : undefined;
      const games = (rec?.w ?? 0) + (rec?.l ?? 0);
      return { opponent: raw, w: rec?.w ?? 0, l: rec?.l ?? 0, wr: games === 0 ? null : Math.round(((rec?.w ?? 0) / games) * 100) };
    });
    return { handle: p.handle, deckName: p.deckName, deckSlug: p.deckSlug, overall, vsExpected };
  });

  // a gap = an expected archetype where no submitted deck has a recorded winning record (>50%)
  const coverageGaps = expectedKeys
    .filter(({ key }) => {
      const covered = picks.some((p) => {
        const rec = p.deckSlug ? tally[p.deckSlug]?.[key] : undefined;
        const games = (rec?.w ?? 0) + (rec?.l ?? 0);
        return games > 0 && (rec!.w / games) > 0.5;
      });
      return !covered;
    })
    .map(({ raw }) => raw);

  return { duplicates, perDeck, coverageGaps };
}
