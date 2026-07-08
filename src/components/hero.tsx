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
      // hero art — drifts down and melts away on scroll
      gsap.to(".hero-art-r", {
        yPercent: 18,
        xPercent: 5,
        rotate: 2,
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

      {/* single hero art — Yubel, blended into the aurora on the right */}
      <HeroArt src="/deck-art/hero-art-right.png" glow="var(--color-brand-500)" />

      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl text-center lg:text-left">
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
            className="hero-fade mx-auto mt-7 max-w-2xl text-lg text-fog-300 lg:mx-0"
          >
            The competitive home of the DSCB Yu-Gi-Oh! roster. Team decks, player
            stats, tournament results and matchup data — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.62 }}
            className="hero-fade mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
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
            className="hero-fade mx-auto mt-16 grid max-w-lg grid-cols-3 gap-4 lg:mx-0"
          >
            <HeroStat v={`${topDeckWr}%`} l="Top deck WR" />
            <HeroStat v={titles} l="Titles won" />
            <HeroStat v={players} l="Roster" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroArt({ src, glow }: { src: string; glow: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.4, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none absolute -right-8 bottom-0 -z-[5] hidden select-none lg:block xl:right-6 2xl:right-24"
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        onError={() => setOk(false)}
        className="hero-art-r"
        style={{
          height: "40rem",
          width: "auto",
          objectFit: "contain",
          marginBottom: "-4rem",
          opacity: 0.5,
          filter: `saturate(1.05) drop-shadow(0 0 70px color-mix(in oklab, ${glow} 45%, transparent))`,
          maskImage:
            "radial-gradient(ellipse 72% 74% at 52% 38%, black 38%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 72% 74% at 52% 38%, black 38%, transparent 82%)",
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
