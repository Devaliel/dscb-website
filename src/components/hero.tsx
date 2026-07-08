"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Magnetic from "./magnetic";
import Star from "./persona/star";
import { TransitionLink } from "./persona/transition-provider";

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

      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[3fr_2fr]">
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-fade mb-6 inline-block -skew-x-12 border border-white/15 bg-white/5 px-4 py-1.5"
          >
            <span className="flex skew-x-12 items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-fog-300">
              <Star className="h-2.5 w-2.5 text-cyber-400" />
              Season 2026 — live rankings
            </span>
          </motion.div>

          <h1 className="text-persona hero-fade text-5xl leading-[0.95] text-fog-100 sm:text-7xl md:text-8xl lg:text-6xl xl:text-7xl 2xl:text-8xl">
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
              className="mt-3 block overflow-visible"
              initial="hidden"
              animate="show"
              transition={{ staggerChildren: 0.12, delayChildren: 0.25 }}
            >
              <motion.span className="relative inline-block" variants={word} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
                {/* accent slab snaps in behind the second line */}
                <motion.span
                  aria-hidden
                  className="absolute -inset-x-3 inset-y-0 -z-10 -skew-x-6"
                  style={{ background: "linear-gradient(100deg, var(--color-brand-500), var(--color-flare-500))", boxShadow: "6px 6px 0 rgba(0,0,0,0.45)" }}
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                />
                <span className="px-1 text-white">North Celebeast</span>
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
              <TransitionLink
                href="/decks"
                className="p-hover-flicker inline-block -skew-x-12 px-7 py-3 transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, var(--color-brand-500), var(--color-flare-500))",
                  boxShadow: "5px 5px 0 rgba(0,0,0,0.55)",
                }}
              >
                <span className="block skew-x-12 font-display text-sm font-extrabold uppercase italic tracking-wide text-white">
                  View team decks
                </span>
              </TransitionLink>
            </Magnetic>
            <TransitionLink
              href="/players"
              className="p-hover-flicker inline-block -skew-x-12 border-[1.5px] border-white/25 bg-white/5 px-7 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:bg-white/10"
              style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.45)" }}
            >
              <span className="block skew-x-12 font-display text-sm font-extrabold uppercase italic tracking-wide text-fog-100">
                Meet the roster
              </span>
            </TransitionLink>
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

        {/* hero art — Yubel, proportional right column */}
        <HeroArt src="/deck-art/hero-art-right.png" glow="var(--color-brand-500)" />
      </div>
    </section>
  );
}

function HeroArt({ src, glow }: { src: string; glow: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;

  // soft fade on the sides only — feet stay visible
  const mask =
    "radial-gradient(ellipse 74% 105% at 50% 42%, black 42%, transparent 90%)";
  // solid-color silhouette via alpha mask of the PNG itself
  const silhouette = (color: string): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    background: color,
    maskImage: `url(${src})`,
    WebkitMaskImage: `url(${src})`,
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "bottom",
    WebkitMaskPosition: "bottom",
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 120, skewX: -6 }}
      animate={{ opacity: 1, x: 0, skewX: 0 }}
      transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none hidden select-none justify-center lg:flex"
      aria-hidden
    >
      <motion.div
        className="hero-art-r relative aspect-[2/3] w-full max-w-sm"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Persona-style colored echoes behind the cutout */}
        <motion.div
          style={{ ...silhouette("var(--color-cyber-500)"), opacity: 0.16 }}
          animate={{ x: [-10, -16, -10], y: [8, 12, 8] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={{ ...silhouette("var(--color-brand-500)"), opacity: 0.18 }}
          animate={{ x: [10, 16, 10], y: [-6, -10, -6] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* the character */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          draggable={false}
          onError={() => setOk(false)}
          className="relative h-full w-full object-contain object-bottom"
          style={{
            opacity: 0.45,
            filter: `saturate(1.05) drop-shadow(0 0 60px color-mix(in oklab, ${glow} 40%, transparent))`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

function HeroStat({ v, l }: { v: string | number; l: string }) {
  return (
    <div className="-skew-x-6 border border-white/10 bg-ink-850/80 py-4 backdrop-blur" style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.4)" }}>
      <div className="skew-x-6">
        <p className="font-display text-2xl font-extrabold italic text-fog-100">{v}</p>
        <p className="mt-0.5 text-[11px] uppercase tracking-wider text-fog-500">{l}</p>
      </div>
    </div>
  );
}
