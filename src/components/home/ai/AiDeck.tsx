"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import FanFit from "@/components/ui/FanFit";
import { blurAt, fanSlots, modIndex, poseAt, useDeckDrag, wrapOffset } from "@/components/ui/deckFan";
import { useCallback, useEffect, useRef, useState } from "react";
import { servicesByCategory } from "@/lib/service-content";
import SpotlightScene from "@/components/home/ai/SpotlightScene";
import SpotlightCopy from "@/components/home/ai/SpotlightCopy";
import { spotlightFor } from "@/components/home/ai/spotlightData";

// The service carousel on /ai's chapter 01.
//
// Same reference as /sites' own deck (the Russia/VR fanned rail), but built
// the other way round on purpose: Egor asked for /ai to use a *real*
// perspective rather than the flat translate+scale fake SitesDeck uses. So
// this one sets `perspective` on the rail and gives every card an actual
// `rotateY`.
//
// The reason SitesDeck avoids 3D is that a rotated `backdrop-blur` panel
// forces its own compositing layer over the reel playing underneath, and the
// whole stage stutters on every swap. The fix here is not to drop the 3D but
// to drop the glass: these cards are painted with an opaque gradient, so
// there is nothing for the compositor to re-sample per frame and the rotation
// stays cheap. Only the centre card carries any blur-free glass edging.
//
// Ten cards, not five (Egor's call): the full /ai offer is on the first
// screen. Only ±2 around the centre are drawn — the rest are unmounted, so
// card count costs nothing at runtime.
//
// Paging is buttons + click-a-card + arrow keys only. No wheel or swipe
// handler: CinematicStage owns those gestures to step chapters, and a second
// listener here would fight it.

type Card = {
  id: string;
  /** Short label for the card face — the offer list's own titles run to five
   *  words and would set as four lines at card size. The full title and the
   *  description below the rail still come from service-content.ts, so the
   *  carousel can't drift from what chapter 05 (Offer) lists. */
  short: string;
  /** Stock frame behind the card's artwork, held at very low exposure —
   *  Egor's ask: the cards read as flat panels, and a photo underneath gives
   *  each one its own subject without competing with the diagram on top.
   *
   *  Deliberately the same frame that tool's own page uses in its hero (see
   *  components/home/direction/content/ai-*.tsx), so clicking a card lands
   *  on a page that opens with the picture the card was already wearing. */
  image: string;
  /** Route to that item's own deep-dive page, when one exists.
   *
   *  Five of the ten offer items now have a full page under /ai/[tool] (see
   *  components/home/direction/toolRegistry.ts); the other five don't yet.
   *  Egor's call on where the entry point lives: "карусель остаётся, но
   *  чтобы через кнопку можно было нажимать на неё и проходить на отдельную
   *  страницу" — the carousel itself stays exactly as it was, and a button
   *  shows up on the info row below it only for the cards that actually
   *  have somewhere to go. No `href` here means no button, not a dead
   *  link. */
  href?: string;
  /** "Хит месяца" — Egor's flagship pick. Draws the card's badge and swaps
   *  its glow/ring/CTA from the deck's default emerald to a pink→orange
   *  pair (same #ff4fd8→#ff6a3d ramp as PromoCard's badge, so it reads as
   *  the site's one established "featured" language, not a new colour
   *  invented for this card alone). */
  hit?: boolean;
};


// Index-aligned with servicesByCategory.ai — same order, now eleven items
// (the "хит месяца" card added at the front, everything else unchanged).
const CARDS: Card[] = [
  { id: "chathub", short: "Единый AI-чат\nдля мессенджеров", href: "/ai/chat-hub", hit: true, image: "/images/stock/devs-night.webp" },
  { id: "gen", short: "Генерация\nвидео и фото", href: "/ai/video", image: "/images/stock/holi-face.webp" },
  { id: "bots", short: "Чат-боты\nи AI-агенты", href: "/ai/agent", image: "/images/stock/robot-hand-chip.webp" },
  { id: "auto", short: "Автоматизация\nкоммуникации", href: "/ai/comms", image: "/images/stock/man-laptop-dark.webp" },
  { id: "text", short: "Текстовый\nконтент", href: "/ai/content", image: "/images/stock/ink-pink.webp" },
  { id: "inner", short: "Ассистенты\nдля процессов", href: "/ai/ops", image: "/images/stock/planner-desk.webp" },
  { id: "crm", short: "AI внутри\nCRM", href: "/ai/crm", image: "/images/stock/brain-circuit.webp" },
  { id: "voice", short: "Голосовые\nрешения", href: "/ai/voice", image: "/images/stock/hologram-laptop.webp" },
  { id: "person", short: "Персонализация\nконтента", href: "/ai/personalization", image: "/images/stock/vr-neon-triangle.webp" },
  { id: "analytics", short: "AI-аналитика", href: "/ai/analytics", image: "/images/stock/platform-speed.webp" },
  { id: "learn", short: "Обучение\nкоманды", href: "/ai/training", image: "/images/stock/team-ideas.webp" },
];

const SERVICES = servicesByCategory.ai;

/** Инструмент карточки — последний сегмент её ссылки (/ai/agent → agent). */
const slugOf = (card: Card) => (card.href ?? "").replace("/ai/", "");

// Лицо карточки карусели: фото-фон, скрим и живая сцена инструмента.
//
// Сцена — та же, что рисуется в выдвижных окошках под блоками страницы
// (SpotlightScene), а не отдельная диаграмма: Егор попросил «просто скопировать
// и вставить» графику оттуда. Прежние CSS-диаграммы (AiThumb, ~500 строк) на
// этом месте больше не нужны и удалены.
//
// Сцену крутит только центральная карточка (`step` меняется вместе с текстом
// под каруселью); боковые стоят на первой сцене — их не читают, а пятнадцать
// одновременных анимаций тяжелы и шумны.
function AiCardFace({
  slug,
  image,
  hit,
  step,
}: {
  slug: string;
  image: string;
  hit?: boolean;
  /** Номер сцены; у боковых карточек всегда 0. */
  step: number;
}) {
  return (
    <div
      className="absolute inset-0 bg-[linear-gradient(160deg,#16241f_0%,#0c1013_58%,#0a0d10_100%)]"
      style={{ "--sp-from": "#c8f169", "--sp-to": "#10b981" } as React.CSSProperties}
    >
      {/* Кадр-подложка. Оставлен по решению Егора: он связывает карточку со
          страницей инструмента, куда она ведёт (см. поле `image`). */}
      <img
        src={image}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.9] [filter:grayscale(0.3)_contrast(1.05)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, rgba(12,22,19,0.62) 0%, rgba(10,13,16,0.72) 55%, rgba(10,13,16,0.8) 100%)",
        }}
      />
      <span
        className={`pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full blur-2xl ${
          hit ? "bg-[#ff6a3d]/25" : "bg-emerald-400/20"
        }`}
      />
      {/* Сцена растянута почти до подписи — тот же фикс, что на
          SitesCardFace/SmmCardFace: раньше графика занимала меньше
          половины карточки и читалась мелкой на пустом затемнённом низе.
          Градиент подписи ниже сам гасит нижний край сцены. */}
      <div className="absolute inset-x-3 top-6 bottom-16">
        <SpotlightScene slug={slug} step={step} card />
      </div>
    </div>
  );
}

// Where each card sits relative to the active one. Real 3D: the neighbours
// turn to face the centre, so the rail curves away instead of just shrinking.
// The cards themselves grew 1.3x (Egor's ask); x/z did NOT grow with them.
// Scaling the spread by the same 1.3 put the outer pair ~400px from the
// rail's centre inside a column only ~510px wide, so they hung off the edge
// of the chapter and raised a horizontal scrollbar along the bottom of the
// page — and a scrollbar that appears and disappears as cards swap resizes
// the pane, which is what made the headings' letters jump. Held near the
// original spread instead: bigger cards over the same width simply overlap
// more, which is what a coverflow wants anyway. (CinematicSection now also
// closes the x axis outright, so a narrow viewport clips rather than pans —
// this keeps it from needing to.)
// Depth is now opacity + a dark veil painted inside the card, never a
// `filter: blur()` and never real transparency. Blur re-rasterised every
// card on every frame of a swap, and a see-through card let the one behind
// it bleed through wherever they overlap — Egor saw both as the carousel
// "дёргается" and "окошки залазят друг на друга".
const POSE: Record<number, { x: number; z: number; ry: number; scale: number; opacity: number; veil: number; zi: number }> = {
  [-2]: { x: -246, z: -390, ry: 40, scale: 0.74, opacity: 0.88, veil: 0.74, zi: 10 },
  [-1]: { x: -148, z: -195, ry: 32, scale: 0.87, opacity: 1, veil: 0.5, zi: 20 },
  [0]: { x: 0, z: 0, ry: 0, scale: 1, opacity: 1, veil: 0, zi: 30 },
  [1]: { x: 148, z: -195, ry: -32, scale: 0.87, opacity: 1, veil: 0.5, zi: 20 },
  [2]: { x: 246, z: -390, ry: -40, scale: 0.74, opacity: 0.88, veil: 0.74, zi: 10 },
  // Mid-drag only: a card leaving the rail needs a pose to travel towards,
  // and poseAt has already faded it out by the time it reaches here.
  [-3]: { x: -318, z: -560, ry: 44, scale: 0.62, opacity: 0.8, veil: 0.84, zi: 5 },
  [3]: { x: 318, z: -560, ry: -44, scale: 0.62, opacity: 0.8, veil: 0.84, zi: 5 },
};

// Hand travel that moves the rail by exactly one card.
const SPACING = 148;

/** Как часто меняется тезис/сцена под каруселью, мс. */
const DECK_BEAT_MS = 4200;

// The chapter's button language, shared with the rest of /ai the way
// SitesDeck's PILL/ROUND are shared across /sites. Emerald rather than the
// site's orange: /ai's whole icon set and accent is emerald, and an orange
// key here read as borrowed from the neighbouring page.
export const AI_PILL =
  "inline-flex items-center gap-2.5 whitespace-nowrap rounded-full bg-gradient-to-b from-[#5ce6b0] to-[#0fa47a] px-7 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.16em] text-[#03120d] shadow-[0_12px_30px_-8px_rgba(16,185,129,0.7)] transition-[filter,transform] duration-300 hover:brightness-110 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300";

export const AI_ROUND =
  "grid h-11 w-11 shrink-0 place-items-center rounded-full border border-paper/25 bg-white/[0.06] text-paper/85 backdrop-blur-md transition-[color,border-color,transform] duration-300 hover:scale-110 hover:border-emerald-300/70 hover:text-emerald-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300";

export default function AiDeck({ panelTarget }: { panelTarget?: HTMLElement | null } = {}) {
  const wide = !!panelTarget;
  const [active, setActive] = useState(0);
  // Рельса теперь живёт в самом жесте (useDeckDrag отдаёт её в bind.ref):
  // два разных ref на одном узле при расстановке через spread затирали друг
  // друга, и побеждал тот, что стоял позже.
  const count = CARDS.length;

  const step = useCallback(
    (delta: number) => setActive((prev) => prev + delta),
    [],
  );
  // `active` is an unwrapped counter (fanSlots explains why); `idx` is the
  // card actually chosen.
  const idx = modIndex(active, count);
  const goTo = useCallback(
    (target: number) =>
      setActive((prev) => prev + wrapOffset(target - modIndex(prev, count), count)),
    [count],
  );

  const { drag, dragging, bind } = useDeckDrag({ count, spacing: SPACING, onSettle: step });

  // Arrow keys, but only while the rail itself has focus inside it — the
  // page's own left/right gestures stay untouched everywhere else.
  useEffect(() => {
    const el = bind.ref.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [bind.ref, step]);

  // Номер сцены/тезиса центральной карточки. Он общий для карточки (графика)
  // и окошка под каруселью (текст), поэтому живёт здесь, а не в каждом из
  // них: так картинка и слова меняются строго вместе. Сбрасывается на первый
  // кадр при каждой смене карточки — новый инструмент всегда начинается с
  // начала, а не с середины чужого сюжета.
  const [sceneStep, setSceneStep] = useState(0);
  const [held, setHeld] = useState(false);
  const data = spotlightFor(slugOf(CARDS[idx]));
  const beats = data?.benefits.length ?? 0;

  // Сброс при смене карточки — прямо во время рендера (документированный
  // приём React для состояния, производного от пропса), а не в эффекте:
  // эффект дал бы один лишний кадр со старым номером сцены на новой карточке.
  const [stepFor, setStepFor] = useState(idx);
  if (stepFor !== idx) {
    setStepFor(idx);
    setSceneStep(0);
  }

  // Чуть быстрее, чем в выдвижных окошках на блоках (5.2с): Егор просил, чтобы
  // тут блоки и графика менялись живее. Пауза, пока курсор над окошком —
  // прочитать тезис до смены.
  useEffect(() => {
    if (held || beats < 2) return;
    const id = window.setInterval(() => setSceneStep((v) => (v + 1) % beats), DECK_BEAT_MS);
    return () => window.clearInterval(id);
  }, [held, beats, idx]);

  const panel = (
    <div
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      className={`glass-panel deck-neon-pulse flex overflow-hidden rounded-3xl px-6 py-5 ${wide ? "h-auto" : "mt-6 h-auto lg:h-[250px]"}`}
      style={
        {
          "--card-glow-rgb": "52, 211, 153",
          "--sp-from": "#c8f169",
          "--sp-to": "#10b981",
        } as React.CSSProperties
      }
    >
      {/* Тот же правый блок, что в выдвижных окошках на блоках страницы —
          один компонент на оба места, чтобы текст и темп не расходились. */}
      {data && <SpotlightCopy data={data} step={sceneStep} setStep={setSceneStep} showSub={false} compact />}
    </div>
  );

  return (
    <div className="w-full max-w-[728px]">
      {/* Paging runs off the pointer drag now (useDeckDrag), so FanFit's
          own swipe handler is left unwired — otherwise one flick paged the
          rail twice. */}
      <FanFit designWidth={396} height={416}>
      <div
        className="deck-rail relative h-full"
        style={{
          perspective: "1430px",
          perspectiveOrigin: "50% 50%",
          cursor: dragging ? "grabbing" : "grab",
          touchAction: "pan-y",
        }}
        {...bind}
      >
        {/* The pool of light the whole deck sits in — without it the rail
            reads as five boxes floating on flat black. One big, slow-breathing
            emerald glow, well behind every card (z-0). */}
        <span
          aria-hidden="true"
          className="ai-deck-ambient-glow pointer-events-none absolute left-1/2 top-1/2 z-0 h-[560px] w-[560px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(52,211,153,0.38) 0%, rgba(52,211,153,0.14) 45%, rgba(52,211,153,0) 72%)",
            filter: "blur(6px)",
          }}
        />

        {fanSlots(count, active, drag).map(({ i, key, offset, settled }) => {
          const card = CARDS[i];
          // Signed, wrapped distance from the active card, so card 10 sits to
          // the *left* of card 01 instead of looping the long way round.
          const pose = poseAt(POSE, offset);
          const opacity = pose.opacity * pose.fade;
          const blurPx = blurAt(offset);
          // 1 в центре, 0 на соседней позиции — непрерывная близость к центру.
          const halo = Math.max(0, 1 - Math.abs(offset) / 1.1);

          // Caption, glow colour and the link itself key off the SETTLED
          // position, so they travel with the chosen card instead of
          // switching cards halfway through a gesture.
          const isFront = settled === 0;
          const dist = Math.abs(settled);

          const caption = (
            <>
              <span
                className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
                style={{ background: "linear-gradient(180deg, rgba(10,13,16,0) 0%, rgba(10,13,16,0.96) 62%)" }}
              />
              <span className="absolute inset-x-5 bottom-5 flex flex-col items-start gap-3">
                <span className="block whitespace-pre-line font-display text-lg uppercase leading-[1.15] tracking-tight text-paper">
                  {card.short}
                </span>
                    {/* Was a small pill on the info row below the deck —
                        Егор: "кнопки перемести во внутрь карточек и сделай
                        их заметнее и пусть они пульсируют". Living on the
                        card itself, it reads as the card's own action
                        instead of a footnote under it; the pulse is what
                        makes it read as clickable rather than as more
                        label text next to the title above it. */}
                    {card.href && (
                      <span
                        // ~30% smaller than the first pass (px-4 py-2.5
                        // text-[11px]) — Егор: the pill was outweighing the
                        // card title above it.
                        // Transparent glass with a lit outline, not a solid
                        // colour plate, and a fifth smaller again — Егор:
                        // кнопка забирала на себя слишком много внимания и
                        // светилась слишком сильно.
                        className={`deck-open-pill inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[7px] font-semibold uppercase tracking-[0.12em] motion-reduce:animate-none ${
                          isFront ? "" : "deck-open-pill-still"
                        }`}
                        style={{ "--pill-rgb": card.hit ? "255, 138, 92" : "92, 230, 176" } as React.CSSProperties}
                      >
                        Открыть инструмент
                        <span aria-hidden="true">→</span>
                      </span>
                    )}
                  </span>
            </>
          );

          const counter = (
            <span className="absolute right-3.5 top-3.5 rounded-full bg-ink/70 px-2.5 py-1 font-display text-[10px] tracking-[0.12em] text-paper/70">
              {String(idx + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
          );


          return (
            // One posed element per card, carrying the 3D transform, the
            // depth opacity and the distance blur — with BOTH the glow and
            // the card itself as its children.
            //
            // This replaces a version where the glow was a sibling of the
            // card with its own copy of the same transform string. Two
            // elements animating two separate transforms cannot be kept in
            // step: they were started by different style writes, and the
            // browser is free to schedule them on different frames, so the
            // light visibly lagged the card it belonged to on every swap —
            // "карточки меняются, а свечение остаётся". Nesting removes the
            // problem by construction rather than by tuning: a child cannot
            // desync from a transform it does not own, it is simply carried
            // by it.
            <div
              key={key}
              className={`deck-pose ${blurPx > 0 ? "deck-pose-blur" : ""} absolute left-1/2 top-1/2 h-[348px] w-[265px] ease-[cubic-bezier(0.45,0.05,0.2,1)] motion-reduce:transition-none ${
                // No transition while the hand holds the rail: the cards
                // have to sit exactly where the finger is, on the frame it
                // is there.
                dragging ? "transition-[filter] duration-[760ms]" : "transition-[transform,opacity,filter] duration-[760ms]"
              }`}
              style={{
                ["--deck-blur" as string]: `${blurPx}px`,
                zIndex: Math.round(pose.zi),
                opacity,
                // NOT `visibility: hidden` at zero opacity: that is applied
                // from the TARGET value, so it hid the card on the first
                // frame of the step and the fade never got to play — the
                // outermost cards looked like they switched off. An
                // opacity-0 layer costs nothing to leave in place; it only
                // has to stop swallowing clicks.
                pointerEvents: opacity < 0.05 ? "none" : undefined,
                transform: `translate(-50%, -50%) translate3d(${pose.x}px, 0, ${pose.z}px) rotateY(${pose.ry}deg) scale(${pose.scale})`,
                willChange: "transform, opacity",
              }}
            >
              {/* Back cards: a faint flickering rim in the page's own
                  emerald — the further from centre, the paler, which is what
                  reads as "receding" rather than just blurred. Front card:
                  same soft flicker, but brighter and in a violet→blue
                  gradient, so the chosen one is unmistakably a different
                  kind of light, not just a bigger version of the same one.
                  Only the colours change on a swap now; the position is the
                  parent's business. */}
              {/* Свет карточки — двумя слоями, которые перетекают друг в
                  друга по мере движения: «дальний» (изумруд/оранж) и
                  «выбранный» (фиолет→синий, у хита — розово-оранжевый).
                  Раньше цвет и яркость переключались скачком в момент
                  смены карточки, и это читалось как рывок. Теперь оба слоя
                  всегда на месте, а меняется только их прозрачность — по
                  непрерывному расстоянию до центра, в том числе пока колоду
                  тянут рукой. */}
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute -inset-3 -z-10 rounded-[30px] ${
                  dragging ? "" : "transition-opacity duration-[760ms] ease-[cubic-bezier(0.45,0.05,0.2,1)]"
                }`}
                style={{ opacity: 1 - halo }}
              >
                <span
                  className="ai-deck-glow absolute inset-0 rounded-[30px]"
                  style={
                    {
                      filter: "blur(24px)",
                      background: card.hit
                        ? `radial-gradient(ellipse farthest-side at center, rgba(255,106,61,${dist <= 1 ? 0.45 : 0.24}) 0%, rgba(255,106,61,${dist <= 1 ? 0.18 : 0.1}) 62%, rgba(255,79,216,0) 100%)`
                        : `radial-gradient(ellipse farthest-side at center, rgba(52,211,153,${dist <= 1 ? 0.4 : 0.2}) 0%, rgba(52,211,153,${dist <= 1 ? 0.16 : 0.08}) 62%, rgba(52,211,153,0) 100%)`,
                      "--flicker-min": dist <= 1 ? 0.25 : 0.12,
                      "--flicker-max": dist <= 1 ? 0.5 : 0.3,
                      "--flicker-duration": "3.8s",
                      "--flicker-delay": `${i * 0.3}s`,
                    } as React.CSSProperties
                  }
                />
              </span>
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute -inset-3 -z-10 rounded-[30px] ${
                  dragging ? "" : "transition-opacity duration-[760ms] ease-[cubic-bezier(0.45,0.05,0.2,1)]"
                }`}
                style={{ opacity: halo }}
              >
                <span
                  className="ai-deck-glow absolute inset-0 rounded-[30px]"
                  style={
                    {
                      filter: "blur(24px)",
                      background: card.hit
                        ? "radial-gradient(ellipse farthest-side at center, rgba(255,79,216,0.95) 0%, rgba(255,106,61,0.6) 52%, rgba(255,106,61,0.2) 80%, rgba(255,106,61,0) 100%)"
                        : "radial-gradient(ellipse farthest-side at center, rgba(167,139,250,0.95) 0%, rgba(56,189,248,0.55) 52%, rgba(56,189,248,0.2) 80%, rgba(56,189,248,0) 100%)",
                      "--flicker-min": 0.65,
                      "--flicker-max": 1,
                      "--flicker-duration": "3.2s",
                      "--flicker-delay": `${i * 0.3}s`,
                    } as React.CSSProperties
                  }
                />
              </span>

              {/* "Хит месяца" — same badge language as PromoCard's own
                  featured pill (.promo-card-badge-lift: pink→orange
                  shimmer + blink glow), reused rather than invented, so the
                  site has one "featured" visual vocabulary and not two.
                  Lives on the posed wrapper (not inside AiThumb), so it
                  moves/blurs with the card like the glow above it. */}
              {card.hit && (
                <span
                  className="promo-card-badge-lift pointer-events-none absolute -top-2.5 left-3.5 z-20 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[8px] uppercase tracking-[0.14em] text-white"
                  aria-hidden="true"
                >
                  <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-white" />
                  Хит месяца
                </span>
              )}

              {/* Название и кнопка — на КАЖДОЙ карточке, не только на
                  передней (Егор: «когда я хватаю карточку, я не вижу ни
                  названия, ни кнопки»). Колода читается сразу и не пустеет,
                  пока её тянут рукой. Счётчик 01/11 остаётся только на
                  выбранной: он считает колоду, а не карточку. */}

              {/* The front card is not a paging control — clicking it was
                  always a no-op (tabIndex -1, onClick re-selecting the
                  already-active index). That's what made it safe to stop
                  rendering it as a <button> once it needed to carry a real
                  navigation link: off-centre cards (which DO page the
                  carousel) keep the <button>, the front card is the link
                  itself now — the whole surface opens the tool, not just the
                  pill inside it (Egor's ask: click anywhere on the selected
                  card, not only its button). A <Link>'s <a> can't nest
                  inside another <a> any more than inside a <button>, so the
                  pill below is a plain <span> styled the same — decoration,
                  not a second link. */}
              {isFront ? (
                <Link
                  href={card.href ?? "#"}
                  aria-current="true"
                  className="deck-card-glow deck-neon-pulse absolute inset-0 overflow-hidden rounded-[26px] text-left"
                  style={{ "--card-glow-rgb": card.hit ? "255, 106, 61" : "16, 185, 129" } as React.CSSProperties}
                >
                  <AiCardFace slug={slugOf(card)} image={card.image} hit={card.hit} step={sceneStep} />

                  {caption}
                  {counter}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    goTo(i);
                    // Restore focus ourselves, without the scroll-into-view a
                    // plain click's native focus would trigger — see the
                    // onMouseDown comment below for why that scroll happens
                    // and why it matters. `preventScroll` is what keeps the
                    // arrow keys usable right after a mouse click without
                    // bringing the jump back.
                    e.currentTarget.focus({ preventScroll: true });
                  }}
                  // A card sitting off-centre is rotated in 3D (rotateY,
                  // inside the rail's own `perspective`). Focusing it on
                  // click — the browser's default for a <button> — makes
                  // Chrome/Safari run their native scroll-into-view against
                  // that rotated geometry, which they sometimes get wrong
                  // and answer by scrolling the whole page. CinematicStage's
                  // own scroll listener then reads that stray scroll as a
                  // real gesture and can swap the chapter under you — the
                  // "вся вёрстка прыгает" bug. Blocking focus on mousedown
                  // (the click itself still fires via mouseup, and onClick
                  // above re-focuses safely) removes the trigger entirely.
                  onMouseDown={(e) => e.preventDefault()}
                  tabIndex={0}
                  aria-label={`Показать: ${SERVICES[i].title}`}
                  className="absolute inset-0 overflow-hidden rounded-[26px] text-left shadow-[0_38px_90px_-28px_rgba(0,0,0,0.9)] cursor-pointer transition-[box-shadow] duration-[760ms] motion-reduce:transition-none"
                >
                  <AiCardFace slug={slugOf(card)} image={card.image} hit={card.hit} step={0} />
                  {caption}
                </button>
              )}
              {/* Затемнение глубины — один слой на карточку, всегда на
                  месте, меняется только прозрачность. Раньше он жил внутри
                  боковой карточки и монтировался целиком в момент, когда
                  карточка переставала быть передней: она будто выключалась.
                  Держит карточки непрозрачными, чтобы они не просвечивали
                  друг сквозь друга на перекрытии. */}
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 z-10 rounded-[26px] bg-[#08090e] ${
                  dragging ? "" : "transition-opacity duration-[760ms] ease-[cubic-bezier(0.45,0.05,0.2,1)]"
                }`}
                style={{ opacity: pose.veil }}
              />
            </div>
          );
        })}

        <button
          type="button"
          onClick={(e) => {
            step(-1);
            e.currentTarget.focus({ preventScroll: true });
          }}
          // See the matching comment on the card button above — same
          // focus-triggered scroll-jump risk, since this sits inside the
          // rail's own `perspective` context too.
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Предыдущая услуга"
          className={`absolute left-0 top-1/2 z-40 -translate-y-1/2 ${AI_ROUND}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => {
            step(1);
            e.currentTarget.focus({ preventScroll: true });
          }}
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Следующая услуга"
          className={`absolute right-0 top-1/2 z-40 -translate-y-1/2 ${AI_ROUND}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      </FanFit>

      {/* The lit track. Ten nodes would crowd at 32px each, so these are bare
          dots with the active one stretched into a capsule — same idea as
          /sites' numbered rail, sized for twice as many items. */}
      <div className="relative mx-auto mt-6 flex max-w-[420px] items-center justify-between">
        <span
          className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
          style={{
            background:
              "linear-gradient(90deg, rgba(52,211,153,0) 0%, rgba(52,211,153,0.4) 10%, rgba(52,211,153,0.4) 90%, rgba(52,211,153,0) 100%)",
          }}
        />
        {CARDS.map((card, i) => {
          const on = i === idx;
          return (
            <button
              key={card.id}
              type="button"
              onClick={(e) => {
                goTo(i);
                e.currentTarget.focus({ preventScroll: true });
              }}
              onMouseDown={(e) => e.preventDefault()}
              aria-label={SERVICES[i].title}
              aria-current={on ? "true" : undefined}
              className="relative grid h-7 place-items-center rounded-full border bg-ink transition-all duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 motion-reduce:transition-none"
              style={{
                width: on ? 34 : 12,
                borderColor: on ? "#34d399" : "rgba(52,211,153,0.3)",
                boxShadow: on ? "0 0 12px rgba(52,211,153,0.9), 0 0 34px rgba(52,211,153,0.45)" : "none",
              }}
            >
              <span className="font-display text-[9px] text-emerald-100" style={{ opacity: on ? 1 : 0 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
            </button>
          );
        })}
      </div>

      {/* The reference's pill toolbar: the full name and, below it, three
          short facts about whichever card is up front — что даёт / кому /
          почему сейчас. Раньше здесь стояла одна строка описания без ответа
          на "кому" и "почему сейчас", и карточка читалась как список
          инструментов без объяснения, зачем конкретно этот нужен именно
          сейчас — Егор попросил разложить это тезисами, а не абзацем.

          A *fixed* height, not a min-height. The eleven titles and facts run
          different lengths, so at this width they set to a different number
          of lines from one card to the next. Under `min-h` the block was
          free to grow past it, and because this whole chapter is centred
          against the copy column beside it (`lg:items-center` in AiPitch),
          every extra line re-centred the entire row — the heading beside it
          visibly shifted on a swap. A hard height means the tallest entry
          defines the box once and nothing below or beside it ever moves
          again. */}
      {/* The "Открыть" button used to live here, in its own pill beside the
          title. Moved onto the card itself (see isFront branch above) per
          Егор's ask — this row is text-only again, same as before that
          button existed. */}
      {/* Окошко — тот же `.glass-panel`, что несут шапки блоков на страницах
          направлений (SectionHead), плюс статичная (без пульса — рядом уже
          дышит эмбиент-свечение самого дека, вторая анимация спорила бы с
          ней) кайма в emerald дека. Раньше факты лежали прямо на фоне
          страницы и читались тише самого дека — теперь у них своя рамка и
          свой свет, а тезисы набраны белым, а не приглушённым paper/70. */}
      {panelTarget ? createPortal(panel, panelTarget) : panel}
    </div>
  );
}
