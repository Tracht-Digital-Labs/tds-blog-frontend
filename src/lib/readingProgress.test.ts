import { afterEach, describe, expect, it } from "vitest";
import { mountReadingProgress } from "./readingProgress";

function setScroll(top: number, height: number, client: number) {
  const doc = document.documentElement;
  Object.defineProperty(doc, "scrollTop", { configurable: true, value: top });
  Object.defineProperty(doc, "scrollHeight", { configurable: true, value: height });
  Object.defineProperty(doc, "clientHeight", { configurable: true, value: client });
}

describe("mountReadingProgress", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("scales the bar by the scrolled share of the page, on mount and on scroll", () => {
    document.body.innerHTML = '<div id="reading-progress"></div>';
    const bar = document.getElementById("reading-progress")!;
    setScroll(0, 2000, 1000);
    mountReadingProgress();
    expect(bar.style.transform).toBe("scaleX(0)");
    setScroll(500, 2000, 1000);
    dispatchEvent(new Event("scroll"));
    expect(bar.style.transform).toBe("scaleX(0.5)");
  });

  it("stays at zero on a page that does not scroll", () => {
    document.body.innerHTML = '<div id="reading-progress"></div>';
    setScroll(0, 800, 800);
    mountReadingProgress();
    expect(document.getElementById("reading-progress")!.style.transform).toBe("scaleX(0)");
  });

  it("does nothing on a page without the bar", () => {
    expect(() => mountReadingProgress()).not.toThrow();
  });
});
