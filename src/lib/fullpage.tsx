"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

// One-block-per-gesture fullpage scroll, shared between Header (nav / active
// state) and FullpageScroll (the visual track) via a single provider mounted
// once in the root layout. The provider only starts intercepting wheel/
// touch/keyboard input once a FullpageScroll instance has registered slide
// ids — on every other route `ids` stays empty and the page scrolls exactly
// as a normal document, untouched.
//
// Block-width rule: a slide is never compressed or clipped horizontally. If
// its content is naturally wider than the viewport (currently: the Works
// portfolio strip's own overflow-x-auto row — nothing here is hard-coded to
// that, any slide with a horizontally-scrollable descendant qualifies
// automatically), vertical navigation past that slide locks until the
// visitor has scrolled it horizontally to the matching edge. This is
// implemented in JS rather than native `scroll-snap-type` because mandatory
// CSS snap does not guarantee landing on the *adjacent* snap point on a fast
// flick — the single-step-per-gesture requirement below needs that
// guarantee, so a real browser scroll container was not used here.
const TRANSITION_MS = 600;
const TRANSITION_EASE = "ease-in-out";
const WHEEL_THRESHOLD = 10; // px of accumulated deltaY that counts as "an intentional tick"
const WHEEL_RESET_MS = 120; // trackpads fire many tiny wheel events per gesture — coalesce them
const SWIPE_THRESHOLD = 40; // px of touch movement that counts as a swipe
const EDGE_EPSILON = 1; // px tolerance for "fully scrolled" comparisons
// Trackpads keep emitting small, decaying wheel events for a while after the
// finger actually lifts (inertial/momentum scrolling). Treating every one of
// those as a fresh "advance one more block" request cascades through several
// slides from a single physical swipe. Instead, a lock started by a
// transition is *extended* by every wheel event that arrives while it's
// still active, and only actually releases once the stream goes quiet for
// WHEEL_SETTLE_MS — i.e. once the momentum has fully died down.
const WHEEL_SETTLE_MS = 260;

type FullpageApi = {
  ids: string[];
  activeIndex: number;
  activeId: string;
  ready: boolean;
  goTo: (id: string) => void;
  goToIndex: (index: number) => void;
};

type InternalApi = FullpageApi & {
  registerIds: (ids: string[]) => void;
};

const FullpageContext = createContext<InternalApi | null>(null);

/** The active slide's own horizontally-overflowing element, if it has one —
 * its own root if the slide itself overflows, otherwise the first
 * descendant that does (e.g. a portfolio strip nested a few levels down).
 * Nothing about this depends on which section it is; it is pure DOM
 * measurement, so no section component needs to know this system exists. */
function findHScrollTarget(slideEl: Element | null): HTMLElement | null {
  if (!slideEl) return null;
  if (slideEl.scrollWidth > slideEl.clientWidth + EDGE_EPSILON) {
    return slideEl as HTMLElement;
  }
  const all = slideEl.querySelectorAll<HTMLElement>("*");
  for (const el of all) {
    if (el.scrollWidth > el.clientWidth + EDGE_EPSILON) {
      const overflowX = getComputedStyle(el).overflowX;
      if (overflowX === "auto" || overflowX === "scroll") return el;
    }
  }
  return null;
}

export function FullpageProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Locked *until* this timestamp (ms, Date.now()-scale) rather than a plain
  // boolean — that makes "extend the lock" a trivial max() instead of
  // juggling multiple competing setTimeout handles.
  const lockedUntilRef = useRef(0);
  const isLocked = useCallback(() => Date.now() < lockedUntilRef.current, []);
  const extendLock = useCallback((ms: number) => {
    lockedUntilRef.current = Math.max(lockedUntilRef.current, Date.now() + ms);
  }, []);
  const wheelAccum = useRef(0);
  const wheelResetTimer = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const activeIndexRef = useRef(0);
  const idsRef = useRef<string[]>([]);
  const lastDirectionRef = useRef<1 | -1>(1);
  const hscrollCache = useRef<Map<number, HTMLElement | null>>(new Map());
  activeIndexRef.current = activeIndex;
  idsRef.current = ids;

  const getHScroll = useCallback((index: number) => {
    if (hscrollCache.current.has(index)) return hscrollCache.current.get(index) ?? null;
    const slideEl = document.querySelector(`[data-slide-index="${index}"]`);
    const target = findHScrollTarget(slideEl);
    if (target) target.style.touchAction = "pan-x"; // let touch pan it horizontally, never vertically
    hscrollCache.current.set(index, target);
    return target;
  }, []);

  const goToIndex = useCallback(
    (index: number) => {
      const count = idsRef.current.length;
      if (count === 0 || isLocked()) return;
      const clamped = Math.max(0, Math.min(count - 1, index));
      if (clamped === activeIndexRef.current) return;
      lastDirectionRef.current = clamped > activeIndexRef.current ? 1 : -1;
      extendLock(TRANSITION_MS + 60);
      setActiveIndex(clamped);
    },
    [isLocked, extendLock]
  );

  const goTo = useCallback(
    (id: string) => {
      const i = idsRef.current.indexOf(id);
      if (i >= 0) goToIndex(i);
    },
    [goToIndex]
  );

  const registerIds = useCallback((next: string[]) => {
    hscrollCache.current.clear();
    setIds(next);
    setActiveIndex((i) => (next.length === 0 ? 0 : Math.min(i, next.length - 1)));
  }, []);

  // Whenever the active slide changes, a horizontally-overflowing slide is
  // landed at the edge matching the direction of travel: its left edge when
  // arriving from an earlier slide, its right edge when arriving from a
  // later one — so scrolling back "up" into it always re-enters at the far
  // side you'd have exited from, and it has to be scrolled back through.
  useEffect(() => {
    const target = getHScroll(activeIndexRef.current);
    if (!target) return;
    target.scrollLeft = lastDirectionRef.current === 1 ? 0 : target.scrollWidth;
  }, [activeIndex, getHScroll]);

  useEffect(() => {
    if (ids.length === 0) return; // not on a fullpage route — leave native scroll alone

    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const i = ids.indexOf(hash);
      if (i > 0) setActiveIndex(i);
    }

    const onWheel = (e: WheelEvent) => {
      const hscroll = getHScroll(activeIndexRef.current);
      if (hscroll) {
        const goingForward = e.deltaY > 0;
        const atRightEdge = hscroll.scrollLeft + hscroll.clientWidth >= hscroll.scrollWidth - EDGE_EPSILON;
        const atLeftEdge = hscroll.scrollLeft <= EDGE_EPSILON;
        if (goingForward && !atRightEdge) {
          e.preventDefault();
          hscroll.scrollLeft += e.deltaY;
          return;
        }
        if (!goingForward && !atLeftEdge) {
          e.preventDefault();
          hscroll.scrollLeft += e.deltaY;
          return;
        }
        // at the edge matching this gesture's direction — fall through and
        // let it advance/retreat to the next slide like any other
      }

      e.preventDefault();
      if (isLocked()) {
        // still inside a transition, or trailing momentum from the gesture
        // that started it — absorb it and push the release further out,
        // rather than letting it count as a fresh "advance" request
        extendLock(WHEEL_SETTLE_MS);
        return;
      }
      wheelAccum.current += e.deltaY;
      if (wheelResetTimer.current) window.clearTimeout(wheelResetTimer.current);
      wheelResetTimer.current = window.setTimeout(() => {
        wheelAccum.current = 0;
      }, WHEEL_RESET_MS);
      if (Math.abs(wheelAccum.current) < WHEEL_THRESHOLD) return;
      const dir = wheelAccum.current > 0 ? 1 : -1;
      wheelAccum.current = 0;
      goToIndex(activeIndexRef.current + dir);
      extendLock(WHEEL_SETTLE_MS);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        goToIndex(activeIndexRef.current + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goToIndex(activeIndexRef.current - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goToIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goToIndex(idsRef.current.length - 1);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      // an overflowing slide gets native horizontal panning (touch-action:
      // pan-x, set when it was discovered) — only non-overflowing slides
      // need the page's own vertical drag suppressed here
      if (getHScroll(activeIndexRef.current)) return;
      e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null || isLocked()) return;
      const endY = e.changedTouches[0]?.clientY ?? touchStartY.current;
      const dy = touchStartY.current - endY;
      touchStartY.current = null;
      if (Math.abs(dy) < SWIPE_THRESHOLD) return;
      const goingForward = dy > 0;

      const hscroll = getHScroll(activeIndexRef.current);
      if (hscroll) {
        const atRightEdge = hscroll.scrollLeft + hscroll.clientWidth >= hscroll.scrollWidth - EDGE_EPSILON;
        const atLeftEdge = hscroll.scrollLeft <= EDGE_EPSILON;
        if (goingForward && !atRightEdge) return;
        if (!goingForward && !atLeftEdge) return;
      }

      goToIndex(activeIndexRef.current + (goingForward ? 1 : -1));
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [ids, goToIndex, getHScroll]);

  const api = useMemo<InternalApi>(
    () => ({
      ids,
      activeIndex,
      activeId: ids[activeIndex] ?? "",
      ready: ids.length > 0,
      goTo,
      goToIndex,
      registerIds,
    }),
    [ids, activeIndex, goTo, goToIndex, registerIds]
  );

  return <FullpageContext.Provider value={api}>{children}</FullpageContext.Provider>;
}

/** Read-only access to fullpage state (Header, SectionReveal, FloatingCta). */
export function useFullpage(): FullpageApi | null {
  return useContext(FullpageContext);
}

/** Only for FullpageScroll itself — registers/unregisters the slide id list. */
export function useFullpageRegister(): (ids: string[]) => void {
  const ctx = useContext(FullpageContext);
  if (!ctx) {
    throw new Error("useFullpageRegister must be used within FullpageProvider");
  }
  return ctx.registerIds;
}

export const FULLPAGE_TRANSITION_MS = TRANSITION_MS;
export const FULLPAGE_TRANSITION_EASE = TRANSITION_EASE;
