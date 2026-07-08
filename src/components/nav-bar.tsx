"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Magnetic from "./magnetic";

const LINKS = [
  { href: "/decks", label: "Decks" },
  { href: "/players", label: "Players" },
  { href: "/tournaments", label: "Tournaments" },
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
      className="grid h-9 w-9 place-items-center rounded-xl font-display text-sm font-bold text-white"
      style={{
        background: "linear-gradient(135deg, var(--color-brand-500), var(--color-flare-500))",
        boxShadow: "0 0 24px -4px var(--color-brand-500)",
      }}
    >
      DS
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
        <Link href="/" className="group flex items-center gap-2.5">
          <NavLogo />
          <span className="hidden font-display text-sm font-semibold tracking-tight text-fog-100 sm:block">
            Duel Standby <span className="text-fog-500">North Celebeast</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative rounded-lg px-3.5 py-2 text-sm transition-colors",
                  active ? "text-fog-100" : "text-fog-500 hover:text-fog-100"
                )}
              >
                {active && (
                  <span className="absolute inset-0 rounded-lg bg-white/5 ring-1 ring-white/10" />
                )}
                <span className="relative">{l.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="hidden md:block">
          <Magnetic>
            <Link
              href="/decks"
              className="rounded-xl px-4 py-2 text-sm font-medium text-white transition"
              style={{
                background: "linear-gradient(135deg, var(--color-brand-500), var(--color-flare-500))",
                boxShadow: "0 8px 30px -10px var(--color-brand-500)",
              }}
            >
              Team Decks
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
        <div className="glass absolute inset-x-4 top-20 rounded-2xl p-2 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block rounded-lg px-4 py-3 text-sm text-fog-300 hover:bg-white/5"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
