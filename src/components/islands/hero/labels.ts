/** The hero's sets and words, per language. */
export type SetId = "empfohlen" | "aktuelles" | "populaer";

export interface SetMeta {
  id: SetId;
  label: string;
  blurb: string;
}

export interface HeroLabels {
  intro: string;
  sets: Record<SetId, SetMeta>;
  read: string;
  more: string;
}

export const LABELS: Record<"de" | "en", HeroLabels> = {
  de: {
    intro: "Einblicke für den Mittelstand",
    read: "Artikel lesen",
    more: "Mehr aus dieser Auswahl",
    sets: {
      empfohlen: { id: "empfohlen", label: "Empfohlen", blurb: "Für Sie ausgewählt" },
      aktuelles: { id: "aktuelles", label: "Aktuelles", blurb: "Die neuesten Beiträge" },
      populaer: { id: "populaer", label: "Populär", blurb: "Am meisten gelesen" },
    },
  },
  en: {
    intro: "Insights for the Mittelstand",
    read: "Read article",
    more: "More from this set",
    sets: {
      empfohlen: { id: "empfohlen", label: "For you", blurb: "Picked for you" },
      aktuelles: { id: "aktuelles", label: "Latest", blurb: "The newest posts" },
      populaer: { id: "populaer", label: "Popular", blurb: "Most read" },
    },
  },
};
