import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const writePrefs = vi.fn();
vi.mock("@tracht-digital-labs/tds-shared/prefs", () => ({ writePrefs: (p: unknown) => writePrefs(p) }));

const { mountArticleNav } = await import("./articleNav");

/** The article's section nav, mounted on markup shaped like Article.astro's. */
const tops: Record<string, number> = {};

beforeEach(() => {
  writePrefs.mockClear();
  document.body.innerHTML = `
    <div id="main">
      <nav id="article-toc">
        <button id="toc-toggle" data-label-expand="Aufklappen" data-label-collapse="Einklappen"></button>
        <ul class="toc">
          <li><a href="#a" data-toc="a">A</a></li>
          <li><a href="#b" data-toc="b">B</a></li>
        </ul>
      </nav>
      <div class="article-col">
        <section id="a"><button class="sec-head" aria-controls="a-body" aria-expanded="true"></button><div id="a-body"></div></section>
        <section id="b"><button class="sec-head" aria-controls="b-body" aria-expanded="false"></button><div id="b-body" class="closed"></div></section>
      </div>
    </div>`;
  tops.a = 100;
  tops.b = 900;
  for (const id of ["a", "b"]) {
    document.getElementById(id)!.getBoundingClientRect = () => ({ top: tops[id]! }) as DOMRect;
  }
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
});

const toggle = () => document.getElementById("toc-toggle")!;
const link = (id: string) => document.querySelector(`a[data-toc="${id}"]`)!;

describe("the section nav", () => {
  it("folds into ticks and back, relabels its toggle and saves the state", () => {
    mountArticleNav();
    toggle().click();
    expect(document.getElementById("main")!.classList.contains("toc-collapsed")).toBe(true);
    expect(toggle().getAttribute("aria-expanded")).toBe("false");
    expect(toggle().getAttribute("aria-label")).toBe("Aufklappen");
    expect(writePrefs).toHaveBeenLastCalledWith({ reader_toc: "collapsed" });
    toggle().click();
    expect(toggle().getAttribute("title")).toBe("Einklappen");
    expect(writePrefs).toHaveBeenLastCalledWith({ reader_toc: "open" });
  });

  it("opens and closes a section from its head", () => {
    mountArticleNav();
    const head = document.querySelector("#a .sec-head") as HTMLElement;
    head.click();
    expect(document.getElementById("a-body")!.classList.contains("closed")).toBe(true);
    expect(head.getAttribute("aria-expanded")).toBe("false");
  });

  it("opens a closed section when its TOC link is followed", () => {
    mountArticleNav();
    (link("b") as HTMLElement).click();
    expect(document.getElementById("b-body")!.classList.contains("closed")).toBe(false);
    expect(document.querySelector("#b .sec-head")!.getAttribute("aria-expanded")).toBe("true");
  });

  it("marks the last section whose top has passed 140px as current", () => {
    mountArticleNav();
    expect(link("a").classList.contains("on")).toBe(true);
    tops.a = -500;
    tops.b = 140;
    dispatchEvent(new Event("scroll"));
    expect(link("b").classList.contains("on")).toBe(true);
    expect(link("a").classList.contains("on")).toBe(false);
  });

  it("fades the rail out once the article column leaves the screen", () => {
    let report: (entries: Array<{ isIntersecting: boolean }>) => void = () => {};
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: typeof report) {
          report = callback;
        }
        observe() {}
      },
    );
    mountArticleNav();
    report([{ isIntersecting: false }]);
    expect(document.getElementById("article-toc")!.classList.contains("rail-off")).toBe(true);
    report([{ isIntersecting: true }]);
    expect(document.getElementById("article-toc")!.classList.contains("rail-off")).toBe(false);
  });
});
