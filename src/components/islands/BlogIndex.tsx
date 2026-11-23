import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import { transitionUpdate } from "@tracht-digital-labs/tds-shared/motion";
import { filterPosts, plural, type IndexPost, type LengthBand, type SortKey } from "~/lib/indexFilter";
import PostCard from "../PostCard";
import HeroSlider from "./HeroSlider";
import CategorySidebar from "./index/CategorySidebar";
import FilterPanel from "./index/FilterPanel";
import { LABELS } from "./index/labels";

/**
 * Journal index from the design-system blog template ("Hero + Grid"):
 * featured-post hero on a fixed navy block, category buttons on the
 * left (with post counters, collapsible), flat card grid, live
 * full-text search over title / excerpt / category / tags.
 *
 * Search input lives in the top nav (JournalHeader). It dispatches
 * `tds-blog-search` CustomEvents which this island listens for, and
 * the query round-trips through `?q=` so a refresh keeps the search.
 * Posts arrive as build-time props — no runtime content-api calls.
 */

export default function BlogIndex({
  posts,
  popular = [],
  lang,
  pageSize = 10,
}: {
  posts: IndexPost[];
  popular?: IndexPost[];
  lang: "de" | "en";
  pageSize?: number;
}) {
  const t = LABELS[lang];
  const [cat, setCat] = useState("all");
  const [catsCollapsed, setCatsCollapsed] = useState(false);
  const [q, setQ] = useState("");
  const [band, setBand] = useState<LengthBand>("all");
  const [sort, setSort] = useState<SortKey>("new");
  const [filterOpen, setFilterOpen] = useState(false);
  // The toggle steps aside while the panel is open (tds-shared ≥ 0.57, the
  // same on the Online-Tools and the Shop): focus moves into the
  // panel on open and back to the toggle on close, never onto a hidden button.
  const filterToggle = useRef<HTMLButtonElement>(null);
  const filterPanel = useRef<HTMLDivElement>(null);
  const filterMoved = useRef(false);
  useEffect(() => {
    if (!filterMoved.current) return;
    if (filterOpen) filterPanel.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    else filterToggle.current?.focus({ preventScroll: true });
  }, [filterOpen]);
  const openFilter = (open: boolean) => {
    filterMoved.current = true;
    setFilterOpen(open);
  };

  // A deliberate filter change (a category, "clear search") runs as a native
  // View Transition: cards that stay glide to their new slot, the rest fade.
  // Not typing — a transition per keystroke would freeze the page each time.
  // tds-shared's transitionUpdate, not motion: this island is client:load on
  // the index, and an animation runtime there would sit on the first load.
  const pickCat = (next: string) => transitionUpdate(() => flushSync(() => setCat(next)));
  const clearSearch = () => transitionUpdate(() => flushSync(() => setQ("")));
  const pickBand = (next: LengthBand) => transitionUpdate(() => flushSync(() => setBand(next)));
  const pickSort = (next: SortKey) => transitionUpdate(() => flushSync(() => setSort(next)));
  const resetFilters = () =>
    transitionUpdate(() =>
      flushSync(() => {
        setBand("all");
        setSort("new");
      }),
    );
  const activeFilters = (band !== "all" ? 1 : 0) + (sort !== "new" ? 1 : 0);

  // Category list — shared by the desktop sidebar and the mobile/tablet
  // chip strip (the sidebar is lg-only, so small screens need their own).
  const cats = useMemo(
    () => Array.from(new Set(posts.map((p) => p.category))).sort((a, b) => a.localeCompare(b)),
    [posts],
  );

  // Pick up ?q= on mount and live queries from the nav search.
  useEffect(() => {
    const initial = new URLSearchParams(location.search).get("q");
    if (initial) setQ(initial);
    const onSearch = (e: Event) => setQ((e as CustomEvent<string>).detail ?? "");
    document.addEventListener("tds-blog-search", onSearch);
    document.documentElement.dataset.blogLiveSearch = "true";
    return () => {
      document.removeEventListener("tds-blog-search", onSearch);
      delete document.documentElement.dataset.blogLiveSearch;
    };
  }, []);

  // Keep ?q= in the URL so a refresh preserves the search.
  useEffect(() => {
    const u = new URL(location.href);
    if (q.trim()) u.searchParams.set("q", q.trim());
    else u.searchParams.delete("q");
    history.replaceState(null, "", u);
  }, [q]);

  const searching = q.trim().length > 0;
  // Any filter-bar choice lifts the pagination like a category does: a band
  // or an order over page 1 alone would hide most of the answer.
  const filtering = searching || cat !== "all" || activeFilters > 0;
  const featured = posts[0];

  const matches = useMemo(() => filterPosts(posts, { cat, band, q, sort }), [posts, cat, q, band, sort]);

  // Unfiltered default view mirrors the static pagination: the hero
  // post plus pageSize-1 grid cards cover page 1, older posts stay
  // behind /page/2. Filtering searches the whole corpus instead.
  const gridPosts = filtering
    ? matches
    : matches.filter((p) => p !== featured).slice(0, pageSize - 1);
  const hasOlder = !filtering && matches.length > pageSize;
  const quoted = lang === "de" ? `„${q.trim()}“` : `“${q.trim()}”`;

  // What the status region announces. Typing in the nav search and pressing a
  // category button both replace the grid in place, and neither moved focus or
  // said anything — a screen-reader user got silence and a changed page. Empty
  // in the unfiltered default so the region says nothing on load; the search
  // case repeats the summary that is already on screen, the category case has
  // no visible counterpart at all.
  const statusMessage = searching
    ? `${matches.length} ${plural(t.results, matches.length)} ${quoted}`
    : cat !== "all"
      ? `${matches.length} ${plural(t.inCategory, matches.length)} ${cat}`
      : activeFilters > 0
        ? `${matches.length} ${plural(t.shown, matches.length)}`
        : "";

  const GridHeading = searching ? "h1" : "h2";

  if (posts.length === 0) {
    return (
      <div className="jnl-band jnl-tone-tint">
        <p className="tds-shell text-[var(--color-muted)] italic">{t.empty}</p>
      </div>
    );
  }

  return (
    <div id="blog-index-island">
      {!searching && featured && (
        <HeroSlider latest={posts} popular={popular} lang={lang} />
      )}

      {/* A tint band flush under the navy hero. Its spacing is the band's own
          padding; the rail stands one shelf gutter beside the books
          (.blog-index-row), and the "older" link hangs on a 1px seam. */}
      <section className="jnl-band jnl-tone-tint">
        <div className="tds-shell blog-index-row lg:flex lg:items-start">
          <div
            // Width changes instantly. Animating `width` reflows the article
            // grid beside it on every frame, so the 320ms transition made the
            // whole listing judder for the sake of a decorative slide.
            //
            // The two widths used to be inline pixels (216 / 30). They are CSS
            // now because the expanded rail is fluid — var(--tds-rail) is a
            // clamp() that grows with the screen, and an inline style cannot be
            // a clamp of the viewport.
            className={`hidden lg:block shrink-0 blog-cat-rail${catsCollapsed ? " is-collapsed" : ""}`}
          >
            <CategorySidebar
              posts={posts}
              cats={cats}
              value={cat}
              onChange={pickCat}
              collapsed={catsCollapsed}
              onToggle={() => setCatsCollapsed((v) => !v)}
              t={t}
            />
          </div>
          <div className="min-w-0 flex-1">
            {/* Mobile + tablet category filter — the sidebar is lg-only, so
                small screens get a horizontally scrollable chip strip. */}
            <div className="lg:hidden pb-6 overflow-x-auto blog-cat-strip">
              <div className="flex gap-2 w-max">
                {["all", ...cats].map((c) => (
                  <button
                    type="button"
                    key={c}
                    className={`chip-flat${cat === c ? " on" : ""}`}
                    onClick={() => pickCat(c)}
                    aria-pressed={cat === c}
                  >
                    {c === "all" ? t.all : c}
                  </button>
                ))}
              </div>
            </div>

            <p className="sr-only" role="status">
              {statusMessage}
            </p>

            {searching && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-muted)" }}>
                  {matches.length} {plural(t.results, matches.length)} {quoted}
                </span>
                <button type="button" className="chip-flat" onClick={clearSearch}>
                  {t.clear}
                </button>
              </div>
            )}

            {/* Heading row: the listing's heading on the left, the filter
                toggle (tds-shared .tds-filterbar__toggle, a brand button) on
                the right; its panel opens below the row. Categories stay in
                the rail and the strip above. */}
            <div className="blog-grid-head">
              {/* The page's only <h1> lives in HeroSlider — and the hero is not
                  rendered while a search is running, so the results view shipped
                  with no top-level heading at all. This heading takes the rank
                  over in exactly that state. Nothing moves: no shared rule
                  targets a bare h1/h2, Tailwind's preflight normalises both, and
                  the size is set inline either way. */}
              <GridHeading
                className="display-tight"
                style={{ fontSize: "1.625rem", margin: 0, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}
              >
                <svg
                  className="head-ico"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
                {cat === "all" ? t.all : cat}
              </GridHeading>
              <button
                type="button"
                className="btn btn-primary tds-filterbar__toggle"
                data-filter-toggle=""
                ref={filterToggle}
                hidden={filterOpen}
                aria-expanded={filterOpen}
                aria-controls="blog-filter"
                onClick={() => openFilter(true)}
              >
                <svg className="tds-filterbar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
                  <path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4" />
                </svg>
                <span className="tds-filterbar__label">{t.filter}</span>
                <span className="tds-filterbar__count">{activeFilters > 0 ? activeFilters : ""}</span>
              </button>
            </div>
            <FilterPanel
              open={filterOpen}
              panelRef={filterPanel}
              band={band}
              sort={sort}
              activeFilters={activeFilters}
              onBand={pickBand}
              onSort={pickSort}
              onReset={resetFilters}
              onClose={() => openFilter(false)}
              t={t}
            />

            {gridPosts.length === 0 ? (
              <p style={{ padding: "48px 0", color: "var(--color-muted)" }}>
                {filtering ? t.noResults : t.empty}
              </p>
            ) : (
              // Intrinsic grid: no breakpoint at any width. `auto-fill` derives
              // the column count from the space actually left beside the rail,
              // so collapsing the rail adds a column without either component
              // knowing about the other. The old `sm:grid-cols-2` capped the
              // listing at two columns on every screen up to 2560px.
              //
              // No inline `gap` here on purpose: an inline style outranks the
              // unlayered .tds-grid-auto class, so a leftover `style={{gap:20}}`
              // would silently pin the gutter and the token would do nothing.
              // `jnl-mosaic` narrows it to the 1px seam.
              <div className="tds-grid-auto jnl-mosaic jnl-shelf">
                {gridPosts.map((p) => (
                  // The SLOT is the container query container, never the card:
                  // a container styles its descendants, so a card can never
                  // respond to its own container-type.
                  <div
                    className="post-card-slot tds-vt-item"
                    key={p.slug}
                    style={{ "--tds-vt-name": `post-${p.slug}` } as CSSProperties}
                  >
                    <PostCard post={p} lang={lang} />
                  </div>
                ))}
              </div>
            )}

            {hasOlder && (
              // Hangs under the grid on the same 1px seam instead of floating
              // 28px below it.
              <nav style={{ paddingTop: 1, display: "flex", justifyContent: "flex-end" }}>
                <a className="btn-back" href={lang === "de" ? "/page/2" : "/en/page/2"}>
                  {t.older} <span aria-hidden="true">→</span>
                </a>
              </nav>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
