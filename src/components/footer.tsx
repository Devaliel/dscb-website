import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-32 border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg font-semibold text-fog-100">Duel Standby · North Celebeast</p>
          <p className="mt-1 text-sm text-fog-500">Competitive Yu-Gi-Oh! — stats, decks, and results.</p>
        </div>
        <div className="flex gap-6 text-sm text-fog-500">
          <Link href="/decks" className="hover:text-fog-100">Decks</Link>
          <Link href="/players" className="hover:text-fog-100">Players</Link>
          <Link href="/tournaments" className="hover:text-fog-100">Tournaments</Link>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1.5 border-t border-white/5 py-5 text-center text-xs text-fog-600 sm:flex-row sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} DSCB. Card data & art via YGOPRODeck. Fan project, not affiliated with Konami.</p>
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
    </footer>
  );
}
