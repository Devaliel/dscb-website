import type { ReactNode, CSSProperties } from "react";

/**
 * Persona content panel — angular clip, halftone texture, optional accent edge.
 */
export default function PPanel({
  children,
  accent,
  className = "",
  style,
}: {
  children: ReactNode;
  accent?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`relative ${className}`} style={style}>
      {/* offset shadow shape */}
      <div
        aria-hidden
        className="clip-corner absolute inset-0 translate-x-1.5 translate-y-1.5 bg-black/60"
      />
      <div className="clip-corner relative overflow-hidden border border-white/10 bg-ink-850">
        <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />
        {accent && (
          <div
            aria-hidden
            className="absolute left-0 top-0 h-full w-1"
            style={{ background: `linear-gradient(180deg, ${accent}, transparent 80%)` }}
          />
        )}
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
