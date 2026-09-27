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
 *  `content` used to sit a full 2s after `intro` — the heading and its
 *  supporting line held alone on screen before anything else moved. Egor
 *  later found that pause read as the page hanging rather than as a
 *  deliberate beat, so it's cut to 0.6s: still long enough for the heading
 *  to register as its own moment, short enough that the chapter doesn't
 *  feel stalled. `controls`/`cta` keep the same spacing *after* `content`
 *  they always had, just carried on the shorter gap. */
export const BEAT = {
  eyebrow: 0.1, // chapter number + icon — "where am I"
  title: 0.35, // "what is this"
  intro: 0.65, // "what does it mean" — heading + this line hold alone briefly
  content: 1.25, // the substance: tiles, cards, lists
  // Filters and catalogue links act *on* the substance, so they arrive after
  // it rather than a hair before it — same 0.3s gap this always had after
  // `content`, so the two don't read as one simultaneous slab.
  controls: 1.55,
  cta: 1.8, // the ask, last — after the reason for it has landed
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

/** Тот же ритм появления, но для страниц направлений (/content/presentation
 *  и остальные внутри /content).
 *
 *  На основных страницах (/content, /ai, /sites, /smm) `BEAT.content` нарочно
 *  ждёт 2 секунды после подзаголовка — Егор просил, чтобы заголовок и
 *  поясняющая строка постояли одни на экране, прежде чем появится
 *  содержимое главы. На странице направления это оказалось неуместно: в
 *  одиннадцать блоков подряд, где на каждом уже есть заголовок и подпись,
 *  та же пауза читается как подвисание, а не как пауза для чтения. Здесь
 *  содержимое идёт сразу следом за подзаголовком, в том же ритме, что и
 *  сама шапка блока. */
export const DIRECTION_BEAT = {
  eyebrow: 0.1,
  title: 0.3,
  intro: 0.5,
  content: 0.8,
  controls: 1.05,
  cta: 1.3,
} as const;

/** Одна анимация для всех окон сайта (Егор, 2026-09-27: «плавно, в стиле
 *  Apple, как на макбуках»). Как окно в macOS: появляется мягкой пружиной
 *  из чуть уменьшенного состояния — без отскока, но с живым дотягиванием, —
 *  а уходит быстрее, коротким «вдохом» внутрь с растворением. Уход всегда
 *  короче появления: закрытие должно ощущаться мгновенным ответом на клик.
 *
 *  Без filter: любой filter на предке выключает backdrop-filter стекла
 *  окна, и оно перестаёт размывать сайт под собой. */
const WIN_SPRING = { type: "spring", visualDuration: 0.45, bounce: 0.14 } as const;
const WIN_OUT = { duration: 0.26, ease: [0.4, 0, 0.6, 1] } as const;

export const WIN = {
  initial: { opacity: 0, scale: 0.94, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { ...WIN_SPRING, opacity: { duration: 0.28, ease: EASE } } },
  exit: { opacity: 0, scale: 0.96, y: 6, transition: WIN_OUT },
} as const;

/** Боковая панель (персонализация блока): тот же характер, но въезжает сбоку. */
export const WIN_SIDE = {
  initial: { opacity: 0, scale: 0.96, x: 24 },
  animate: { opacity: 1, scale: 1, x: 0, transition: { ...WIN_SPRING, opacity: { duration: 0.28, ease: EASE } } },
  exit: { opacity: 0, scale: 0.97, x: 16, transition: WIN_OUT },
} as const;

/** Затемнение сайта за окном: проявляется вместе с окном и гаснет чуть
 *  позже него — сайт «возвращается», когда окно уже ушло. */
export const WIN_DIM = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.32, ease: EASE, delay: 0.06 } },
} as const;
