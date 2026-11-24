import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import ForYou from "./ForYou";
import HeroSlider, { type SliderPost } from "./HeroSlider";

/**
 * What the reader's topic profile (the `tds-interests` cookie) does to the
 * index: "Für dich" lists the strongest matches, and the hero opens on a
 * personal tab. Both score a post by the summed weight of its category and
 * tags, strongest first and newer first among equals.
 */

window.matchMedia = ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

const post = (slug: string, category: string, tags: string | null, publishedAt: string, lang = "de") => ({
  slug,
  lang,
  category,
  tags,
  publishedAt,
  title: `Titel ${slug}`,
  excerpt: "Kurz.",
  coverHint: null,
  readingMinutes: 4,
});

const corpus = [
  post("shop-alt", "Webshop", "shopware", "2026-01-01"),
  post("shop-neu", "Webshop", "woocommerce", "2026-05-01"),
  post("recht", "Recht", "impressum", "2026-06-01"),
  post("prozesse", "Digitalisierung", "Webshop, prozesse", "2026-03-01"),
  post("ohne-tags", "Allgemein", null, "2026-07-01"),
  post("english", "Webshop", null, "2026-08-01", "en"),
];

function profile(weights: Record<string, unknown>) {
  document.cookie = `tds-interests=${encodeURIComponent(JSON.stringify(weights))}; Path=/`;
}

beforeEach(() => {
  document.cookie = "tds-interests=; Max-Age=0; Path=/";
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Für dich", () => {
  function mount(limit?: number) {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => corpus })));
    return render(<ForYou lang="de" limit={limit} />);
  }
  const shown = () => screen.queryAllByRole("link").map((a) => a.getAttribute("href"));

  it("lists the posts of this language whose topics the reader has read, strongest first", async () => {
    profile({ webshop: 3, prozesse: 2, recht: 1 });
    mount();
    // prozesse: webshop 3 + prozesse 2; the two shop posts 3 each, newer first.
    await waitFor(() => expect(shown()).toEqual(["/prozesse", "/shop-neu", "/shop-alt"]));
  });

  it("honours the limit", async () => {
    profile({ webshop: 3, prozesse: 2, recht: 1 });
    mount(4);
    await waitFor(() => expect(shown()).toEqual(["/prozesse", "/shop-neu", "/shop-alt", "/recht"]));
  });

  it("stays away without a profile, and does not even fetch", async () => {
    mount();
    await Promise.resolve();
    expect(fetch).not.toHaveBeenCalled();
    expect(shown()).toEqual([]);
  });

  it("stays away when no post matches", async () => {
    profile({ kochen: 5 });
    mount();
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(shown()).toEqual([]);
  });

  it("forgets the profile on reset", async () => {
    profile({ recht: 1 });
    mount();
    await waitFor(() => expect(shown()).toEqual(["/recht"]));
    fireEvent.click(screen.getByRole("button", { name: "Zurücksetzen" }));
    expect(shown()).toEqual([]);
    expect(document.cookie).not.toContain("tds-interests=%");
  });
});

describe("the hero's personal tab", () => {
  const latest = corpus.filter((p) => p.lang === "de") as unknown as SliderPost[];
  const tab = (name: string) => screen.queryByRole("tab", { name });

  it("opens on the reader's picks, at most four", () => {
    profile({ webshop: 3, prozesse: 2, recht: 1, impressum: 1 });
    render(<HeroSlider latest={latest} popular={[]} lang="de" />);
    expect(tab("Empfohlen")?.getAttribute("aria-selected")).toBe("true");
    const lead = document.querySelector('[aria-hidden="false"] a, .hero-slide:not([aria-hidden="true"]) a');
    expect(lead?.getAttribute("href")).toBe("/prozesse");
  });

  it("has no personal tab without a profile", () => {
    render(<HeroSlider latest={latest} popular={[]} lang="de" />);
    expect(tab("Empfohlen")).toBeNull();
  });

  it("has none when nothing matches", () => {
    profile({ kochen: 5 });
    render(<HeroSlider latest={latest} popular={[]} lang="de" />);
    expect(tab("Empfohlen")).toBeNull();
  });
});
