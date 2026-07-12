import type { Metadata } from "next";
import Link from "next/link";
import Star from "@/components/persona/star";

export const metadata: Metadata = { title: "War Room" };

/**
 * Internal portal chrome — deliberately separate from the public site:
 * no public nav, no footer, just a slim top bar and the tool itself.
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-950/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <span className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/celebeast-logo.png" alt="" className="h-7 w-7 rounded-lg object-contain" />
            <span className="font-display text-sm font-extrabold uppercase italic tracking-wide text-fog-100">
              DSCB <span className="text-brand-300">War Room</span>
            </span>
            <span className="hidden items-center gap-1 -skew-x-12 bg-cyber-500 px-2 py-0.5 sm:inline-flex">
              <span className="flex skew-x-12 items-center gap-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white">
                <Star className="h-2 w-2" /> Internal
              </span>
            </span>
          </span>
          <Link href="/" className="text-xs text-fog-500 transition-colors hover:text-fog-100">
            ← Back to site
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
