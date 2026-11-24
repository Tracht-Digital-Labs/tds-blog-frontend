import { writePrefs } from "@tracht-digital-labs/tds-shared/prefs";

/**
 * The article's section nav (`components/Article.astro`): the rail that folds
 * into ticks, the collapsible sections, TOC links that open a closed section,
 * the scroll spy, and the rail fading out past the article column. Mounted
 * from the component's script; moved here unchanged.
 */
export function mountArticleNav(): void {
  // Fold the section nav into a tick rail (each section = one line; the
  // line for the section in view expands via the scroll-spy `.on` class).
  // The state is saved through tds-shared/prefs so it survives navigation.
  const tocShell = document.getElementById("main");
  const tocToggle = document.getElementById("toc-toggle");
  if (tocShell && tocToggle) {
    const applyToc = (collapsed: boolean) => {
      tocShell.classList.toggle("toc-collapsed", collapsed);
      tocToggle.setAttribute("aria-expanded", String(!collapsed));
      const label = collapsed
        ? tocToggle.dataset.labelExpand
        : tocToggle.dataset.labelCollapse;
      if (label) {
        tocToggle.setAttribute("aria-label", label);
        tocToggle.setAttribute("title", label);
      }
    };
    tocToggle.addEventListener("click", () => {
      const collapsed = !tocShell.classList.contains("toc-collapsed");
      applyToc(collapsed);
      writePrefs({ reader_toc: collapsed ? "collapsed" : "open" });
    });
  }

  const heads = document.querySelectorAll<HTMLButtonElement>(".sec-head");
  heads.forEach((btn) => {
    btn.addEventListener("click", () => {
      const body = document.getElementById(btn.getAttribute("aria-controls") ?? "");
      if (!body) return;
      const closed = body.classList.toggle("closed");
      btn.setAttribute("aria-expanded", String(!closed));
    });
  });

  const tocLinks = document.querySelectorAll<HTMLAnchorElement>(".toc a[data-toc]");
  tocLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const id = link.dataset.toc ?? "";
      const body = document.getElementById(`${id}-body`);
      const head = document.querySelector<HTMLButtonElement>(`#${CSS.escape(id)} .sec-head`);
      if (body?.classList.contains("closed")) {
        body.classList.remove("closed");
        head?.setAttribute("aria-expanded", "true");
      }
    });
  });

  if (tocLinks.length > 0) {
    const ids = Array.from(tocLinks).map((l) => l.dataset.toc ?? "");
    const spy = () => {
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      }
      tocLinks.forEach((l) => l.classList.toggle("on", l.dataset.toc === current));
    };
    spy();
    addEventListener("scroll", spy, { passive: true });
    addEventListener("resize", spy, { passive: true });
  }

  // Fade the fixed rail out once the reader scrolls past the article
  // column (it would otherwise float over the navy site footer).
  const rail = document.getElementById("article-toc");
  const artCol = document.querySelector(".article-col");
  if (rail && artCol && "IntersectionObserver" in window) {
    new IntersectionObserver(
      ([e]) => rail.classList.toggle("rail-off", !e.isIntersecting),
      { threshold: 0 },
    ).observe(artCol);
  }
}
