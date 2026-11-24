/**
 * The small facts every view of a post shows the same way: who wrote it, when,
 * and how long it takes to read. Article page, print view, cards, hero and
 * the OG image all read them from here.
 */

type Lang = "de" | "en";

/** Neutral byline for a post whose author is missing (deleted user / legacy). */
export function fallbackAuthorName(lang: Lang): string {
  return lang === "de" ? "Tracht Digital Redaktion" : "Tracht Digital Editorial";
}

/** Up to two initials for the avatar stand-in; "TD" when the name has none. */
export function authorInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || "TD"
  );
}

/** Alt text for an author's avatar. */
export function portraitAlt(name: string, lang: Lang): string {
  return lang === "de" ? `Porträt von ${name}` : `Portrait of ${name}`;
}

/** "3. März 2026" / "March 3, 2026"; empty without a date. */
export function formatPostDate(publishedAt: string | null, lang: Lang): string {
  if (!publishedAt) return "";
  return new Date(publishedAt).toLocaleDateString(lang === "de" ? "de-DE" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Words in a plain-text body. */
export function countWords(plain: string): number {
  return plain.split(/\s+/).filter(Boolean).length;
}

/** Reading time at 220 words a minute, at least one minute. */
export function readingMinutes(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 220));
}
