"use client";

import { useCallback, useState } from "react";

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
  /** Which mini-site mockup to draw inside the card — see SiteThumb. */
  shape: "landing" | "pages" | "shop" | "chat" | "redesign";
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
    shape: "landing",
  },
  {
    id: "card",
    name: "Сайт-визитка",
    blurb: "Несколько страниц: о компании, услуги, контакты — без раздутого бюджета.",
    price: "от 120 000 ₽",
    term: "8 рабочих дней",
    shape: "pages",
  },
  {
    id: "turnkey",
    name: "Сайт под ключ",
    blurb: "Многостраничный сайт с формами, интеграцией CRM и разделами каталога.",
    price: "от 220 000 ₽",
    term: "14 рабочих дней",
    shape: "shop",
  },
  {
    id: "assistant",
    name: "AI-ассистент",
    blurb: "Чат-бот на сайте, который отвечает на вопросы посетителей до подключения менеджера.",
    price: "по запросу",
    term: "от 5 дней",
    shape: "chat",
  },
  {
    id: "redesign",
    name: "Редизайн",
    blurb: "Переносим на актуальный стек, не теряя структуру и позиции в поиске.",
    price: "по запросу",
    term: "от 7 дней",
    shape: "redesign",
  },
];

// Placeholder artwork, drawn in CSS rather than shipped as images: a browser
// chrome plus the block rhythm of that kind of site. Zero bytes, always on
// palette, and it reads as the category at card size. Swap for real
// screenshots or generated art later by replacing this one component.
function SiteThumb({ shape }: { shape: Service["shape"] }) {
  const line = (w: string) => <span className="block h-1.5 rounded-[2px] bg-paper/20" style={{ width: w }} />;
  const cta = <span className="block h-3 w-1/3 rounded-[3px] bg-orange/85" />;

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#1b2030] to-[#0d0f16]">
      <div className="flex h-5 items-center gap-1 bg-paper/[0.07] px-2">
        <span className="h-1 w-1 rounded-full bg-paper/30" />
        <span className="h-1 w-1 rounded-full bg-paper/30" />
        <span className="h-1 w-1 rounded-full bg-paper/30" />
      </div>
      <div className="grid gap-1.5 p-2.5">
        <span className="block h-14 w-full rounded-[3px] bg-gradient-to-br from-glow/35 to-[#e85fa0]/30" />
        {shape === "landing" && (
          <>
            {line("70%")}
            {line("45%")}
            {cta}
          </>
        )}
        {shape === "pages" && (
          <>
            <div className="grid grid-cols-3 gap-1.5">
              {line("100%")}
              {line("100%")}
              {line("100%")}
            </div>
            {line("60%")}
            {cta}
          </>
        )}
        {shape === "shop" && (
          <>
            <div className="grid grid-cols-4 gap-1.5">
              <span className="block h-4 rounded-[3px] bg-paper/15" />
              <span className="block h-4 rounded-[3px] bg-paper/15" />
              <span className="block h-4 rounded-[3px] bg-paper/15" />
              <span className="block h-4 rounded-[3px] bg-paper/15" />
            </div>
            {line("50%")}
            {cta}
          </>
        )}
        {shape === "chat" && (
          <>
            {line("55%")}
            <span className="ml-auto block h-1.5 w-2/5 rounded-[2px] bg-glow/45" />
            {line("40%")}
            {cta}
          </>
        )}
        {shape === "redesign" && (
          <>
            <div className="grid grid-cols-2 gap-1.5">
              <span className="block h-5 rounded-[3px] bg-paper/10" />
              <span className="block h-5 rounded-[3px] bg-gradient-to-br from-glow/30 to-transparent" />
            </div>
            {line("65%")}
            {cta}
          </>
        )}
      </div>
    </div>
  );
}

// One entry per signed distance from the centre card. Anything further out
// than ±2 is not drawn — a sixth card would sit past the container's edge and
// only ever be a sliver.
const FAN: Record<number, { x: number; y: number; scale: number; opacity: number; blur: number; z: number }> = {
  [-2]: { x: -214, y: 26, scale: 0.7, opacity: 0.45, blur: 1.4, z: 10 },
  [-1]: { x: -122, y: 10, scale: 0.85, opacity: 0.78, blur: 0.4, z: 20 },
  [0]: { x: 0, y: -8, scale: 1, opacity: 1, blur: 0, z: 30 },
  [1]: { x: 122, y: 10, scale: 0.85, opacity: 0.78, blur: 0.4, z: 20 },
  [2]: { x: 214, y: 26, scale: 0.7, opacity: 0.45, blur: 1.4, z: 10 },
};

const CARD_SHELL =
  "rounded-[20px] border border-white/[0.14] bg-white/[0.055] shadow-[0_28px_70px_-24px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-2xl backdrop-saturate-150";

// The chapter's button language, matching the minimalism of the references
// Egor picked: a flat gradient pill in the mono face, no bevel. Deliberately
// not the site-wide .btn-neon.btn-3d "physical key" — that treatment is what
// he flagged as unfinished here, since a pressed-key button fights the flat
// glass everything else in this chapter is made of.
export const PILL =
  "inline-flex items-center gap-2.5 whitespace-nowrap rounded-full bg-gradient-to-b from-[#ff8a5f] to-[#f0512a] px-7 py-3.5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[#1a0a04] shadow-[0_12px_30px_-8px_rgba(255,106,61,0.7)] transition-[filter,transform] duration-300 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow";

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
          description under it changes length. */}
      <div className="relative h-[290px]">
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

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => setActive(i)}
              tabIndex={isFront ? -1 : 0}
              aria-label={`Показать: ${service.name}`}
              aria-current={isFront ? "true" : undefined}
              className={`absolute left-1/2 top-1/2 h-[240px] w-[188px] overflow-hidden text-left transition-all duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${CARD_SHELL} ${
                isFront ? "cursor-default" : "cursor-pointer"
              }`}
              style={{
                zIndex: pose.z,
                opacity: pose.opacity,
                filter: pose.blur ? `blur(${pose.blur}px)` : undefined,
                transform: `translate(-50%, -50%) translate(${pose.x}px, ${pose.y}px) scale(${pose.scale})`,
              }}
            >
              <SiteThumb shape={service.shape} />

              {/* Caption inside the card, as in the reference — but only on
                  the centre one. On a card at 70% behind a blur it would be
                  unreadable noise. */}
              {isFront && (
                <>
                  <span
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
                    style={{
                      background: "linear-gradient(180deg, rgba(11,11,16,0) 0%, rgba(11,11,16,0.92) 70%)",
                    }}
                  />
                  <span className="absolute inset-x-4 bottom-4 block">
                    <span className="block font-display text-[15px] uppercase leading-none tracking-tight text-paper">
                      {service.name}
                    </span>
                    <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-orange">
                      {service.price}
                    </span>
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-ink/70 px-2 py-1 font-mono text-[9px] tracking-[0.12em] text-paper/70 backdrop-blur-md">
                    {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                  </span>
                </>
              )}
            </button>
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
              className="relative grid h-8 w-8 place-items-center rounded-full border bg-ink font-mono text-[9px] transition-all duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow motion-reduce:transition-none"
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

      {/* The reference's pill toolbar: what the selected category is and what
          it costs in time. No button of its own — the chapter's single
          "Обсудить проект" lives in the copy column beside the fan, and a
          second copy of it here read as the same offer made twice. */}
      <div className="mt-6">
        <p className="min-h-[38px] max-w-[420px] text-[13px] leading-snug text-paper/55">{front.blurb}</p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-paper/45">
          Срок · <span className="font-medium text-paper">{front.term}</span>
        </p>
      </div>
    </div>
  );
}
