import { L as pageCache, R as resolveCacheDirs, n as cacheEvents, r as contentCache, t as alwaysPaths } from "./cache_aVoJa3Tr.mjs";
import { r as connection } from "./connection_D5-tH5Gv.mjs";
// src/lib/pageCache.ts
/**
* The one page-cache instance this site uses.
*
* Both halves must share it — the middleware that stores renders and the
* control endpoint that triggers them read the same store, the same token and
* the same event map.
*/
var siteCache = pageCache({
	...resolveCacheDirs({ logger: (m) => console.warn(`[tds-blog] ${m}`) }),
	events: cacheEvents,
	alwaysPaths,
	tokenProvider: () => connection.cacheToken(),
	onInvalidate: () => contentCache.invalidate(),
	logger: (message) => console.warn(`[tds-blog] ${message}`)
});
export { siteCache as t };
