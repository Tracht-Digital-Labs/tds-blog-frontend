// src/lib/interestWeights.ts
/**
* The reader's topic weights (the first-party `tds-interests` cookie) and the
* one way the journal turns them into recommendations — for "Für dich"
* (`islands/ForYou.tsx`) and the hero's personal tab (`islands/HeroSlider.tsx`).
*
* Pure and free of the consent store, so the islands can use it without
* loading it; WRITING the weights is `interests.ts`, which asks for consent.
*/
var INTERESTS_COOKIE = "tds-interests";
/** The weights in a cookie string; anything malformed reads as no profile. */
function readInterests(cookie) {
	const match = cookie.match(/(?:^|; )tds-interests=([^;]*)/);
	if (!match) return {};
	try {
		const parsed = JSON.parse(decodeURIComponent(match[1] ?? ""));
		if (typeof parsed !== "object" || parsed === null) return {};
		const out = {};
		for (const [k, v] of Object.entries(parsed)) if (typeof v === "number") out[k] = v;
		return out;
	} catch {
		return {};
	}
}
function clearInterests() {
	try {
		document.cookie = `${INTERESTS_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
	} catch {}
}
/** A post's topics as the weights count them: its category and tags, lower-case. */
function topicsOf(post) {
	return [post.category, ...(post.tags ?? "").split(",")].map((t) => t.trim().toLowerCase()).filter(Boolean);
}
/**
* The posts the reader's topics point to: scored by the summed weight of
* their topics, strongest first and newer first among equals. A post that
* scores nothing is left out.
*/
function recommend(posts, weights, limit) {
	return posts.map((post) => ({
		post,
		score: topicsOf(post).reduce((sum, topic) => sum + (weights[topic] ?? 0), 0)
	})).filter((s) => s.score > 0).sort((a, b) => b.score - a.score || (b.post.publishedAt ?? "").localeCompare(a.post.publishedAt ?? "")).slice(0, limit).map((s) => s.post);
}
export { topicsOf as i, readInterests as n, recommend as r, clearInterests as t };
