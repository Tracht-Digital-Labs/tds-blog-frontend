import { consentGranted, onConsentChange } from "@tracht-digital-labs/tds-shared/consent/store";
import { INTERESTS_COOKIE, bumpInterests, clearInterests, readInterests } from "./interestWeights";

/**
 * The reader's topic weights behind "Für dich" and the hero's personal tab.
 *
 * A profile of what someone reads is not something the journal needs to work,
 * so it is stored only with the "Komfort" (`functional`) consent (§ 25 Abs. 1
 * TDDDG). Without it — and the moment it is withdrawn — the cookie is deleted
 * and the recommendations fall back to the generic order, which is what
 * `ForYou` and `HeroSlider` already do when the cookie is missing. Reading
 * the weights and scoring posts is `interestWeights.ts`.
 */
const MAX_AGE_S = 180 * 24 * 3600;

/**
 * Count this article's topics — only with consent. Called once per article
 * page; re-runs when consent arrives later on the same page, and clears the
 * cookie when it is withdrawn.
 */
export function trackInterests(topics: readonly string[]): () => void {
  if (typeof document === "undefined") return () => {};
  let counted = false;
  const apply = () => {
    if (!consentGranted("functional")) {
      clearInterests();
      return;
    }
    if (counted) return;
    counted = true;
    try {
      const value = encodeURIComponent(JSON.stringify(bumpInterests(readInterests(document.cookie), topics)));
      document.cookie = `${INTERESTS_COOKIE}=${value}; Max-Age=${MAX_AGE_S}; Path=/; SameSite=Lax`;
    } catch {
      /* cookies disabled — recommendations simply stay generic */
    }
  };
  apply();
  return onConsentChange(apply);
}
