import type { LengthBand, SortKey } from "~/lib/indexFilter";

/** The index island's words, per language. */
export interface Labels {
  featured: string;
  readArticle: string;
  all: string;
  categories: string;
  expandCats: string;
  collapseCats: string;
  /**
   * Counted nouns as [singular, plural]. German "Treffer" does not inflect
   * and English "result" does, and both languages need the singular for a
   * one-hit filter — "1 Beiträge" and "1 results" are what a hard-coded
   * plural produces, and nothing on the page would have reported it.
   */
  results: readonly [string, string];
  inCategory: readonly [string, string];
  clear: string;
  noResults: string;
  empty: string;
  older: string;
  minRead: string;
  filter: string;
  length: string;
  lengths: Record<LengthBand, string>;
  sort: string;
  sorts: Record<SortKey, string>;
  resetFilters: string;
  closeFilters: string;
  shown: readonly [string, string];
}

export const LABELS: Record<"de" | "en", Labels> = {
  de: {
    featured: "Im Fokus",
    readArticle: "Artikel lesen",
    all: "Alle Beiträge",
    categories: "Kategorien",
    expandCats: "Kategorien ausklappen",
    collapseCats: "Kategorien einklappen",
    results: ["Treffer für", "Treffer für"],
    inCategory: ["Beitrag in der Kategorie", "Beiträge in der Kategorie"],
    clear: "Zurücksetzen",
    noResults: "Keine Beiträge gefunden. Versuchen Sie einen anderen Suchbegriff oder Filter.",
    empty: "Noch keine Artikel veröffentlicht.",
    older: "Ältere Artikel",
    minRead: "Min. Lesezeit",
    filter: "Filter",
    length: "Lesezeit",
    lengths: { all: "Alle", short: "Kurz (bis 3 Min.)", medium: "Mittel (4–8 Min.)", long: "Lang (ab 9 Min.)" },
    sort: "Sortierung",
    sorts: { new: "Neueste", popular: "Meistgelesen" },
    resetFilters: "Filter zurücksetzen",
    closeFilters: "Filter schließen",
    shown: ["Beitrag", "Beiträge"],
  },
  en: {
    featured: "Featured",
    readArticle: "Read article",
    all: "All posts",
    categories: "Categories",
    expandCats: "Expand categories",
    collapseCats: "Collapse categories",
    results: ["result for", "results for"],
    inCategory: ["post in category", "posts in category"],
    clear: "Clear",
    noResults: "No posts found. Try a different search term or filter.",
    empty: "No articles published yet.",
    older: "Older articles",
    minRead: "min read",
    filter: "Filter",
    length: "Reading time",
    lengths: { all: "All", short: "Short (up to 3 min)", medium: "Medium (4–8 min)", long: "Long (9+ min)" },
    sort: "Sort",
    sorts: { new: "Newest", popular: "Most read" },
    resetFilters: "Reset filters",
    closeFilters: "Close filters",
    shown: ["post", "posts"],
  },
};
