import type { BlogBlock, BlogPost } from "@tracht-digital-labs/tds-shared";
import { topicsOf } from "./interestWeights";
import { formatPostDate } from "./postMeta";
import { stripProductShortcodes } from "./productShortcodes";

/**
 * What the article page derives from a post, kept out of the component so each
 * rule has a test. The page shows these values and the JSON-LD repeats them, so
 * both read the same function.
 */

type Lang = "de" | "en";

/** The slice of every other post the related strip and prev/next read. */
export type ArticlePostRef = Pick<
  BlogPost,
  "slug" | "lang" | "category" | "title" | "excerpt" | "coverHint" | "tags" | "publishedAt" | "author"
>;

/** A post body in either format: parsed blocks, or the markdown post's HTML. */
export interface ArticleBody {
  blocks: BlogBlock[] | null;
  bodyHtml: string;
}

/**
 * One entry per slug, preferring the row in `lang`: every post is reachable in
 * both languages (authored or machine-translated), so related and prev/next
 * list each article once, with the metadata of the page's own language.
 */
export function onePerSlug<T extends { slug: string; lang: string }>(posts: T[], lang: Lang): T[] {
  const bySlug = new Map<string, T>();
  for (const p of posts) {
    if (!bySlug.has(p.slug) || p.lang === lang) bySlug.set(p.slug, p);
  }
  return [...bySlug.values()];
}

/** The readable text of the body, for the word count and the graph's `articleBody`. */
export function articlePlainText({ blocks, bodyHtml }: ArticleBody): string {
  if (blocks == null) return stripProductShortcodes(bodyHtml).replace(/<[^>]+>/g, " ");
  return blocks
    .map((b) => {
      if (b.type === "paragraph" || b.type === "heading" || b.type === "quote" || b.type === "callout") return b.text;
      if (b.type === "list") return b.items.join(" ");
      if (b.type === "code") return b.code;
      return "";
    })
    .join(" ");
}

/**
 * The outside sources the article links to, for the graph's `citation`.
 *
 * Read off the rendered body, which is the only honest source: every entry is
 * a link a reader can see and follow. A markdown post yields them from its
 * HTML; a block post from its button blocks, which is where a block article
 * puts an outbound link. Capped at ten, de-duplicated, and anything on a
 * tracht-digital.de host dropped: citing ourselves is not a source.
 */
export function articleCitations({ blocks, bodyHtml }: ArticleBody): string[] {
  const hrefs =
    blocks != null
      ? blocks.flatMap((b) => (b.type === "button" && b.href ? [b.href] : []))
      : [...bodyHtml.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]!);
  const external = hrefs.filter((href) => {
    try {
      return !new URL(href).hostname.endsWith("tracht-digital.de");
    } catch {
      return false;
    }
  });
  return Array.from(new Set(external)).slice(0, 10);
}

/** The next newer and next older post by publication date; null at either end. */
export function chronologicalNeighbours<T extends { slug: string; publishedAt?: string | null }>(
  posts: T[],
  slug: string,
): { newer: T | null; older: T | null } {
  const ordered = [...posts].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  const i = ordered.findIndex((p) => p.slug === slug);
  return {
    newer: i > 0 ? ordered[i - 1]! : null,
    older: i >= 0 && i < ordered.length - 1 ? ordered[i + 1]! : null,
  };
}

/**
 * When the text last changed, only if that is later than publication: an
 * "updated" line on the day of publication is noise, and `dateModified` in the
 * markup needs this date on the page to back it.
 */
export function laterUpdateLabel(
  publishedAt: string | null | undefined,
  updatedAt: string | null | undefined,
  lang: Lang,
): string | null {
  if (!updatedAt || !publishedAt || !(Date.parse(updatedAt) > Date.parse(publishedAt))) return null;
  return formatPostDate(updatedAt, lang);
}

/** The post's category and tags, once each, for the "Für dich" interest count. */
export function interestTopics(post: { category: string; tags?: string | null }): string[] {
  return Array.from(new Set(topicsOf(post)));
}
