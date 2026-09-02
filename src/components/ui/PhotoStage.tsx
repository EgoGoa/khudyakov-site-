"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useCinematicNavRegister } from "@/lib/cinematic-nav";
import { StageContext, type ChapterMeta } from "@/components/ui/CinematicStage";

export type { ChapterMeta };

// A pinned chapter deck with a static-photo background instead of a
// scroll-scrubbed video reel — for a service page that doesn't have its own
// edited reel yet (see /ai). Deliberately a fork of CinematicStage rather
// than a shared abstraction: that component's gesture engine (wheel/touch/
// keyboard stepping, momentum locking, entry-from-outside handling) is ~500
// lines of hand-tuned fixes for specific real bugs, each documented in place
// there. Extracting a shared engine risked regressing /content's already-
// shipped behaviour for the sake of DRY; forking costs some duplication but
// keeps the two decks provably independent. Everything below the "gesture
// stepping" mark is copied from CinematicStage verbatim except where noted.
//
// The two share a single StageContext (exported from CinematicStage), so
// CinematicSection and its useStageActive/useIsStaged hooks work identically
// under either stage without any changes of their own — a Context is just an
// object identity, not tied to the component that provides it.
//
// Swapping the photo for a video later (once /ai has its own reel) means
// replacing this component with CinematicStage in the page file — the
// chapter markup underneath (CinematicSection children) doesn't change.

const WHEEL_THRESHOLD = 12;
const WHEEL_RESET_MS = 120;
const SWIPE_THRESHOLD = 36;
const MOMENTUM_MS = 220;
const STEP_MS = 420;
const EDGE_EPSILON = 2;
const SCROLLABLE_MIN_OVERFLOW = 48;
const KEY_SCROLL_PX = 320;

export default function PhotoStage({
  photo,
  chapters,
  children,
}: {
  /** Static background image behind the whole deck (object-fit: cover). */
  photo: string;
  chapters: ChapterMeta[];
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const directionRef = useRef(1);
  const activeIndexRef = useRef(0);
  activeIndexRef.current = activeIndex;
  const registerGoTo = useCinematicNavRegister();

  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    return () => {
      root.style.scrollBehavior = prev;
    };
  }, []);

  // ---- Gesture stepping (verbatim from CinematicStage) ----
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lock = 0;
    let wheelAccum = 0;
    let wheelReset: number | null = null;
    let touchStartY: number | null = null;
    let paneMoved = false;
    let tween = 0;
    const isLocked = () => performance.now() < lock;
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

    const engaged = () => {
      const wrap = wrapRef.current;
      if (!wrap) return false;
      const rect = wrap.getBoundingClientRect();
      return rect.top <= 1 && rect.bottom >= window.innerHeight - 1;
    };

    let wasEngaged = engaged();

    const armEntry = (): boolean => {
      wasEngaged = true;
      const prevIndex = activeIndexRef.current;
      const raw = indexNow();
      const current =
        prevIndex === 0 && raw > 0 ? 0 : Math.max(prevIndex - 1, Math.min(prevIndex + 1, raw));
      setActiveIndex(current);
      const settling = glideTo(current);
      if (settling) {
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

    const glideTo = (index: number): boolean => {
      const wrap = wrapRef.current;
      if (!wrap) return false;
      const from = window.scrollY;
      const to = wrap.offsetTop + index * window.innerHeight;
      if (Math.abs(to - from) < 1) return false;
      extendLock(STEP_MS + 60);
      const started = performance.now();
      cancelAnimationFrame(tween);
      const step = () => {
        const p = Math.min(1, (performance.now() - started) / STEP_MS);
        const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        window.scrollTo(0, from + (to - from) * e);
        if (p < 1) tween = requestAnimationFrame(step);
      };
      tween = requestAnimationFrame(step);
      return true;
    };

    const isDesktopLayout = () => window.matchMedia("(min-width: 1024px)").matches;

    const activePane = () =>
      document.querySelector<HTMLElement>('[data-chapter-pane][data-active="true"]');

    const paneRoom = (dir: number) => {
      if (isDesktopLayout()) return 0;
      const pane = activePane();
      if (!pane) return 0;
      const max = pane.scrollHeight - pane.clientHeight;
      if (max <= SCROLLABLE_MIN_OVERFLOW) return 0;
      return dir > 0 ? max - pane.scrollTop : pane.scrollTop;
    };

    const canStep = (delta: number) => {
      const next = activeIndexRef.current + delta;
      return next >= 0 && next <= chapters.length - 1;
    };

    const stepBy = (delta: number): boolean => {
      const current = activeIndexRef.current;
      const next = current + delta;
      if (next < 0 || next > chapters.length - 1) return false;
      directionRef.current = delta;
      setActiveIndex(next);
      glideTo(next);
      extendLock(STEP_MS + 700);
      return true;
    };

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
        if (settling) return;
      }
      if (isLocked()) {
        e.preventDefault();
        return;
      }
      const dir = e.deltaY > 0 ? 1 : -1;
      if (paneRoom(dir) > EDGE_EPSILON) {
        e.preventDefault();
        const pane = activePane();
        if (pane) pane.scrollTop += e.deltaY;
        wheelAccum = 0;
        paneMoved = true;
        armWheelReset();
        return;
      }

      if (paneMoved) {
        e.preventDefault();
        armWheelReset();
        return;
      }

      wheelAccum += e.deltaY;
      armWheelReset();
      if (Math.abs(wheelAccum) < WHEEL_THRESHOLD) {
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
        e.preventDefault();
        touchStartY = e.touches[0]?.clientY ?? null;
        return;
      }
      const y = e.touches[0]?.clientY ?? 0;
      const dir = (touchStartY ?? y) - y > 0 ? 1 : -1;
      if (paneRoom(dir) > EDGE_EPSILON) {
        paneMoved = true;
        return;
      }
      if (!canStep(dir)) return;
      e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY === null || !engaged() || isLocked()) return;
      const dy = touchStartY - (e.changedTouches[0]?.clientY ?? touchStartY);
      touchStartY = null;
      if (Math.abs(dy) < SWIPE_THRESHOLD) return;
      const dir = dy > 0 ? 1 : -1;
      if (paneMoved || paneRoom(dir) > EDGE_EPSILON) return;
      stepBy(dir);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const isEngagedNow = engaged();
      if (!isEngagedNow) {
        wasEngaged = false;
        return;
      }
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const down = e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ";
      const up = e.key === "ArrowUp" || e.key === "PageUp";
      if (!down && !up) return;
      const dir = down ? 1 : -1;
      if (!wasEngaged) {
        wasEngaged = true;
        const prevIndex = activeIndexRef.current;
        const raw = indexNow();
        const settled = Math.max(prevIndex - 1, Math.min(prevIndex + 1, raw));
        const target = Math.max(0, Math.min(chapters.length - 1, settled + dir));
        e.preventDefault();
        if (target === prevIndex) return;
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
  }, [chapters, registerGoTo]);

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

  useEffect(() => {
    const pane = document.querySelector<HTMLElement>(
      '[data-chapter-pane][data-active="true"]'
    );
    if (!pane) return;
    const max = pane.scrollHeight - pane.clientHeight;
    if (max <= 0) return;
    const substantial = max > pane.clientHeight * 0.25;
    pane.scrollTop = directionRef.current > 0 || !substantial ? 0 : max;
  }, [activeIndex]);
  // ---- end verbatim gesture stepping ----

  const api = useMemo(() => ({ activeIndex, staged: true, started }), [activeIndex, started]);

  return (
    <StageContext.Provider value={api}>
      <div ref={wrapRef} className="relative">
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
          {/* Static stand-in for the video reel other stages scrub. A slow
              Ken Burns drift (globals.css .photo-stage-bg) gives it some life
              without pretending to be footage; disabled under
              prefers-reduced-motion via the same rule. */}
          <div
            className="photo-stage-bg absolute inset-0 h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${photo})` }}
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute inset-0 bg-ink/45" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(11,11,16,0.72) 0%, rgba(11,11,16,0.16) 26%, rgba(11,11,16,0.2) 54%, rgba(11,11,16,0.85) 100%)",
            }}
          />
          {children}

          {/* Same three-chevron hint as CinematicStage — kept identical on
              purpose so the two stages don't drift into two different
              "scroll on" cues. See that file for the timing. */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-6 flex items-center justify-center gap-2 text-paper/60 sm:bottom-9"
            aria-hidden="true"
          >
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
        </div>

        <div className="-mt-[100svh]" aria-hidden="true">
          {chapters.map((chapter) => (
            <div key={chapter.id} id={chapter.id} className="h-[100svh]" />
          ))}
        </div>
      </div>
    </StageContext.Provider>
  );
}
