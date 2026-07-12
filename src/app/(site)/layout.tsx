import SmoothScroll from "@/components/smooth-scroll";
import NavBar from "@/components/nav-bar";
import Footer from "@/components/footer";
import { TransitionProvider } from "@/components/persona/transition-provider";

/** Public site chrome — nav, footer, page-wipe transitions, smooth scroll. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <TransitionProvider>
      <SmoothScroll>
        <NavBar />
        <main className="flex-1">{children}</main>
        <Footer />
      </SmoothScroll>
    </TransitionProvider>
  );
}
