import { PostCover } from "@tracht-digital-labs/tds-shared/components";
import { AuthorChip } from "../../PostCard";
import { bookClass, bookLabel } from "../../../lib/book";
import { fallbackAuthorName, formatPostDate } from "../../../lib/postMeta";
import { imageHints } from "../../../lib/imageCatalog";
import type { SliderPost } from "../HeroSlider";
import type { HeroLabels, SetMeta } from "./labels";

function hrefFor(lang: "de" | "en", slug: string): string {
  return `${lang === "en" ? "/en" : ""}/${slug}`;
}

/**
 * One set on the hero: the lead article (headline, lede, byline, CTA and
 * cover, all linking to it) and up to two more titles from the same set.
 */
export default function HeroSlide({
  posts,
  meta,
  lang,
  t,
}: {
  posts: SliderPost[];
  meta: SetMeta;
  lang: "de" | "en";
  t: HeroLabels;
}) {
  const [lead, ...rest] = posts;
  if (!lead) return null;
  const secondary = rest.slice(0, 2);

  return (
    <div className="hero-grid grid md:grid-cols-2 gap-8 md:gap-11">
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <span className="eyebrow" style={{ color: "var(--color-accent-pink)" }}>
            {meta.label}
          </span>
          <span aria-hidden="true" style={{ width: 4, height: 4, background: "rgba(255,255,255,.4)" }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,.6)" }}>{lead.category}</span>
        </div>
        <a href={hrefFor(lang, lead.slug)} style={{ textDecoration: "none", color: "inherit" }}>
          {/* The shared display leading (0.96) is set for one-line heads; at the
              blog's 800 weight a two-line hero title let the descenders of
              line one touch the ascenders of line two. 1.05 matches .page-title. */}
          <h2 className="display" style={{ fontSize: "clamp(2rem, 1.6rem + 1.9vw, 3.25rem)", lineHeight: 1.05, margin: 0, textWrap: "balance" }}>
            {lead.title}
          </h2>
        </a>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.6,
            color: "rgba(255,255,255,.75)",
            margin: "14px 0 0",
            maxWidth: "54ch",
            textWrap: "pretty",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {lead.excerpt}
        </p>
        {/* Each item stays on one line and the row wraps between items; in a
            narrow two-column hero (768px) the items used to break inside
            themselves ("Julian / Tracht", "7. Oktober / 2026"). */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 18, rowGap: 8, marginTop: 18, whiteSpace: "nowrap" }}>
          <AuthorChip inverse name={lead.author?.name ?? fallbackAuthorName(lang)} avatarUrl={lead.author?.avatarUrl} lang={lang} />
          {bookLabel(lead.readingMinutes, lang) && (
            <span className="tabular hidden sm:inline" style={{ fontSize: 13, color: "rgba(255,255,255,.55)" }}>
              {bookLabel(lead.readingMinutes, lang)}
            </span>
          )}
          {lead.publishedAt && (
            <span className="tabular" style={{ fontSize: 13, color: "rgba(255,255,255,.55)" }}>
              {formatPostDate(lead.publishedAt, lang)}
            </span>
          )}
        </div>
        <a
          className="hero-cta"
          href={hrefFor(lang, lead.slug)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginTop: 22,
            height: 48,
            padding: "0 24px",
            // Coral with ink text (8:1) rather than a white block: the one
            // white surface on the navy band is gone.
            background: "var(--color-accent-pink)",
            color: "var(--color-surface-ink)",
            textDecoration: "none",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          {t.read} <span aria-hidden="true">→</span>
        </a>
      </div>
      <div className="hidden sm:flex" style={{ flexDirection: "column", justifyContent: "center", gap: 16, minHeight: 0 }}>
        {/* The cover is the biggest thing on the slide, so it has to BE the
            link — a reader who clicks the picture expects the article. Hidden
            from the accessibility tree and out of the tab order because the
            headline above already links to the same URL. */}
        <a
          href={hrefFor(lang, lead.slug)}
          className={`hero-cover ${bookClass(lead.readingMinutes)}`}
          aria-hidden="true"
          tabIndex={-1}
          style={{ overflow: "hidden", position: "relative", display: "block" }}
        >
          <PostCover slug={lead.slug} coverHint={lead.coverHint} image={{...imageHints(lead.coverHint, lang, "(min-width: 48rem) 50vw, 100vw"), loading: "eager", fetchPriority: "high"}} title={lead.title} style={{ position: "absolute", inset: 0 }} />
        </a>
        {secondary.length > 0 && (
          <ul className="list-none p-0 m-0" style={{ display: "grid", gap: 8 }}>
            {secondary.map((p) => (
              <li key={p.slug}>
                <a
                  href={hrefFor(lang, p.slug)}
                  style={{
                    display: "flex",
                    gap: 10,
                    color: "rgba(255,255,255,.78)",
                    textDecoration: "none",
                    fontSize: 13.5,
                    lineHeight: 1.4,
                  }}
                >
                  <span aria-hidden="true" style={{ color: "var(--color-accent-pink)" }}>
                    →
                  </span>
                  <span style={{ textWrap: "balance" }}>{p.title}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
