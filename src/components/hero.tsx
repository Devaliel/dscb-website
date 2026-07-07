"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Magnetic from "./magnetic";

export default function Hero({
  topDeckWr,
  titles,
  players,
}: {
  topDeckWr: number;
  titles: number;
  players: number;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.to(".hero-parallax", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-fade", {
        opacity: 0,
        y: -40,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      // flanking card art — drift at different speeds and melt away on scroll
      gsap.to(".hero-art-l", {
        yPercent: 22,
        xPercent: -8,
        rotate: -3,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-art-r", {
        yPercent: 32,
        xPercent: 8,
        rotate: 3,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const word = { hidden: { y: "110%" }, show: { y: 0 } };

  return (
    <section ref={root} className="relative overflow-hidden px-6 pb-20 pt-40 sm:pt-48">
      {/* animated orbs */}
      <div className="hero-parallax pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-24 h-72 w-72 animate-pulse rounded-full bg-brand-500/25 blur-[100px]" />
        <div className="absolute right-1/4 top-40 h-72 w-72 rounded-full bg-cyber-500/20 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-flare-500/15 blur-[100px]" />
      </div>

      {/* flanking card art — blurred into the aurora, parallax on scroll */}
      <HeroArt src="/deck-art/hero-art-left.png" side="left" glow="var(--color-cyber-500)" />
      <HeroArt src="/deck-art/hero-art-right.png" side="right" glow="var(--color-brand-500)" />

      <div className="mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hero-fade mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-fog-300"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyber-400" />
          Season 2026 — live rankings
        </motion.div>

        <h1 className="hero-fade font-display text-5xl font-bold leading-[0.95] tracking-tight text-fog-100 sm:text-7xl md:text-8xl">
          <motion.span
            className="block overflow-hidden"
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.12, delayChildren: 0.1 }}
          >
            <motion.span className="block" variants={word} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
              Duel Standby
            </motion.span>
          </motion.span>
          <motion.span
            className="mt-2 block overflow-hidden"
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.12, delayChildren: 0.25 }}
          >
            <motion.span
              className="text-gradient block"
              variants={word}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              North Celebeast
            </motion.span>
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="hero-fade mx-auto mt-7 max-w-2xl text-lg text-fog-300"
        >
          The competitive home of the DSCB Yu-Gi-Oh! roster. Team decks, player
          stats, tournament results and matchup data — all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.62 }}
          className="hero-fade mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Magnetic>
            <Link
              href="/decks"
              className="rounded-xl px-6 py-3 font-medium text-white"
              style={{
                background: "linear-gradient(135deg, var(--color-brand-500), var(--color-flare-500))",
                boxShadow: "0 10px 40px -12px var(--color-brand-500)",
              }}
            >
              View team decks
            </Link>
          </Magnetic>
          <Link
            href="/players"
            className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-medium text-fog-100 transition hover:bg-white/10"
          >
            Meet the roster
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="hero-fade mx-auto mt-16 grid max-w-lg grid-cols-3 gap-4"
        >
          <HeroStat v={`${topDeckWr}%`} l="Top deck WR" />
          <HeroStat v={titles} l="Titles won" />
          <HeroStat v={players} l="Roster" />
        </motion.div>
      </div>
    </section>
  );
}

function HeroArt({ src, side, glow }: { src: string; side: "left" | "right"; glow: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -70 : 70, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 1.4, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`pointer-events-none absolute top-16 -z-[5] hidden select-none lg:block ${
        side === "left" ? "-left-16 xl:left-0" : "-right-16 xl:right-0"
      }`}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        onError={() => setOk(false)}
        className={side === "left" ? "hero-art-l" : "hero-art-r"}
        style={{
          height: "42rem",
          width: "auto",
          objectFit: "contain",
          opacity: 0.38,
          filter: `blur(0.6px) saturate(1.15) drop-shadow(0 0 80px color-mix(in oklab, ${glow} 45%, transparent))`,
          maskImage:
            "radial-gradient(ellipse 78% 74% at 50% 44%, black 55%, transparent 98%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 78% 74% at 50% 44%, black 55%, transparent 98%)",
        }}
      />
    </motion.div>
  );
}

function HeroStat({ v, l }: { v: string | number; l: string }) {
  return (
    <div className="glass rounded-2xl py-4">
      <p className="font-display text-2xl font-bold text-fog-100">{v}</p>
      <p className="mt-0.5 text-xs text-fog-500">{l}</p>
    </div>
  );
}
