import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const writePrefs = vi.fn();
vi.mock("@tracht-digital-labs/tds-shared/prefs", () => ({ writePrefs: (p: unknown) => writePrefs(p) }));

const { mountFocusMode, mountReaderZoom } = await import("./readerTools");

/**
 * The article's reading tools, mounted on markup shaped like Article.astro's:
 * the desktop buttons by id, the phone's settings sheet by data attribute.
 */
const root = document.documentElement;

beforeEach(() => {
  writePrefs.mockClear();
  localStorage.clear();
  root.className = "";
  root.style.removeProperty("--reader-zoom");
});

afterEach(() => {
  document.body.innerHTML = "";
});

function press(key: string, init: KeyboardEventInit = {}, target: EventTarget = document.body) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

describe("focus mode", () => {
  beforeEach(() => {
    document.body.innerHTML = `<button id="focus-toggle"></button><button data-focus-toggle></button><input id="field">`;
    mountFocusMode();
  });

  const desktop = () => document.getElementById("focus-toggle")!;
  const sheet = () => document.querySelector("[data-focus-toggle]")!;

  it("starts with both toggles showing the current state", () => {
    expect(desktop().getAttribute("aria-pressed")).toBe("false");
    expect(sheet().getAttribute("aria-pressed")).toBe("false");
  });

  it("toggles from either button, keeps both in step and remembers the choice", () => {
    (sheet() as HTMLElement).click();
    expect(root.classList.contains("focus-mode")).toBe(true);
    expect(desktop().getAttribute("aria-pressed")).toBe("true");
    expect(localStorage.getItem("tds-blog-focus")).toBe("1");
    (desktop() as HTMLElement).click();
    expect(root.classList.contains("focus-mode")).toBe(false);
    expect(localStorage.getItem("tds-blog-focus")).toBe("0");
  });

  it("toggles on a plain f and leaves on Escape", () => {
    expect(press("f").defaultPrevented).toBe(true);
    expect(root.classList.contains("focus-mode")).toBe(true);
    press("Escape");
    expect(root.classList.contains("focus-mode")).toBe(false);
  });

  it("ignores f with a modifier and Escape while it is off", () => {
    for (const init of [{ metaKey: true }, { ctrlKey: true }, { altKey: true }]) {
      expect(press("f", init).defaultPrevented).toBe(false);
    }
    press("Escape");
    expect(root.classList.contains("focus-mode")).toBe(false);
    expect(localStorage.getItem("tds-blog-focus")).toBeNull();
  });

  it("ignores keys typed into a field", () => {
    press("f", {}, document.getElementById("field")!);
    expect(root.classList.contains("focus-mode")).toBe(false);
  });
});

describe("reader zoom", () => {
  function mount() {
    document.body.innerHTML = `
      <button id="zoom-out"></button><button id="zoom-in"></button>
      <button data-zoom-step="-1"></button><button data-zoom-step="1"></button>
      <button data-zoom-reset><span data-zoom-label></span></button>`;
    mountReaderZoom();
  }
  const zoom = () => root.style.getPropertyValue("--reader-zoom");
  const label = () => document.querySelector("[data-zoom-label]")!.textContent;
  const zoomIn = () => document.getElementById("zoom-in") as HTMLButtonElement;
  const zoomOut = () => document.getElementById("zoom-out") as HTMLButtonElement;

  it("steps through the scale, saves each step and labels it", () => {
    mount();
    expect(label()).toBe("100 %");
    zoomIn().click();
    expect(zoom()).toBe("1.1");
    expect(writePrefs).toHaveBeenLastCalledWith({ reader_zoom: "1.1" });
    expect(label()).toBe("110 %");
    (document.querySelector('[data-zoom-step="-1"]') as HTMLButtonElement).click();
    expect(zoom()).toBe("");
    expect(writePrefs).toHaveBeenLastCalledWith({ reader_zoom: "1" });
  });

  it("stops at both ends and disables the button that would pass them", () => {
    mount();
    for (let i = 0; i < 6; i++) zoomIn().click();
    expect(zoom()).toBe("1.4");
    expect(zoomIn().disabled).toBe(true);
    expect((document.querySelector('[data-zoom-step="1"]') as HTMLButtonElement).disabled).toBe(true);
    for (let i = 0; i < 6; i++) zoomOut().click();
    expect(zoom()).toBe("0.9");
    expect(zoomOut().disabled).toBe(true);
    expect(zoomIn().disabled).toBe(false);
  });

  it("resets to 100 % and marks the reset as pressed there", () => {
    mount();
    zoomIn().click();
    const reset = document.querySelector("[data-zoom-reset]") as HTMLButtonElement;
    expect(reset.getAttribute("aria-pressed")).toBe("false");
    reset.click();
    expect(zoom()).toBe("");
    expect(reset.getAttribute("aria-pressed")).toBe("true");
  });

  it("snaps a stored value between steps to the nearest one", () => {
    root.style.setProperty("--reader-zoom", "1.2");
    mount();
    expect(label()).toBe("125 %");
    zoomIn().click();
    expect(zoom()).toBe("1.4");
  });
});
