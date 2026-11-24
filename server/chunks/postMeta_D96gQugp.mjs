// src/lib/postMeta.ts
/** Neutral byline for a post whose author is missing (deleted user / legacy). */
function fallbackAuthorName(lang) {
	return lang === "de" ? "Tracht Digital Redaktion" : "Tracht Digital Editorial";
}
/** Up to two initials for the avatar stand-in; "TD" when the name has none. */
function authorInitials(name) {
	return name.split(/\s+/).map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase() || "TD";
}
/** Alt text for an author's avatar. */
function portraitAlt(name, lang) {
	return lang === "de" ? `Porträt von ${name}` : `Portrait of ${name}`;
}
/** "3. März 2026" / "March 3, 2026"; empty without a date. */
function formatPostDate(publishedAt, lang) {
	if (!publishedAt) return "";
	return new Date(publishedAt).toLocaleDateString(lang === "de" ? "de-DE" : "en-US", {
		year: "numeric",
		month: "long",
		day: "numeric"
	});
}
/** Words in a plain-text body. */
function countWords(plain) {
	return plain.split(/\s+/).filter(Boolean).length;
}
/** Reading time at 220 words a minute, at least one minute. */
function readingMinutes(wordCount) {
	return Math.max(1, Math.round(wordCount / 220));
}
export { portraitAlt as a, formatPostDate as i, countWords as n, readingMinutes as o, fallbackAuthorName as r, authorInitials as t };
