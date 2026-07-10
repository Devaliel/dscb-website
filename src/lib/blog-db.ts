import { getSupabase, supabaseEnabled } from "./supabase";
import { getPosts as getStaticPosts, getPost as getStaticPost, type BlogPost } from "./blog";

/** Maps Supabase auth emails → player handles (lowercased compare). */
export const EMAIL_TO_HANDLE: Record<string, string> = {
  "darkzill0410@gmail.com": "Darkzill",
  "andresondakh121@gmail.com": "sieg121",
  "p13rr3.maxwell@gmail.com": "yuryevna",
  "cadullahrivaldy@gmail.com": "cain00",
  // War Room self-serve — add once their Supabase auth users exist:
  // "<mev-email>": "mev7901",
  // "<lonts-email>": "Lonts94",
  // "<awarix-email>": "awarix",
};

interface PostRow {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  cover: string;
  author_handle: string;
  body: { type: "p" | "h2"; text: string }[];
  created_at: string;
}

function rowToPost(row: PostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    date: row.created_at,
    authorHandle: row.author_handle,
    tag: (["Meta", "Tournament", "Team News", "Guide"].includes(row.tag)
      ? row.tag
      : "Team News") as BlogPost["tag"],
    cover: row.cover,
    body: Array.isArray(row.body) ? row.body : [],
  };
}

/** All posts — DB posts merged over static placeholders (DB wins on slug), newest first. */
export async function fetchPosts(): Promise<BlogPost[]> {
  const statics = getStaticPosts();
  if (!supabaseEnabled) return statics;
  try {
    const { data, error } = await getSupabase()
      .from("posts")
      .select("slug,title,excerpt,tag,cover,author_handle,body,created_at")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (error || !data) return statics;
    const db = (data as unknown as PostRow[]).map(rowToPost);
    const dbSlugs = new Set(db.map((p) => p.slug));
    return [...db, ...statics.filter((p) => !dbSlugs.has(p.slug))].sort(
      (a, b) => +new Date(b.date) - +new Date(a.date)
    );
  } catch {
    return statics;
  }
}

export async function fetchPost(slug: string): Promise<BlogPost | undefined> {
  if (supabaseEnabled) {
    try {
      const { data, error } = await getSupabase()
        .from("posts")
        .select("slug,title,excerpt,tag,cover,author_handle,body,created_at")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (!error && data) return rowToPost(data as unknown as PostRow);
    } catch {
      // fall through to static
    }
  }
  return getStaticPost(slug);
}
