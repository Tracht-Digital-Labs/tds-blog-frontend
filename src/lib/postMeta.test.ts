import { describe, expect, it } from "vitest";
import { authorInitials, countWords, fallbackAuthorName, formatPostDate, portraitAlt, readingMinutes } from "./postMeta";

describe("postMeta", () => {
  it("names the studio when a post has no author", () => {
    expect(fallbackAuthorName("de")).toBe("Tracht Digital Redaktion");
    expect(fallbackAuthorName("en")).toBe("Tracht Digital Editorial");
  });

  it("takes at most two initials, upper-cased, and falls back to TD", () => {
    expect(authorInitials("Julian Tracht")).toBe("JT");
    expect(authorInitials("anna maria lena")).toBe("AM");
    expect(authorInitials("")).toBe("TD");
  });

  it("labels the portrait in the page's language", () => {
    expect(portraitAlt("Ada", "de")).toBe("Porträt von Ada");
    expect(portraitAlt("Ada", "en")).toBe("Portrait of Ada");
  });

  it("writes the long date per locale and nothing without one", () => {
    expect(formatPostDate("2026-03-03T10:00:00Z", "de")).toBe("3. März 2026");
    expect(formatPostDate("2026-03-03T10:00:00Z", "en")).toBe("March 3, 2026");
    expect(formatPostDate(null, "de")).toBe("");
  });

  it("counts words across any whitespace", () => {
    expect(countWords("  eins\nzwei\tdrei  ")).toBe(3);
    expect(countWords("")).toBe(0);
  });

  it("reads 220 words a minute, never less than one minute", () => {
    expect(readingMinutes(0)).toBe(1);
    expect(readingMinutes(440)).toBe(2);
    expect(readingMinutes(549)).toBe(2);
    expect(readingMinutes(551)).toBe(3);
  });
});
