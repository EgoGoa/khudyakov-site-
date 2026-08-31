// /smm's own reveal rhythm.
//
// Every other service page reads at the pace lib/motion.ts sets (BEAT/DUR),
// and this page did too until Egor asked for it specifically — "чуть
// медленнее и последовательнее появлялась инфа" and "более дорогая и
// креативная анимация" for /smm alone. Rather than slow BEAT/DUR themselves,
// which every chapter on /content, /ai and /sites also reads, this file is a
// second, slower rhythm that only /smm's own chapter components import — see
// the scope-narrowly lesson this mirrors: a change asked for on one page
// stays on that page.
//
// Three differences from the shared scale:
//   1. Every delay is stretched roughly 1.6–1.8x, so a chapter's elements
//      keep landing in the same reading order (number → heading → intro →
//      substance → CTA) but with noticeably more air between each one.
//   2. `item` duration is longer too (1.05s vs 0.7s) — a slower settle reads
//      as the element being placed rather than snapping into position.
//   3. A cascade step (`STAGGER`) that lib/motion.ts's BEAT scale has no
//      notion of: it only marks when a *block* of content arrives, not when
//      each row inside it arrives relative to its neighbours. /smm's lists
//      (services, process steps, terms, tier cards) use it to reveal one row
//      at a time instead of as one block.

export const SMM_BEAT = {
  eyebrow: 0.1,
  title: 0.32,
  intro: 0.58,
  content: 0.95,
  cta: 1.6,
} as const;

export const SMM_DUR = {
  /** The whole chapter block flying in/out — passed to CinematicSection's
   *  `transitionDuration`. Was DUR.chapter (0.85s). */
  chapter: 1.15,
  /** A single heading/paragraph/CTA settling into place. Was DUR.item
   *  (0.7s). */
  item: 1.05,
  /** One row/card inside a cascading list — shorter than `item` since a row
   *  is a smaller, simpler shape and the cascade's own stagger already
   *  supplies the sense of duration; a full 1.05s per row would make a
   *  five-row list take visibly longer to finish than the heading above it
   *  did to arrive. */
  row: 0.8,
} as const;

/** Gap between successive rows/cards in a cascade. 0.12s reads as one thing
 *  after another without the list dragging — a 5-row list starting at
 *  SMM_BEAT.content finishes its last row at content + 4×STAGGER ≈ 1.43s,
 *  which lands comfortably before the CTA at SMM_BEAT.cta (1.6s): the list
 *  is meant to finish revealing itself before the reader is asked to act on
 *  it, not still be cascading when the button arrives. */
export const SMM_STAGGER = 0.12;
