import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import PlayerAvatar from "@/components/player-avatar";
import Star from "@/components/persona/star";
import { getPost, getPosts } from "@/lib/blog";
import { getPlayer, getDeck } from "@/lib/data";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  return { title: post ? post.title : "Post", description: post?.excerpt };
}

const TAG_COLOR: Record<string, string> = {
  Meta: "var(--color-flare-400)",
  Tournament: "var(--color-cyber-500)",
  "Team News": "var(--color-brand-500)",
  Guide: "#22D3EE",
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const author = getPlayer(post.authorHandle);
  const authorDeck = author ? getDeck(author.mainDeckSlug) : undefined;
  const accent = TAG_COLOR[post.tag] ?? "var(--color-brand-500)";
  const more = getPosts().filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      {/* cover banner with blade cut */}
      <div className="clip-blade relative h-80 w-full overflow-hidden sm:h-[26rem]">
        <Image src={post.cover} alt="" fill className="object-cover opacity-50 saturate-[1.1]" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-ink-950/20" />
        <div className="halftone absolute inset-0 opacity-[0.05]" aria-hidden />
      </div>

      <article className="mx-auto max-w-3xl px-6">
        <Reveal className="-mt-32 relative">
          <Link href="/blog" className="mb-5 inline-block text-sm text-fog-300 hover:text-fog-100">
            ← Blog
          </Link>
          <div className="flex items-center gap-3">
            <span
              className="-skew-x-12 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white"
              style={{ background: `color-mix(in oklab, ${accent} 85%, black)`, boxShadow: "3px 3px 0 rgba(0,0,0,0.45)" }}
            >
              <span className="block skew-x-12">{post.tag}</span>
            </span>
            <span className="text-xs text-fog-500">
              {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <h1 className="text-persona mt-4 -rotate-1 text-4xl leading-[1.02] text-fog-100 sm:text-5xl">
            {post.title}
          </h1>
          <div
            className="mt-4 h-1.5 w-32 -skew-x-12"
            style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
          />

          {/* byline */}
          {author && (
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden">
                <PlayerAvatar player={author} accent={authorDeck?.accent ?? "var(--color-brand-400)"} size="card" className="h-full w-full" />
              </div>
              <div>
                <Link href={`/players/${author.handle}`} className="text-sm font-semibold text-fog-100 hover:text-white">
                  {author.name}
                </Link>
                <p className="text-xs text-fog-500">{author.tagline}</p>
              </div>
            </div>
          )}
        </Reveal>

        {/* body */}
        <Reveal delay={0.1} className="mt-10 space-y-5 pb-4">
          {post.body.map((block, i) =>
            block.type === "h2" ? (
              <h2 key={i} className="text-persona flex items-center gap-2.5 pt-4 text-2xl text-fog-100">
                <Star className="h-3.5 w-3.5 shrink-0 text-cyber-400" />
                {block.text}
              </h2>
            ) : (
              <p key={i} className="text-[1.05rem] leading-relaxed text-fog-300">
                {block.text}
              </p>
            )
          )}
        </Reveal>

        {/* more posts */}
        {more.length > 0 && (
          <div className="mt-16 border-t border-white/10 pt-10 pb-20">
            <h2 className="text-persona mb-6 text-xl text-fog-100">More posts</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {more.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="clip-corner group border border-white/10 bg-ink-850 p-5 transition-transform hover:-translate-y-0.5"
                  style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.4)" }}
                >
                  <p className="text-xs text-fog-500">
                    {new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <h3 className="text-persona mt-1.5 text-lg text-fog-100 group-hover:text-white">{p.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}
