import { t as sequence, xt as defineMiddleware } from "./chunks/sequence_CO-k8VTm.mjs";
import { t as siteCache } from "./chunks/pageCache_DAaIS3xH.mjs";
import { A as guardSiteKey, F as withUtf8Charset } from "./chunks/cache_DabkS7Fl.mjs";
// src/middleware.ts
/**
* Serve cached pages and store rendered ones.
*
* The control plane that drives it is NOT here — it is a real route
* (`src/pages/tds/cache/[action].ts`), because Astro never runs middleware for
* a path no route matches. See that file.
*
* ### In production Apache usually answers first
*
* `public/.htaccess` serves an existing cache entry straight off disk, so a
* hit normally never reaches Node at all — that is the point of the design.
* The hit path here still matters: it is what `npm run dev`, `npm start` and
* any host without the rewrite use, and having both read the same store keeps
* the two implementations honest.
*/
/**
* Refuse to STORE a page that was rendered while the API rejected our site key.
*
* Every content fetch is deliberately fail-soft, so a rejected key produces a
* perfectly valid page full of baked fallbacks. Cached, that page would
* outlive the misconfiguration and there would be nothing to see — a site
* quietly serving its own placeholder copy.
*
* Comparing the rejection counter around the render is enough. Two requests
* racing can only make this refuse to store a page that was fine; it can never
* make it store one that was not, and a needless miss costs one render.
*/
var refuseStaleKey = defineMiddleware((_context, next) => guardSiteKey(next));
/**
* `sequence` runs these outside-in, so the cache wraps the guard: the guard's
* `no-store` is already on the response by the time the cache decides whether
* to store it. Reversing the two would put the guard outside the cache, where
* it would see hits it never rendered and mark them unstorable for no reason.
*/
/** Outermost, so every response (cache hit or render) names its charset. */
var utf8Charset = defineMiddleware(async (_context, next) => withUtf8Charset(await next()));
var onRequest$1 = sequence(utf8Charset, defineMiddleware((context, next) => siteCache.middleware({
	request: context.request,
	url: context.url,
	isPrerendered: context.isPrerendered
}, next)), refuseStaleKey);
// \0virtual:astro:middleware
var onRequest = sequence(onRequest$1);
export { onRequest };
