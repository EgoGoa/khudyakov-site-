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
  controls: 2.6, // filters and links that act on the substance
  cta: 3.2, // the ask, last — after the reason for it has landed
} as const;

/** How long each kind of element takes to settle. Slightly slower than the
 *  original scale (title 0.9→1.0, text/item 0.7-0.75→0.85) to match the
 *  unhurried settle Egor liked on /smm. */
export const DUR = {
  chapter: 0.85, // the chapter block itself flying in
  title: 1.0,
  text: 0.85,
  item: 0.85,
} as const;

/** Gap between siblings in a sequence (tiles, cards, list rows). Wider than
 *  before (0.07/0.11 → 0.09/0.15) so a cascading list reads as one row after
 *  another rather than a fast ripple. */
export const STAGGER = {
  tight: 0.09, // long lists — ten service rows
  normal: 0.15, // a handful of cards or tiles
} as const;
