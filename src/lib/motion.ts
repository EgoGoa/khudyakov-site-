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

/** Seconds after the chapter takes the stage. */
export const BEAT = {
  eyebrow: 0.08, // chapter number + icon — "where am I"
  title: 0.2, // "what is this"
  intro: 0.4, // "what does it mean"
  content: 0.62, // the substance: tiles, cards, lists
  controls: 0.55, // filters and links that act on the substance
  cta: 1.0, // the ask, last — after the reason for it has landed
} as const;

/** How long each kind of element takes to settle. */
export const DUR = {
  chapter: 0.85, // the chapter block itself flying in
  title: 0.9,
  text: 0.75,
  item: 0.7,
} as const;

/** Gap between siblings in a sequence (tiles, cards, list rows). */
export const STAGGER = {
  tight: 0.07, // long lists — ten service rows
  normal: 0.11, // a handful of cards or tiles
} as const;
