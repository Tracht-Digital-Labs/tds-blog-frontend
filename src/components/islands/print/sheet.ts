import { PAGE_NAME, type Fit, type Size } from "./options";

/**
 * The paper: its true size, its margin and how the preview fits it to the
 * screen. The sheets are laid out in mm and scaled with CSS `zoom`, never
 * clamped in width, so A5, A4 and A3 differ on a phone the way the paper does.
 */

/** Paper size in mm — the sheets are laid out at this true size and then
 *  scaled to the screen, so A5/A4/A3 differ the way the paper does. */
export const PAGE_MM: Record<Size, [number, number]> = { a5: [148, 210], a4: [210, 297], a3: [297, 420] };
export const MM_TO_PX = 96 / 25.4;
export const PAGE_MARGIN = "16mm"; // Seitenabstand — mirrored by .print-page padding.
/** The sheet's hard offset on screen (8px) plus a little air. */
export const SHEET_EXTRA = 12;

/** The `@page` rule for real print and PDF: size, margin, and the page number in the bottom margin. */
export function pageRule(size: Size, pageNoCss: string): string {
  return (
    `@page { size: ${PAGE_NAME[size]}; margin: ${PAGE_MARGIN}; ` +
    `@bottom-right { content: ${pageNoCss}; font-family: var(--font-body), sans-serif; ` +
    `font-size: 8.25pt; color: #71717a; vertical-align: middle; } }`
  );
}

/**
 * The preview's scale for a sheet in the space available: the page width, the
 * whole page, or 100 %. Never above 1, never below 0.2.
 */
export function fitScale(size: Size, fit: Fit, availW: number, availH: number): number {
  const [wMm, hMm] = PAGE_MM[size];
  const pageW = wMm * MM_TO_PX + SHEET_EXTRA;
  const pageH = hMm * MM_TO_PX + SHEET_EXTRA;
  let next = 1;
  if (fit === "width") next = Math.min(1, availW / pageW);
  else if (fit === "page") next = Math.min(1, availW / pageW, availH / pageH);
  return Math.max(0.2, next);
}
