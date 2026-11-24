import type { IndexPost } from "~/lib/indexFilter";
import type { Labels } from "./labels";

function Chevron({ left }: { left?: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={left ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}

/** The category rail beside the grid (lg and up), with a count per category. */
export default function CategorySidebar({
  posts,
  cats,
  value,
  onChange,
  collapsed,
  onToggle,
  t,
}: {
  posts: IndexPost[];
  cats: string[];
  value: string;
  onChange: (c: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  t: Labels;
}) {
  const count = (c: string) =>
    c === "all" ? posts.length : posts.filter((p) => p.category === c).length;

  if (collapsed) {
    return (
      <nav className="sidenav" id="blog-cat-rail" aria-label={t.categories}>
        <button
          type="button"
          className="sidenav-toggle"
          onClick={onToggle}
          aria-label={t.expandCats}
          aria-controls="blog-cat-rail"
          aria-expanded="false"
        >
          <Chevron />
        </button>
      </nav>
    );
  }
  return (
    <nav className="sidenav" id="blog-cat-rail" aria-label={t.categories}>
      <div className="sidenav-head">
        <span>{t.categories}</span>
        <button
          type="button"
          className="sidenav-toggle"
          onClick={onToggle}
          aria-label={t.collapseCats}
          aria-controls="blog-cat-rail"
          aria-expanded="true"
        >
          <Chevron left />
        </button>
      </div>
      {/* aria-pressed, because the `on` class is the only other place the
          selected category exists. The mobile chip strip below has carried it
          all along, so the same filter reported its state on a phone and said
          nothing on a desktop — the wider screen is the one with the rail. */}
      {/* One run of tiles with 1px seams; the buttons carry no margin. */}
      <div className="jnl-stack">
        {["all", ...cats].map((c) => (
          <button
            type="button"
            key={c}
            className={`sidenav-item${value === c ? " on" : ""}`}
            aria-pressed={value === c}
            onClick={() => onChange(c)}
          >
            <span>{c === "all" ? t.all : c}</span>
            <span className="cnt">{count(c)}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
