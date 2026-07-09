"use client";

import { TransitionLink } from "./persona/transition-provider";
import VisitorCounter from "./visitor-counter";

const LINKS = [
  { href: "/decks", label: "Decks" },
  { href: "/players", label: "Players" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/blog", label: "Blog" },
];

export default function Footer() {
  return (
    <footer className="mt-32">
      {/* diagonal stripe band — P5 caution-tape motif */}
      <div className="p-stripes h-2 w-full opacity-30" aria-hidden />
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-persona text-lg text-fog-100">Duel Standby · North Celebeast</p>
            <p className="mt-1 text-sm text-fog-500">Competitive Yu-Gi-Oh! — stats, decks, and results.</p>
          </div>
          <div className="flex gap-2 text-sm">
            {LINKS.map((l) => (
              <TransitionLink
                key={l.href}
                href={l.href}
                className="group relative overflow-hidden px-3 py-1.5 text-fog-500 transition-colors hover:text-white"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-[110%] -skew-x-12 bg-brand-500/80 transition-transform duration-200 group-hover:translate-x-0"
                />
                <span className="relative font-display text-sm font-bold uppercase italic tracking-wide">{l.label}</span>
              </TransitionLink>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1.5 border-t border-white/5 py-5 text-center text-xs text-fog-600 sm:flex-row sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} DSCB. Card data & art via YGOPRODeck. Fan project, not affiliated with Konami.</p>
          <VisitorCounter />
          <p>
            Built by{" "}
            <a
              href="https://darkzill.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fog-500 underline decoration-white/20 underline-offset-2 hover:text-fog-100"
            >
              Darkzill
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
