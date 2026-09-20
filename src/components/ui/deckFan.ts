"use client";

import { useCallback, useRef, useState } from "react";

// Drag-to-scrub for the service carousels (AiDeck, SitesDeck, SmmDeck).
//
// Egor's ask: hold a card — finger or cursor — and the whole fan follows the
// hand while the hold lasts, so he is steering the deck rather than pressing
// a button and waiting for an animation. Let go and the nearest card settles
// into the centre; flick hard and the deck carries several cards on before
// coming to rest.
//
// The position is therefore not the integer `active` alone any more: while a
// drag is live, every card sits at `its offset + drag`, a FRACTIONAL
// distance from centre, and `poseAt` below interpolates the fan's poses
// between whole steps. Nothing about the resting look changes — at drag 0
// the interpolation returns exactly the hand-authored poses.

// Signed distance wrapped into (-count/2, count/2], so a card that would sit
// past the far edge of the fan is counted as arriving at the near one
// instead. That keeps the ring seamless while a drag runs: dragging right by
// one card would otherwise leave a hole where the rightmost card used to be.
export function wrapOffset(offset: number, count: number) {
  const half = count / 2;
  let o = offset;
  while (o > half) o -= count;
  while (o <= -half) o += count;
  return o;
}

// The pose for a fractional distance from centre, lerped between the two
// whole poses either side of it. `fade` is a separate multiplier that takes
// a card to fully transparent by |2.5| — the exact distance at which
// wrapOffset teleports it to the other end of a five-card ring, so the jump
// always happens on an invisible card.
export function poseAt<T extends Record<string, number>>(
  table: Record<number, T>,
  offset: number,
): T & { fade: number } {
  const clamped = Math.max(-3, Math.min(3, offset));
  const lo = Math.floor(clamped);
  const hi = Math.ceil(clamped);
  const t = clamped - lo;
  const a = table[lo] ?? table[lo < 0 ? -3 : 3];
  const b = table[hi] ?? table[hi < 0 ? -3 : 3];
  const out = {} as Record<string, number>;
  for (const key of Object.keys(a)) out[key] = a[key] + (b[key] - a[key]) * t;
  // Long, gentle ramp rather than a cliff: a card leaving the fan dims out
  // across most of a whole step instead of switching off at the edge, which
  // is what Egor saw as "самые дальние окошки резко вырубаются".
  // Fade across a whole step, from |2| out to |3|: a card leaving the fan
  // dims the entire way rather than dropping out near the edge.
  out.fade = Math.max(0, Math.min(1, (3 - Math.abs(offset)) / 1));
  return out as T & { fade: number };
}


// Depth blur by whole steps from the centre: the chosen card is sharp, its
// neighbours are softened a little, the outermost pair more still. Egor's
// ask, and the reason it is QUANTISED rather than interpolated like every
// other pose value: a blur radius that changes on every frame forces the
// browser to re-rasterise the card each frame, which is exactly what made
// paging stutter before. Rounded to whole steps it changes a handful of
// times per gesture instead, and `.deck-pose` eases each change over 420ms
// so the step is never visible.
const BLUR_STEPS = [0, 0.9, 1.9, 2.6];

export function blurAt(offset: number) {
  return BLUR_STEPS[Math.min(BLUR_STEPS.length - 1, Math.round(Math.abs(offset)))];
}

// Positive modulo — `active` is kept unbounded (see fanSlots), so the index
// of the card actually chosen has to be folded back into 0..count-1.
export function modIndex(active: number, count: number) {
  return ((active % count) + count) % count;
}

/** How far from the centre a card is still drawn, in cards. */
export const REACH = 3;

// Which cards to draw, and where.
//
// The naive version — wrap each card's distance into (-count/2, count/2] —
// has one card teleport from one end of the fan to the other on every step,
// because that is literally what wrapping does. It vanished at one edge and
// reappeared at the other, which is the hard cut Egor flagged.
//
// So the ring is built the other way round: `active` counts up and down
// without ever wrapping, distances are continuous, and a card is drawn once
// for EVERY multiple of the ring that lands within reach. Near the edges
// that means a card is on screen twice — once fading out past +3 and once
// fading in before -3 — and stepping simply hands the fan over from one copy
// to the other. Nothing jumps, because nothing has to.
//
// `key` is that copy's identity (`card:ring`), stable for as long as it
// stays on screen, so React keeps the same element and its transition runs.
export function fanSlots(count: number, active: number, drag: number, reach = REACH) {
  const slots: { i: number; key: string; offset: number; settled: number }[] = [];
  for (let i = 0; i < count; i += 1) {
    const rel = i - active;
    const near = Math.round(-rel / count);
    for (let k = near - 1; k <= near + 1; k += 1) {
      const settled = rel + k * count;
      const offset = settled + drag;
      if (Math.abs(offset) <= reach + 0.2) slots.push({ i, key: `${i}:${k}`, offset, settled });
    }
  }
  return slots;
}

type DragArgs = {
  /** Cards in the deck. */
  count: number;
  /** Design-pixel gap between two neighbouring cards — the distance the hand
   *  has to travel to move the deck by exactly one card. */
  spacing: number;
  /** Called on release with how many cards to advance (signed). */
  onSettle: (delta: number) => void;
};

export function useDeckDrag({ count, spacing, onSettle }: DragArgs) {
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const live = useRef<{
    id: number;
    startX: number;
    lastX: number;
    /** Position at the last velocity sample (lastX moves on every event). */
    sampleX: number;
    lastT: number;
    velocity: number;
    scale: number;
    moved: boolean;
  } | null>(null);
  // Set on release after a real drag, so the click that the browser fires
  // next can be swallowed — otherwise dragging the front card sideways would
  // also open its page on let-go.
  const swallowClick = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const rail = e.currentTarget;
    // FanFit draws the whole deck at its design width and scales it to the
    // space it has, so a screen pixel is not a design pixel on a phone. The
    // ratio between the rail's painted width and its layout width is exactly
    // that scale, read off the element itself rather than threaded down.
    const scale = rail.offsetWidth ? rail.getBoundingClientRect().width / rail.offsetWidth : 1;
    live.current = {
      id: e.pointerId,
      startX: e.clientX,
      lastX: e.clientX,
      sampleX: e.clientX,
      lastT: performance.now(),
      velocity: 0,
      scale: scale || 1,
      moved: false,
    };
    swallowClick.current = false;
    // Deliberately NO setPointerCapture and no `dragging` yet. Capturing on
    // press alone routes the whole gesture to the rail, and the click that
    // follows is then delivered to the rail instead of the arrow, dot or
    // card that was actually pressed — every control inside the deck stops
    // working. Capture starts below, the moment the hand has moved far
    // enough that this is a drag and not a tap.
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const s = live.current;
      if (!s || s.id !== e.pointerId) return;
      const travelled = e.clientX - s.startX;
      if (!s.moved && Math.abs(travelled) > 4) {
        s.moved = true;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        setDragging(true);
      }
      if (!s.moved) return;
      const now = performance.now();
      const dt = now - s.lastT;
      // Velocity in cards per second, sampled over the last ~frame rather
      // than over the whole gesture: a flick is the speed at the END of the
      // movement, not its average.
      if (dt > 8) {
        s.velocity = (e.clientX - s.sampleX) / s.scale / spacing / (dt / 1000);
        s.sampleX = e.clientX;
        s.lastT = now;
      }
      s.lastX = e.clientX;
      setDrag(travelled / s.scale / spacing);
    },
    [spacing],
  );

  const finish = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const s = live.current;
      if (!s || s.id !== e.pointerId) return;
      live.current = null;
      if (!s.moved) {
        // A tap: nothing to settle, and the click underneath must go
        // through untouched.
        setDragging(false);
        setDrag(0);
        return;
      }
      // Measured from the last position a MOVE reported, not from the
      // release event. A phone browser ends a gesture with `pointercancel`
      // the moment it decides to take over (a drift toward vertical is
      // enough), and that event's clientX is 0 — reading it threw the deck
      // several cards in a random direction.
      const travelled = (s.lastX - s.startX) / s.scale / spacing;
      // A throw carries on past where the hand stopped: 0.22s worth of the
      // release speed, capped so even a violent flick lands somewhere the
      // eye can follow. The staleness check is what separates a throw from a
      // deliberate drag — if the hand held still for a moment before letting
      // go, the last sampled speed is no longer what the hand is doing, and
      // counting it would fling the deck past the card the visitor had
      // carefully lined up.
      const stale = performance.now() - s.lastT > 90;
      const momentum = stale ? 0 : Math.max(-4, Math.min(4, s.velocity * 0.22));
      // Never a whole lap or more: on a five-card ring a flick worth five
      // cards lands on the card it started from, which reads as «свайп не
      // сработал». One card short of a lap is the longest useful throw.
      const raw = -Math.round(travelled + momentum);
      const delta = Math.max(-(count - 1), Math.min(count - 1, raw));
      swallowClick.current = s.moved;
      // The click a browser fires right after a drag arrives within the same
      // gesture; if none does (a touch that ended in `pointercancel`), the
      // flag must not linger and eat a later, genuine tap.
      if (s.moved) window.setTimeout(() => { swallowClick.current = false; }, 80);
      // Both writes in one commit on purpose: the cards go from "held at the
      // hand's position, no transition" to "at their new resting pose, with
      // the transition back on" in a single style change, which is what
      // makes the release read as the deck gliding home from exactly where
      // it was let go rather than restarting from a snapped position.
      setDragging(false);
      setDrag(0);
      if (delta) onSettle(((delta % count) + count) % count === 0 ? 0 : delta);
    },
    [count, onSettle, spacing],
  );

  // If the browser takes the capture away mid-gesture (the tab loses focus,
  // another element grabs it, the OS interrupts), no pointerup ever arrives
  // and the deck would stay frozen wherever the hand left it. Settling from
  // the last sampled position is what keeps that from stranding the fan
  // between two cards.
  const onLostPointerCapture = useCallback(() => {
    const s = live.current;
    if (!s) return;
    live.current = null;
    const travelled = (s.lastX - s.startX) / s.scale / spacing;
    setDragging(false);
    setDrag(0);
    const delta = -Math.round(travelled);
    if (delta) onSettle(delta);
  }, [onSettle, spacing]);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (!swallowClick.current) return;
    swallowClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return {
    /** Fractional cards the deck is currently held away from `active`. */
    drag,
    dragging,
    /** Spread onto the rail element that wraps the cards. */
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      onPointerCancel: finish,
      onLostPointerCapture,
      onClickCapture,
      // Safety net for browsers that ignore `-webkit-user-drag: none` on a
      // nested element: no native drag ever starts inside the rail.
      onDragStart: (e: React.DragEvent) => e.preventDefault(),
      // A long press on the front card (it is a link) opens the phone's own
      // link menu, which cancels the gesture mid-hold — the «зажатие»
      // Egor could not do on a phone.
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    },
  };
}
