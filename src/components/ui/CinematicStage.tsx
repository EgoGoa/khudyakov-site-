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

export type Phase = { start: number; end: number };
export type ChapterMeta = { id: string };

type StageApi = { activeIndex: number };

const StageContext = createContext<StageApi>({ activeIndex: 0 });

// Seeking is only accurate to the nearest keyframe; the reel carries one per
// second (-g 25), so land slightly inside the phase rather than exactly on its
// boundary, where the previous scene's last frame can still surface.
const SEEK_EPSILON = 0.04;

// How far behind a phase's start the playhead may sit and still count as
// "already here" — covers the frame or two of overshoot left by pausing on the
// previous phase's boundary.
const RESUME_TOLERANCE = 0.5;

// Gesture stepping. Thresholds are deliberately low: the ask is that one short
// movement is enough, so a flick registers well before a full page of scrolling
// has been spent. MOMENTUM_MS is what a trackpad's decaying tail is absorbed
// for, so one physical flick cannot cascade through several chapters.
const WHEEL_THRESHOLD = 12; // px of accumulated deltaY that counts as a flick
const WHEEL_RESET_MS = 120; // trackpads fire many tiny events — coalesce them
const SWIPE_THRESHOLD = 36; // px of touch travel that counts as a swipe
const MOMENTUM_MS = 320;
const STEP_MS = 620; // the glide from one chapter to the next
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
// transition instead. BLUR_SECONDS is the window, at both ends of a phase,
// over which it ramps; MAX_BLUR_PX is how far it gets.
const BLUR_SECONDS = 0.7;
const MAX_BLUR_PX = 16;

export default function CinematicStage({
  src,
  poster,
  phases,
  chapters,
  children,
}: {
  src: string;
  poster: string;
  phases: Phase[];
  chapters: ChapterMeta[];
  children: ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
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
    let lock = 0; // timestamp until which further gestures are absorbed
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
    const armEntry = () => {
      wasEngaged = true;
      const current = indexNow();
      setActiveIndex(current);
      glideTo(current);
      // Only long enough to absorb this same gesture's trailing momentum, not
      // a full step's worth — a bigger lock here reads as the deck being
      // stuck right where responsiveness matters most, the very first
      // interaction with it.
      extendLock(MOMENTUM_MS);
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
    const glideTo = (index: number) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const from = window.scrollY;
      const to = wrap.offsetTop + index * window.innerHeight;
      if (Math.abs(to - from) < 1) return;
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

    /** Is there a chapter in this direction, or does the page take over? */
    const canStep = (delta: number) => {
      const next = indexNow() + delta;
      return next >= 0 && next <= chapters.length - 1;
    };

    const stepBy = (delta: number): boolean => {
      const current = indexNow();
      const next = current + delta;
      if (next < 0 || next > chapters.length - 1) return false; // hand back to the page
      directionRef.current = delta;
      setActiveIndex(next);
      glideTo(next);
      extendLock(STEP_MS + 120);
      return true;
    };

    const onWheel = (e: WheelEvent) => {
      const isEngagedNow = engaged();
      if (!isEngagedNow) {
        wasEngaged = false;
        return;
      }
      if (!wasEngaged) {
        armEntry();
        e.preventDefault();
        return;
      }
      if (isLocked()) {
        // Trackpads keep emitting decaying events after the fingers lift;
        // absorbing them here is what stops one flick cascading through
        // several chapters.
        e.preventDefault();
        extendLock(MOMENTUM_MS);
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
        extendLock(MOMENTUM_MS);
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
      if (!wasEngaged) {
        armEntry();
        e.preventDefault();
        return;
      }
      if (isLocked()) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const down = e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ";
      const up = e.key === "ArrowUp" || e.key === "PageUp";
      if (!down && !up) return;
      const dir = down ? 1 : -1;
      if (paneRoom(dir) > EDGE_EPSILON) {
        e.preventDefault();
        const pane = activePane();
        if (pane) pane.scrollBy({ top: dir * KEY_SCROLL_PX, behavior: "smooth" });
        return;
      }
      if (stepBy(dir)) e.preventDefault();
    };

    // Keeps the deck honest when the page is scrolled by anything that is not
    // a gesture — a header anchor, a hash on load, the scrollbar.
    const onScroll = () => {
      if (isLocked()) return;
      const next = indexNow();
      setActiveIndex((prev) => (prev === next ? prev : next));
    };

    onScroll();
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(tween);
      if (wheelReset) window.clearTimeout(wheelReset);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [chapters.length]);

  // Flip on once the deck first enters the viewport — before that, the reel
  // has no visible audience yet and should stay parked at its start.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0 }
    );
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

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
    let raf = 0;
    const tick = () => {
      const remaining = phase.end - video.currentTime;
      if (remaining <= 0) {
        if (!video.paused) video.pause();
        video.style.filter = `blur(${MAX_BLUR_PX}px)`;
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
      const revealT = Math.min(1, Math.max(0, elapsed / BLUR_SECONDS));
      const settleT = Math.min(1, Math.max(0, remaining / BLUR_SECONDS));
      const blurIn = (1 - smoothstep(revealT)) * MAX_BLUR_PX;
      const blurOut = (1 - smoothstep(settleT)) * MAX_BLUR_PX;
      const blur = Math.max(blurIn, blurOut);
      video.style.filter = blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : "";

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [activeIndex, phases, started]);

  const api = useMemo<StageApi>(() => ({ activeIndex }), [activeIndex]);

  return (
    <StageContext.Provider value={api}>
      <div ref={wrapRef} className="relative">
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
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
            className="absolute inset-0 h-full w-full object-cover"
          />
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
          {children}
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
