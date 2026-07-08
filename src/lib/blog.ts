export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  authorHandle: string; // player handle → name/avatar via getPlayer
  tag: "Meta" | "Tournament" | "Team News" | "Guide";
  cover: string; // image path
  body: { type: "p" | "h2"; text: string }[];
}

/* Placeholder content — owner will replace with real posts. */
const posts: BlogPost[] = [
  {
    slug: "jawir-2026-finals-recap",
    title: "Jawir 2026: How We Fought Our Way to the Finals",
    excerpt:
      "Eight phases, three Black EOS encounters, and a Kewl Tune engine that never stopped. The full story of our Jawir 2026 run.",
    date: "2026-07-07",
    authorHandle: "Darkzill",
    tag: "Tournament",
    cover: "/deck-art/kewl-tune.jpg",
    body: [
      { type: "p", text: "Five weeks of Swiss, a quarter-final, a semi-final rematch against Black EOS, and a grand final against DS Celestial. Jawir 2026 was the longest event this roster has ever played — and we came out of it as finalists with a 5–3 team record." },
      { type: "h2", text: "The Kewl Tune constant" },
      { type: "p", text: "Cain piloted Kewl Tune in all eight phases and finished 33–21 across 54 individual games. When the rest of the lineup shifted week to week, KT was the anchor every game plan was built around." },
      { type: "h2", text: "The Black EOS trilogy" },
      { type: "p", text: "We faced Black EOS twice — a 1–2 loss in Week 5 and a 2–1 revenge win in the semi-final. The adjustment between those two matches (Sieg switching to Radiant Typhoon, Lonts taking Branded) is the clearest example of why lineup flexibility wins team events." },
      { type: "p", text: "The final against DS Celestial slipped away 1–2, but a finals finish in a field this strong is a result the whole guild should be proud of. Full match data is on the tournament page." },
    ],
  },
  {
    slug: "kewl-tune-primer",
    title: "Deck Primer: Why Kewl Tune Carries Our Lineups",
    excerpt:
      "33 wins in one tournament. What makes Kewl Tune the most reliable engine in the DSCB arsenal — and where it struggles.",
    date: "2026-07-06",
    authorHandle: "cain00",
    tag: "Guide",
    cover: "/deck-art/kewl-tune.jpg",
    body: [
      { type: "p", text: "Kewl Tune rewards tight sequencing more than any deck I've played. This primer covers the core combo lines, the matchups that matter, and the tech choices we ran at Jawir 2026." },
      { type: "h2", text: "The matchup spread" },
      { type: "p", text: "Across Jawir the deck went 57% into Radiant Typhoon variants and near-even into Vanquish Soul K9. The mirror is a coin flip decided by who resolves their engine first — we went 3–4 in mirror games." },
      { type: "p", text: "A full card-by-card breakdown with the sample list is on the deck page. Ask in the guild Discord if you want the sequencing notes." },
    ],
  },
  {
    slug: "roster-update-season-2026",
    title: "Roster Update: Season 2026 Lineup Locked",
    excerpt:
      "Seven pilots, nine tournament decks, one goal. Meet the roster carrying the Celebeast banner this season.",
    date: "2026-07-01",
    authorHandle: "sieg121",
    tag: "Team News",
    cover: "/deck-art/hero-art-right.png",
    body: [
      { type: "p", text: "Season 2026 is officially underway. The competitive roster is locked at seven: Sieg (captain), Cain (vice-captain), Yuryevna, Lonts, Darkzill, Mev, and DSmajinboo." },
      { type: "h2", text: "Deck assignments" },
      { type: "p", text: "The tournament pool currently spans nine archetypes — Kewl Tune, Radiant Typhoon, Branded Despia, Vanquish Soul, Yummy, Magnet Warrior, Azamina Mitsurugi, Enneacraft, and Exosister. Player profiles list each pilot's favorite deck and per-phase history." },
      { type: "p", text: "More signings and guest appearances may happen mid-season. Watch this space." },
    ],
  },
];

export function getPosts(): BlogPost[] {
  return [...posts].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
