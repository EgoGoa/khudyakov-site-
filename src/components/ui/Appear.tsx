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

export default function Appear({
  from = "up",
  delay = 0,
  duration = DUR.item,
  className = "",
  children,
}: {
  from?: AppearFrom;
  /** Seconds after the chapter lands. Stagger siblings by 0.06–0.1. */
  delay?: number;
  duration?: number;
  className?: string;
  children: ReactNode;
}) {
  const active = useContext(ChapterActive);
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      initial={false}
      animate={active ? { x: 0, y: 0, scale: 1, opacity: 1 } : { ...HIDDEN[from], opacity: 0 }}
      transition={{ duration, delay: active ? delay : 0, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
