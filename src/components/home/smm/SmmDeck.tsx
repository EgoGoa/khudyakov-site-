"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import FanFit from "@/components/ui/FanFit";
import { blurAt, fanSlots, modIndex, poseAt, useDeckDrag, wrapOffset, useDeckSpring, zFor } from "@/components/ui/deckFan";
import { smmFormatPages } from "@/components/home/direction/smmFormatRegistry";
import SpotlightScene from "@/components/home/ai/SpotlightScene";
import SpotlightCopy from "@/components/home/ai/SpotlightCopy";
import { spotlightFor } from "@/components/home/ai/spotlightData";
import { SMM_ACCENT, SMM_SPOTLIGHT_PREFIX } from "@/components/home/ai/spotlightSmm";

// Violet, this page's own accent — see .deck-card-glow in globals.css for
// how this hands off to the hover glow.
const CARD_GLOW_STYLE = { "--card-glow-rgb": "168, 85, 247" } as CSSProperties;

// The format carousel on /smm's chapter 01 — the same fanned card rail
// SitesDeck works out in detail (see that file for why the fan is built from
// flat translate+scale transforms rather than a real `rotateY`: a 3D-rotated
// backdrop-blur panel forces its own compositing layer over the reel playing
// underneath and the whole stage stutters on every swap).
//
// What differs here is the card itself. /sites fans browser windows, so its
// cards are landscape; /smm sells vertical video, so these are 9:16 phone
// frames — narrower and taller, with the fan's x-offsets pulled in to match
// the smaller width. The artwork is drawn in CSS rather than shipped as
// images: zero bytes, always on palette, and at card size it reads as the
// format. Swap for real screenshots later by replacing FormatThumb alone.

type Format = {
  id: string;
  name: string;
  blurb: string;
  meta: string;
  /** Кому подходит формат — второй факт в окошке под деком. */
  audience: string;
  /** Почему это актуально сейчас, а не «когда-нибудь» — третий факт там же. */
  now: string;
  /** Which phone-screen mockup to draw inside the card — see FormatThumb. */
  shape: "reels" | "stories" | "carousel" | "ads" | "bloggers";
  /** Themed backdrop photo, held at low exposure behind the mockup — same
   *  treatment as AiThumb (/ai) and SiteThumb (/sites). Each is the same
   *  image that format's own page (smm-*.tsx) already opens on, so the
   *  card previews the page it links to. */
  image: string;
};

// Wording taken from lib/service-content.ts (servicesByCategory.smm) rather
// than rewritten here, so the carousel can't drift from what chapter 03 says
// a few screens later.
const FORMATS: Format[] = [
  {
    id: "reels",
    name: "Reels",
    blurb: "Вертикальные ролики снимаем и монтируем сами — те же операторы, что снимают рекламу.",
    meta: "8–12 роликов в месяц",
    audience: "Брендам, у которых охваты в ленте просели, а в Reels ещё нет.",
    now: "Площадка отдаёт органический охват бесплатно, пока в него не зашли все конкуренты.",
    shape: "reels",
    image: "/images/stock/smm-phone-bokeh.webp",
  },
  {
    id: "stories",
    name: "Сторис",
    blurb: "Ежедневная лента историй: анонсы, закулисье, опросы — держит аккаунт живым между роликами.",
    meta: "каждый рабочий день",
    audience: "Аккаунтам, где подписчики есть, а вовлечённость между постами проседает.",
    now: "Без ежедневного присутствия алгоритм и аудитория забывают об аккаунте за неделю.",
    shape: "stories",
    image: "/images/stock/night-lights.webp",
  },
  {
    id: "carousel",
    name: "Карусели",
    blurb: "Посты-объяснения на несколько экранов — то, что аудитория сохраняет и пересылает.",
    meta: "4–8 постов в месяц",
    audience: "Экспертам и брендам, которым есть что объяснить, а не только показать.",
    now: "Формат, который сохраняют и пересылают, приносит охват без рекламного бюджета.",
    shape: "carousel",
    image: "/images/stock/dj-neon.webp",
  },
  {
    id: "ads",
    name: "Таргет",
    blurb: "Настройка, тесты креативов и оптимизация бюджета — реклама на том же контенте, что ведём.",
    meta: "тесты каждую неделю",
    audience: "Брендам, которым органики уже недостаточно и нужен управляемый приток лидов.",
    now: "Каждая неделя без тестов — упущенные данные о том, какой креатив реально продаёт.",
    shape: "ads",
    image: "/images/stock/brain-circuit.webp",
  },
  {
    id: "bloggers",
    name: "Блогеры",
    blurb: "Подбор блогеров под аудиторию и бюджет, согласование интеграций, замер результата.",
    meta: "в пакете Full-service",
    audience: "Брендам, которым нужно доверие чужой аудитории, а не ещё один свой пост.",
    now: "Своя аудитория уже видела бренд — блогер приносит тех, кто о нём ещё не слышал.",
    shape: "bloggers",
    image: "/images/stock/vr-neon-triangle.webp",
  },
];

// Лицо карточки: тот же приём, что у AiDeck и SitesDeck — кадр-подложка,
// скрим и живая сцена формата (SpotlightScene), а не отдельная CSS-схема.
// Раньше здесь была нарисованная в CSS имитация телефонного экрана
// (FormatThumb) — статичная и никак не связанная с окошком под деком; Егор
// попросил тот же приём, что уже стоит на /ai и /sites: карточка, панель под
// каруселью и окошки в главах говорят одной графикой из spotlightSmm.ts.
//
// Сцену крутит только передняя карточка (`step` меняется вместе с текстом
// панели под каруселью); боковые стоят на первой сцене.
function SmmCardFace({ id, image, step }: { id: string; image: string; step: number }) {
  return (
    <div
      className="absolute inset-0 bg-[linear-gradient(160deg,#241a35_0%,#120f1c_58%,#0a0910_100%)]"
      style={{ "--sp-from": SMM_ACCENT.from, "--sp-to": SMM_ACCENT.to } as CSSProperties}
    >
      <img
        src={image}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.85] [filter:grayscale(0.25)_contrast(1.05)_saturate(1.1)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(170deg, rgba(23,16,38,0.55) 0%, rgba(12,11,20,0.66) 55%, rgba(12,11,20,0.78) 100%)",
        }}
      />
      <span className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-[#a855f7]/20 blur-2xl" />

      {/* Stories-style progress strip along the top — the one cue every
          vertical-video surface shares, so it reads as "phone" instantly. */}
      <div className="relative flex gap-1 px-2.5 pt-2.5">
        <span className="h-[3px] flex-1 rounded-full bg-paper/55" />
        <span className="h-[3px] flex-1 rounded-full bg-paper/18" />
        <span className="h-[3px] flex-1 rounded-full bg-paper/18" />
      </div>

      {/* Сцена растянута почти до подписи — тот же фикс, что на SitesDeck:
          раньше графика занимала меньше половины карточки и терялась на
          фоне пустого затемнённого низа. Градиент подписи ниже сам гасит
          нижний край сцены. */}
      <div className="absolute inset-x-1.5 top-8 bottom-14">
        <SpotlightScene slug={`${SMM_SPOTLIGHT_PREFIX}${id}`} step={step} card />
      </div>
    </div>
  );
}

// One entry per signed distance from the centre card. Nothing beyond ±2 is
// drawn — a sixth card would sit past the container's edge and only ever be a
// sliver. Egor's call: the front card grows 30% (1 → 1.3), the immediate
// neighbours shrink a bit further than before (0.85 → 0.74), and the outer
// pair shrink further still (0.7 → 0.54) — one continuous depth step rather
// than "big card, then two flat sizes".
const FAN: Record<number, { x: number; y: number; scale: number; opacity: number; veil: number; z: number }> = {
  // Apple-style (обложки Apple Music): соседи прячутся ЗА передней карточкой
  // и выглядывают узкой полосой, все на одной линии, без лесенки. Крайняя
  // точка любой карточки ≤ половины designWidth (147px), поэтому ни одна не
  // срезается краем экрана — раньше ±2 уезжали за край и рвали подписи.
  [-2]: { x: -104, y: 0, scale: 0.6, opacity: 0.45, veil: 0.8, z: 10 },
  [-1]: { x: -84, y: 0, scale: 0.78, opacity: 1, veil: 0.6, z: 20 },
  [0]: { x: 0, y: 0, scale: 1.12, opacity: 1, veil: 0, z: 30 },
  [1]: { x: 84, y: 0, scale: 0.78, opacity: 1, veil: 0.6, z: 20 },
  [2]: { x: 104, y: 0, scale: 0.6, opacity: 0.45, veil: 0.8, z: 10 },
  // Mid-drag only, and faded out by the time a card gets here.
  [-3]: { x: -116, y: 0, scale: 0.5, opacity: 0, veil: 0.9, z: 5 },
  [3]: { x: 116, y: 0, scale: 0.5, opacity: 0, veil: 0.9, z: 5 },
};

// Hand travel that moves the deck by exactly one card.
const SPACING = 84;

// Темп смены тезиса под каруселью — тот же, что на /ai и /sites (Егор
// попросил одну механику на всех страницах).
const DECK_BEAT_MS = 4200;

// Front card only keeps the backdrop blur — see the same split in
// SitesDeck for why five animated backdrop-filters is what stuttered.
const CARD_SHELL =
  "rounded-[20px] bg-white/[0.055] shadow-[0_28px_70px_-24px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.16)]";
const CARD_SHELL_FRONT = `${CARD_SHELL} backdrop-blur-2xl backdrop-saturate-150`;

// The page's button language: the flat gradient pill plus a glass
// circle-arrow, deliberately not the site-wide `.btn-neon.btn-3d` pressed key,
// which fights the flat glass every panel on this page is made of.
//
// The pill runs the brand ORANGE, borrowed verbatim from /sites, not this
// page's own violet. Both were built and Egor picked the orange on sight: on
// a night reel graded in purple and cold blue, a violet button sits *inside*
// the picture and stops reading as a control, while the warm pill is the one
// element on screen the footage has no colour for — so it reads as the thing
// to press. The violet stays where it belongs, on the heading keywords, the
// chapter numbers and the rail, which are type rather than controls.
export const PILL =
  "inline-flex items-center gap-2.5 whitespace-nowrap rounded-full bg-gradient-to-b from-[#ff8a5f] to-[#f0512a] px-7 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.16em] text-[#1a0a04] shadow-[0_12px_30px_-8px_rgba(255,106,61,0.7)] transition-[filter,transform] duration-300 hover:brightness-110 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange";

export const ROUND =
  "grid h-11 w-11 shrink-0 place-items-center rounded-full border border-paper/25 bg-white/[0.06] text-paper/85 backdrop-blur-md transition-[color,border-color,transform] duration-300 hover:scale-110 hover:border-orange/60 hover:text-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange";

export default function SmmDeck({ panelTarget }: { panelTarget?: HTMLElement | null } = {}) {
  const wide = !!panelTarget;
  const [active, setActive] = useState(0);
  const count = FORMATS.length;

  // Unwrapped counter — fanSlots explains why the ring must stay
  // continuous; `idx` is it folded back into 0..count-1.
  const step = useCallback((delta: number) => setActive((prev) => prev + delta), []);
  const idx = modIndex(active, count);
  const goTo = useCallback(
    (target: number) =>
      setActive((prev) => prev + wrapOffset(target - modIndex(prev, count), count)),
    [count],
  );

  const { drag, dragging, bind } = useDeckDrag({ count, spacing: SPACING, onSettle: step });
  // Пружина вместо CSS-перехода: см. useDeckSpring в deckFan.
  const { lag, moving } = useDeckSpring(active, drag, dragging);
  const live = dragging || moving;

  // Номер сцены/тезиса передней карточки — общий для картинки на карточке и
  // текста в панели под каруселью (тот же приём, что в AiDeck/SitesDeck):
  // графика и слова меняются строго вместе. На новой карточке всегда
  // начинается с первой сцены.
  const [sceneStep, setSceneStep] = useState(0);
  const [held, setHeld] = useState(false);
  const data = spotlightFor(`${SMM_SPOTLIGHT_PREFIX}${FORMATS[idx].id}`);
  const beats = data?.benefits.length ?? 0;

  // Сброс при смене карточки прямо во время рендера (React-приём для
  // состояния, производного от пропса) — эффект дал бы один кадр со старым
  // номером сцены на новой карточке.
  const [stepFor, setStepFor] = useState(idx);
  if (stepFor !== idx) {
    setStepFor(idx);
    setSceneStep(0);
  }

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
      className={`glass-panel deck-neon-pulse flex overflow-hidden rounded-3xl px-6 py-5 ${wide ? "h-auto" : "mt-6 h-auto lg:h-[210px] lg:min-h-0"}`}
      style={
        {
          "--card-glow-rgb": "168, 85, 247",
          "--sp-from": SMM_ACCENT.from,
          "--sp-to": SMM_ACCENT.to,
        } as CSSProperties
      }
    >
      {/* Тот же правый блок, что в окошках под блоками страницы и под
          каруселью /ai и /sites — один компонент на все места, чтобы
          тексты и темп не расходились. Динамическая панель: содержимое
          меняется вслед за выбранной карточкой колоды. */}
      {data && <SpotlightCopy data={data} step={sceneStep} setStep={setSceneStep} showSub={false} showTitle={false} compact />}
    </div>
  );

  return (
    <div className="w-full max-w-[560px]">
      {/* Fixed height so the chapter's layout doesn't shift as the description
          under it changes length — grown from 300 to fit the front card's
          new +30% size (250px tall × 1.3 = 325px) plus its upward y-nudge. */}
      {/* Paging by pointer drag (useDeckDrag) instead of FanFit's own
          swipe, so a flick isn't counted twice. */}
      <FanFit designWidth={295} height={310}>
      <div
        className="deck-rail relative h-full"
        style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "pan-y" }}
        {...bind}
      >
        {fanSlots(count, active, drag + lag).map(({ i, key, offset, settled }) => {
          const format = FORMATS[i];
          const pose = poseAt(FAN, offset);
          const opacity = pose.opacity * pose.fade;
          const blurPx = blurAt(offset);
          // 1 в центре, 0 на соседней позиции — непрерывно, без ступеней.
          const halo = Math.max(0, 1 - Math.abs(offset) / 1.1);

          // Settled position, not the dragged one — caption and halo stay
          // with the chosen card while the deck is pulled around.
          const isFront = settled === 0;
          const hasPage = format.id in smmFormatPages;

          // Подпись видна у передней карточки и проявляется у той, что едет
          // к центру (в том числе под пальцем) — у выглядывающих соседей её
          // нет, иначе из-за передней торчат обрубки слов («БЛОГЕ», «ИС»).
          const captionOpacity = Math.max(0, 1 - Math.abs(offset) / 0.7);

          const caption = (
            <span
              className={`pointer-events-none absolute inset-0 ${
                live ? "" : "transition-opacity duration-[760ms] ease-[cubic-bezier(0.45,0.05,0.2,1)]"
              }`}
              style={{ opacity: captionOpacity }}
            >
              <span
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
                style={{
                  background: "linear-gradient(180deg, rgba(11,11,16,0) 0%, rgba(11,11,16,0.92) 70%)",
                }}
              />
              <span className="absolute inset-x-3.5 bottom-4 flex flex-col items-start gap-2">
                <span className="block font-display text-[15px] uppercase leading-none tracking-tight text-paper">
                  {format.name}
                </span>
                <span className="block font-display text-[9px] uppercase tracking-[0.12em] text-[#c4a0ff]">
                  {format.meta}
                </span>
                {/* Same pattern as /ai and /sites: a small, pulsing pill
                    living on the card itself instead of a separate button
                    below the deck. */}
                {hasPage && (
                  <span
                    className={`deck-open-pill inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[7px] font-semibold uppercase tracking-[0.12em] motion-reduce:animate-none ${
                      isFront ? "" : "deck-open-pill-still"
                    }`}
                    style={{ "--pill-rgb": "192, 132, 252" } as CSSProperties}
                  >
                    Подробнее
                    <span aria-hidden="true">→</span>
                  </span>
                )}
              </span>
            </span>
          );

          // Deck counter, front card only — it counts the deck, not the
          // card. The caption above is on every card now (Egor: название и
          // кнопка должны быть видны всегда, и во время перетаскивания).
          const counter = (
            <span style={{ opacity: captionOpacity }} className="absolute right-2.5 top-3 rounded-full bg-ink/70 px-2 py-1 font-display text-[9px] tracking-[0.12em] text-paper/70 backdrop-blur-md">
              {String(idx + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
          );

          // The position/transition live on a stable outer <div> that never
          // changes element type — only its child (Link vs button) swaps
          // when a card becomes front-with-a-page. Same fix as AiDeck's own
          // wrapper: a <button> and a <Link> are different tags, so if the
          // TRANSFORM sat directly on whichever one was rendered, bringing a
          // card to front would unmount the button and mount a fresh Link
          // already sitting at its final position — no transition to
          // animate, the card just snaps instead of sliding in. Wrapping
          // keeps the transform on one element that's always present, so the
          // fan animation stays smooth regardless of which control fills it.
          return (
            <div
              key={key}
              className={`deck-pose ${blurPx > 0 ? "deck-pose-blur" : ""} absolute left-1/2 top-1/2 h-[250px] w-[150px] ease-[cubic-bezier(0.45,0.05,0.2,1)] motion-reduce:transition-none ${
                live ? "transition-[filter] duration-[420ms]" : "transition-[transform,opacity,filter] duration-[760ms]"
              }`}
              style={{
                ["--deck-blur" as string]: `${blurPx}px`,
                zIndex: zFor(offset),
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
              {/* Fixed-size breathing light behind the front card — see the
                  twin in SitesDeck: it replaces the box-shadow that used to
                  swell over the neighbouring cards. */}
              {/* Свет карточки. Живёт на КАЖДОЙ карточке, а сила — от
                  расстояния до центра, поэтому при перелистывании и при
                  перетаскивании рукой он плавно перетекает с одной карточки
                  на другую, а не включается и выключается рывком. */}
              <span
                aria-hidden="true"
                className={`deck-halo-fade pointer-events-none absolute -inset-4 -z-10 ${
                  live ? "" : "transition-opacity duration-[760ms] ease-[cubic-bezier(0.45,0.05,0.2,1)]"
                }`}
                style={{ opacity: halo }}
              >
                <span
                  className="deck-halo absolute inset-0 rounded-[28px]"
                  style={{ "--card-glow-rgb": "168, 85, 247" } as CSSProperties}
                />
              </span>
              {/* Once a format is front AND has its own page, the whole
                  card becomes the link to it — Egor's ask: click anywhere
                  on the selected card (bar the dedicated buttons elsewhere
                  on the page) and it opens the format's page, with a hover
                  glow so the card reads as one big button rather than a
                  picture. Off-centre cards stay <button>s that page the
                  carousel; a card the visitor just brought to front by
                  clicking it fills this same wrapper with the Link on the
                  very next render, so "first click selects, second click
                  opens" falls out of the existing active/front state rather
                  than needing its own click-count tracking. */}
              {isFront && hasPage ? (
                <Link
                  href={`/smm/${format.id}`}
                  aria-current="true"
                  className={`deck-card-glow absolute inset-0 overflow-hidden text-left ${CARD_SHELL_FRONT}`}
                  style={CARD_GLOW_STYLE}
                >
                  <SmmCardFace id={format.id} image={format.image} step={sceneStep} />
                  {caption}
                  {counter}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  tabIndex={isFront ? -1 : 0}
                  aria-label={`Показать формат: ${format.name}`}
                  aria-current={isFront ? "true" : undefined}
                  className={`absolute inset-0 overflow-hidden text-left ${
                    isFront ? `${CARD_SHELL_FRONT} cursor-default` : `${CARD_SHELL} cursor-pointer`
                  }`}
                >
                  <SmmCardFace id={format.id} image={format.image} step={isFront ? sceneStep : 0} />
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
                  live ? "" : "transition-opacity duration-[760ms] ease-[cubic-bezier(0.45,0.05,0.2,1)]"
                }`}
                style={{ opacity: pose.veil }}
              />
            </div>
          );
        })}

      </div>
      </FanFit>

      {/* The lit track: one node per format, the active one flaring the page's
          violet. It looks like the chapter rail down the left edge on purpose,
          but the two never share state — that one walks chapters, this one
          walks formats. */}
      {/* Стрелки — под колодой, по краям дорожки, как у каруселей Apple:
          поверх карточек они закрывали боковые подписи. */}
      <div className="mx-auto mt-6 flex max-w-[420px] items-center gap-3">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Предыдущий формат"
          className={`relative z-10 shrink-0 ${ROUND}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
      <div className="relative flex flex-1 items-center justify-between">
        <span
          className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
          style={{
            background:
              "linear-gradient(90deg, rgba(168,85,247,0) 0%, rgba(168,85,247,0.45) 10%, rgba(56,189,248,0.45) 90%, rgba(56,189,248,0) 100%)",
          }}
        />
        {FORMATS.map((format, i) => {
          const on = i === idx;
          return (
            <button
              key={format.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={format.name}
              aria-current={on ? "true" : undefined}
              className="relative grid h-8 w-8 place-items-center rounded-full border bg-ink font-display text-[9px] transition-all duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a855f7] motion-reduce:transition-none"
              style={{
                borderColor: on ? "#a855f7" : "rgba(168,85,247,0.28)",
                color: on ? "#e4d0ff" : "rgba(220,221,239,0.45)",
                boxShadow: on
                  ? "0 0 12px rgba(168,85,247,0.95), 0 0 34px rgba(168,85,247,0.5), inset 0 0 10px rgba(168,85,247,0.3)"
                  : "none",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </button>
          );
        })}
      </div>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Следующий формат"
          className={`relative z-10 shrink-0 ${ROUND}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Окошко под деком — тот же приём, что и на /ai (AiDeck.tsx) и /sites
          (SitesDeck.tsx): стекло .glass-panel со статичной каймой в
          акценте страницы (фиолетовый /smm, не изумруд/циан соседних
          деков — Егор попросил цвет свой на каждой странице), три факта
          белым текстом вместо одной приглушённой строки. The "Подробнее"
          button lives on the card itself (see the isFront branch above),
          so this row stays text-only. */}
      {panelTarget ? createPortal(panel, panelTarget) : panel}
    </div>
  );
}
