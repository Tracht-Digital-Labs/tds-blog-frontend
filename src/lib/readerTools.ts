import { writePrefs } from "@tracht-digital-labs/tds-shared/prefs";

// The article's reading tools (`components/Article.astro`), mounted from its
// script; moved here unchanged so they are type-checked and testable.

/**
 * Reader focus mode: toggles `focus-mode` on <html> (pre-paint restore lives
 * in Layout), persists the choice, and binds the `f` key (toggle) + `Escape`
 * (exit). Ignores key presses while typing in a field.
 */
export function mountFocusMode(): void {
  const root = document.documentElement;
  const btn = document.getElementById("focus-toggle");
  // The phone's settings sheet carries the same toggle.
  const others = Array.from(document.querySelectorAll<HTMLElement>("[data-focus-toggle]"));
  const KEY = "tds-blog-focus";
  const sync = () => {
    const on = String(root.classList.contains("focus-mode"));
    if (btn) btn.setAttribute("aria-pressed", on);
    for (const b of others) b.setAttribute("aria-pressed", on);
  };
  const set = (on: boolean) => {
    root.classList.toggle("focus-mode", on);
    try { localStorage.setItem(KEY, on ? "1" : "0"); } catch { /* no-op */ }
    sync();
  };
  sync();
  btn?.addEventListener("click", () => set(!root.classList.contains("focus-mode")));
  for (const b of others) b.addEventListener("click", () => set(!root.classList.contains("focus-mode")));
  document.addEventListener("keydown", (e) => {
    const t = e.target as HTMLElement | null;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (e.key === "f" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      set(!root.classList.contains("focus-mode"));
    } else if (e.key === "Escape" && root.classList.contains("focus-mode")) {
      set(false);
    }
  });
}

/**
 * Reader zoom: scales the reading frame (`--reader-zoom`, read by
 * `.article-read` / `.article-zoom`). The pre-paint restore lives in Layout;
 * the value is saved through tds-shared/prefs, so it follows the reader to
 * every Tracht Digital site and, signed in, to other devices.
 */
export function mountReaderZoom(): void {
  const root = document.documentElement;
  const STEPS = [0.9, 1, 1.1, 1.25, 1.4];
  const inBtns = [document.getElementById("zoom-in"), ...document.querySelectorAll<HTMLElement>('[data-zoom-step="1"]')]
    .filter(Boolean) as HTMLButtonElement[];
  const outBtns = [document.getElementById("zoom-out"), ...document.querySelectorAll<HTMLElement>('[data-zoom-step="-1"]')]
    .filter(Boolean) as HTMLButtonElement[];
  const resets = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-zoom-reset]"));
  const current = () => {
    const v = parseFloat(root.style.getPropertyValue("--reader-zoom")) || 1;
    // Snap to the nearest step so a stale stored value still moves sanely.
    return STEPS.reduce((best, s) => (Math.abs(s - v) < Math.abs(best - v) ? s : best), 1);
  };
  const sync = () => {
    const z = current();
    const i = STEPS.indexOf(z);
    for (const b of inBtns) b.disabled = i >= STEPS.length - 1;
    for (const b of outBtns) b.disabled = i <= 0;
    for (const r of resets) {
      const label = r.querySelector("[data-zoom-label]");
      if (label) label.textContent = `${Math.round(z * 100)} %`;
      r.setAttribute("aria-pressed", String(z === 1));
    }
  };
  const apply = (next: number) => {
    if (next === 1) root.style.removeProperty("--reader-zoom");
    else root.style.setProperty("--reader-zoom", String(next));
    writePrefs({ reader_zoom: String(next) });
    sync();
  };
  const step = (dir: 1 | -1) => {
    const i = STEPS.indexOf(current());
    apply(STEPS[Math.min(STEPS.length - 1, Math.max(0, i + dir))]!);
  };
  for (const b of inBtns) b.addEventListener("click", () => step(1));
  for (const b of outBtns) b.addEventListener("click", () => step(-1));
  for (const r of resets) r.addEventListener("click", () => apply(1));
  sync();
}
