// One rhythm for every chapter entrance on the cinematic pages.
//
// Elements do not arrive together, and they do not arrive in DOM order: they
// arrive in the order the eye should read them. The chapter number establishes
// where you are, the heading says what this is, the intro explains it, then the
// substance of the chapter, then the controls that act on it, and finally the
// call to action — which should land after the visitor has been given a reason
// to press it, not before.
//
// Everything is deliberately slower than a typical UI transition. Fast
// entrances read as an interface reacting; slow ones read as a scene being
// composed, which is the whole point of this page.

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Seconds after the chapter takes the stage.
 *
 *  `content` sits a full 2s after `intro` on purpose — Egor asked for the
 *  heading and its supporting line to hold alone on screen for a couple of
 *  seconds before anything else moves, so the eye reads the chapter's point
 *  (and the footage behind it) before the substance arrives. Everything
 *  after `content` (`controls`, `cta`) is unchanged in *spacing* from before,
 *  just shifted later by that same 2s. */
export const BEAT = {
  eyebrow: 0.1, // chapter number + icon — "where am I"
  title: 0.35, // "what is this"
  intro: 0.65, // "what does it mean" — heading + this line hold alone for 2s
  content: 2.65, // the substance: tiles, cards, lists
  // Filters and catalogue links act *on* the substance, so they arrive after
  // it rather than a hair before it — the value used to be 2.6, which put
  // them 0.05s ahead of the thing they control and made the two read as one
  // simultaneous slab. Still comfortably before `cta`.
  controls: 2.95,
  cta: 3.2, // the ask, last — after the reason for it has landed
} as const;

/** How long each kind of element takes to settle.
 *
 *  These are /smm's numbers, adopted for every service page. /smm used to
 *  carry its own slower scale in a `smmMotion.ts` of its own; Egor picked
 *  that pace as the one the whole site should read at, so the file is gone
 *  and its values live here instead. A longer settle reads as an element
 *  being *placed* rather than snapping into position, which is what made
 *  /smm feel more considered than its siblings. */
export const DUR = {
  chapter: 1.15, // the chapter block itself flying in
  title: 1.05,
  text: 1.05,
  item: 1.05,
  /** One row or card inside a cascading list — shorter than `item` on
   *  purpose. A row is a smaller, simpler shape, and the cascade's own
   *  STAGGER already supplies the sense of duration; a full `item` per row
   *  would make a five-row list take visibly longer to finish than the
   *  heading above it took to arrive. */
  row: 0.8,
} as const;

/** Gap between siblings in a sequence (tiles, cards, list rows). Wide enough
 *  that a cascading list reads as one row after another rather than a fast
 *  ripple, and narrow enough that the list finishes revealing itself before
 *  BEAT.cta asks the reader to act on it. */
export const STAGGER = {
  tight: 0.09, // long lists — process steps, ten service rows, FAQ
  normal: 0.15, // a handful of cards, tiles or pills
} as const;
