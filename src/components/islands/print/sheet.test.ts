import { describe, expect, it } from "vitest";
import { MM_TO_PX, PAGE_MM, SHEET_EXTRA, fitScale, pageRule } from "./sheet";

/** The sheet on screen: A4 is 210 × 297 mm plus the shadow's air. */
const a4 = { w: 210 * MM_TO_PX + SHEET_EXTRA, h: 297 * MM_TO_PX + SHEET_EXTRA };

describe("the preview's scale", () => {
  it("fits the page width, never enlarging", () => {
    expect(fitScale("a4", "width", a4.w / 2, 100)).toBeCloseTo(0.5);
    expect(fitScale("a4", "width", a4.w * 3, 100)).toBe(1);
  });

  it("fits the whole page by whichever side is tighter", () => {
    expect(fitScale("a4", "page", a4.w, a4.h / 4)).toBeCloseTo(0.25);
    expect(fitScale("a4", "page", a4.w / 2, a4.h * 3)).toBeCloseTo(0.5);
  });

  it("shows 100 % as 1 and never shrinks below a fifth", () => {
    expect(fitScale("a3", "actual", 10, 10)).toBe(1);
    expect(fitScale("a3", "width", 10, 10)).toBe(0.2);
  });

  it("scales A5, A4 and A3 differently in the same space", () => {
    const scales = (["a5", "a4", "a3"] as const).map((s) => fitScale(s, "width", 300, 600));
    expect(scales[0]).toBeGreaterThan(scales[1]!);
    expect(scales[1]).toBeGreaterThan(scales[2]!);
    expect(PAGE_MM.a3[0]).toBe(PAGE_MM.a4[1]);
  });
});

describe("the @page rule", () => {
  it("carries the paper, the 16mm margin and the page number", () => {
    const rule = pageRule("a5", '"Seite " counter(page)');
    expect(rule).toMatch(/^@page \{ size: A5; margin: 16mm; /);
    expect(rule).toContain('@bottom-right { content: "Seite " counter(page);');
  });
});
