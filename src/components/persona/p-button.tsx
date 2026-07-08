"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Persona parallelogram button.
 * variant "solid" — accent-filled slab with hard offset shadow.
 * variant "ghost" — outlined, fills on hover.
 */
export default function PButton({
  href,
  children,
  variant = "solid",
  accent = "var(--color-brand-500)",
  className = "",
  onClick,
}: {
  href?: string;
  children: ReactNode;
  variant?: "solid" | "ghost";
  accent?: string;
  className?: string;
  onClick?: () => void;
}) {
  const shell =
    "group relative inline-block -skew-x-12 px-7 py-3 transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 p-hover-flicker " +
    className;

  const style =
    variant === "solid"
      ? {
          background: accent,
          boxShadow: `5px 5px 0 rgba(0,0,0,0.55), 5px 5px 0 1px color-mix(in oklab, ${accent} 35%, transparent)`,
        }
      : {
          background: "rgba(255,255,255,0.04)",
          border: `1.5px solid color-mix(in oklab, ${accent} 60%, white 10%)`,
          boxShadow: "4px 4px 0 rgba(0,0,0,0.45)",
        };

  const label = (
    <span
      className={`block skew-x-12 font-display text-sm font-extrabold uppercase italic tracking-wide ${
        variant === "solid" ? "text-white" : "text-fog-100"
      }`}
    >
      {children}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={shell} style={style} onClick={onClick}>
        {label}
      </Link>
    );
  }
  return (
    <button type="button" className={shell} style={style} onClick={onClick}>
      {label}
    </button>
  );
}
