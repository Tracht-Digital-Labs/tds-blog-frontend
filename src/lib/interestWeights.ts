/**
 * The reader's topic weights (the first-party `tds-interests` cookie) and the
 * one way the journal turns them into recommendations — for "Für dich"
 * (`islands/ForYou.tsx`) and the hero's personal tab (`islands/HeroSlider.tsx`).
 *
 * Pure and free of the consent store, so the islands can use it without
 * loading it; WRITING the weights is `interests.ts`, which asks for consent.
 */
export const INTERESTS_COOKIE = "tds-interests";
const MAX_TOPICS = 12;
const MAX_WEIGHT = 50;

/** The weights in a cookie string; anything malformed reads as no profile. */
export function readInterests(cookie: string): Record<string, number> {
  const match = cookie.match(/(?:^|; )tds-interests=([^;]*)/);
  if (!match) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1] ?? "")) as unknown;
    if (typeof parsed !== "object" || parsed === null) return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed)) if (typeof v === "number") out[k] = v;
    return out;
  } catch {
    return {};
  }
}

/** Add one read of each topic, keep the strongest twelve. */
export function bumpInterests(weights: Record<string, number>, topics: readonly string[]): Record<string, number> {
  const next = { ...weights };
  for (const t of topics) next[t] = Math.min((next[t] ?? 0) + 1, MAX_WEIGHT);
  return Object.fromEntries(
    Object.entries(next)
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_TOPICS),
  );
}

export function clearInterests(): void {
  try {
    document.cookie = `${INTERESTS_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
  } catch {
    /* cookies disabled — nothing stored either */
  }
}

interface Topical {
  category: string;
  tags?: string | null;
  publishedAt?: string | null;
}

/** A post's topics as the weights count them: its category and tags, lower-case. */
export function topicsOf(post: Topical): string[] {
  return [post.category, ...(post.tags ?? "").split(",")]
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * The posts the reader's topics point to: scored by the summed weight of
 * their topics, strongest first and newer first among equals. A post that
 * scores nothing is left out.
 */
export function recommend<P extends Topical>(posts: readonly P[], weights: Record<string, number>, limit: number): P[] {
  return posts
    .map((post) => ({ post, score: topicsOf(post).reduce((sum, topic) => sum + (weights[topic] ?? 0), 0) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || (b.post.publishedAt ?? "").localeCompare(a.post.publishedAt ?? ""))
    .slice(0, limit)
    .map((s) => s.post);
}
