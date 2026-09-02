"use client";

import { createContext, useContext, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DUR, EASE } from "@/lib/motion";

// Per-element entrance inside a chapter.
//
// A chapter that arrives as one solid slab reads cheap no matter how it is
// styled: everything lands at once, so nothing appears to have been placed.
// These let each element inside a chapter come from its own direction on its
// own beat — the filters from the left while the catalogue link comes from the
// right, tiles lifting one after another, the offer rising last.
//
// Entrances are tied to the chapter being on stage rather than to the
// viewport, so they replay every time the visitor comes back to that chapter
// instead of firing once per page load.

const ChapterActive = createContext(true);

export function ChapterActiveProvider({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return <ChapterActive.Provider value={active}>{children}</ChapterActive.Provider>;
}

/** Whether the nearest ChapterActiveProvider ancestor is currently the
 *  chapter on stage — for content that needs to know this beyond just
 *  motion (e.g. gating an autoplaying embed so it doesn't load before the
 *  visitor has actually scrolled to it). Defaults to true outside a
 *  provider, matching ChapterActive's own default. */
export function useChapterActive() {
  return useContext(ChapterActive);
}

export type AppearFrom = "left" | "right" | "up" | "down" | "scale" | "fade";

const HIDDEN: Record<AppearFrom, Record<string, number>> = {
  left: { x: -44, y: 0, scale: 1 },
  right: { x: 44, y: 0, scale: 1 },
  up: { x: 0, y: 34, scale: 1 },
  down: { x: 0, y: -28, scale: 1 },
  scale: { x: 0, y: 10, scale: 0.94 },
  fade: { x: 0, y: 0, scale: 1 },
};

// Which element this renders as. Almost everything wants a <div> — the
// motion.div plays no part in document semantics, it's just a wrapper. "li"
// and "article" exist for the one case a wrapping div can't cover: a
// cascading list ROW that must stay a direct child of its <ul>/<ol> (a
// browser hoists any <div> a script puts between a list and its <li> right
// back out, which silently breaks the cascade) or a grid cell a CSS grid
// addresses positionally. Add more tags here only when a real call site
// needs one — this is a lookup table, not an attempt to cover every tag.
const MOTION_TAGS = { div: motion.div, li: motion.li, article: motion.article };
const PLAIN_TAGS = { div: "div", li: "li", article: "article" } as const;

export default function Appear({
  from = "up",
  delay = 0,
  duration = DUR.item,
  className = "",
  blur = true,
  blurPx = 14,
  as = "div",
  children,
}: {
  from?: AppearFrom;
  /** Seconds after the chapter lands. Stagger siblings by 0.06–0.1. */
  delay?: number;
  duration?: number;
  className?: string;
  /** Also blurs the element in from `blurPx` and clears it as the element
   *  settles, instead of position/opacity alone — a "coming into focus"
   *  arrival. On by default now: this used to be /smm's own opt-in look, but
   *  Egor asked for it site-wide, so every page's entrances get it unless a
   *  call site opts out. Kept element-scoped rather than applied to a whole
   *  chapter or the video reel — CinematicSection's own header tried a
   *  full-screen blur once and dropped it, since it forces a repaint of the
   *  entire stage every frame and visibly stutters. A blur on one heading or
   *  one row is a small fraction of that area and doesn't carry the same
   *  cost. */
  blur?: boolean;
  blurPx?: number;
  /** Element tag to render — see MOTION_TAGS above for when to reach for
   *  "li"/"article" instead of the default "div". */
  as?: keyof typeof MOTION_TAGS;
  children: ReactNode;
}) {
  const active = useContext(ChapterActive);
  const reduced = useReducedMotion();

  if (reduced) {
    const Plain = PLAIN_TAGS[as];
    return <Plain className={className}>{children}</Plain>;
  }

  const MotionTag = MOTION_TAGS[as];

  return (
    <MotionTag
      initial={false}
      animate={
        active
          ? { x: 0, y: 0, scale: 1, opacity: 1, ...(blur ? { filter: "blur(0px)" } : {}) }
          : { ...HIDDEN[from], opacity: 0, ...(blur ? { filter: `blur(${blurPx}px)` } : {}) }
      }
      transition={{ duration, delay: active ? delay : 0, ease: EASE }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
