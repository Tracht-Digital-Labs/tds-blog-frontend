import type { Ref } from "react";
import { LENGTH_BANDS, SORT_KEYS, type LengthBand, type SortKey } from "~/lib/indexFilter";
import type { Labels } from "./labels";

/**
 * The filter bar's panel (tds-shared `.tds-filterbar`): reading-time band,
 * order, reset and close. Opens below the index heading row; Escape closes it.
 */
export default function FilterPanel({
  open,
  panelRef,
  band,
  sort,
  activeFilters,
  onBand,
  onSort,
  onReset,
  onClose,
  t,
}: {
  open: boolean;
  panelRef: Ref<HTMLDivElement>;
  band: LengthBand;
  sort: SortKey;
  activeFilters: number;
  onBand: (band: LengthBand) => void;
  onSort: (sort: SortKey) => void;
  onReset: () => void;
  onClose: () => void;
  t: Labels;
}) {
  return (
    <div
      className="tds-filterbar__panel"
      id="blog-filter"
      ref={panelRef}
      hidden={!open}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <fieldset className="tds-filterbar__group">
        <legend className="tds-filterbar__legend">{t.length}</legend>
        <div className="tds-toolbar">
          {LENGTH_BANDS.map((b) => (
            <button type="button" key={b} className="chip" aria-pressed={band === b} onClick={() => onBand(b)}>
              {t.lengths[b]}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="tds-filterbar__group">
        <legend className="tds-filterbar__legend">{t.sort}</legend>
        <div className="tds-toolbar">
          {SORT_KEYS.map((k) => (
            <button type="button" key={k} className="chip" aria-pressed={sort === k} onClick={() => onSort(k)}>
              {t.sorts[k]}
            </button>
          ))}
        </div>
      </fieldset>
      <button type="button" className="tds-filterbar__reset" disabled={activeFilters === 0} onClick={onReset}>
        {t.resetFilters}
      </button>
      <button
        type="button"
        className="tds-filterbar__close"
        aria-label={t.closeFilters}
        title={t.closeFilters}
        onClick={onClose}
      />
    </div>
  );
}
