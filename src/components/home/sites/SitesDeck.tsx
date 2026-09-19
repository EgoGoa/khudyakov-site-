"use client";

import { useCallback, useState, type CSSProperties } from "react";
import Link from "next/link";
import FanFit from "@/components/ui/FanFit";
import { sitesFormatPages } from "@/components/home/direction/sitesFormatRegistry";

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
// Only the centre card carries the category name over its artwork, the way
// the reference labels its middle card. Price, term and the description live
// in the row underneath — the reference's pill toolbar — so the cards stay
// pictures rather than turning into five competing spec sheets.

type Service = {
  id: string;
  name: string;
  blurb: string;
  price: string;
  term: string;
  /** Кому подходит формат — второй факт в окошке под деком. */
  audience: string;
  /** Почему это актуально сейчас, а не «когда-нибудь» — третий факт там же. */
  now: string;
  /** Which mini-site mockup to draw inside the card — see SiteThumb. */
  shape: "landing" | "pages" | "shop" | "chat" | "redesign";
  /** "Хит месяца" — Egor's flagship pick, same badge/glow language as
   *  AiDeck's own hit card. */
  hit?: boolean;
  /** Themed backdrop photo, held at low exposure behind the mockup — same
   *  trick as AiThumb on /ai. One distinct image per format, matched to
   *  what that format's own page (sites-*.tsx) already uses as its hero
   *  media, so the card previews the page it opens. */
  image: string;
};

// Wording taken verbatim from lib/service-content.ts (the offer list and the
// pricing tiers) rather than rewritten here, so the carousel can't drift from
// what chapters 03 and 06 already say. "По запросу" for the two without a
// published tier — no number gets invented.
const SERVICES: Service[] = [
  {
    id: "landing",
    name: "Лендинг",
    blurb: "Одна страница, которая доводит трафик до заявки. Тексты, дизайн и вёрстка с нуля.",
    price: "от 60 000 ₽",
    term: "5 рабочих дней",
    audience: "Компаниям, которые запускают продукт, акцию или рекламную кампанию.",
    now: "Трафик уже идёт или вот-вот пойдёт — страница нужна раньше первого клика.",
    shape: "landing",
    hit: true,
    image: "/images/stock/desk-aerial.webp",
  },
  {
    id: "card",
    name: "Сайт-визитка",
    blurb: "Несколько страниц: о компании, услуги, контакты — без раздутого бюджета.",
    price: "от 120 000 ₽",
    term: "8 рабочих дней",
    audience: "Малому бизнесу и специалистам, которым до сих пор верят на слово в мессенджере.",
    now: "Клиент проверяет компанию в поиске до звонка — без сайта проверка обрывается.",
    shape: "pages",
    image: "/images/stock/design-tablet.webp",
  },
  {
    id: "turnkey",
    name: "Сайт под ключ",
    blurb: "Многостраничный сайт с формами, интеграцией CRM и разделами каталога.",
    price: "от 220 000 ₽",
    term: "14 рабочих дней",
    audience: "Компаниям с каталогом, несколькими направлениями или растущей воронкой заявок.",
    now: "Заявки уже не помещаются в один лендинг — нужна структура, а не ещё одна страница.",
    shape: "shop",
    image: "/images/stock/team-night-office.webp",
  },
  {
    id: "assistant",
    name: "AI-ассистент",
    blurb: "Чат-бот на сайте, который отвечает на вопросы посетителей до подключения менеджера.",
    price: "по запросу",
    term: "от 5 дней",
    audience: "Сайтам с потоком однотипных вопросов, на которые сейчас отвечает менеджер вручную.",
    now: "Посетитель уходит, не дождавшись ответа в оффлайне — бот отвечает раньше, чем человек.",
    shape: "chat",
    image: "/images/stock/holo-keyboard.webp",
  },
  {
    id: "redesign",
    name: "Редизайн",
    blurb: "Переносим на актуальный стек, не теряя структуру и позиции в поиске.",
    price: "по запросу",
    term: "от 7 дней",
    audience: "Владельцам сайта, который стыдно показать клиенту или неудобно редактировать самим.",
    now: "Старый стек и вёрстка тормозят каждое обновление — держать его дальше дороже переезда.",
    shape: "redesign",
    image: "/images/stock/paint-purple-macro.webp",
  },
];

// Card artwork: a themed stock frame held at low exposure underneath, and
// the format's own browser-chrome mockup drawn in CSS on top — same trick
// AiThumb uses on /ai (image dimmed + scrim so the mockup keeps contrast,
// zero extra bytes for the diagram itself). `animate` gates the per-format
// loop below: only the front card gets it, via `.ai-thumb-live` — the exact
// same animation hook /ai's own deck already defines in globals.css, reused
// rather than duplicated so both pages share one motion system.
function SiteThumb({ shape, image, animate = false }: { shape: Service["shape"]; image: string; animate?: boolean }) {
  const line = (w: string, dim = false, cls = "", style?: React.CSSProperties) => (
    <span className={`block h-1.5 rounded-[2px] ${dim ? "bg-paper/12" : "bg-paper/20"} ${cls}`} style={{ width: w, ...style }} />
  );
  const cta = (cls = "") => <span className={`block h-3 w-1/3 rounded-[3px] bg-orange/85 ${cls}`} />;
  const d = (s: number): React.CSSProperties => ({ animationDelay: `${s}s` });

  return (
    <div className="absolute inset-0 bg-[linear-gradient(160deg,#1b2030_0%,#0d0f16_58%,#0a0b10_100%)]">
      {/* Themed photo — Egor's ask, raised twice now: 0.42 first pass, then
          brighter still with the scrim behind it cut (raising the photo
          alone didn't read as changed the first time on /ai either — the
          scrim was still eating the extra light). Same values as AiThumb. */}
      <img
        src={image}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.85] [filter:grayscale(0.3)_contrast(1.05)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(165deg, rgba(15,18,28,0.5) 0%, rgba(10,11,16,0.6) 55%, rgba(10,11,16,0.7) 100%)",
        }}
      />

      <div className="relative flex h-5 items-center gap-1 bg-paper/[0.07] px-2">
        <span className="h-1 w-1 rounded-full bg-paper/30" />
        <span className="h-1 w-1 rounded-full bg-paper/30" />
        <span className="h-1 w-1 rounded-full bg-paper/30" />
      </div>
      {/* The static blue placeholder rectangle that used to sit above every
          diagram is gone — Egor: it read the same on all five cards and
          crowded out the part that's actually supposed to differ. Each
          shape's own live graphic now fills that space too, so the whole
          body of the card is the thing that tells formats apart. */}
      <div className={`relative grid gap-2 p-3 pt-3.5 ${animate ? "ai-thumb-live" : ""}`}>
        {shape === "landing" && (
          <>
            {/* A visit that ends in a lead: the page scrolls, a cursor
                drifts down toward the button, the button blinks live, and
                a lead card lands and holds. */}
            <span className="block h-2.5 w-[62%] rounded-[3px] bg-paper/30 ai-a-seq" style={d(0)} />
            {line("78%", false, "ai-a-seq", d(0.15))}
            {line("50%", true, "ai-a-seq", d(0.3))}
            <span className="relative block h-1 w-full overflow-hidden rounded-full bg-paper/10">
              <span className="ai-a-progress absolute inset-0 origin-left rounded-full bg-glow/70" />
            </span>
            <span className="relative flex items-center gap-2">
              {cta("ai-a-blink")}
              <span className="ai-a-lift block h-2.5 w-2.5 rounded-full bg-paper/70 ring-2 ring-glow/40" style={d(0.4)} />
            </span>
            <span className="ai-a-seq flex w-fit items-center gap-1 rounded-full bg-glow/15 px-1.5 py-0.5 font-display text-[7px] tracking-[0.1em] text-glow ring-1 ring-glow/30" style={d(2.1)}>
              <span className="ai-a-blink block h-1 w-1 rounded-full bg-glow" />
              Заявка
            </span>
          </>
        )}

        {shape === "pages" && (
          <>
            {/* A visitor clicking between pages — the nav tabs light up one
                at a time — while the "о компании" section and its contact
                line build underneath. */}
            <div className="flex items-center gap-1.5">
              {["О нас", "Услуги", "Контакты"].map((label, i) => (
                <span
                  key={label}
                  className="ai-a-blink rounded-[3px] bg-glow/15 px-1.5 py-0.5 font-display text-[6px] uppercase tracking-[0.08em] text-glow ring-1 ring-glow/25"
                  style={d(i * 0.5)}
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="ai-a-seq flex items-center gap-1.5" style={d(0.2)}>
              <span className="block h-5 w-5 shrink-0 rounded-full bg-gradient-to-br from-glow/40 to-[#e85fa0]/30" />
              <div className="grid flex-1 gap-1">
                {line("90%")}
                {line("60%", true)}
              </div>
            </div>
            <span className="ai-a-seq flex items-center gap-1.5" style={d(0.9)}>
              <span className="block h-1.5 w-1.5 rounded-full bg-orange/70" />
              {line("42%")}
            </span>
            {cta("ai-a-seq")}
            {/* Egor's ask: same detail level as /ai's cards — a closing
                status, not just a build-up with no payoff. */}
            <span className="ai-a-node flex w-fit items-center gap-1 rounded-full bg-glow/15 px-1.5 py-0.5 font-display text-[7px] tracking-[0.1em] text-glow ring-1 ring-glow/30" style={d(2.3)}>
              <span aria-hidden="true" className="ai-a-blink block h-1 w-1 rounded-full bg-glow" />Найден в поиске
            </span>
          </>
        )}

        {shape === "shop" && (
          <>
            {/* Catalogue tiles light up in turn with price tags underneath,
                then one line feeds down into the CRM node — the structure a
                single landing can't hold. Egor's ask: a catalogue count up
                top instead of the grid speaking for itself alone. */}
            <span className="ai-a-seq block font-display text-[7px] uppercase tracking-[0.08em] text-paper/45" style={d(0)}>
              Каталог · 24 товара
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="grid gap-1">
                  <span className="ai-a-blink block h-4 rounded-[3px] bg-glow/20 ring-1 ring-glow/25" style={d(i * 0.3)} />
                  {i % 2 === 0 && <span className="ai-a-seq block h-1 w-full rounded-[1px] bg-orange/60" style={d(i * 0.3 + 0.15)} />}
                </div>
              ))}
            </div>
            <div className="relative h-4">
              <span className="ai-a-bar absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-glow/50" style={{ transformOrigin: "top center", ...d(0.6) }} />
            </div>
            <span className="ai-a-node mx-auto flex w-fit items-center gap-1 rounded-full bg-glow/15 px-2 py-0.5 font-display text-[7px] tracking-[0.1em] text-glow ring-1 ring-glow/30" style={d(1.4)}>
              Заявка → CRM
            </span>
            {cta()}
          </>
        )}

        {shape === "chat" && (
          <>
            {/* A question answered before a manager would even open the
                chat: an "online" status, then the exchange itself, then the
                reply-time badge that's the whole point of the format. */}
            <span className="ai-a-seq flex items-center gap-1.5" style={d(0)}>
              <span className="ai-a-blink block h-1.5 w-1.5 rounded-full bg-emerald-300" />
              <span className="font-display text-[7px] uppercase tracking-[0.1em] text-paper/50">Онлайн</span>
            </span>
            <div className="ai-a-seq flex items-start gap-1.5" style={d(0.2)}>
              <span className="mt-0.5 block h-4 w-4 shrink-0 rounded-full bg-paper/15" />
              <span className="block w-[70%] rounded-lg rounded-bl-sm bg-paper/10 p-1.5">{line("85%")}</span>
            </div>
            <span className="ai-a-seq ml-auto flex w-fit items-center gap-1 rounded-full bg-glow/15 px-1.5 py-1 ring-1 ring-glow/30" style={d(0.9)}>
              <span className="ai-a-typing block h-1 w-1 rounded-full bg-glow" style={d(0)} />
              <span className="ai-a-typing block h-1 w-1 rounded-full bg-glow" style={d(0.18)} />
              <span className="ai-a-typing block h-1 w-1 rounded-full bg-glow" style={d(0.36)} />
            </span>
            <span className="ai-a-seq ml-auto block w-[72%] rounded-lg rounded-br-sm bg-glow/20 p-1.5 ring-1 ring-glow/30" style={d(1.5)}>
              {line("60%")}
            </span>
            <span className="ai-a-seq flex w-fit items-center gap-1 rounded-full bg-glow/15 px-1.5 py-0.5 font-display text-[7px] tracking-[0.1em] text-glow ring-1 ring-glow/30" style={d(2.2)}>
              Ответ за 3 сек
            </span>
          </>
        )}

        {shape === "redesign" && (
          <>
            {/* A before/after wipe: the dim old layout gives way to the lit
                new one as the divider travels across, labelled either side,
                then resets. */}
            <div className="flex items-center justify-between px-0.5 font-display text-[6px] uppercase tracking-[0.1em]">
              <span className="text-paper/35">Было</span>
              <span className="ai-a-blink text-glow">Стало</span>
            </div>
            <div className="relative grid grid-cols-2 gap-1.5 overflow-hidden">
              <div className="grid gap-1">
                <span className="block h-3.5 rounded-[3px] bg-paper/10" />
                {line("70%", true)}
              </div>
              <div className="grid gap-1">
                <span className="block h-3.5 rounded-[3px] bg-gradient-to-br from-glow/35 to-transparent ring-1 ring-glow/25" />
                {line("70%")}
              </div>
              <span className="ai-a-travel pointer-events-none absolute top-0 h-full w-px bg-glow/70" />
            </div>
            <span className="ai-a-seq flex items-center gap-1.5" style={d(0.5)}>
              <span className="block h-1.5 w-1.5 rounded-full bg-glow/70" />
              {line("55%")}
            </span>
            {cta("ai-a-seq")}
            {/* Egor's ask: close on the actual value, not just a wipe —
                структура и позиции сохранены, а не просто «стало красивее». */}
            <span className="ai-a-node flex w-fit items-center gap-1 rounded-full bg-glow/15 px-1.5 py-0.5 font-display text-[7px] tracking-[0.1em] text-glow ring-1 ring-glow/30" style={d(2.4)}>
              <span aria-hidden="true" className="ai-a-blink block h-1 w-1 rounded-full bg-glow" />Позиции в поиске сохранены
            </span>
          </>
        )}
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
const FAN: Record<number, { x: number; y: number; scale: number; opacity: number; blur: number; z: number }> = {
  [-2]: { x: -226, y: 30, scale: 0.56, opacity: 0.42, blur: 1.4, z: 10 },
  [-1]: { x: -132, y: 12, scale: 0.76, opacity: 0.76, blur: 0.4, z: 20 },
  [0]: { x: 0, y: -10, scale: 1.2, opacity: 1, blur: 0, z: 30 },
  [1]: { x: 132, y: 12, scale: 0.76, opacity: 0.76, blur: 0.4, z: 20 },
  [2]: { x: 226, y: 30, scale: 0.56, opacity: 0.42, blur: 1.4, z: 10 },
};

const CARD_SHELL =
  "rounded-[20px] bg-white/[0.055] shadow-[0_28px_70px_-24px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-2xl backdrop-saturate-150";

// The chapter's button language, matching the minimalism of the references
// Egor picked: a flat gradient pill in the mono face, no bevel. Deliberately
// not the site-wide .btn-neon.btn-3d "physical key" — that treatment is what
// he flagged as unfinished here, since a pressed-key button fights the flat
// glass everything else in this chapter is made of.
export const PILL =
  "inline-flex items-center gap-2.5 whitespace-nowrap rounded-full bg-gradient-to-b from-[#ff8a5f] to-[#f0512a] px-7 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.16em] text-[#1a0a04] shadow-[0_12px_30px_-8px_rgba(255,106,61,0.7)] transition-[filter,transform] duration-300 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow";

export const ROUND =
  "grid h-11 w-11 shrink-0 place-items-center rounded-full border border-paper/25 bg-white/[0.06] text-paper/85 backdrop-blur-md transition-colors duration-300 hover:border-glow/60 hover:text-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow";

export default function SitesDeck() {
  const [active, setActive] = useState(0);
  const count = SERVICES.length;

  const step = useCallback(
    (delta: number) => setActive((prev) => (prev + delta + count) % count),
    [count],
  );

  const front = SERVICES[active];

  return (
    <div className="w-full max-w-[560px]">
      {/* The fan. Fixed height so the chapter's layout doesn't shift as the
          description under it changes length — grown from 290 to fit the
          front card's new +20% size (240px tall × 1.2 ≈ 288px) plus its
          upward y-nudge. */}
      <FanFit designWidth={341} height={320} onSwipe={step}>
      <div className="relative h-full">
        {SERVICES.map((service, i) => {
          // Signed, wrapped distance from the active card: -2..+2, so the
          // last card sits to the *left* of the first rather than looping
          // the long way round.
          let offset = i - active;
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;

          const pose = FAN[offset];
          if (!pose) return null;

          const isFront = offset === 0;
          const hasPage = service.id in sitesFormatPages;

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
                {/* Same pattern as /ai's front-card pill: small, pulsing,
                    living on the card itself rather than as a separate
                    button below the deck. */}
                {hasPage && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-[8px] font-semibold uppercase tracking-[0.14em] motion-reduce:animate-none ${
                      service.hit
                        ? "ai-open-pulse-hit bg-gradient-to-b from-[#ff8a5c] to-[#ff4fd8] text-[#1a0a04]"
                        : "sites-open-pulse bg-gradient-to-b from-[#4fe0ff] to-[#0090b8] text-[#03181d]"
                    }`}
                  >
                    Подробнее
                    <span aria-hidden="true">→</span>
                  </span>
                )}
              </span>
              <span className="absolute right-3 top-3 rounded-full bg-ink/70 px-2 py-1 font-display text-[9px] tracking-[0.12em] text-paper/70 backdrop-blur-md">
                {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
            </>
          );

          // The position/transition live on a stable outer <div> that never
          // changes element type — see the matching comment in SmmDeck for
          // why: a <button> and a <Link> are different tags, so a transform
          // sitting directly on whichever one renders would make the card
          // snap instead of slide every time it swaps between them.
          return (
            <div
              key={service.id}
              className="deck-pose absolute left-1/2 top-1/2 h-[240px] w-[188px] transition-all duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{
                zIndex: pose.z,
                opacity: pose.opacity,
                filter: pose.blur ? `blur(${pose.blur}px)` : undefined,
                transform: `translate(-50%, -50%) translate(${pose.x}px, ${pose.y}px) scale(${pose.scale})`,
              }}
            >
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
                  className={`deck-card-glow deck-neon-pulse absolute inset-0 overflow-hidden text-left ${CARD_SHELL}`}
                  style={service.hit ? CARD_GLOW_STYLE_HIT : CARD_GLOW_STYLE}
                >
                  <SiteThumb shape={service.shape} image={service.image} animate />
                  {caption}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  tabIndex={isFront ? -1 : 0}
                  aria-label={`Показать: ${service.name}`}
                  aria-current={isFront ? "true" : undefined}
                  className={`absolute inset-0 overflow-hidden text-left ${CARD_SHELL} ${
                    isFront ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  <SiteThumb shape={service.shape} image={service.image} animate={isFront} />
                  {isFront && caption}
                </button>
              )}
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
      <div className="relative mx-auto mt-7 flex max-w-[340px] items-center justify-between">
        <span
          className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,106,61,0) 0%, rgba(255,106,61,0.45) 10%, rgba(255,106,61,0.45) 90%, rgba(255,106,61,0) 100%)",
          }}
        />
        {SERVICES.map((service, i) => {
          const on = i === active;
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => setActive(i)}
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
      <div
        className="glass-panel deck-neon-pulse mt-6 flex h-auto min-h-[300px] items-start lg:h-[240px] lg:min-h-0 overflow-hidden rounded-3xl px-6 py-6"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.13), 0 28px 70px -34px rgba(0,0,0,0.95)", "--card-glow-rgb": "0, 210, 255" } as CSSProperties}
      >
        <div className="max-w-[460px]">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="font-display text-sm uppercase leading-snug tracking-tight text-white">{front.name}</p>
            <p className="font-display text-[11px] uppercase tracking-[0.1em] text-glow">
              {front.price} · {front.term}
            </p>
          </div>
          <dl className="mt-3 grid gap-2.5">
            <SitesFact label="Что даёт" text={front.blurb} />
            <SitesFact label="Кому" text={front.audience} />
            <SitesFact label="Почему сейчас" text={front.now} />
          </dl>
        </div>
      </div>
    </div>
  );
}

// Одна строка факта — тот же рисунок, что у AiDeck's Fact, в акценте /sites.
function SitesFact({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-[92px] shrink-0 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-glow/80">
        {label}
      </dt>
      <dd className="text-[13px] leading-snug text-white">{text}</dd>
    </div>
  );
}
