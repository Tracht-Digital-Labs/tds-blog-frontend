import { describe, expect, it } from "vitest";
import { filterPosts, inBand, matchesQuery, plural, type IndexPost } from "./indexFilter";

const post = (over: Partial<IndexPost>): IndexPost =>
  ({ slug: "x", title: "", excerpt: "", category: "Allgemein", publishedAt: "2026-01-01", coverHint: null, ...over }) as IndexPost;

describe("reading-time bands", () => {
  it("draws the edges at 3 and 8 minutes", () => {
    expect([1, 3, 4, 8, 9].map((m) => inBand(m, "short"))).toEqual([true, true, false, false, false]);
    expect([3, 4, 8, 9].map((m) => inBand(m, "medium"))).toEqual([false, true, true, false]);
    expect([8, 9, 30].map((m) => inBand(m, "long"))).toEqual([false, true, true]);
  });

  it("puts a post without a length in no band but 'all'", () => {
    for (const minutes of [null, undefined, 0]) {
      expect(inBand(minutes, "all")).toBe(true);
      for (const band of ["short", "medium", "long"] as const) expect(inBand(minutes, band)).toBe(false);
    }
  });
});

describe("search", () => {
  const p = post({ title: "Excel oder Werkzeug", excerpt: "Wann eine Tabelle", category: "Digitalisierung", tags: "werkzeuge,kmu" });

  it("needs every word, in any field and any case", () => {
    expect(matchesQuery(p, "  EXCEL   tabelle ")).toBe(true);
    expect(matchesQuery(p, "digitalisierung kmu")).toBe(true);
    expect(matchesQuery(p, "excel shop")).toBe(false);
  });

  it("lets everything through on an empty query, and a post without tags is searchable", () => {
    expect(matchesQuery(p, "   ")).toBe(true);
    expect(matchesQuery(post({ title: "Recht", tags: null }), "recht")).toBe(true);
  });
});

describe("filterPosts", () => {
  const posts = [
    post({ slug: "a", category: "Shop", readingMinutes: 2, viewCount: 5 }),
    post({ slug: "b", category: "Digital", readingMinutes: 6, viewCount: 50 }),
    post({ slug: "c", category: "Digital", readingMinutes: 12, viewCount: 50 }),
    post({ slug: "d", category: "Digital", readingMinutes: 12 }),
  ];
  const slugs = (list: IndexPost[]) => list.map((p) => p.slug);
  const all = { cat: "all", band: "all", q: "", sort: "new" } as const;

  it("keeps the given order when nothing is chosen", () => {
    expect(slugs(filterPosts(posts, all))).toEqual(["a", "b", "c", "d"]);
  });

  it("keeps one category", () => {
    expect(slugs(filterPosts(posts, { ...all, cat: "Shop" }))).toEqual(["a"]);
  });

  it("combines category and band", () => {
    expect(slugs(filterPosts(posts, { ...all, cat: "Digital", band: "long" }))).toEqual(["c", "d"]);
  });

  it("orders by reads, keeps newest-first among equals and counts a missing figure as none", () => {
    expect(slugs(filterPosts(posts, { ...all, sort: "popular" }))).toEqual(["b", "c", "a", "d"]);
  });

  it("leaves the input untouched", () => {
    filterPosts(posts, { ...all, sort: "popular" });
    expect(slugs(posts)).toEqual(["a", "b", "c", "d"]);
  });
});

describe("plural", () => {
  it("takes the singular for exactly one", () => {
    const forms = ["result", "results"] as const;
    expect([0, 1, 2].map((n) => plural(forms, n))).toEqual(["results", "result", "results"]);
  });
});
