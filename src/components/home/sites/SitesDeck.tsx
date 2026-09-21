"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import FanFit from "@/components/ui/FanFit";
import { blurAt, fanSlots, modIndex, poseAt, useDeckDrag, wrapOffset } from "@/components/ui/deckFan";
import { sitesFormatPages } from "@/components/home/direction/sitesFormatRegistry";
import SpotlightScene from "@/components/home/ai/SpotlightScene";
import SpotlightCopy from "@/components/home/ai/SpotlightCopy";
import { spotlightFor } from "@/components/home/ai/spotlightData";
import { SITES_ACCENT, SITE_SPOTLIGHT_PREFIX } from "@/components/home/ai/spotlightSites";

// Cyan — the site-wide `glow` accent /sites already uses for hover states
// (ROUND below). See .deck-card-glow in globals.css for the hand-off.
const CARD_GLOW_STYLE = { "--card-glow-rgb": "0, 210, 255" } as CSSProperties;
// "Хит месяца" — same pink→orange ramp AiDeck's flagship pick uses
// (#ff4fd8→#ff6a3d), so the whole site shares one "featured" colour
// language instead of inventing a second one here.
const CARD_GLOW_STYLE_HIT = { "--card-glow-rgb": "255, 106, 61" } as CSSProperties;

// The service carousel on /sites' chapter 01.
//
// First build stacked the cards into depth ("tunnel"): the active card square
// to the viewer and the rest stepping back up-and-right. Egor replaced that
// brief with the one this file now implements — the reference is the fanned
// card rail (the Russia/VR shot): cards laid out *horizontally*, the centre
// one large and upright, its neighbours falling away to the left and to the
// right, and paging that runs both directions through the categories.
//
// The fan is built from flat transforms (translate + scale) rather than a
// real `rotateY`. A 3D-rotated backdrop-blur panel forces its own compositing
// layer over the reel playing underneath and the whole stage stutters on
// every swap; at these angles the flat version is indistinguishable and stays
// cheap.
//
// Every card carries its name and button over the artwork; the description
// lives in the panel underneath (SpotlightCopy), the same block /ai's deck
// uses, so the cards stay pictures rather than five competing spec sheets.

type Service = {
  id: string;
  name: string;
  /** "Хит месяца" — Egor's flagship pick, same badge/glow language as
   *  AiDeck's own hit card. */
  hit?: boolean;
  /** Themed backdrop photo behind the card's scene. One distinct image per
   *  format; the same frame the format's spotlight window wears
   *  (spotlightSites.ts), so the card and its window read as one object. */
  image: string;
};

// Names match lib/service-content.ts (the offer list and pricing tiers); the
// descriptions come from spotlightSites.ts.
const SERVICES: Service[] = [
  {
    id: "landing",
    name: "Лендинг",
    hit: true,
    image: "/images/stock/desk-aerial.webp",
  },
  {
    id: "card",
    name: "Сайт-визитка",
    image: "/images/stock/design-tablet.webp",
  },
  {
    id: "turnkey",
    name: "Сайт под ключ",
    image: "/images/stock/team-night-office.webp",
  },
  {
    id: "assistant",
    name: "AI-ассистент",
    image: "/images/stock/holo-keyboard.webp",
  },
  {
    id: "redesign",
    name: "Редизайн",
    image: "/images/stock/paint-purple-macro.webp",
  },
];

// Лицо карточки: тот же приём, что у AiDeck (AiCardFace) — кадр-подложка,
// скрим и живая сцена формата (SpotlightScene), а не отдельная CSS-схема.
// Сцена — та же, что рисуется в окошках под блоками страницы, поэтому карточка,
// панель под каруселью и окошка говорят одним языком.
//
// Сцену крутит только передняя карточка (`step` меняется вместе с текстом
// панели под каруселью); боковые стоят на первой сцене — их не читают, а
// пять одновременных анимаций тяжелы и шумны.
function SitesCardFace({ id, image, step }: { id: string; image: string; step: number }) {
  return (
    <div
      className="absolute inset-0 bg-[linear-gradient(160deg,#1b2030_0%,#0d0f16_58%,#0a0b10_100%)]"
      style={{ "--sp-from": SITES_ACCENT.from, "--sp-to": SITES_ACCENT.to } as CSSProperties}
    >
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
            "linear-gradient(165deg, rgba(16,18,30,0.62) 0%, rgba(10,11,16,0.72) 55%, rgba(10,11,16,0.8) 100%)",
        }}
      />
      <span className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-[#ff4fd8]/20 blur-2xl" />
      {/* Сцена лежит над областью названия и не заходит в неё: подпись
          занимает нижние ~40% карточки (правило Егора — графика не нависает
          над названием формата). */}
      <div className="absolute inset-x-2 top-5 h-[50%]">
        <SpotlightScene slug={`${SITE_SPOTLIGHT_PREFIX}${id}`} step={step} card />
      </div>
    </div>
  );
}

// One entry per signed distance from the centre card. Anything further out
// than ±2 is not drawn — a sixth card would sit past the container's edge and
// only ever be a sliver.
// Egor's call: the front card grows ~20% (1 → 1.2), the immediate
// neighbours shrink a little from before (0.85 → 0.76) rather than staying
// put, and the outer pair shrink further still (0.7 → 0.56) — so depth
// reads as one continuous step rather than "big card, then two flat sizes".
const FAN: Record<number, { x: number; y: number; scale: number; opacity: number; veil: number; z: number }> = {
  [-2]: { x: -280, y: 38, scale: 0.56, opacity: 0.92, veil: 0.74, z: 10 },
  [-1]: { x: -170, y: 16, scale: 0.74, opacity: 1, veil: 0.5, z: 20 },
  [0]: { x: 0, y: -10, scale: 1.16, opacity: 1, veil: 0, z: 30 },
  [1]: { x: 170, y: 16, scale: 0.74, opacity: 1, veil: 0.5, z: 20 },
  [2]: { x: 280, y: 38, scale: 0.56, opacity: 0.92, veil: 0.74, z: 10 },
  // Only ever reached mid-drag, and already faded out by then (see poseAt's
  // `fade`): it exists so a card leaving the fan has a pose to travel
  // towards instead of stopping dead at ±2.
  [-3]: { x: -365, y: 56, scale: 0.44, opacity: 0.8, veil: 0.82, z: 5 },
  [3]: { x: 365, y: 56, scale: 0.44, opacity: 0.8, veil: 0.82, z: 5 },
};

// Design-pixel distance between two neighbouring cards — how far the hand
// travels to move the deck by one card.
const SPACING = 170;

// Как часто сменяется тезис под каруселью — то же значение, что у AiDeck.
const DECK_BEAT_MS = 4200;

// Split in two on purpose. `backdrop-filter` is the single most expensive
// thing a card can carry through a transform animation: the browser has to
// re-sample everything behind the card on every frame, and five of them
// sliding at once is what made paging stutter. Only the front card — the one
// actually read as glass — keeps it; the four behind it get a flat tint,
// which at their size and dimming is indistinguishable.
const CARD_SHELL =
  "rounded-[20px] bg-white/[0.055] shadow-[0_28px_70px_-24px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.16)]";
const CARD_SHELL_FRONT = `${CARD_SHELL} backdrop-blur-2xl backdrop-saturate-150`;

// The chapter's button language, matching the minimalism of the references
// Egor picked: a flat gradient pill in the mono face, no bevel. Deliberately
// not the site-wide .btn-neon.btn-3d "physical key" — that treatment is what
// he flagged as unfinished here, since a pressed-key button fights the flat
// glass everything else in this chapter is made of.
export const PILL =
  "inline-flex items-center gap-2.5 whitespace-nowrap rounded-full bg-gradient-to-b from-[#ff8a5f] to-[#f0512a] px-7 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.16em] text-[#1a0a04] shadow-[0_12px_30px_-8px_rgba(255,106,61,0.7)] transition-[filter,transform] duration-300 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow";

export const ROUND =
  "grid h-11 w-11 shrink-0 place-items-center rounded-full border border-paper/25 bg-white/[0.06] text-paper/85 backdrop-blur-md transition-colors duration-300 hover:border-glow/60 hover:text-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow";

export default function SitesDeck({ panelTarget }: { panelTarget?: HTMLElement | null } = {}) {
  const wide = !!panelTarget;
  const [active, setActive] = useState(0);
  const count = SERVICES.length;

  // `active` counts without wrapping — see fanSlots for why the ring has to
  // be continuous. The chosen card is this folded back into 0..count-1.
  const step = useCallback((delta: number) => setActive((prev) => prev + delta), []);
  const idx = modIndex(active, count);
  // Jumping straight to a card (a dot, or a side card being clicked) goes
  // the SHORT way round from wherever the counter currently stands.
  const goTo = useCallback(
    (target: number) =>
      setActive((prev) => prev + wrapOffset(target - modIndex(prev, count), count)),
    [count],
  );

  const { drag, dragging, bind } = useDeckDrag({ count, spacing: SPACING, onSettle: step });

  // Номер сцены/тезиса передней карточки — общий для картинки на карточке и
  // текста в панели под каруселью (тот же приём, что в AiDeck): графика и
  // слова меняются строго вместе. На новой карточке всегда начинается с
  // первой сцены.
  const [sceneStep, setSceneStep] = useState(0);
  const [held, setHeld] = useState(false);
  const data = spotlightFor(`${SITE_SPOTLIGHT_PREFIX}${SERVICES[idx].id}`);
  const beats = data?.benefits.length ?? 0;

  // Сброс при смене карточки прямо во время рендера (приём React для
  // состояния, производного от пропса): эффект дал бы один кадр со старым
  // номером сцены на новой карточке.
  const [stepFor, setStepFor] = useState(idx);
  if (stepFor !== idx) {
    setStepFor(idx);
    setSceneStep(0);
  }

  // Темп как на /ai (4.2с) — Егор просил одну механику на всех страницах.
  // Пауза, пока курсор над панелью: тезис можно дочитать до смены.
  useEffect(() => {
    if (held || beats < 2) return;
    const id = window.setInterval(() => setSceneStep((v) => (v + 1) % beats), DECK_BEAT_MS);
    return () => window.clearInterval(id);
  }, [held, beats, idx]);

  const panel = (
    <div
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      className={`glass-panel deck-neon-pulse flex overflow-hidden rounded-3xl px-6 py-5 ${wide ? "h-auto" : "mt-6 h-auto lg:h-[276px] lg:min-h-0"}`}
      style={
        {
          "--card-glow-rgb": "0, 210, 255",
          "--sp-from": SITES_ACCENT.from,
          "--sp-to": SITES_ACCENT.to,
        } as CSSProperties
      }
    >
      {/* Тот же правый блок, что в окошках под блоками страницы и под
          каруселью /ai — один компонент на все места, чтобы тексты и темп
          не расходились. */}
      {data && <SpotlightCopy data={data} step={sceneStep} setStep={setSceneStep} showSub={false} showTitle={false} compact />}
    </div>
  );

  return (
    <div className="w-full max-w-[560px]">
      {/* The fan. Fixed height so the chapter's layout doesn't shift as the
          description under it changes length — grown from 290 to fit the
          front card's new +20% size (240px tall × 1.2 ≈ 288px) plus its
          upward y-nudge. */}
      {/* No `onSwipe` any more: the pointer drag below replaces FanFit's
          own swipe-at-the-end gesture, and running both would page the deck
          twice for one flick. */}
      <FanFit designWidth={380} height={350}>
      <div
        className="deck-rail relative h-full"
        style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "pan-y" }}
        {...bind}
      >
        {fanSlots(count, active, drag).map(({ i, key, offset, settled }) => {
          const service = SERVICES[i];
          const pose = poseAt(FAN, offset);
          const opacity = pose.opacity * pose.fade;
          const blurPx = blurAt(offset);
          // 1 в центре, 0 на соседней позиции — непрерывно, без ступеней.
          const halo = Math.max(0, 1 - Math.abs(offset) / 1.1);

          // Keyed to the SETTLED position, not the dragged one: the
          // caption, the pill and the halo belong to the card that is
          // currently chosen, and they travel with it while the deck is
          // being pulled around instead of switching cards mid-gesture.
          const isFront = settled === 0;
          const hasPage = service.id in sitesFormatPages;

          // Егор: «когда я хватаю карточку, я не вижу ни названия, ни
          // кнопки» — название и кнопка теперь на КАЖДОЙ карточке, а не
          // только на передней, чтобы колода читалась сразу и не пустела
          // во время перетаскивания. Счётчик 01/05 остался только на
          // передней: он про колоду, а не про карточку.
          const caption = (
            <>
              <span
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
                style={{
                  background: "linear-gradient(180deg, rgba(11,11,16,0) 0%, rgba(11,11,16,0.92) 70%)",
                }}
              />
              <span className="absolute inset-x-4 bottom-4 flex flex-col items-start gap-2">
                <span className="block font-display text-[15px] uppercase leading-none tracking-tight text-paper">
                  {service.name}
                </span>
                {/* Same pattern as /ai's front-card pill, and the same
                    class: transparent glass with a glowing outline rather
                    than a solid colour plate — Egor's ask, the filled pill
                    was pulling more attention than the format's own name
                    above it. Smaller too (px-3 py-1.5 → px-2.5 py-1). */}
                {hasPage && (
                  <span
                    className={`deck-open-pill inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[7px] font-semibold uppercase tracking-[0.12em] motion-reduce:animate-none ${
                      isFront ? "" : "deck-open-pill-still"
                    }`}
                    style={{ "--pill-rgb": service.hit ? "255, 138, 92" : "79, 224, 255" } as CSSProperties}
                  >
                    Подробнее
                    <span aria-hidden="true">→</span>
                  </span>
                )}
              </span>
            </>
          );

          const counter = (
            <span className="absolute right-3 top-3 rounded-full bg-ink/70 px-2 py-1 font-display text-[9px] tracking-[0.12em] text-paper/70 backdrop-blur-md">
              {String(idx + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
          );

          // The position/transition live on a stable outer <div> that never
          // changes element type — see the matching comment in SmmDeck for
          // why: a <button> and a <Link> are different tags, so a transform
          // sitting directly on whichever one renders would make the card
          // snap instead of slide every time it swaps between them.
          return (
            <div
              key={key}
              // Only transform and opacity animate. `transition-all` also
              // animated the per-card `filter: blur()` that used to sit
              // here, and a blur filter re-runs on every frame for every
              // card — the depth it bought is now carried by the dark veil
              // inside the card instead, which costs nothing to move.
              className={`deck-pose ${blurPx > 0 ? "deck-pose-blur" : ""} absolute left-1/2 top-1/2 h-[272px] w-[212px] ease-[cubic-bezier(0.45,0.05,0.2,1)] motion-reduce:transition-none ${
                // While the hand holds the deck the cards must track it on
                // the same frame — a transition here would make them lag
                // behind the finger by half a second.
                dragging ? "transition-[filter] duration-[760ms]" : "transition-[transform,opacity,filter] duration-[760ms]"
              }`}
              style={{
                ["--deck-blur" as string]: `${blurPx}px`,
                zIndex: Math.round(pose.z),
                opacity,
                // NOT `visibility: hidden` at zero opacity: that is applied
                // from the TARGET value, so it hid the card on the first
                // frame of the step and the fade never got to play — the
                // outermost cards looked like they switched off. An
                // opacity-0 layer costs nothing to leave in place; it only
                // has to stop swallowing clicks.
                pointerEvents: opacity < 0.05 ? "none" : undefined,
                transform: `translate(-50%, -50%) translate(${pose.x}px, ${pose.y}px) scale(${pose.scale})`,
                willChange: "transform, opacity",
              }}
            >
              {/* The front card's light. A fixed-size radial behind the card
                  rather than a growing box-shadow on it: the lit area never
                  changes size, so it cannot creep over the cards beside it,
                  and only its opacity breathes — one compositor channel, no
                  repaint. */}
              {/* Свет карточки. Живёт на КАЖДОЙ карточке, а сила — от
                  расстояния до центра, поэтому при перелистывании и при
                  перетаскивании рукой он плавно перетекает с одной карточки
                  на другую, а не включается и выключается рывком. */}
              <span
                aria-hidden="true"
                className={`deck-halo-fade pointer-events-none absolute -inset-4 -z-10 ${
                  dragging ? "" : "transition-opacity duration-[760ms] ease-[cubic-bezier(0.45,0.05,0.2,1)]"
                }`}
                style={{ opacity: halo }}
              >
                <span
                  className="deck-halo absolute inset-0 rounded-[28px]"
                  style={{ "--card-glow-rgb": service.hit ? "255, 106, 61" : "0, 210, 255" } as CSSProperties}
                />
              </span>
              {/* "Хит месяца" — same badge language as AiDeck's own flagship
                  card (.promo-card-badge-lift: pink→orange shimmer + blink
                  glow), shown at every distance from centre so the card
                  reads as lit while scrolling past it too, not only once
                  front. */}
              {service.hit && (
                <span
                  className="promo-card-badge-lift pointer-events-none absolute -top-2.5 left-3 z-20 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[8px] uppercase tracking-[0.14em] text-white"
                  aria-hidden="true"
                >
                  <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-white" />
                  Хит месяца
                </span>
              )}

              {/* Same mechanic as SmmDeck/AiDeck: once a format is front AND
                  has its own page, the whole card becomes the link to it,
                  with the cyan hover glow — pink→orange instead for the hit
                  card, same ramp as the badge above. Off-centre cards stay
                  <button>s that page the carousel — click once to bring a
                  card to front, click again (now that it fills this wrapper
                  as the Link) to open its page. */}
              {isFront && hasPage ? (
                <Link
                  href={`/sites/${service.id}`}
                  aria-current="true"
                  className={`deck-card-glow absolute inset-0 overflow-hidden text-left ${CARD_SHELL_FRONT}`}
                  style={service.hit ? CARD_GLOW_STYLE_HIT : CARD_GLOW_STYLE}
                >
                  <SitesCardFace id={service.id} image={service.image} step={sceneStep} />
                  {caption}
                  {counter}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  tabIndex={isFront ? -1 : 0}
                  aria-label={`Показать: ${service.name}`}
                  aria-current={isFront ? "true" : undefined}
                  className={`absolute inset-0 overflow-hidden text-left ${
                    isFront ? `${CARD_SHELL_FRONT} cursor-default` : `${CARD_SHELL} cursor-pointer`
                  }`}
                >
                  <SitesCardFace id={service.id} image={service.image} step={isFront ? sceneStep : 0} />
                  {caption}
                  {isFront && counter}
                </button>
              )}
              {/* Затемнение глубины — один слой на карточку, который
                  ВСЕГДА на месте, а меняется только его прозрачность.
                  Раньше он монтировался в момент, когда карточка переставала
                  быть передней, сразу на полную силу — и это читалось как
                  «первое окошко резко исчезает». Теперь он просто плавно
                  набирает и отдаёт плотность вместе с движением. */}
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 z-10 rounded-[20px] bg-[#08090e] ${
                  dragging ? "" : "transition-opacity duration-[760ms] ease-[cubic-bezier(0.45,0.05,0.2,1)]"
                }`}
                style={{ opacity: pose.veil }}
              />
            </div>
          );
        })}

        {/* Paging, both directions — the thing Egor asked for. Sits over the
            outermost cards at the container's edges, the way the reference
            puts its own back-arrow over the rail. */}
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Предыдущая услуга"
          className={`absolute left-0 top-1/2 z-40 -translate-y-1/2 ${ROUND}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Следующая услуга"
          className={`absolute right-0 top-1/2 z-40 -translate-y-1/2 ${ROUND}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      </FanFit>

      {/* The lit track: one node per category, the active one flaring the
          same orange as the chapter rail down the left edge. The rail
          navigates chapters, this navigates services — they look alike on
          purpose but never share state. */}
      <div className="relative mx-auto mt-5 flex max-w-[340px] items-center justify-between">
        <span
          className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,106,61,0) 0%, rgba(255,106,61,0.45) 10%, rgba(255,106,61,0.45) 90%, rgba(255,106,61,0) 100%)",
          }}
        />
        {SERVICES.map((service, i) => {
          const on = i === idx;
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={service.name}
              aria-current={on ? "true" : undefined}
              className="relative grid h-8 w-8 place-items-center rounded-full border bg-ink font-display text-[9px] transition-all duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow motion-reduce:transition-none"
              style={{
                borderColor: on ? "#ff6a3d" : "rgba(255,106,61,0.28)",
                color: on ? "#ffd0bd" : "rgba(220,221,239,0.45)",
                boxShadow: on
                  ? "0 0 12px rgba(255,106,61,0.95), 0 0 34px rgba(255,106,61,0.5), inset 0 0 10px rgba(255,106,61,0.3)"
                  : "none",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </button>
          );
        })}
      </div>

      {/* Окошко под деком — тот же приём, что и на /ai (AiDeck.tsx): стекло
          .glass-panel со статичной каймой в акценте страницы (циан, а не
          изумруд /ai — Егор попросил цвет свой на каждой странице, а не
          общий), три факта белым текстом вместо одной приглушённой строки.
          Название формата и цена/срок остаются над фактами — это то, что
          раньше жило в отдельной строке "Срок · …" под описанием. No
          button of its own — the chapter's single "Обсудить проект" lives
          in the copy column beside the fan, and a second copy of it here
          read as the same offer made twice. */}
      {panelTarget ? createPortal(panel, panelTarget) : panel}
    </div>
  );
}
