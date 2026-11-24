/** The article page's words, per language. */
export interface ArticleLabels {
  back: string;
  read: string;
  updated: string;
  contents: string;
  tocCollapse: string;
  tocExpand: string;
  aboutAuthor: string;
  owner: string;
  bio: string;
  newer: string;
  older: string;
  nav: string;
  allArticles: string;
  rss: string;
  print: string;
  tools: string;
  zoomIn: string;
  zoomOut: string;
  focus: string;
  focusTitle: string;
  machine: string;
  contactHead: string;
  contactLead: string;
  contactCta: string;
}

export const LABELS: Record<"de" | "en", ArticleLabels> = {
  de: {
    back: "Alle Beiträge",
    read: "Min. Lesezeit",
    updated: "aktualisiert",
    contents: "Inhalt",
    tocCollapse: "Inhalt einklappen",
    tocExpand: "Inhalt ausklappen",
    aboutAuthor: "Über den Autor",
    owner: "Inhaber, Tracht Digital Solutions",
    bio: "Entwickelt Software, Websites und Digitalisierungslösungen für kleine und mittlere Unternehmen, ansässig in Schwarzenbek bei Hamburg.",
    newer: "Neuerer Artikel",
    older: "Älterer Artikel",
    nav: "Artikel-Navigation",
    allArticles: "Alle Artikel",
    rss: "RSS abonnieren",
    print: "Drucken",
    tools: "Lesewerkzeuge",
    zoomIn: "Text vergrößern",
    zoomOut: "Text verkleinern",
    focus: "Fokusmodus",
    focusTitle: "Fokusmodus (Taste F)",
    machine: "Automatisch übersetzt, das Original ist auf Englisch verfasst.",
    contactHead: "Zusammenarbeiten",
    contactLead:
      "Ich baue Websites, Webshops und individuelle Lösungen für Selbstständige, kleine Unternehmen und lokale Betriebe, aus Schwarzenbek bei Hamburg.",
    contactCta: "Unverbindlich anfragen",
  },
  en: {
    back: "All posts",
    read: "min read",
    updated: "updated",
    contents: "Contents",
    tocCollapse: "Collapse contents",
    tocExpand: "Expand contents",
    aboutAuthor: "About the author",
    owner: "Owner, Tracht Digital Solutions",
    bio: "Builds software, websites and digitalization solutions for small and medium-sized businesses, based in Schwarzenbek near Hamburg.",
    newer: "Newer article",
    older: "Older article",
    nav: "Article navigation",
    allArticles: "All articles",
    rss: "Subscribe via RSS",
    print: "Print",
    tools: "Reading tools",
    zoomIn: "Larger text",
    zoomOut: "Smaller text",
    focus: "Focus mode",
    focusTitle: "Focus mode (press F)",
    machine: "Machine-translated, the original is written in German.",
    contactHead: "Work together",
    contactLead:
      "I build websites, online shops and custom solutions for freelancers, small companies and local businesses, from Schwarzenbek near Hamburg.",
    contactCta: "Get in touch",
  },
};
