/**
 * The reading-progress bar at the top of an article (`#reading-progress`):
 * scaled along x by how far the page is scrolled, kept current on scroll and
 * resize. Does nothing on a page without the bar.
 */
export function mountReadingProgress(): void {
  const bar = document.getElementById("reading-progress");
  if (!bar) return;
  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    bar.style.transform = `scaleX(${max > 0 ? doc.scrollTop / max : 0})`;
  };
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update, { passive: true });
  update();
}
