"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Magnetic from "./magnetic";
import { TransitionLink } from "./persona/transition-provider";

const LINKS = [
  { href: "/decks", label: "Decks" },
  { href: "/players", label: "Players" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/blog", label: "Blog" },
  { href: "/guestbook", label: "Guestbook" },
];

function NavLogo() {
  const [ok, setOk] = useState(true);
  if (ok) {
    return (
      <Image
        src="/celebeast-logo.png"
        alt="Duel Standby North Celebeast"
        width={36}
        height={36}
        className="h-9 w-9 rounded-xl object-contain"
        onError={() => setOk(false)}
        priority
      />
    );
  }
  return (
    <span
      className="grid h-9 w-9 -skew-x-6 place-items-center font-display text-sm font-extrabold italic text-white"
      style={{
        background: "linear-gradient(135deg, var(--color-brand-500), var(--color-flare-500))",
        boxShadow: "3px 3px 0 rgba(0,0,0,0.5)",
      }}
    >
      <span className="skew-x-6">DS</span>
    </span>
  );
}

export default function NavBar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        className={cn(
          "flex w-full max-w-6xl items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300",
          scrolled ? "glass shadow-2xl" : "border border-transparent"
        )}
      >
        <TransitionLink href="/" className="group flex items-center gap-2.5">
          <NavLogo />
          <span className="hidden font-display text-sm font-semibold tracking-tight text-fog-100 sm:block">
            Duel Standby <span className="text-fog-500">North Celebeast</span>
          </span>
        </TransitionLink>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <TransitionLink
                key={l.href}
                href={l.href}
                className={cn(
                  "group relative overflow-hidden px-4 py-2 text-sm transition-colors",
                  active ? "text-white" : "text-fog-500 hover:text-white"
                )}
              >
                {/* skewed fill — slides in on hover, solid when active */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-0 -skew-x-12 transition-transform duration-200 ease-out",
                    active
                      ? "translate-x-0 bg-brand-500"
                      : "-translate-x-[110%] bg-brand-500/80 group-hover:translate-x-0"
                  )}
                  style={{ boxShadow: active ? "3px 3px 0 rgba(0,0,0,0.4)" : undefined }}
                />
                <span className="relative font-display text-sm font-bold uppercase italic tracking-wide">
                  {l.label}
                </span>
              </TransitionLink>
            );
          })}
        </div>

        <div className="hidden md:block">
          <Magnetic>
            {/* plain Link — the wipe provider lives in the (site) layout and unmounts when leaving it */}
            <Link
              href="/warroom"
              className="p-hover-flicker inline-block -skew-x-12 px-5 py-2 transition-transform duration-150 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, var(--color-brand-500), var(--color-flare-500))",
                boxShadow: "4px 4px 0 rgba(0,0,0,0.5)",
              }}
            >
              <span className="block skew-x-12 text-center">
                <span className="block font-display text-sm font-extrabold uppercase italic tracking-wide text-white">
                  War Room
                </span>
                <span className="-mt-0.5 block text-[8px] font-bold uppercase tracking-[0.28em] text-white/70">
                  Members only
                </span>
              </span>
            </Link>
          </Magnetic>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-lg text-fog-300 md:hidden"
          aria-label="Menu"
        >
          <div className="space-y-1.5">
            <span className={cn("block h-0.5 w-5 bg-current transition", open && "translate-y-2 rotate-45")} />
            <span className={cn("block h-0.5 w-5 bg-current transition", open && "opacity-0")} />
            <span className={cn("block h-0.5 w-5 bg-current transition", open && "-translate-y-2 -rotate-45")} />
          </div>
        </button>
      </nav>

      {open && (
        <div className="clip-corner glass absolute inset-x-4 top-20 p-2 md:hidden">
          <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />
          {LINKS.map((l) => (
            <TransitionLink
              key={l.href}
              href={l.href}
              className="relative block px-4 py-3 font-display text-sm font-bold uppercase italic tracking-wide text-fog-300 hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </TransitionLink>
          ))}
          <Link
            href="/warroom"
            className="relative flex items-center gap-2 px-4 py-3 font-display text-sm font-bold uppercase italic tracking-wide text-brand-300 hover:bg-white/5 hover:text-brand-200"
          >
            War Room
            <span className="not-italic rounded-full border border-brand-400/40 bg-brand-500/15 px-2 py-0.5 text-[9px] tracking-[0.18em]">
              Members only
            </span>
          </Link>
        </div>
      )}
    </header>
  );
}
