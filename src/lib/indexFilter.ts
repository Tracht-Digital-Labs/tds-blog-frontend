import type { CardPost } from "~/components/PostCard";

/**
 * What the journal index (`islands/BlogIndex.tsx`) filters by: a category, a
 * reading-time band, a search query and an order. Pure, so the rules hold
 * without a rendered island.
 */

export interface IndexPost extends CardPost {
  tags?: string | null;
  /** Reads (Besucher-Statistik, else the CMS counter): the "most read" order. */
  viewCount?: number;
}

/** Reading-time bands of the filter bar. A post without a length is in none. */
export type LengthBand = "all" | "short" | "medium" | "long";
export type SortKey = "new" | "popular";

export const LENGTH_BANDS = ["all", "short", "medium", "long"] as const satisfies readonly LengthBand[];
export const SORT_KEYS = ["new", "popular"] as const satisfies readonly SortKey[];

export function inBand(minutes: number | null | undefined, band: LengthBand): boolean {
  if (band === "all") return true;
  if (!minutes) return false;
  if (band === "short") return minutes <= 3;
  if (band === "medium") return minutes > 3 && minutes <= 8;
  return minutes > 8;
}

function searchText(post: IndexPost): string {
  return [post.title, post.excerpt, post.category, post.tags ?? ""].join(" ").toLowerCase();
}

/** Every word of the query appears somewhere in title, excerpt, category or tags. */
export function matchesQuery(post: IndexPost, q: string): boolean {
  const query = q.trim().toLowerCase();
  if (!query) return true;
  const text = searchText(post);
  return query.split(/\s+/).every((word) => text.includes(word));
}

export interface IndexFilter {
  /** A category name, or "all". */
  cat: string;
  band: LengthBand;
  q: string;
  sort: SortKey;
}

/** The posts the filter lets through, newest first or by reads. */
export function filterPosts<P extends IndexPost>(posts: readonly P[], { cat, band, q, sort }: IndexFilter): P[] {
  const list = posts
    .filter((p) => (cat === "all" ? true : p.category === cat))
    .filter((p) => inBand(p.readingMinutes, band))
    .filter((p) => matchesQuery(p, q));
  // Array.prototype.sort is stable: equal reads keep newest-first.
  if (sort === "popular") list.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
  return list;
}

/** Pick the singular for exactly one, the plural for everything else. */
export function plural(forms: readonly [string, string], n: number): string {
  return n === 1 ? forms[0] : forms[1];
}
