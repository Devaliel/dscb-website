"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Star from "./star";

/**
 * P5R-style screen-wipe page transitions.
 * Click a TransitionLink → 3 diagonal wedges sweep in (cover) → route change →
 * wedges sweep out (reveal). Respects prefers-reduced-motion (plain fast fade).
 */

const TransitionContext = createContext<{ navigate: (href: string) => void }>({
  navigate: () => {},
});

const COVER_MS = 480;
const REVEAL_DELAY_MS = 120; // let the new page paint behind the overlay
const REVEAL_MS = 520;

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "cover" | "reveal">("idle");
  const pendingHref = useRef<string | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const navigate = useCallback(
    (href: string) => {
      if (href === pathname || phase !== "idle") return;
      if (reduced.current) {
        router.push(href);
        return;
      }
      pendingHref.current = href;
      setPhase("cover");
      // push once the wedges have covered the screen
      window.setTimeout(() => {
        router.push(href);
      }, COVER_MS);
    },
    [pathname, phase, router]
  );

  // when the new route has mounted, sweep the wedges away
  useEffect(() => {
    if (phase === "cover" && pendingHref.current && pathname === pendingHref.current.split("?")[0]) {
      pendingHref.current = null;
      const t = window.setTimeout(() => setPhase("reveal"), REVEAL_DELAY_MS);
      return () => window.clearTimeout(t);
    }
  }, [pathname, phase]);

  useEffect(() => {
    if (phase === "reveal") {
      const t = window.setTimeout(() => setPhase("idle"), REVEAL_MS + 200);
      return () => window.clearTimeout(t);
    }
  }, [phase]);

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <Wipe phase={phase} />
    </TransitionContext.Provider>
  );
}

function Wipe({ phase }: { phase: "idle" | "cover" | "reveal" }) {
  // wedges: skewed full-screen bands sliding across
  const wedges = [
    { bg: "var(--color-cyber-500)", delay: 0 },
    { bg: "var(--color-brand-500)", delay: 70 },
    { bg: "var(--color-ink-950)", delay: 140 },
  ];

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      style={{ visibility: phase === "idle" ? "hidden" : "visible" }}
    >
      {wedges.map((w, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            inset: "-12% -30%",
            background: w.bg,
            transform:
              phase === "cover"
                ? "skewX(-14deg) translateX(0%)"
                : phase === "reveal"
                ? "skewX(-14deg) translateX(115%)"
                : "skewX(-14deg) translateX(-115%)",
            transition:
              phase === "idle"
                ? "none"
                : `transform ${phase === "cover" ? COVER_MS : REVEAL_MS}ms cubic-bezier(0.83, 0, 0.17, 1) ${w.delay + (phase === "reveal" ? (wedges.length - 1 - i) * 0 : 0)}ms`,
          }}
        />
      ))}
      {/* star flash on the black wedge */}
      <div
        className="absolute inset-0 grid place-items-center"
        style={{
          opacity: phase === "cover" ? 1 : 0,
          transition: `opacity 200ms ease ${phase === "cover" ? COVER_MS - 60 : 0}ms`,
        }}
      >
        <div className="flex items-center gap-3 text-fog-100">
          <Star className="h-8 w-8 animate-[p-pop_0.4s_ease]" />
          <span className="text-persona text-3xl tracking-tight">DSCB</span>
        </div>
      </div>
    </div>
  );
}

export function useTransitionRouter() {
  return useContext(TransitionContext);
}

/** Drop-in replacement for next/link that plays the screen wipe. */
export function TransitionLink({
  href,
  children,
  className,
  style,
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const { navigate } = useTransitionRouter();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    // allow modified clicks (new tab etc.) to behave natively
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onClick?.();
    navigate(href);
  };
  return (
    <Link href={href} onClick={handle} className={className} style={style}>
      {children}
    </Link>
  );
}
