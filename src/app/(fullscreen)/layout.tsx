import { TransitionProvider } from "@/components/persona/transition-provider";

/**
 * Bare full-screen chrome — no public nav/footer/smooth-scroll. Used by the shareable
 * /next-match poster, which owns the entire viewport. Keeps TransitionProvider so the
 * page's own TransitionLinks (back to site / view decks) still play the wipe.
 */
export default function FullscreenLayout({ children }: { children: React.ReactNode }) {
  return <TransitionProvider>{children}</TransitionProvider>;
}
