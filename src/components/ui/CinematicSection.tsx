"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useStageActive, useIsStaged } from "@/components/ui/CinematicStage";
import type { ChapterIconName } from "@/components/ui/ChapterIcon";
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

// The width of a `column` chapter, in one place.
//
// This used to be hardcoded here for the header and written out again by the
// chapter for its own body, and the two drifted apart the moment one was
// tuned: the header stayed at 44% while /sites' chapter 01 body went to 56%
// to fit its CTA bar, so title and card shared a left edge but ended at
// different right edges — which reads as a mistake rather than a deliberate
// step. Exported so a chapter's body can use the same value instead of
// restating it.
//
// 56% is set by the widest thing that has to fit on one line: the CTA bar's
// eyebrow, headline and button (~520px, measured, not estimated). It still
// ends well left of frame centre, keeping the footage's subject clear.
export const CHAPTER_COLUMN = "max-w-xl lg:max-w-[56%]";

/** The chapter's supporting line — the sentence under the title.
 *
 *  Exported because /sites' chapters render their own heading stack
 *  (`headless`, see SitesPitch) and so cannot inherit this component's own
 *  `intro` slot. Egor asked for that page's supporting lines to look like
 *  every other page's, and one exported string is the only way that stays
 *  true after the next edit to either side. */
export const CHAPTER_INTRO =
  "font-display text-sm uppercase leading-snug tracking-tight text-white sm:text-base";

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
  id,
  children,
  decor,
  bodyDecor,
  spacious = false,
  column = false,
  headless = false,
  transitionDuration,
}: {
  /** Position in the deck — must match this chapter's entry in `chapters`. */
  index: number;
  /** "01".."06" */
  chapter: string;
  /** ReactNode rather than string so a chapter can force its own line
   *  breaks — /sites' chapter 01 sets the heading over four lines the way
   *  its approved sketch does, which no automatic wrap reproduces. It is
   *  only ever rendered as children of the <h2>, never read back as text. */
  title: ReactNode;
  intro?: ReactNode;
  icon: ChapterIconName;
  side?: "left" | "right" | "center";
  /** Defaults to sliding in from whichever side the chapter is aligned to. */
  entrance?: EntranceKind;
  /** Extra classes appended to the title — for the one chapter whose title
   *  needs to carry more weight than the shared size gives every chapter. */
  titleClassName?: string;
  /** Scroll-spy anchor, e.g. for VibeRail. Only applied outside the pinned
   *  deck (`!staged`) — inside it, CinematicStage's own runway div already
   *  carries this same id at the matching scroll position, and setting it
   *  here too would duplicate it in the DOM. */
  id?: string;
  children?: ReactNode;
  /** Optional decorative element (e.g. ContentDecoIcon) rendered inside the
   *  header, positioned absolutely by the element itself via its own
   *  className — same pattern as Opening.tsx's chapter 01 header. */
  decor?: ReactNode;
  /** Same idea as `decor`, but rendered next to the body/children instead of
   *  the header — for a decoration meant to sit beside the content below the
   *  title rather than beside the title itself. */
  bodyDecor?: ReactNode;
  /** Opt-in "safe column" layout: instead of the centred title over the full
   *  width, the whole chapter (title, intro and body) is left-aligned and
   *  capped at roughly the left half of the container, leaving the right and
   *  bottom of the frame clear. For chapters whose footage has a subject
   *  that must stay unobstructed — /sites' chapter 01 sits over a car that
   *  lives in the lower-right of the shot. Off by default so every existing
   *  chapter keeps its centred composition. */
  column?: boolean;
  /** Skip this component's own header (number, title, intro) and let the
   *  chapter render the heading itself, inside `children`.
   *
   *  The header is normally a separate flex child pinned above the body,
   *  which is right for every chapter whose body is a full-width block under
   *  a heading. It is wrong for a two-column chapter that wants its heading
   *  to sit *inside* the left column and be vertically centred against a tall
   *  element in the right one — /sites' chapter 01 against its service
   *  carousel. There the split header left the title at the top of the frame
   *  and the rest of the copy floating ~180px below it, which is not one
   *  block any more. With `headless` the chapter owns the whole stack and the
   *  two columns can centre against each other.
   *
   *  The chapter is then responsible for rendering its own <h2>; `title` and
   *  `intro` are ignored. Off by default. */
  headless?: boolean;
  /** Outside a pinned deck only (`!staged`): stretches the section to at
   *  least one viewport tall and centers the body in the extra room, instead
   *  of the section hugging its content height. For plain-scroll pages
   *  (/ai, /sites, /smm) whose chapters were never designed against a fixed
   *  screen the way the pinned deck's are — without this they read as
   *  cramped bands of a few hundred px stacked back to back rather than
   *  full "chapters". Off by default so the pinned-deck consumers (Trust,
   *  Offer, Process, Close inside /content's stage) and every plain-scroll
   *  page that hasn't opted in keep their current, tighter rhythm. */
  spacious?: boolean;
  /** How long the whole chapter block takes to fly in/out (DUR.chapter,
   *  0.85s, if omitted). Every page but /smm leaves this unset — /smm's own
   *  chapters pass a longer value (see smmMotion.ts) as part of the slower,
   *  more theatrical pace Egor asked for there specifically ("заметно
   *  медленнее... дорогая, креативная анимация"), without moving the other
   *  three service pages off the pace lib/motion.ts already sets for them. */
  transitionDuration?: number;
}) {
  // Trust/Offer/Process/Close are authored for the pinned deck (see
  // CinematicStage) but Process is also reused directly on the plain-scroll
  // /ai, /sites, /smm pages, with no deck above it. `useStageActive` alone
  // can't tell those cases apart — matched against the context's fallback
  // value, it silently and permanently reads as "not active", leaving the
  // whole section stuck off-stage: invisible, `aria-hidden`, and still
  // occupying `position: absolute` layout space that overflowed the page.
  // `staged` distinguishes a real deck from that fallback, so outside one
  // this renders as a normal, always-visible, static-flow section instead.
  const staged = useIsStaged();
  const stageActive = useStageActive(index);
  const active = staged ? stageActive : true;
  // `spacious` exists to give a chapter a full screen of room on a page that
  // has no deck — see the prop's own note. Inside a deck every pane already
  // *is* exactly one screen (`absolute inset-0`), so applying it there did
  // the opposite of its name: it padded the header out to min-h-[20svh] and,
  // worse, dropped the body's `my-auto`, which is the only thing centering
  // content in the room left below the header. The result was every chapter
  // crammed into the top of the frame with a dead band along the bottom —
  // invisible while /sites was plain-scroll, and immediately obvious once it
  // became a deck. Gated here rather than at each call site so /sites' four
  // `spacious` chapters (01, 03, 04, 06) are all fixed at once and the prop
  // keeps working unchanged on the plain-scroll pages that still pass it.
  const roomy = spacious && !staged;
  const reduced = useReducedMotion();
  const alignRight = side === "right";
  const alignCenter = side === "center";
  const kind: EntranceKind = entrance ?? (alignRight ? "slide-right" : alignCenter ? "rise" : "slide-left");

  return (
    <motion.div
      id={!staged ? id : undefined}
      initial={false}
      animate={!staged || reduced ? { opacity: active ? 1 : 0 } : entranceFor(kind, active)}
      // Only transform and opacity are animated — a blur() on a full-screen
      // layer was tried and dropped: it forces a repaint of the whole stage on
      // every frame and made the swap visibly stutter.
      transition={{ duration: transitionDuration ?? DUR.chapter, ease: EASE }}
      aria-hidden={!active}
      data-chapter-pane={staged ? "" : undefined}
      data-active={active ? "true" : "false"}
      className={
        staged
          // overflow-x-hidden, not just overflow-y-auto: `overflow-y-auto`
          // alone leaves the x axis at `auto` too, so anything that reaches
          // past the pane's width — a wide decorative element, a 3D-posed
          // carousel card (see AiDeck) — raises a real horizontal scrollbar
          // along the bottom of the chapter. Worse than the bar itself is
          // that its appearing and disappearing changes the pane's usable
          // height, which reflows every line of type inside it: that is the
          // "буквы прыгают" jump. A pinned, full-screen chapter is never
          // meant to pan sideways, so the axis is closed outright and the
          // sticky stage's own overflow-hidden does the clipping.
          ? `absolute inset-0 flex flex-col overflow-y-auto overflow-x-hidden px-6 pb-12 pt-[5.5rem] lg:px-10 lg:pb-12 lg:pt-[5.5rem] ${
              active ? "" : "pointer-events-none"
            }`
          : roomy
          ? "relative flex min-h-[100svh] flex-col px-6 py-16 sm:py-20 lg:min-h-screen lg:px-10 lg:py-24"
          : "relative flex flex-col px-6 py-10 sm:py-14 lg:px-10"
      }
      // touch-action pan-y so the pane itself can be dragged on a phone; the
      // stage decides whether that drag scrolls this chapter or steps to the
      // next one (see CinematicStage). Irrelevant outside the deck, but
      // harmless to leave set.
      style={
        staged
          ? { willChange: "transform, opacity", perspective: 1200, touchAction: "pan-y" }
          : undefined
      }
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

      {!headless && (
      <header
        className={`relative mx-auto w-full max-w-7xl shrink-0 ${
          roomy ? "flex flex-col justify-center min-h-[20svh]" : ""
        }`}
      >
        {decor}

        {/* The chapter number sits in its own corner regardless of how the
            title is aligned — it used to travel with the title as one block,
            which meant centring a title also centred the number away from
            any corner. Kept separate, a centred title can still be a centred
            title. No per-chapter glyph next to it any more (removed by
            request) — the number alone is the marker. */}
        <motion.div
          initial={false}
          animate={active ? "on" : "off"}
          variants={reduced ? undefined : HEADER_EYEBROW}
          className={`flex items-center gap-3 [text-shadow:0_2px_24px_rgba(11,11,16,0.9)] ${
            alignRight ? "lg:justify-end" : ""
          }`}
        >
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
          className={`mt-2 [text-shadow:0_2px_24px_rgba(11,11,16,0.9)] ${
            column ? `${CHAPTER_COLUMN} text-left` : "mx-auto max-w-5xl text-center"
          }`}
        >
          <motion.h2
            variants={reduced ? undefined : HEADER_TITLE}
            // 2x the previous scale (text-3xl/4xl/4xl/5xl) — the chapter
            // name is meant to carry the whole header now, not share the
            // weight with the icon/eyebrow row above it.
            className={`chapter-neon font-display uppercase leading-[0.95] tracking-tight ${
              titleClassName || "text-4xl sm:text-6xl lg:text-6xl xl:text-7xl"
            }`}
          >
            {title}
          </motion.h2>

          {intro && (
            <motion.p
              variants={reduced ? undefined : HEADER_INTRO}
              // White and at reading size, not the 10–12px uppercase display
              // this used to be. Egor asked for the supporting line back at
              // the weight it carries on /sites, on every page — at the old
              // size it read as a caption pinned under the title rather than
              // as the sentence that explains the chapter.
              className={`relative z-10 mx-auto ${CHAPTER_INTRO} ${
                column ? "mt-4 max-w-[34em]" : "mt-3 max-w-[42em]"
              }`}
            >
              {intro}
            </motion.p>
          )}
        </motion.div>
      </header>
      )}

      {children && (
        <div
          // `my-auto` also when headless: with the header gone this is the
          // section's only flex child, so auto margins are what centre the
          // chapter's whole stack in the viewport instead of leaving it
          // parked at the top.
          className={`relative mx-auto w-full max-w-7xl py-2 ${roomy && !headless ? "" : "my-auto"}`}
        >
          {bodyDecor}
          {/* Children use <Appear> to arrive on their own beat and from their
              own direction; this is what tells them the chapter is on stage. */}
          <ChapterActiveProvider active={active}>{children}</ChapterActiveProvider>
        </div>
      )}
    </motion.div>
  );
}
