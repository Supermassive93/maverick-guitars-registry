// Fanned-deck layout shared by the models page and the identification wizard's model picker.

// Model deck: a series row is a fanned deck of fixed-size cards. Each card after the first
// overlaps the one before it so the whole row always fits the row's width — no scrollbar. The
// overlap is computed from the row's own width (container units), so it adapts to any screen:
//   visible strip per card = (row width − card width) / (cards − 1)
// clamped so cards never gap apart (wide screens) or shrink below a minimum strip (narrow
// screens, where the row scrolls instead). --deck-n (card count) is set on the row, --card-w and
// data-i (the card's position) on each card.
//
// Hovering card k riffles the deck like a stack of papers: cards before k stay exactly where they
// are (so the pointer never drifts off the card you're on), the card after k slides over to sit
// directly beside it, exposing k in full, and the cards beyond that squeeze their strips just
// enough that the row still fits the screen:
//   k·strip (unchanged) + card + (n−2−k)·squeezedStrip + card = row width
// One rule per possible k (rows never have more than DECK_MAX cards). Rendered inline with the
// page so it ships with it.
export const DECK_MAX = 24
const DECK_HOVER_CSS = Array.from({ length: DECK_MAX }, (_, k) => `
.model-deck:has(.deck-card[data-i="${k}"]:hover) .deck-card:nth-child(n+${k + 2}) {
  margin-left: clamp(
    calc(var(--deck-min-strip) - var(--card-w)),
    calc((100cqw - 2 * var(--card-w) - ${k} * ((100cqw - var(--card-w)) / (var(--deck-n) - 1))) / max(1, var(--deck-n) - ${k + 2}) - var(--card-w)),
    0px
  );
}
.model-deck:has(.deck-card[data-i="${k}"]:hover) .deck-card:nth-child(${k + 2}) { margin-left: 0; }`).join('')

export const DECK_CSS = `
.model-deck {
  container-type: inline-size;
  display: flex;
  padding: 18px 0 26px;
  overflow-x: auto;
  --deck-min-strip: 64px;
}
.model-deck .deck-card {
  position: relative;
  flex: 0 0 auto;
  box-shadow: -10px 0 18px rgba(0,0,0,0.5);
  transition: margin-left 0.28s ease, transform 0.28s ease, box-shadow 0.28s ease;
}
.model-deck .deck-card:first-child { box-shadow: none; }
/* The synopsis sits in the part of the card that's hidden while it's overlapped, so it fades in
   when the card is hovered (the last card is always fully visible, so it keeps its text). */
.model-deck .deck-synopsis { opacity: 0; transition: opacity 0.2s ease 0.1s; }
.model-deck .deck-card:hover .deck-synopsis,
.model-deck .deck-card:last-child .deck-synopsis { opacity: 1; }
.model-deck .deck-card + .deck-card {
  margin-left: clamp(
    calc(var(--deck-min-strip) - var(--card-w)),
    calc((100cqw - var(--card-w)) / (var(--deck-n) - 1) - var(--card-w)),
    0px
  );
}
.model-deck .deck-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 0 0 1px rgba(200,169,110,0.45), 0 18px 40px rgba(0,0,0,0.6);
}
` + DECK_HOVER_CSS
