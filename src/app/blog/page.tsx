import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHeader from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import Star from "@/components/persona/star";
import { getPosts } from "@/lib/blog";
import { getPlayer } from "@/lib/data";

export const metadata: Metadata = {
  title: "Blog",
  description: "Tournament recaps, deck primers and team news from DSCB.",
};

const TAG_COLOR: Record<string, string> = {
  Meta: "var(--color-flare-400)",
  Tournament: "var(--color-cyber-500)",
  "Team News": "var(--color-brand-500)",
  Guide: "#22D3EE",
};

function TagChip({ tag }: { tag: string }) {
  return (
    <span
      className="-skew-x-12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white"
      style={{ background: `color-mix(in oklab, ${TAG_COLOR[tag] ?? "var(--color-brand-500)"} 85%, black)`, boxShadow: "3px 3px 0 rgba(0,0,0,0.45)" }}
    >
      <span className="block skew-x-12">{tag}</span>
    </span>
  );
}

export default function BlogPage() {
  const [featured, ...rest] = getPosts();
  const featuredAuthor = getPlayer(featured.authorHandle);

  return (
    <>
      <PageHeader
        eyebrow="The feed"
        title="Blog"
        subtitle="Tournament recaps, deck primers and team news — straight from the roster."
      />
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* featured post */}
        <Reveal>
          <Link
            href={`/blog/${featured.slug}`}
            className="clip-corner group relative block overflow-hidden border border-white/10 bg-ink-850"
            style={{ boxShadow: "6px 6px 0 rgba(0,0,0,0.5)" }}
          >
            <div className="relative h-72 w-full sm:h-96">
              <Image
                src={featured.cover}
                alt=""
                fill
                className="object-cover opacity-60 saturate-[1.1] transition-transform duration-300 group-hover:scale-[1.03]"
                sizes="(max-width: 1152px) 100vw, 1152px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
              <div className="halftone absolute inset-0 opacity-[0.05]" aria-hidden />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <TagChip tag={featured.tag} />
                  <span className="text-xs text-fog-500">
                    {new Date(featured.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    {featuredAuthor && <> · {featuredAuthor.name}</>}
                  </span>
                </div>
                <h2 className="text-persona mt-3 max-w-3xl text-3xl text-fog-100 sm:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm text-fog-300 sm:text-base">{featured.excerpt}</p>
              </div>
            </div>
          </Link>
        </Reveal>

        {/* the rest */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {rest.map((post, i) => {
            const author = getPlayer(post.authorHandle);
            return (
              <Reveal key={post.slug} delay={i * 0.06}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="clip-corner group relative block overflow-hidden border border-white/10 bg-ink-850 transition-transform hover:-translate-y-1"
                  style={{ boxShadow: "5px 5px 0 rgba(0,0,0,0.45)" }}
                >
                  <div className="relative h-40 w-full">
                    <Image
                      src={post.cover}
                      alt=""
                      fill
                      className="object-cover opacity-50 transition-opacity duration-200 group-hover:opacity-70"
                      sizes="(max-width: 640px) 100vw, 560px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />
                    <div className="absolute left-4 top-4">
                      <TagChip tag={post.tag} />
                    </div>
                  </div>
                  <div className="relative p-5">
                    <div className="halftone pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />
                    <p className="text-xs text-fog-500">
                      {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      {author && <> · {author.name}</>}
                    </p>
                    <h3 className="text-persona mt-2 text-xl text-fog-100">{post.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-fog-500">{post.excerpt}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-cyber-400">
                      <Star className="h-2.5 w-2.5" /> Read post
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </>
  );
}
