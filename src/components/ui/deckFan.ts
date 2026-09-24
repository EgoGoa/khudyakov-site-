"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

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

// Насколько далеко должна уехать рука, чтобы это считалось перетаскиванием, а
// не тычком. У мыши курсор стоит там, куда его поставили, поэтому хватает
// четырёх пикселей; палец всегда немного ёрзает по стеклу, и на телефоне тот
// же порог срабатывал от дрожания руки при обычном нажатии.
const TAP_SLOP_MOUSE = 4;
const TAP_SLOP_TOUCH = 5;

// Какую долю расстояния между карточками надо пройти, чтобы колода шагнула.
//
// Раньше здесь было обычное округление, то есть половина шага: при расстоянии
// между карточками в 150 макетных пикселей палец должен был проехать больше 80
// реальных — четверть ширины телефона ради одного шага. Колода честно ехала за
// рукой и так же честно возвращалась назад, и это читалось как «свайп не
// работает вообще».
//
// Пятая часть шага — это примерно 30 экранных пикселей, лёгкий смах. Обрати
// внимание, что карточки при этом по-прежнему едут за пальцем один в один:
// меняется не скорость движения, а только порог, на котором принимается
// решение доводить до следующей карточки или возвращать назад. Разводить эти
// две вещи — обычный приём в нативных листалках: рука ведёт содержимое точно,
// а «защёлка» срабатывает гораздо раньше середины.
// Замерено на телефоне: с этой долей колода шагает примерно с 30 экранных
// пикселей пути — ровно тот «лёгкий смах», о котором просил Егор.
const SNAP_FRACTION = 0.15;

// Скорость броска (карточек в секунду), выше которой колода docrучивается
// дальше даже при коротком пути — как маховик, которому придали ход.
const FLICK_VELOCITY = 0.8;

// Сколько ещё карточек «доносит» инерцией после отпускания и насколько давно
// должна была замереть рука, чтобы бросок перестал считаться броском.
const MOMENTUM_SECONDS = 0.3;
const MOMENTUM_MAX = 4;
const STALE_FLICK_MS = 130;

// На сколько вертикаль должна обогнать горизонталь, чтобы колода отпустила
// жест и он достался листу страницы.
const VERTICAL_RELEASE = 6;

// Сколько карточек отмотать при таком суммарном пути (путь + инерция).
// Целая часть — это карточки, которые рука прошла полностью; дробная
// доводится до следующей, если перевалила за SNAP_FRACTION.
function stepsFrom(raw: number) {
  const dir = raw < 0 ? -1 : 1;
  const mag = Math.abs(raw);
  const whole = Math.floor(mag);
  return dir * (whole + (mag - whole > SNAP_FRACTION ? 1 : 0));
}

export function useDeckDrag({ count, spacing, onSettle }: DragArgs) {
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  // Палец шлёт события чаще, чем экран успевает рисовать (а браузер ещё и
  // склеивает пропущенные), и каждый setState перерисовывал всю колоду с её
  // размытиями и свечениями. На телефоне это и читалось как «тормозит и
  // дёргается»: мы считали кадры, которые никто не увидит. Теперь позиция
  // копится в ref, а в состояние уходит ровно один раз за кадр.
  const pending = useRef<number | null>(null);
  const frame = useRef(0);

  const pushDrag = useCallback((value: number) => {
    pending.current = value;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      if (pending.current !== null) setDrag(pending.current);
    });
  }, []);

  const cancelFrame = useCallback(() => {
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = 0;
    pending.current = null;
  }, []);

  useEffect(() => cancelFrame, [cancelFrame]);
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
    /** Где рука была в момент, когда жест признали перетаскиванием. */
    originX: number;
    /** Куда палец коснулся по вертикали — по нему жест отдаётся странице. */
    startY: number;
  } | null>(null);
  // Рельса нужна как настоящий DOM-узел: свои touch-события мы вешаем на неё
  // напрямую, а не через React (см. эффект ниже).
  const railRef = useRef<HTMLDivElement | null>(null);
  // Set on release after a real drag, so the click that the browser fires
  // next can be swallowed — otherwise dragging the front card sideways would
  // also open its page on let-go.
  const swallowClick = useRef(false);

  // Досчёт после отпускания — общий для мыши и пальца. Раньше эта арифметика
  // жила прямо в обработчике отпускания указателя, и второй путь ввода
  // (касания) неизбежно завёл бы её вторую, расходящуюся копию.
  const applySettle = useCallback(
    (s: NonNullable<typeof live.current>) => {
      cancelFrame();
      if (!s.moved) {
        setDragging(false);
        setDrag(0);
        return;
      }
      const travelled = (s.lastX - s.originX) / s.scale / spacing;
      const stale = performance.now() - s.lastT > STALE_FLICK_MS;
      const momentum = stale
        ? 0
        : Math.max(-MOMENTUM_MAX, Math.min(MOMENTUM_MAX, s.velocity * MOMENTUM_SECONDS));
      let raw = -stepsFrom(travelled + momentum);
      // Короткий, но быстрый смах — жест, которым листают, почти не сдвигая
      // руку. Пути на целый порог там нет, а намерение очевидно, поэтому
      // скорость сама по себе даёт один шаг в сторону броска.
      if (raw === 0 && !stale && Math.abs(s.velocity) > FLICK_VELOCITY) {
        raw = s.velocity < 0 ? 1 : -1;
      }
      const delta = Math.max(-(count - 1), Math.min(count - 1, raw));
      swallowClick.current = true;
      window.setTimeout(() => {
        swallowClick.current = false;
      }, 80);
      // Оба присваивания одним обновлением намеренно: карточки переходят из
      // «держим там, где рука, без анимации» в «едем на новое место, анимация
      // включена» за одну смену стилей — отпускание читается как доводка
      // ровно оттуда, где колоду отпустили.
      setDragging(false);
      setDrag(0);
      if (delta) onSettle(((delta % count) + count) % count === 0 ? 0 : delta);
    },
    [cancelFrame, count, onSettle, spacing],
  );

  // Скорость последнего отрезка жеста, в карточках за секунду. Считается не за
  // весь жест, а за последний кадр: бросок — это скорость В КОНЦЕ движения, а
  // не средняя по всему пути.
  const sampleVelocity = useCallback(
    (s: NonNullable<typeof live.current>, x: number) => {
      const now = performance.now();
      const dt = now - s.lastT;
      if (dt > 8) {
        s.velocity = (x - s.sampleX) / s.scale / spacing / (dt / 1000);
        s.sampleX = x;
        s.lastT = now;
      }
    },
    [spacing],
  );

  // Палец ведёт колоду своими же, «родными» событиями.
  //
  // Раньше и мышь, и касание шли одним путём — через pointer-события. Это
  // удобно ровно до тех пор, пока на странице не найдётся другой обработчик,
  // который вызовет preventDefault на touchmove: браузер тогда снимает с
  // касания указатель и присылает pointercancel, а жест колоды умирает на
  // первом миллиметре движения. На сайте таких обработчиков три
  // (CinematicStage, PhotoStage, fullpage), и каждый новый ломал бы карусель
  // заново.
  //
  // Поэтому касания обрабатываются напрямую и первыми: слушатель висит на
  // самой рельсе, срабатывает раньше оконных, и как только движение признано
  // горизонтальным — сам зовёт preventDefault, объявляя жест своим. Ни одна
  // страничная навигация после этого его уже не отнимет. Слушатель нативный,
  // а не React-овский, потому что React вешает touchmove пассивно, а
  // пассивному обработчику preventDefault запрещён.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return; // двумя пальцами — это не наш жест
      const t = e.touches[0];
      const scale = rail.offsetWidth ? rail.getBoundingClientRect().width / rail.offsetWidth : 1;
      live.current = {
        id: -1,
        startX: t.clientX,
        lastX: t.clientX,
        sampleX: t.clientX,
        lastT: performance.now(),
        velocity: 0,
        scale: scale || 1,
        moved: false,
        originX: t.clientX,
        startY: t.clientY,
      };
      swallowClick.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      const s = live.current;
      const t = e.touches[0];
      if (!s || !t) return;
      const dx = t.clientX - s.startX;
      const dy = t.clientY - s.startY;

      if (!s.moved) {
        // Пока не решили, чей жест: ушёл вверх или вниз — отдаём странице и
        // больше в него не вмешиваемся; ушёл вбок дальше порога — берём себе.
        if (Math.abs(dy) > Math.abs(dx) + VERTICAL_RELEASE) {
          live.current = null;
          return;
        }
        if (Math.abs(dx) <= TAP_SLOP_TOUCH) return;
        s.moved = true;
        s.originX = t.clientX;
        setDragging(true);
      }

      // Жест наш — забираем его у страницы, иначе она уедет под колодой.
      e.preventDefault();
      sampleVelocity(s, t.clientX);
      s.lastX = t.clientX;
      pushDrag((t.clientX - s.originX) / s.scale / spacing);
    };

    const onTouchEnd = () => {
      const s = live.current;
      if (!s) return;
      live.current = null;
      applySettle(s);
    };

    rail.addEventListener("touchstart", onTouchStart, { passive: true });
    rail.addEventListener("touchmove", onTouchMove, { passive: false });
    rail.addEventListener("touchend", onTouchEnd);
    rail.addEventListener("touchcancel", onTouchEnd);
    return () => {
      rail.removeEventListener("touchstart", onTouchStart);
      rail.removeEventListener("touchmove", onTouchMove);
      rail.removeEventListener("touchend", onTouchEnd);
      rail.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [applySettle, pushDrag, sampleVelocity, spacing]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    // Касания ведёт эффект выше — здесь остаются мышь и перо.
    if (e.pointerType === "touch") return;
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
      originX: e.clientX,
      startY: e.clientY,
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
      const slop = e.pointerType === "mouse" ? TAP_SLOP_MOUSE : TAP_SLOP_TOUCH;
      if (!s.moved && Math.abs(travelled) > slop) {
        s.moved = true;
        // Считаем путь от этой точки, а не от первого касания: иначе в момент
        // срабатывания порога колода прыгала бы сразу на его величину.
        s.originX = e.clientX;
        // Захват — это удобство, а не условие работы жеста: браузер вправе
        // отказать (указателя уже нет, элемент перерисовался), и раньше такой
        // отказ ронял обработчик вместе со всем перетаскиванием.
        try {
          e.currentTarget.setPointerCapture?.(e.pointerId);
        } catch {
          /* жест продолжает жить на обычных событиях рельсы */
        }
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
      pushDrag((e.clientX - s.originX) / s.scale / spacing);
    },
    [pushDrag, spacing],
  );

  const finish = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const s = live.current;
      if (!s || s.id !== e.pointerId) return;
      live.current = null;
      // Позиция берётся из последнего события ДВИЖЕНИЯ, а не из события
      // отпускания: браузер заканчивает жест через pointercancel, как только
      // решает забрать его себе, и у такого события clientX равен нулю —
      // раньше колоду от этого отбрасывало в случайную сторону.
      applySettle(s);
    },
    [applySettle],
  );

  // Если браузер отобрал захват посреди жеста (вкладка потеряла фокус, другой
  // элемент перехватил указатель, вмешалась система), отпускание уже не
  // придёт, и колода осталась бы висеть там, где её бросила рука.
  const onLostPointerCapture = useCallback(() => {
    const s = live.current;
    if (!s) return;
    live.current = null;
    applySettle(s);
  }, [applySettle]);

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
      ref: railRef,
      // По этой метке полностраничная навигация (CinematicStage, fullpage)
      // узнаёт, что касание началось внутри колоды, и не гасит его своим
      // preventDefault — см. подробный разбор там же.
      "data-deck-rail": "",
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

// ── Пружина колоды ──────────────────────────────────────────────────────────
// Раньше смену карточки анимировал CSS-transition, а z-index (какая карточка
// сверху) переключался мгновенно, в первый же кадр шага. Входящая карточка
// выпрыгивала поверх ещё большой уходящей — это и был «рывок» и «перескок
// карточек сквозь друг друга», который видел Егор.
//
// Теперь позиция колоды — одно дробное число, которое каждый кадр догоняет
// выбранную карточку по критически задемпфированной пружине (как листалки
// iOS: без перелёта и без отскока). Все позы, прозрачность подписей и
// порядок слоёв считаются из этой позиции, поэтому карточки меняются местами
// ровно в середине пути, когда они одного размера.
const SPRING_OMEGA = 11; // жёсткость: ≈0.45 с на шаг

export function useDeckSpring(active: number, drag: number, dragging: boolean) {
  const [pos, setPos] = useState(active);
  const posRef = useRef(active);
  const vel = useRef(0);
  const lastDrag = useRef(0);
  const prevActive = useRef(active);
  const wasDragging = useRef(false);

  // Путь руки, пока колоду держат.
  useEffect(() => {
    if (dragging) lastDrag.current = drag;
  }, [drag, dragging]);

  // Отпустили колоду: позиция становится ровно той, где карточки бросили
  // (старая карточка минус путь руки), и доводка идёт оттуда. Layout-эффект —
  // чтобы поправка успела до первой отрисовки кадра отпускания.
  useLayoutEffect(() => {
    if (wasDragging.current && !dragging) {
      posRef.current = prevActive.current - lastDrag.current;
      vel.current = 0;
      lastDrag.current = 0;
      setPos(posRef.current);
    } else if (dragging) {
      posRef.current = active;
      vel.current = 0;
      setPos(active);
    }
    wasDragging.current = dragging;
    prevActive.current = active;
  }, [active, dragging]);

  useEffect(() => {
    if (dragging) return;
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const x = posRef.current - active;
      const a = -SPRING_OMEGA * SPRING_OMEGA * x - 2 * SPRING_OMEGA * vel.current;
      vel.current += a * dt;
      posRef.current += vel.current * dt;
      if (Math.abs(posRef.current - active) < 0.001 && Math.abs(vel.current) < 0.01) {
        posRef.current = active;
        vel.current = 0;
        setPos(active);
        return;
      }
      setPos(posRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, dragging]);

  const shown = dragging ? active : pos;
  return {
    /** Добавка к drag для fanSlots: насколько колода ещё не доехала. */
    lag: active - shown,
    /** Колода в движении — CSS-переходы поз на это время выключены. */
    moving: !dragging && Math.abs(pos - active) > 0.001,
  };
}

/** Порядок слоёв из непрерывного расстояния до центра. */
export function zFor(offset: number) {
  return 100 - Math.round(Math.abs(offset) * 20);
}
