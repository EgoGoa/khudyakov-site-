"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useStageActive } from "@/components/ui/CinematicStage";
import ChapterIcon, { type ChapterIconName } from "@/components/ui/ChapterIcon";
import { ChapterActiveProvider } from "@/components/ui/Appear";
import { BEAT, DUR, EASE as MOTION_EASE } from "@/lib/motion";

// A chapter in the pinned deck (see CinematicStage). It is absolutely
// positioned over the film and is either on stage or off it — it never scrolls
// past the viewport.
//
// Entrances vary per chapter rather than repeating one slide. Six identical
// swaps read as a template; giving each chapter its own move is what makes the
// deck feel authored. Direction also carries meaning: chapters that continue
// the argument rise from below, chapters that change subject come in from a
// side, and the closing chapter zooms up to meet the visitor.
//
// Layout: the chapter's icon, number and title always sit at the top of the
// screen, so the eye lands in the same place every time and the swap reads as
// content changing under a stable header.
//
// Air is the point: the intro column stays narrow, there is no card or panel
// behind it, and the content gets a wide gap below the heading. Legibility
// comes from the stage's grade, a feathered scrim, and text shadow.

const EASE = [0.22, 1, 0.36, 1] as const;

export type EntranceKind = "slide-left" | "slide-right" | "rise" | "zoom" | "unfold";

function entranceFor(kind: EntranceKind, active: boolean) {
  const hidden: Record<EntranceKind, Record<string, number>> = {
    "slide-left": { x: -190, y: 0, scale: 1, rotateX: 0 },
    "slide-right": { x: 190, y: 0, scale: 1, rotateX: 0 },
    rise: { x: 0, y: 90, scale: 1, rotateX: 0 },
    zoom: { x: 0, y: 24, scale: 0.92, rotateX: 0 },
    // A shallow rotateX reads as the block tipping up into place; kept small
    // (10deg) because anything steeper distorts type over live footage.
    unfold: { x: 0, y: 56, scale: 1, rotateX: 10 },
  };
  return active
    ? { x: 0, y: 0, scale: 1, rotateX: 0, opacity: 1 }
    : { ...hidden[kind], opacity: 0 };
}

// The header's three parts arrive in reading order on the shared beat scale
// (see lib/motion.ts) rather than on a uniform stagger: the chapter number
// first to place you, then the title, then the sentence that explains it.
const HEADER_EYEBROW: Variants = {
  off: { opacity: 0, y: 10 },
  on: { opacity: 1, y: 0, transition: { duration: DUR.text, delay: BEAT.eyebrow, ease: MOTION_EASE } },
};
const HEADER_TITLE: Variants = {
  off: { opacity: 0, y: 22 },
  on: { opacity: 1, y: 0, transition: { duration: DUR.title, delay: BEAT.title, ease: MOTION_EASE } },
};
const HEADER_INTRO: Variants = {
  off: { opacity: 0, y: 16 },
  on: { opacity: 1, y: 0, transition: { duration: DUR.text, delay: BEAT.intro, ease: MOTION_EASE } },
};

export default function CinematicSection({
  index,
  chapter,
  title,
  intro,
  icon,
  side = "left",
  entrance,
  titleClassName = "",
  children,
}: {
  /** Position in the deck — must match this chapter's entry in `chapters`. */
  index: number;
  /** "01".."06" */
  chapter: string;
  title: string;
  intro?: ReactNode;
  icon: ChapterIconName;
  side?: "left" | "right" | "center";
  /** Defaults to sliding in from whichever side the chapter is aligned to. */
  entrance?: EntranceKind;
  /** Extra classes appended to the title — for the one chapter whose title
   *  needs to carry more weight than the shared size gives every chapter. */
  titleClassName?: string;
  children?: ReactNode;
}) {
  const active = useStageActive(index);
  const reduced = useReducedMotion();
  const alignRight = side === "right";
  const alignCenter = side === "center";
  const kind: EntranceKind = entrance ?? (alignRight ? "slide-right" : alignCenter ? "rise" : "slide-left");

  return (
    <motion.div
      initial={false}
      animate={reduced ? { opacity: active ? 1 : 0 } : entranceFor(kind, active)}
      // Only transform and opacity are animated — a blur() on a full-screen
      // layer was tried and dropped: it forces a repaint of the whole stage on
      // every frame and made the swap visibly stutter.
      transition={{ duration: DUR.chapter, ease: EASE }}
      aria-hidden={!active}
      data-chapter-pane=""
      data-active={active ? "true" : "false"}
      className={`absolute inset-0 flex flex-col overflow-y-auto px-6 pb-12 pt-[5.5rem] lg:px-10 lg:pb-12 lg:pt-[5.5rem] ${
        active ? "" : "pointer-events-none"
      }`}
      // touch-action pan-y so the pane itself can be dragged on a phone; the
      // stage decides whether that drag scrolls this chapter or steps to the
      // next one (see CinematicStage).
      style={{ willChange: "transform, opacity", perspective: 1200, touchAction: "pan-y" }}
    >
      {/* Feathered scrim rather than a card: it has no edge to see, so the
          chapter still reads as type on film, but the copy keeps its contrast
          over the bright parts of the frame (faces, highlights). */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: alignCenter
            ? "radial-gradient(120% 85% at 50% 40%, rgba(11,11,16,0.86) 0%, rgba(11,11,16,0.5) 45%, transparent 78%)"
            : alignRight
            ? "radial-gradient(115% 85% at 88% 45%, rgba(11,11,16,0.86) 0%, rgba(11,11,16,0.5) 40%, transparent 74%)"
            : "radial-gradient(115% 85% at 12% 45%, rgba(11,11,16,0.86) 0%, rgba(11,11,16,0.5) 40%, transparent 74%)",
        }}
      />

      <header className="mx-auto w-full max-w-7xl shrink-0">
        {/* The chapter number/icon sits in its own corner regardless of how
            the title is aligned — it used to travel with the title as one
            block, which meant centring a title also centred the number away
            from any corner. Kept separate, a centred title can still be a
            centred title. */}
        <motion.div
          initial={false}
          animate={active ? "on" : "off"}
          variants={reduced ? undefined : HEADER_EYEBROW}
          className={`flex items-center gap-3 [text-shadow:0_2px_24px_rgba(11,11,16,0.9)] ${
            alignRight ? "lg:justify-end" : ""
          }`}
        >
          <ChapterIcon name={icon} active={active} />
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-glow">
            {chapter}
          </span>
          <span className="h-px w-8 bg-glow/40" />
        </motion.div>

        {/* The title is always centred on its own, independent of which
            corner the number sits in — bigger too, since it's now the one
            thing carrying the chapter's weight rather than sharing it with
            an inline icon. */}
        <motion.div
          initial={false}
          animate={active ? "on" : "off"}
          className="mx-auto mt-2 max-w-3xl text-center [text-shadow:0_2px_24px_rgba(11,11,16,0.9)]"
        >
          <motion.h2
            variants={reduced ? undefined : HEADER_TITLE}
            className={`chapter-neon font-display uppercase leading-[0.95] tracking-tight ${
              titleClassName || "text-3xl sm:text-4xl lg:text-4xl xl:text-5xl"
            }`}
          >
            {title}
          </motion.h2>

          {intro && (
            <motion.p
              variants={reduced ? undefined : HEADER_INTRO}
              className="mt-2.5 text-sm leading-relaxed text-paper/80"
            >
              {intro}
            </motion.p>
          )}
        </motion.div>
      </header>

      {children && (
        <div className="mx-auto my-auto w-full max-w-7xl py-2">
          {/* Children use <Appear> to arrive on their own beat and from their
              own direction; this is what tells them the chapter is on stage. */}
          <ChapterActiveProvider active={active}>{children}</ChapterActiveProvider>
        </div>
      )}
    </motion.div>
  );
}
