"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useCinematicNavRegister } from "@/lib/cinematic-nav";

// One continuous film behind a deck of chapters.
//
// The reel (public/video/content-reel.mp4) is the source footage whole and
// unedited — nothing is cut out of it and nothing is joined onto it. Each
// chapter owns one contiguous slice of that timeline ("phase"), placed on the
// film's own cuts. Arriving at a chapter plays its phase and then *freezes on
// the last frame*; scrolling on resumes the film into the next phase, so the
// reel runs 0 → 43s exactly once across a full scroll of the page rather than
// restarting per block, and the picture never carries a join of ours.
//
// Nothing scrolls past the viewport. The video and every chapter live in a
// single sticky screen pinned for the whole stack; the document scroll is pure
// runway, one viewport-height per chapter, and it only advances an index.
// Chapters swap by flying in and out from alternating sides.
//
// Stepping is gesture-driven, not position-driven. Two earlier approaches were
// removed: CSS scroll-snap grabbed the wrong step against a sticky layer laid
// out with a negative margin, and a "settle onto the nearest chapter once the
// scrolling stops" correction made the page feel like it was pulling back
// against the visitor. Now a gesture picks the chapter outright and the page is
// glided to it on our own easing.
//
// One short gesture — a flick, a swipe, an arrow key — moves exactly one
// chapter, and the film eases to a stop rather than cutting to one.
//
// No chapter scrolls internally. Nested scrolling inside a pinned deck reads
// as two scrollbars fighting over one gesture, so every chapter is built to
// fit a single screen instead — the portfolio chapter shows four works and
// links to /works for the full catalogue.

export type Phase = {
  start: number;
  end: number;
  /** Optional per-chapter override of the stage's `brightness` prop, for a
   *  fragment that grades much darker or lighter than the rest of the reel.
   *  /smm's closing phase is the case it was added for: the last four
   *  seconds are a near-black terrace, and at the stage-wide multiplier the
   *  picture simply read as an unlit page. Left undefined, a phase inherits
   *  the stage value, so no existing page changes. */
  brightness?: number;
};
export type ChapterMeta = { id: string };

type StageApi = { activeIndex: number; staged: boolean; started: boolean };

// `staged: false` on the default value (no Provider above) is what lets
// CinematicSection tell "really inside a CinematicStage" apart from "the
// context fell back to its default" — see useIsStaged below. A component
// like Process that is reused both inside /content's deck and directly on
// the plain-scroll /ai, /sites, /smm pages needs that distinction: it must
// stay hidden-until-active in the deck, but render as an ordinary visible
// section everywhere else.
// Exported so PhotoStage (a static-background sibling deck for pages with no
// video reel yet — see that file) can provide the exact same context object.
// CinematicSection's hooks below then work under either stage unmodified,
// since a React Context is just an object identity — which component
// provides it doesn't matter.
export const StageContext = createContext<StageApi>({ activeIndex: 0, staged: false, started: false });

// Seeking is only accurate to the nearest keyframe; the reel carries one per
// second (-g 25), so land slightly inside the phase rather than exactly on its
// boundary, where the previous scene's last frame can still surface.
const SEEK_EPSILON = 0.04;

// How far behind a phase's start the playhead may sit and still count as
// "already here" — covers HOLD_BACK_SECONDS below, which deliberately parks
// the playhead just *short* of the boundary rather than on it.
const RESUME_TOLERANCE = 0.5;

// How far before a phase's end the hold actually stops the film.
//
// A phase boundary is one of the footage's own cuts, and a scene detector
// reports a cut at the timestamp of the *first frame of the new scene*. So
// pausing at `phase.end` froze the deck on the next fragment's opening frame:
// the new angle sat there, blurred, for the whole hold, and when the blur
// cleared it revealed the very frame it had been showing all along — the
// reveal had nothing left to give.
//
// Stopping a few frames earlier holds the last frame of the fragment that
// just played instead, so the new angle stays entirely behind the blur and
// only arrives as it lifts. The remaining sliver is played back (not sought
// past) when the next chapter resumes — at that point the blur is still at
// full strength, so the cut itself lands where nothing is legible, and no
// seek/decode is spent on a step that used to need none.
//
// 0.12s is ~3 frames at 24fps: comfortably clear of one frame of playback
// plus the ~17ms of overshoot a 60Hz rAF loop can leave, with room for a
// scene detector's own off-by-one, while still reading as the fragment's
// final beat rather than a chunk cut off its end.
const HOLD_BACK_SECONDS = 0.12;

// Gesture stepping. Thresholds are deliberately low: the ask is that one short
// movement is enough, so a flick registers well before a full page of scrolling
// has been spent. MOMENTUM_MS is what a trackpad's decaying tail is absorbed
// for, so one physical flick cannot cascade through several chapters.
const WHEEL_THRESHOLD = 12; // px of accumulated deltaY that counts as a flick
const WHEEL_RESET_MS = 120; // trackpads fire many tiny events — coalesce them
const SWIPE_THRESHOLD = 36; // px of touch travel that counts as a swipe
const MOMENTUM_MS = 220;
const STEP_MS = 420; // the glide from one chapter to the next
// How long the post-step lock is renewed by, on every wheel event that
// arrives while still locked (see the isLocked branch in onWheel). Egor
// reported an ordinary, unhurried trackpad/mouse scroll — not a hard flick —
// carrying the deck through two chapters in one continuous motion. The old
// lock was a single fixed window (STEP_MS + 700, set once when the step
// fired) rather than tied to the gesture itself: an everyday scroll routinely
// keeps emitting wheel events for longer than 1.12s, so by the time that
// window expired the visitor's finger was often still moving, and the very
// next event started accumulating a second step from scratch — mid-gesture.
// Renewing the lock a little on each absorbed event instead ties its expiry
// to the gesture actually going quiet: it keeps being pushed out for as long
// as the same continuous scroll keeps producing events, and only lapses this
// many ms after the last one, whether that is 200ms or 2s later. One
// continuous gesture — of any length — now always lands exactly one chapter.
const WHEEL_LOCK_RENEW_MS = 180;
const EDGE_EPSILON = 2; // px tolerance for "this chapter is scrolled to the end"
// Below this, an overflow is treated as measurement noise (sub-pixel font
// metrics, a slightly different zoom level) rather than a chapter that
// genuinely needs reading before it steps on. Without this, a chapter that
// was only a few px over the fold -- invisible to the eye -- still demanded a
// full scroll-to-the-edge before a trackpad flick would advance it, which is
// what made switching off the portfolio chapter feel stuck.
const SCROLLABLE_MIN_OVERFLOW = 48;
const KEY_SCROLL_PX = 320; // how far one arrow press scrolls inside a tall chapter

// The hold is reached by blurring, not by slowing down. An earlier version
// eased playbackRate down before the pause, but the reel only carries one
// keyframe per second — at a low rate the browser has nothing to interpolate
// between, so the "slow motion" read as a stutter rather than a settle. Full
// speed to a hard stop has no such problem; the blur is what sells the
// transition instead. `blurSeconds` is the window, at both ends of a phase,
// over which it ramps; `maxBlurPx` is how far it gets. Both are props, since
// how hard the defocus should hit is a per-reel decision: these are the
// values /content's reel was tuned to, /ai asks for a heavier one.
const DEFAULT_BLUR_SECONDS = 0.7;
const DEFAULT_MAX_BLUR_PX = 16;

// `push` only. A slow zoom across the *whole* reel, not per phase: the film
// closes in by PUSH_RANGE from 0 to its last phase's end and never resets, so
// no chapter change carries a scale jump (a per-phase push does, and a 6%
// pop is legible even under a full-strength blur). It earns its place on a
// reel with long, near-frozen stretches — /ai's has two — where the picture
// would otherwise sit dead still for a whole chapter. PUSH_BASE also keeps
// the frame overscanned, so a heavy blur can't drag the video's own edges
// into shot.
const PUSH_BASE = 1.04;
const PUSH_RANGE = 0.06;

export default function CinematicStage({
  src,
  poster,
  phases,
  chapters,
  maxBlurPx = DEFAULT_MAX_BLUR_PX,
  blurSeconds = DEFAULT_BLUR_SECONDS,
  push = false,
  brightness = 1,
  rail,
  children,
}: {
  src: string;
  poster: string;
  phases: Phase[];
  chapters: ChapterMeta[];
  /** How far the defocus goes at a hold. See DEFAULT_MAX_BLUR_PX. */
  maxBlurPx?: number;
  /** How long it takes to get there, at both ends of a phase. */
  blurSeconds?: number;
  /** Slow zoom across the whole reel — see PUSH_BASE. */
  push?: boolean;
  /** CSS brightness() multiplier on the reel, e.g. 1.3 = 30% lighter. Baked
   *  into the same filter string the blur ramp writes (see the tick loop
   *  below), since setting `style.filter` replaces the whole property. */
  brightness?: number;
  /** Deck-level furniture rendered inside the sticky viewport, above the
   *  grade and below the chapters — currently only /sites' neon chapter
   *  rail (see ChapterRail). Optional and off by default so every
   *  other CinematicStage consumer is unaffected; a page opts in by
   *  passing its own element, which receives the deck's activeIndex via
   *  StageContext the same way the chapters themselves do. */
  rail?: ReactNode;
  children: ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Blur and the push-zoom transform land on this wrapper, not on the
  // <video> element itself. Safari composites a hardware-decoded <video>
  // through its own overlay layer, and mutating `filter`/`transform` on
  // that element directly — especially both at once, every animation
  // frame, which only /ai's heavier `push` reel does — makes WebKit drop
  // the video to a black/frozen frame instead of rendering the effect.
  // Chromium has no such issue, which is why only Safari showed it.
  // Applying the same styles to a plain div wrapping the video sidesteps
  // the video's own compositing path entirely.
  const frameRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // The phase-driving effect below fires on mount (activeIndex starts at 0),
  // which used to mean chapter 01's phase played out — and parked, blurred,
  // on its closing frame — before the visitor had scrolled anywhere near it.
  // Gated on actually entering the viewport, so the reel is still sitting at
  // its start when the visitor arrives and the built-in blur-in plays for
  // real instead of having already finished off-screen.
  const [started, setStarted] = useState(false);
  // Which way the last step went, so a chapter can be entered at the right edge.
  const directionRef = useRef(1);
  const activeIndexRef = useRef(0);
  activeIndexRef.current = activeIndex;
  const registerGoTo = useCinematicNavRegister();

  // globals.css sets html{scroll-behavior:smooth} for ordinary anchor-link
  // navigation elsewhere on the site. Inside this deck that fights every
  // programmatic scroll the code below does: glideTo() below already runs
  // its own hand-timed easing tween precisely because native smooth scroll
  // can't be cancelled or timed (see its own comment), but without this the
  // ambient CSS default still re-smooths each of its per-frame scrollTo()
  // calls on top of that tween — two animations racing for the same
  // scroll position — and does the same to a plain browser scroll-to-anchor
  // landing here from a hash link (e.g. Header's nav, VibeRail). Forcing the
  // CSS property to "auto" (instant) for as long as this deck is mounted
  // removes the ambient smoothing so this component's own logic is the only
  // thing moving the scroll position; restored on unmount since it's only
  // /content that needs this, not the rest of the site.
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    return () => {
      root.style.scrollBehavior = prev;
    };
  }, []);

  // Gesture stepping. One short flick, swipe or arrow press moves exactly one
  // chapter — the same one-block-per-gesture contract as lib/fullpage.tsx on
  // the homepage, and for the same reason: reading scroll *position* means a
  // visitor has to push a whole viewport of scrolling to change block, and any
  // "settle onto the nearest step" correction afterwards reads as the page
  // fighting back.
  //
  // Native scrolling is suppressed only while the stage actually fills the
  // viewport and the step stays inside the deck. At the first chapter scrolling
  // up, and at the last scrolling down, the event is left alone so the page
  // continues out to the picker above or the footer below.
  useEffect(() => {
    // A visitor with `prefers-reduced-motion` gets plain native scrolling
    // instead — no wheel/touch/keyboard capture, no eased glide. `onScroll`
    // is still registered below regardless, so the chapter runway's real
    // scroll height keeps mapping scroll position to activeIndex and
    // chapters still swap; only the aggressive one-gesture-one-chapter
    // takeover and its resistance to plain scrolling are skipped.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Timestamp until which wheel input is absorbed after a step — fixed
    // once a step decides its duration (glideTo + stepBy/armEntry's own
    // calls, which legitimately need to grow it, see extendLock), then
    // deliberately left alone by every wheel event that follows during
    // that window (see the isLocked branch in onWheel). Earlier attempts
    // at renewing it per absorbed event, meant to outlast a trackpad's
    // momentum tail, went to two different extremes: no cap on the renewal
    // left the deck looking permanently stuck for as long as any wheel
    // activity continued, and a silence-gap heuristic meant to replace
    // that kept mistaking a real new swipe for a continuation of the
    // last one — trackpads rarely go fully quiet between deliberate
    // swipes — and needed several tries to register one step. A plain
    // fixed window, generous enough to cover one flick's momentum tail
    // (STEP_MS + STEP_LOCK_BUFFER_MS below), is simpler and predictable:
    // everything inside it is this step's own settling, and the very next
    // event after it always gets a clean shot at being read as new input.
    let lock = 0;
    let wheelAccum = 0;
    let wheelReset: number | null = null;
    let touchStartY: number | null = null;
    // Set when a gesture is spent scrolling the chapter itself. A gesture that
    // scrolled the chapter must never also step to the next one, even if it
    // reached the bottom on the way: hitting the end of a chapter and moving
    // past it are two separate movements, otherwise the deck appears to jump
    // on its own at the end of a swipe.
    let paneMoved = false;
    let tween = 0;
    const isLocked = () => performance.now() < lock;
    // One timer clears both the accumulated delta and the "this gesture was
    // spent on the chapter" flag, so a new flick starts from a clean slate.
    const armWheelReset = () => {
      if (wheelReset) window.clearTimeout(wheelReset);
      wheelReset = window.setTimeout(() => {
        wheelAccum = 0;
        paneMoved = false;
      }, WHEEL_RESET_MS);
    };
    const extendLock = (ms: number) => {
      lock = Math.max(lock, performance.now() + ms);
    };

    // Is the deck the thing on screen right now?
    const engaged = () => {
      const wrap = wrapRef.current;
      if (!wrap) return false;
      const rect = wrap.getBoundingClientRect();
      return rect.top <= 1 && rect.bottom >= window.innerHeight - 1;
    };

    // Was the deck engaged on the previous check? Initialised from the actual
    // state (not `false`) so a page that loads already scrolled into the deck
    // — a hash link to one of its chapter ids — does not treat its first
    // gesture as a cold entry.
    let wasEngaged = engaged();

    // The gesture that carries the visitor from the ordinary page (Hero,
    // ServicePicker) across the deck's own edge is still travelling — it is
    // not a flick aimed at a chapter, it is the tail of a scroll that started
    // outside the deck entirely. Without this, the moment the deck "switched
    // on" its very first wheel/touch event already had enough delta to count
    // as a step, so chapter 01 (and, entering from below, the last chapter)
    // was skipped before it was ever seen. Crossing in snaps onto whichever
    // chapter the visitor landed on and arms the same settle lock a normal
    // step gets, so the incoming momentum has somewhere to be absorbed.
    // Returns whether it actually had anything to settle. Landing on this
    // page fresh (no incoming scroll momentum to absorb) means the visitor
    // is usually already sitting exactly on chapter 01 the first time a
    // gesture reaches here — glideTo() then has nowhere to go and is a
    // silent no-op, so the whole gesture that was supposed to open the deck
    // produces no visible motion at all and reads as "scrolling doesn't do
    // anything". The caller uses this to tell that case apart from a real
    // settle and let the same gesture also carry the first real step.
    const armEntry = (): boolean => {
      wasEngaged = true;
      // Clamped to at most one chapter away from wherever the deck last
      // knew it was — not indexNow() raw. Trackpads have a browser quirk
      // that makes this necessary: entering the deck flips engaged() to
      // true mid-gesture, but if that gesture's very first wheel event
      // arrived a few pixels earlier (while still outside the deck and
      // legitimately left un-prevented), Chrome commits the *entire*
      // physical gesture — including its momentum — to native scrolling
      // and ignores every preventDefault() after that. By the time this
      // code regains control, native momentum may already have carried
      // scrollY well past chapter 01 into chapter 02 or 03, and indexNow()
      // would happily round to wherever that raw position landed —
      // silently skipping every chapter in between instead of visiting
      // each one. Clamping the landing to one step from the last known
      // chapter keeps that promise regardless of how far the native scroll
      // got to first; onScroll (below) still gently retargets activeIndex
      // afterward if the visitor keeps scrolling past even that.
      const prevIndex = activeIndexRef.current;
      const raw = indexNow();
      // prevIndex === 0 only ever means "never engaged yet" or "sitting on
      // the deck's own opening chapter" — a visitor scrolling up into the
      // deck from below would already carry whatever later chapter it last
      // knew, never 0. So a fresh entry from above landing here is always
      // supposed to open on chapter 0 — it's never a valid target to clamp
      // *past*, the way the general one-step clamp below would otherwise
      // let a strong trackpad flick's overshoot do.
      const current =
        prevIndex === 0 && raw > 0 ? 0 : Math.max(prevIndex - 1, Math.min(prevIndex + 1, raw));
      setActiveIndex(current);
      const settling = glideTo(current);
      if (settling) {
        // Only long enough to absorb this same gesture's trailing momentum,
        // not a full step's worth — a bigger lock here reads as the deck
        // being stuck right where responsiveness matters most, the very
        // first interaction with it.
        extendLock(MOMENTUM_MS);
      }
      return settling;
    };

    const indexNow = () => {
      const wrap = wrapRef.current;
      if (!wrap) return 0;
      const travelled = (window.scrollY - wrap.offsetTop) / window.innerHeight;
      return Math.max(0, Math.min(chapters.length - 1, Math.round(travelled)));
    };

    // Own easing rather than scrollTo({behavior:'smooth'}): the native smooth
    // scroll cannot be cancelled or timed, and its duration varies by distance
    // and browser, so the chapter swap and the film could not be matched to it.
    const glideTo = (index: number): boolean => {
      const wrap = wrapRef.current;
      if (!wrap) return false;
      const from = window.scrollY;
      const to = wrap.offsetTop + index * window.innerHeight;
      if (Math.abs(to - from) < 1) return false;
      // The glide always runs a full STEP_MS regardless of who called it —
      // armEntry only arms a much shorter MOMENTUM_MS lock of its own (see
      // above), which used to expire mid-glide. onScroll would then read the
      // animation's own in-flight scrollTo() calls as a real gesture and
      // recompute activeIndex from wherever the tween happened to be,
      // snapping the chapter header back and forth and fighting the glide —
      // the stutter and repeated re-renders on entering the deck. Locking
      // for the glide's actual duration here, centrally, means every caller
      // is covered no matter how short a lock it arms afterwards (extendLock
      // only ever grows the deadline).
      extendLock(STEP_MS + 60);
      const started = performance.now();
      cancelAnimationFrame(tween);
      const step = () => {
        const p = Math.min(1, (performance.now() - started) / STEP_MS);
        // easeInOutCubic — leaves and arrives without a visible corner
        const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        window.scrollTo(0, from + (to - from) * e);
        if (p < 1) tween = requestAnimationFrame(step);
      };
      tween = requestAnimationFrame(step);
      return true;
    };

    // The active chapter's own scroll box. On a narrow/mobile layout a chapter
    // taller than the screen has to be readable before the deck moves on, so a
    // gesture is spent on the chapter first and only steps once that inner
    // scroll has reached the edge it is heading for — the same contract
    // lib/fullpage.tsx applies to horizontally overflowing slides on the
    // homepage, applied here vertically.
    //
    // On desktop this is switched off entirely: one flick always steps,
    // full stop. It was gated by viewport width once before and un-gated
    // again, on the theory that the real cause of "one flick doesn't step"
    // was a lock bug rather than the inner scroll — that bug is now fixed
    // (see armEntry and the wheel-lock notes above), but a chapter that is
    // even a little taller than the fold in a real browser (different font
    // metrics, a non-100% zoom) still fell into "scroll to the edge, then a
    // *separate* gesture to advance," which reads as the deck getting stuck.
    // Desktop chapters are laid out to fit the screen; this stops the rare
    // few extra px from imposing that two-step dance there.
    const isDesktopLayout = () => window.matchMedia("(min-width: 1024px)").matches;

    const activePane = () =>
      document.querySelector<HTMLElement>('[data-chapter-pane][data-active="true"]');

    /** How much room the active chapter still has in this direction, in px.
     *  Zero on desktop always, and zero on mobile for a chapter that fits
     *  within noise (SCROLLABLE_MIN_OVERFLOW) — either way, that chapter
     *  steps on the first flick with nothing in between. */
    const paneRoom = (dir: number) => {
      if (isDesktopLayout()) return 0;
      const pane = activePane();
      if (!pane) return 0;
      const max = pane.scrollHeight - pane.clientHeight;
      if (max <= SCROLLABLE_MIN_OVERFLOW) return 0; // fits, within noise — nothing to scroll
      return dir > 0 ? max - pane.scrollTop : pane.scrollTop;
    };

    /** Is there a chapter in this direction, or does the page take over?
     *  Based on activeIndexRef, not indexNow() — see stepBy below for why. */
    const canStep = (delta: number) => {
      const next = activeIndexRef.current + delta;
      return next >= 0 && next <= chapters.length - 1;
    };

    const stepBy = (delta: number): boolean => {
      // activeIndexRef, not indexNow(): a step fired while the previous
      // glide is still animating (its own lock ran out early, or this one
      // slipped in past it) would have indexNow() read window.scrollY
      // somewhere *between* two chapters and round to whichever is nearer —
      // already the chapter this step is meant to land on, one step ahead
      // of where the deck actually, conceptually is. Adding delta to that
      // then overshoots by a whole chapter. activeIndexRef always holds the
      // last *committed* target, set synchronously the moment a step or
      // settle decides on it, regardless of whether the tween chasing it
      // has arrived yet — the correct base for "one more from here".
      const current = activeIndexRef.current;
      const next = current + delta;
      if (next < 0 || next > chapters.length - 1) return false; // hand back to the page
      directionRef.current = delta;
      setActiveIndex(next);
      glideTo(next);
      // Just enough to cover the glide animation itself — anything past
      // that (a trackpad's momentum tail, or the visitor simply still
      // scrolling) is now absorbed by the isLocked branch in onWheel
      // renewing this same lock event by event, so it keeps stretching for
      // as long as the gesture keeps producing wheel events instead of
      // needing a guess at how long a tail can run.
      extendLock(STEP_MS + 150);
      return true;
    };

    // A deliberate jump to a specific chapter (a menu link), as opposed to
    // stepBy's "one chapter from here" — registered with CinematicNavProvider
    // so Header can reach a chapter directly instead of a plain `#id` anchor,
    // whose native scroll-jump onScroll above would otherwise clamp to one
    // chapter away from wherever the visitor already was (see that provider's
    // own comment for why).
    const goToId = (id: string): boolean => {
      const index = chapters.findIndex((c) => c.id === id);
      if (index < 0) return false;
      directionRef.current = index > activeIndexRef.current ? 1 : -1;
      setActiveIndex(index);
      glideTo(index);
      extendLock(STEP_MS + 700);
      return true;
    };
    registerGoTo(goToId);

    const onWheel = (e: WheelEvent) => {
      const isEngagedNow = engaged();
      if (!isEngagedNow) {
        wasEngaged = false;
        return;
      }
      if (!wasEngaged) {
        const settling = armEntry();
        e.preventDefault();
        // Nothing to settle onto (the visitor is already sitting exactly on
        // a chapter boundary, the normal case scrolling in cleanly from
        // just above the deck) — fall through and let this same gesture
        // also register as the first real step below, instead of quietly
        // discarding it and leaving the deck looking unresponsive.
        if (settling) return;
      }
      if (isLocked()) {
        // Renewed by WHEEL_LOCK_RENEW_MS on every event absorbed here — see
        // that constant's own comment for why: an ordinary, unhurried scroll
        // keeps this window pushed out for as long as it keeps producing
        // wheel events, so the same continuous gesture can never cascade
        // into a second step, and the lock still lapses promptly (within
        // one renewal window) once the visitor's scroll actually stops.
        e.preventDefault();
        extendLock(WHEEL_LOCK_RENEW_MS);
        return;
      }
      // Spend the gesture on the chapter itself while it still has room.
      const dir = e.deltaY > 0 ? 1 : -1;
      if (paneRoom(dir) > EDGE_EPSILON) {
        e.preventDefault();
        const pane = activePane();
        if (pane) pane.scrollTop += e.deltaY;
        wheelAccum = 0;
        // Marked, not locked. Extending the lock here was a bug: every wheel
        // event pushed the release further out, so while the wheel kept
        // turning the lock never expired and the deck could never step at all.
        // The flag is cleared once the wheel goes quiet (see below), which is
        // what makes "hit the foot of the chapter" and "move on" two gestures.
        paneMoved = true;
        armWheelReset();
        return;
      }

      // A gesture that was spent scrolling the chapter cannot also step.
      if (paneMoved) {
        e.preventDefault();
        armWheelReset();
        return;
      }

      wheelAccum += e.deltaY;
      armWheelReset();
      if (Math.abs(wheelAccum) < WHEEL_THRESHOLD) {
        // Only hold on to the gesture if a chapter is actually waiting in that
        // direction; at the ends of the deck it has to reach the page.
        if (canStep(dir)) e.preventDefault();
        return;
      }
      const stepDir = wheelAccum > 0 ? 1 : -1;
      wheelAccum = 0;
      if (stepBy(stepDir)) {
        e.preventDefault();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? null;
      paneMoved = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      const isEngagedNow = engaged();
      if (!isEngagedNow) {
        wasEngaged = false;
        return;
      }
      if (!wasEngaged) {
        armEntry();
        // Without this, the native drag kept scrolling the page underneath
        // armEntry's own glideTo() at the same time — two things driving
        // scrollY on the same frame — which is what read as a jerk right at
        // the moment the deck took over on a phone. Matches onWheel and
        // onKeyDown, which already prevent default the same way here.
        e.preventDefault();
        // Measure the swipe from here on — distance covered before the deck
        // engaged belonged to the ordinary page, not to this gesture.
        touchStartY = e.touches[0]?.clientY ?? null;
        return;
      }
      const y = e.touches[0]?.clientY ?? 0;
      const dir = (touchStartY ?? y) - y > 0 ? 1 : -1;
      // Let the pane pan itself natively while it has room; only swallow the
      // drag once the chapter is at the edge, so the page cannot run away
      // underneath a half-read chapter.
      if (paneRoom(dir) > EDGE_EPSILON) {
        paneMoved = true;
        return;
      }
      // At the deck's own ends the drag belongs to the page — swallowing it
      // here is what made it impossible to swipe back up to the picker.
      if (!canStep(dir)) return;
      e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY === null || !engaged() || isLocked()) return;
      const dy = touchStartY - (e.changedTouches[0]?.clientY ?? touchStartY);
      touchStartY = null;
      if (Math.abs(dy) < SWIPE_THRESHOLD) return;
      const dir = dy > 0 ? 1 : -1;
      // This gesture belonged to the chapter — it either still has room, or it
      // was used up scrolling to the end. Either way the step needs a fresh
      // swipe.
      if (paneMoved || paneRoom(dir) > EDGE_EPSILON) return;
      stepBy(dir);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const isEngagedNow = engaged();
      if (!isEngagedNow) {
        wasEngaged = false;
        return;
      }
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      // Space is also how a focused button activates itself natively, and this
      // listener runs first: tabbing to a chapter's own button (the Works
      // chapter's "Смотреть", a filter pill) and pressing Space stepped the
      // deck to the next chapter instead of pressing the button, because
      // preventDefault() below landed before the browser's click-on-Space
      // ever fired. Links are included for the same reason even though they
      // activate on Enter — a focused <a> swallowing the page's scroll key
      // would be just as surprising.
      if (e.key === " " && (tag === "BUTTON" || tag === "A" || target?.isContentEditable)) return;
      const down = e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ";
      const up = e.key === "ArrowUp" || e.key === "PageUp";
      if (!down && !up) return;
      const dir = down ? 1 : -1;
      if (!wasEngaged) {
        // A key press has no momentum tail to absorb the way a trackpad
        // flick does, so armEntry's settle-then-wait-for-a-second-press
        // contract (built for that tail — see armEntry's own comment) just
        // reads as "the first press did nothing" here. Ordinary native
        // arrow-key scrolling above the deck advances in ~40px browser
        // increments, so the press that crosses into the deck almost never
        // lands exactly on a chapter boundary and would otherwise spend
        // itself settling that small drift alone. Land on the nearest
        // chapter (same one-step clamp armEntry itself uses, so a stray
        // native scroll still can't skip past more than one) and glide
        // straight on to the intended next chapter in this same press,
        // instead of a separate settle animation followed by a second
        // press's worth of step animation.
        wasEngaged = true;
        const prevIndex = activeIndexRef.current;
        const raw = indexNow();
        const settled = Math.max(prevIndex - 1, Math.min(prevIndex + 1, raw));
        const target = Math.max(0, Math.min(chapters.length - 1, settled + dir));
        e.preventDefault();
        if (target === prevIndex) return; // already at the deck's edge in this direction
        directionRef.current = dir;
        setActiveIndex(target);
        glideTo(target);
        extendLock(STEP_MS + 700);
        return;
      }
      if (isLocked()) return;
      if (paneRoom(dir) > EDGE_EPSILON) {
        e.preventDefault();
        const pane = activePane();
        if (pane) pane.scrollBy({ top: dir * KEY_SCROLL_PX, behavior: "smooth" });
        return;
      }
      if (stepBy(dir)) e.preventDefault();
    };

    // Keeps the deck honest when the page is scrolled by anything that is not
    // our own gesture handling below — a header anchor, a hash on load, the
    // scrollbar, or (the case this is clamped for) a trackpad's native
    // momentum. Chrome commits an entire physical trackpad gesture to native
    // scrolling, ignoring every subsequent preventDefault(), if that
    // gesture's very first wheel event fired a moment before engaged()
    // turned true (still legitimately unprevented, outside the deck) — a
    // long swipe can then carry scrollY straight through an entire extra
    // chapter's worth of native scrolling before onWheel/armEntry ever get a
    // chance to run, and this listener (unlike those, it can't preventDefault
    // — passive) would otherwise just adopt wherever that native scroll
    // ended up, silently skipping the chapter in between. Clamped to one
    // step per update past the initial sync fixes that: a real deep link
    // (hash on load) still lands exactly where it points in that one
    // one-time initial call, but any *ongoing* scroll — gesture or drift —
    // is only ever allowed to advance the deck one chapter at a time,
    // exactly like a normal step.
    let syncedInitialScroll = false;
    const onScroll = () => {
      if (isLocked()) return;
      const next = indexNow();
      if (!syncedInitialScroll) {
        syncedInitialScroll = true;
        setActiveIndex(next);
        return;
      }
      setActiveIndex((prev) => {
        if (prev === next) return prev;
        return Math.max(prev - 1, Math.min(prev + 1, next));
      });
    };

    onScroll();
    if (!reducedMotion) {
      window.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", onTouchEnd);
      window.addEventListener("keydown", onKeyDown);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(tween);
      if (wheelReset) window.clearTimeout(wheelReset);
      if (!reducedMotion) {
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onTouchEnd);
        window.removeEventListener("keydown", onKeyDown);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      registerGoTo(null);
    };
  }, [chapters.length, registerGoTo]);

  // Run the film only while the deck is actually the thing on screen.
  //
  // This used to gate on `wrap.top <= 1` — true only once the deck is fully
  // pinned. Chapter 01's video frame is `sticky top-0` inside `wrap`, so
  // before that point it isn't hidden: it scrolls up from the bottom edge of
  // the viewport like ordinary content, in full view, for a whole screen
  // height of scrolling — just not yet playing. A visitor scrolling down
  // from Hero/ServicePicker into the deck watched a paused poster frame
  // slide up and lock into place, then only *then* start moving — the
  // "фоновое видео не воспроизводится, пока не начинаю видеть блок" bug.
  //
  // Fixed the same way `engaged()` still tests the gesture question below
  // (whether the deck fills the screen), but this test asks a different
  // question — whether any part of the sticky video frame is visible yet —
  // and answers it with a wider, asymmetric threshold instead of `<= 1`:
  //   enters "onScreen" (video starts) the instant any pixel of the frame is
  //   visible (`top < innerHeight`), so playback is already running for
  //   every frame the visitor can actually see, with none of the old dead
  //   time;
  //   leaves "onScreen" (video pauses + rewinds) only once the frame is
  //   fully clear of the viewport again, plus an EXIT_HYSTERESIS margin.
  //   Without that margin, scroll noise right at the `top === innerHeight`
  //   boundary — a trackpad's momentum settling, a mouse wheel's last few
  //   sub-pixel deltas — flips the state back and forth and calls
  //   play()/pause() repeatedly, which is exactly the "дёргания и
  //   спотыкания" this was asked to avoid. The asymmetry (instant enter,
  //   buffered exit) is deliberate: it costs nothing on the way in — the
  //   frame is only just reaching the screen — and only matters on the way
  //   out, where the extra margin is invisible because the frame is already
  //   off-screen by the time it fires.
  //
  // Leaving upwards still rewinds the current phase to its start, so coming
  // back down replays that chapter from the beginning instead of resuming a
  // few frames from its hold — without this the second visit reproduced the
  // original bug exactly.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const EXIT_HYSTERESIS = 120;
    const check = () => {
      const top = wrap.getBoundingClientRect().top;
      setStarted((prev) => {
        const onScreen = prev
          ? top < window.innerHeight + EXIT_HYSTERESIS
          : top < window.innerHeight;
        if (prev === onScreen) return prev;
        if (!onScreen) {
          const video = videoRef.current;
          const phase = phases[activeIndexRef.current];
          if (video && phase) {
            try {
              video.pause();
              video.currentTime = phase.start + SEEK_EPSILON;
            } catch {
              /* metadata not ready — onLoadedMetadata seeks instead */
            }
          }
        }
        return onScreen;
      });
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [phases]);

  // A chapter that scrolls internally is entered at the edge matching the
  // direction of travel: at its top when arriving from the chapter above, at
  // its bottom when coming back up from below. Landing mid-chapter, or always
  // at the top when reversing, both read as the page losing your place.
  useEffect(() => {
    const pane = document.querySelector<HTMLElement>(
      '[data-chapter-pane][data-active="true"]'
    );
    if (!pane) return;
    const max = pane.scrollHeight - pane.clientHeight;
    if (max <= 0) return;
    // Only a chapter that genuinely runs long is entered at its foot when
    // coming back up. For one that merely overshoots the screen by a little,
    // landing at the bottom meant the whole chapter had to be scrolled back
    // through before the deck would step again — which is what made going from
    // chapter 3 back to chapter 2 feel stuck.
    const substantial = max > pane.clientHeight * 0.25;
    pane.scrollTop = directionRef.current > 0 || !substantial ? 0 : max;
  }, [activeIndex]);

  // Play the active chapter's phase, then hold on its closing frame.
  useEffect(() => {
    const video = videoRef.current;
    const phase = phases[activeIndex];
    if (!video || !phase || !started) return;

    // Advancing to the next chapter must NOT seek: the previous phase left the
    // playhead parked exactly on this one's start, and re-seeking there costs a
    // decode and shows as a hitch right where the dissolve should be smooth.
    // So only seek when the playhead is genuinely elsewhere — which in practice
    // means the visitor scrolled back, or jumped chapters via the header.
    const alreadyInPhase =
      video.currentTime >= phase.start - RESUME_TOLERANCE && video.currentTime < phase.end;
    if (!alreadyInPhase) {
      try {
        video.currentTime = phase.start + SEEK_EPSILON;
      } catch {
        /* metadata not ready yet — onLoadedMetadata seeks instead */
      }
    }
    video.play().catch(() => {});

    // Blur into the hold instead of coasting to a stop. Playback stays at
    // full speed right up to the cut — reel's one keyframe per second gives
    // a slow rate nothing to interpolate between, so slowing down read as a
    // stutter rather than a settle. The blur ramps in over the last
    // BLUR_SECONDS instead, and back out over the first BLUR_SECONDS of the
    // next phase, so the same window sells both the stop and the resume.
    //
    // Driven by rAF rather than `timeupdate`, which only fires about four
    // times a second — far too coarse to shape a sub-second ramp.
    const smoothstep = (t: number) => t * t * (3 - 2 * t);
    const reelEnd = phases[phases.length - 1]?.end ?? 0;
    // Prefixed onto every filter string below rather than set once as a CSS
    // class: `style.filter` is rewritten wholesale each frame by the blur
    // ramp, and an inline style always wins over a class rule for the same
    // property, so a class-based brightness would just get clobbered the
    // first time the ramp touches `filter`.
    //
    // A phase may override the stage value (see Phase.brightness). This is
    // read here rather than inside the tick because the effect already
    // re-runs on `activeIndex`, so the prefix is recomputed exactly when the
    // chapter — and therefore the fragment being graded — changes.
    const phaseBrightness = phases[activeIndex]?.brightness ?? brightness;
    const brightnessPrefix = phaseBrightness !== 1 ? `brightness(${phaseBrightness}) ` : "";
    const applyPush = () => {
      const frame = frameRef.current;
      if (!push || reelEnd <= 0 || !frame) return;
      const travelled = Math.min(1, Math.max(0, video.currentTime / reelEnd));
      frame.style.transform = `scale(${(PUSH_BASE + PUSH_RANGE * travelled).toFixed(4)})`;
    };
    let raf = 0;
    const tick = () => {
      const frame = frameRef.current;
      const remaining = phase.end - video.currentTime;
      applyPush();
      // A phase whose `end` sits at or past the file's actual duration (a
      // last chapter cut right up to the reel's own final frame) can hit the
      // <video>'s native end — currentTime pinned at duration, paused true —
      // before `remaining` ever counts down to 0 itself. Treated as an
      // ordinary unexpected pause below, the self-heal call would then
      // re-`play()` an already-ended element, which some browsers (Chrome
      // included) answer by restarting it from 0 rather than leaving it put
      // — the reel visibly looping back to its opening frame instead of
      // holding on its last one. `video.ended` catches that case here, ahead
      // of the self-heal branch, and holds exactly like a normal phase end.
      if (remaining <= HOLD_BACK_SECONDS || video.ended) {
        if (!video.paused) video.pause();
        if (frame) frame.style.filter = `${brightnessPrefix}blur(${maxBlurPx}px)`;
        return;
      }
      // Self-heal an unexpected pause. play() is fire-and-forget above, and
      // an overlapping play()/seek right at mount (StrictMode's double
      // effect invocation, or the browser throttling a video that's still
      // scrolled out of view) can leave it paused with nothing left to
      // resume it — the effect that called play() only reruns on the next
      // chapter change. Checking every frame here means any such stall
      // corrects itself well before the visitor scrolls to see it.
      if (video.paused) video.play().catch(() => {});

      const elapsed = video.currentTime - phase.start;
      const revealT = Math.min(1, Math.max(0, elapsed / blurSeconds));
      // Measured against the hold point (HOLD_BACK_SECONDS short of the cut),
      // not the cut itself, so the ramp arrives at exactly maxBlurPx on the
      // frame the film actually stops on. Against `remaining` alone it was
      // still a few percent shy there and the hold's own hard assignment
      // closed the gap in one step.
      const settleT = Math.min(1, Math.max(0, (remaining - HOLD_BACK_SECONDS) / blurSeconds));
      const blurIn = (1 - smoothstep(revealT)) * maxBlurPx;
      const blurOut = (1 - smoothstep(settleT)) * maxBlurPx;
      const blur = Math.max(blurIn, blurOut);
      if (frame) {
        frame.style.filter = blur > 0.4 ? `${brightnessPrefix}blur(${blur.toFixed(1)}px)` : brightnessPrefix.trim();
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [activeIndex, phases, started, maxBlurPx, blurSeconds, push, brightness]);

  const api = useMemo<StageApi>(() => ({ activeIndex, staged: true, started }), [activeIndex, started]);

  return (
    <StageContext.Provider value={api}>
      <div ref={wrapRef} className="relative">
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
          <div ref={frameRef} className="absolute inset-0 h-full w-full">
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              onLoadedMetadata={() => {
                const video = videoRef.current;
                const phase = phases[activeIndexRef.current];
                if (video && phase) video.currentTime = phase.start + SEEK_EPSILON;
              }}
              className="h-full w-full object-cover"
            />
          </div>
          {/* Two-part grade. A flat wash across the whole frame drops the
              footage back a stop so the chapters read as the foreground, and a
              second gradient adds weight at the top and bottom edges, where the
              header and the copy actually sit. Kept as a wash rather than a
              heavier blur so the picture is still legibly a picture. */}
          <div className="pointer-events-none absolute inset-0 bg-ink/45" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(11,11,16,0.72) 0%, rgba(11,11,16,0.16) 26%, rgba(11,11,16,0.2) 54%, rgba(11,11,16,0.85) 100%)",
            }}
          />
          {rail}

          {children}

          {/* Nudge on every chapter but the last: without it, a visitor's
              scroll gesture is silently absorbed by the deck (see
              onWheel/onTouchMove above) instead of moving the page the way
              scrolling normally does, which reads as the site having frozen
              — that risk exists at each chapter, not only on arrival.
              The final chapter is the exception. Its closing chapter is the
              one that ends on a full-width CTA line sitting at the very
              bottom of the pane (Close's "Начать проект сейчас"), and the
              hint is centred at bottom-6 of the same stage: on /ai the two
              overlap by ~20px, drawing the mono caption and its chevron
              straight through the CTA. The nudge also has the least to say
              there — past the last chapter "further" is just the ordinary
              page below, which scrolls normally anyway. */}
          {activeIndex < chapters.length - 1 && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-6 flex items-center justify-center gap-2 text-paper/60 sm:bottom-9"
            aria-hidden="true"
          >
            {/* The "Листайте дальше" caption is gone — three chevrons in a
                row say the same thing without a line of type competing with
                the chapter's own copy. The delays are what make the dip
                travel left-to-right along the row instead of all three
                moving together; the step (0.16s) is a little under a fifth
                of the 1.9s cycle, so the wave has passed all three well
                before the next one starts. */}
            {[0, 0.16, 0.32].map((delay) => (
              <svg
                key={delay}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="scroll-hint-chevron"
                style={{ animationDelay: `${delay}s` }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            ))}
          </div>
          )}
        </div>

        {/* Runway: one viewport-height step per chapter, pulled up behind the
            pinned deck so it contributes scroll distance without contributing
            layout. The ids are here (not on the chapters) because a header link
            has to land on a scroll position, and the chapters themselves never
            move. */}
        <div className="-mt-[100svh]" aria-hidden="true">
          {chapters.map((chapter) => (
            <div key={chapter.id} id={chapter.id} className="h-[100svh]" />
          ))}
        </div>
      </div>
    </StageContext.Provider>
  );
}

export function useStageActive(index: number) {
  return useContext(StageContext).activeIndex === index;
}

// Whether the deck has actually scrolled into view yet (see `started`
// above) — chapter 0 is "active" by the default activeIndex state from the
// very first render, before the visitor has scrolled anywhere near it (Hero
// and ServicePicker sit above it). A component gating an autoplaying embed
// on "is my chapter active" alone would mount it immediately on page load
// for that reason; combining with this catches the same real-viewport
// intent `started` already gates the reel's own playback on.
export function useStageStarted() {
  return useContext(StageContext).started;
}

// True only inside a real CinematicStage. A chapter component built for the
// deck (Trust, Offer, Process, Close — see CinematicSection) is sometimes
// reused directly on a plain-scroll page instead, with no CinematicStage
// ancestor; there `useStageActive` would silently and permanently return
// false (matched against the context's *default* value, not a real deck
// position), leaving the whole section stuck in its off-stage transform —
// invisible, `aria-hidden`, and still occupying `position: absolute` layout
// space that overflows the page. CinematicSection checks this to fall back
// to always-visible, normal-flow rendering outside a stage.
export function useIsStaged() {
  return useContext(StageContext).staged;
}
