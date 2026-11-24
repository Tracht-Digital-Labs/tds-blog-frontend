import { describe, expect, it } from "vitest";
import type { BlogBlock } from "@tracht-digital-labs/tds-shared";
import {
  articleCitations,
  articlePlainText,
  chronologicalNeighbours,
  interestTopics,
  laterUpdateLabel,
  onePerSlug,
} from "./articleView";

const blocks: BlogBlock[] = [
  { type: "heading", level: 2, text: "Titel" },
  { type: "paragraph", text: "Ein Satz." },
  { type: "list", ordered: false, items: ["a", "b"] },
  { type: "code", lang: "ts", code: "x()" },
  { type: "divider" },
  { type: "button", label: "Mehr", href: "https://example.org/a", style: "primary" },
  { type: "button", label: "Wieder", href: "https://example.org/a", style: "ghost" },
  { type: "button", label: "Wir", href: "https://www.tracht-digital.de/x", style: "ghost" },
];

describe("onePerSlug", () => {
  it("keeps one row per slug and prefers the page's language", () => {
    const rows = [
      { slug: "a", lang: "de", title: "A de" },
      { slug: "a", lang: "en", title: "A en" },
      { slug: "b", lang: "en", title: "B en" },
    ];
    expect(onePerSlug(rows, "de").map((r) => r.title)).toEqual(["A de", "B en"]);
    expect(onePerSlug(rows, "en").map((r) => r.title)).toEqual(["A en", "B en"]);
  });
});

describe("articlePlainText", () => {
  it("reads the text fields of a block post and skips the rest", () => {
    expect(articlePlainText({ blocks, bodyHtml: "" })).toBe("Titel Ein Satz. a b x()    ");
  });

  it("strips tags and product shortcodes from a markdown post", () => {
    const text = articlePlainText({ blocks: null, bodyHtml: "<p>Hallo <b>Welt</b></p><p>{{produkt:tasse}}</p>" });
    expect(text.split(/\s+/).filter(Boolean)).toEqual(["Hallo", "Welt"]);
  });
});

describe("articleCitations", () => {
  it("cites each outside link once and never the site's own hosts", () => {
    expect(articleCitations({ blocks, bodyHtml: "" })).toEqual(["https://example.org/a"]);
    const html = '<a href="https://a.example/1">1</a><a href="https://blog.tracht-digital.de/x">x</a><a href="/rel">r</a>';
    expect(articleCitations({ blocks: null, bodyHtml: html })).toEqual(["https://a.example/1"]);
  });

  it("stops at ten", () => {
    const html = Array.from({ length: 12 }, (_, i) => `<a href="https://s${i}.example/">${i}</a>`).join("");
    expect(articleCitations({ blocks: null, bodyHtml: html })).toHaveLength(10);
  });
});

describe("chronologicalNeighbours", () => {
  const posts = [
    { slug: "mid", publishedAt: "2026-02-01" },
    { slug: "old", publishedAt: "2026-01-01" },
    { slug: "new", publishedAt: "2026-03-01" },
  ];

  it("finds the next newer and next older post by date", () => {
    expect(chronologicalNeighbours(posts, "mid")).toEqual({ newer: posts[2], older: posts[1] });
  });

  it("has no newer post for the newest and no older for the oldest", () => {
    expect(chronologicalNeighbours(posts, "new").newer).toBeNull();
    expect(chronologicalNeighbours(posts, "old").older).toBeNull();
  });

  it("has neither for an unknown slug", () => {
    expect(chronologicalNeighbours(posts, "gone")).toEqual({ newer: null, older: null });
  });
});

describe("laterUpdateLabel", () => {
  it("shows the update date only when it is after publication", () => {
    expect(laterUpdateLabel("2026-01-01", "2026-02-01", "de")).toBe("1. Februar 2026");
    expect(laterUpdateLabel("2026-01-01", "2026-01-01", "de")).toBeNull();
    expect(laterUpdateLabel("2026-02-01", "2026-01-01", "en")).toBeNull();
  });

  it("shows nothing without both dates or with an unreadable one", () => {
    expect(laterUpdateLabel(null, "2026-02-01", "de")).toBeNull();
    expect(laterUpdateLabel("2026-01-01", undefined, "de")).toBeNull();
    expect(laterUpdateLabel("2026-01-01", "kein Datum", "de")).toBeNull();
  });
});

describe("interestTopics", () => {
  it("lists category and tags once each, lower-cased", () => {
    expect(interestTopics({ category: "Shop", tags: "shop, Kasse ,kasse" })).toEqual(["shop", "kasse"]);
  });
});
