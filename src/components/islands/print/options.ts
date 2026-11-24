/** The print view's choices: what each can be, its default, and where it is kept. */

export type Key = "cover" | "category" | "lead" | "date" | "reading" | "author" | "url" | "tags";
export type Size = "a5" | "a4" | "a3";
export type Fs = "s" | "m" | "l";
export type Fit = "page" | "width" | "actual";

// Meta order follows the document's own top-to-bottom flow.
export const ORDER: Key[] = ["cover", "category", "lead", "date", "reading", "author", "url", "tags"];

// Cover defaults off (it's the colourful brand geometry the print view strips);
// everything textual defaults on.
export const DEFAULTS: Record<Key, boolean> = {
  cover: false,
  category: true,
  lead: true,
  date: true,
  reading: true,
  author: true,
  url: true,
  tags: true,
};

// Sorted small → large.
export const SIZES: Size[] = ["a5", "a4", "a3"];
export const PAGE_NAME: Record<Size, string> = { a5: "A5", a4: "A4", a3: "A3" };

export const FONT_SIZES: Fs[] = ["s", "m", "l"];
export const FITS: Fit[] = ["page", "width", "actual"];

export const META_KEY = "tds-print-meta";
export const SIZE_KEY = "tds-print-size";
export const FS_KEY = "tds-print-fs";
