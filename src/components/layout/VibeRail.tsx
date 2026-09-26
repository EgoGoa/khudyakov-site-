"use client";

import { Fragment, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { useCleanPathname } from "@/lib/use-clean-pathname";
import { AnimatePresence, motion } from "framer-motion";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useHeaderMenu } from "@/lib/header-menu";
import { useCinematicGoTo } from "@/lib/cinematic-nav";
import WelcomeWidget from "@/components/home/WelcomeWidget";
import CenterModal from "@/components/ui/CenterModal";
import NanoSphere from "@/components/ui/NanoSphere";
import VibeMode from "@/components/vibe/VibeMode";
import { PAGE_GRADIENT } from "@/components/home/PageSideNav";
import { homeOf } from "@/components/layout/PageBar";
import { serviceOrder } from "@/lib/service-content";

// Standalone routes where the whole page *is* one rail item — no in-page
// anchor to scroll-spy, the URL alone decides it.
const PAGE_ACTIVE_ID: Record<string, string> = {
  "/works": "catalog",
  "/calculator": "calculator",
  "/brief": "brief",
};

// Tracks whichever of `anchorIds` is currently on screen, re-running its
// IntersectionObserver whenever the id list changes (i.e. on every route
// change between /content, /ai, /sites, /smm, each with its own block set).
// The cinematic deck on /content and the plain-scroll layout on /ai, /sites,
// /smm both end up with one real DOM element per id at the right scroll
// position — CinematicStage's own runway divs for the former, each
// section's own `id=` for the latter — so the exact same technique
// (same rootMargin) covers both without knowing which one it's on.
function useActiveRailId(anchorIds: string[]): string {
  const pathname = useCleanPathname();
  const [activeId, setActiveId] = useState("");
  const anchorKey = anchorIds.join(",");

  useEffect(() => {
    const pageMatch = PAGE_ACTIVE_ID[pathname];
    if (pageMatch) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fixed id for pages with no scroll-spy anchors, not derivable during this render
      setActiveId(pageMatch);
      return;
    }
    setActiveId("");
    const elements = anchorIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- anchorKey is anchorIds' stable identity
  }, [pathname, anchorKey]);

  return activeId;
}

// The site-wide "vibe" rail — replaces the old bottom-right "VIBE САЙТ"
// floating button (see FloatingCta, now removed from layout.tsx). Same
// gradient pill, same WelcomeWidget flow, just relocated to the top slot of
// this rail instead of floating alone.
//
// Below it, one row per top-level section of the site (the same set Header's
// desktop nav and burger menu already link to). Clicking a row does not
// navigate directly — it opens a small "Vibe режим" window offering four ways
// to engage with that block: an AI agent, a live creative session, personal
// tailoring, or just the section as it exists today ("Обычная страница",
// the only one of the four that's wired to a real destination right now).
// The other three are an honest, clearly-labelled preview of where this is
// headed, not a dead button — each names itself "скоро" and explains the
// idea in a line instead of pretending to work.
//
// Desktop (>=1024px, matching every other lg: breakpoint in the codebase):
// a slim icon-only rail sits on screen at all times; hovering it (or
// focusing a row via keyboard) widens it into a matte, label-bearing panel
// with a soft neon pulse — the same motion idea as a macOS Dock or Arc's
// collapsed sidebar. The whole thing floats on top of the page,
// deliberately: it does not reserve any layout space, the same as the old
// floating CTA button it replaces.
//
// Mobile (<1024px): the rail's hover affordance has no touch equivalent, so
// it collapses to a single round button in the same bottom-right corner the
// old floating CTA used, opening a full-screen matte sheet with the same
// rows instead of expanding in place.

// The rail's labels: plain white, set light and thin.
//
// They used to carry the site-wide magenta→cyan `.kw` gradient, which is the
// right mark for a heading keyword but wrong at 13px in a dense nine-row
// column — the two-colour fill plus its own drop-shadow made every row read
// as a highlight, so nothing in the rail stood out from anything else. Egor
// asked for white and thinner instead, with the colour work moved to where
// it carries meaning: the hover state and the active section's icon.
//
// font-sans (Manrope), not font-display (Unbounded): Unbounded's lightest cut
// in this project is 500, so "thinner" isn't reachable in that face at all —
// Manrope goes to 300, which is what actually makes the row read as a quiet
// label rather than a small heading. Tracking is opened up a little to keep
// the uppercase setting legible at that weight.
// Pure white — and this time actually *rendered* white.
//
// The label was already `color: #fff` at `opacity: 1` while still looking
// washed-out grey on screen, because nothing about the colour was the
// problem. Three things were dimming the paint itself, and all three are
// dealt with here:
//
//   1. `subpixel-antialiased` overrides the `antialiased` that layout.tsx
//      sets on <body>. `-webkit-font-smoothing: antialiased` makes macOS
//      render type visibly thinner; at 12px a light weight's stems come out
//      under a pixel wide, so they can only ever be *partially* covered —
//      and a half-covered white pixel on near-black is, literally, grey. No
//      colour value can fix that; the glyph has to be given real coverage.
//   2. Weight 300 → 500. Same reason: below ~400 there is not enough stem
//      at this size for the screen to paint solid. Manrope 500 still reads
//      far lighter than the display face this replaced, so the rail keeps
//      the thin, quiet look Egor asked for while gaining a stroke the
//      display can actually fill in.
//   3. The dark legibility shadow is gone at rest. It sat directly under
//      the glyph and darkened exactly the antialiased edge pixels that were
//      already only half-covered — a grey fringe around every letter. The
//      rail's own backdrop (a near-opaque rgba(5,5,9,0.86) once expanded)
//      is what separates the text from the footage now, which is what a
//      backdrop is for; the label no longer needs to carry its own.
const RAIL_LABEL_CLASS =
  "shrink-0 whitespace-nowrap font-sans text-[12px] font-medium uppercase leading-none tracking-[0.08em] text-white subpixel-antialiased transition-[opacity,text-shadow] duration-200";

// Hover: the word lights along its own outline. Tight radii (1/3/7px) rather
// than a wide bloom — Egor asked for the glow to trace the lettering itself
// ("по окантовке"), and anything past ~8px stops reading as an edge and
// starts reading as a halo behind the text. Scoped by `group-hover` to the
// row's own button, so only the row actually under the cursor lights up
// while every other label stays plain white.
const RAIL_LABEL_HOVER =
  "group-hover:[text-shadow:0_0_1px_rgba(255,255,255,1),0_0_3px_rgba(255,255,255,0.95),0_0_7px_rgba(255,255,255,0.7)]";

const EASE = [0.22, 1, 0.36, 1] as const;
type RailItem = {
  id: string;
  label: string;
  /** Shown inside the Vibe-mode window under the section's name. */
  description: string;
  /** Where "Обычная страница" actually goes. */
  href: string;
  glyph: ReactNode;
};

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      {children}
    </svg>
  );
}

// A block belongs to exactly one page and is rendered with an in-page
// `#id` anchor computed from the current route (see PAGE_BLOCKS/useRailItems
// below) — unlike CROSS_PAGE_ITEMS, whose href is a real destination page.
type PageBlock = Omit<RailItem, "href">;

const WORKS_BLOCK: PageBlock = {
  id: "works",
  label: "Работы",
  description: "78 проектов портфолио: реклама, шоурилы, 3D и моушн.",
  glyph: (
    <Glyph>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 9h18M3 15h18M8 5v14M16 5v14" />
    </Glyph>
  ),
};

const SERVICES_BLOCK: PageBlock = {
  id: "services",
  label: "Что делаем",
  description: "Продакшн, AI, сайты и SMM — весь стек услуг сервиса.",
  glyph: (
    <Glyph>
      <path d="M12 3l8.5 4.5L12 12 3.5 7.5 12 3z" />
      <path d="M3.5 12L12 16.5 20.5 12" />
      <path d="M3.5 16.5L12 21l8.5-4.5" />
    </Glyph>
  ),
};

const CONTACT_BLOCK: PageBlock = {
  id: "contact",
  label: "Цены и заявка",
  description: "Сроки, бюджет и как быстрее всего оставить заявку.",
  glyph: (
    <Glyph>
      <path d="M12 2.5l2.3 6.2 6.2 2.3-6.2 2.3L12 19.5l-2.3-6.2L3.5 11l6.2-2.3L12 2.5z" />
    </Glyph>
  ),
};

const PROCESS_BLOCK: PageBlock = {
  id: "process",
  label: "Как мы работаем",
  description: "Шесть шагов пути: от оценки проекта до сдачи и поддержки.",
  glyph: (
    <Glyph>
      <path d="M4 6h11a3.5 3.5 0 0 1 0 7H7" />
      <path d="M9.5 10 6 13l3.5 3M14 18h6" />
    </Glyph>
  ),
};

const WHY_BLOCK: PageBlock = {
  id: "why",
  label: "Почему мы",
  description: "Что отличает сервис: опыт, подход и что получает клиент.",
  glyph: (
    <Glyph>
      <path d="M12 3 4 6.5V12c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6.5L12 3z" />
    </Glyph>
  ),
};

// The cinematic deck's opening chapter on /content — its id comes from
// CinematicStage's own runway div (see CHAPTERS in content/page.tsx), not
// from the Opening component itself.
const OPENING_BLOCK: PageBlock = {
  id: "opening",
  label: "Интро",
  description: "Ключевой месседж и цифры результата — открывающий кадр.",
  glyph: (
    <Glyph>
      <path d="M5 4.5 19 12 5 19.5z" />
    </Glyph>
  ),
};

// The former STATS/FINALCTA/TESTIMONIALS/AICONSULT/PRICING blocks lived here
// until /smm's rebuild into a deck — they described sections of that page's
// old plain-scroll layout and had no consumer left once its list was
// corrected, so they are gone rather than kept as five dead ids.

// /ai is a CinematicStage deck of its own now (see (landing)/ai/page.tsx) —
// eight chapters, one entry here per chapter, ids matching that page's own
// CHAPTERS exactly (pitch/portfolio/segments/trust/offer/guarantees/process/
// close) so useActiveRailId's IntersectionObserver picks up CinematicStage's
// runway divs at the right scroll step, the same technique /content's own
// deck already relies on.
const AI_PITCH_BLOCK: PageBlock = {
  id: "pitch",
  label: "AI-решения",
  description: "Боль клиента, 10 AI-услуг и цифры опыта — открывающий блок.",
  glyph: (
    <Glyph>
      <path d="M12.5 2.5 5 13.5h5.5L11 21.5l7.5-11H13z" />
    </Glyph>
  ),
};

const AI_PORTFOLIO_BLOCK: PageBlock = {
  id: "portfolio",
  label: "Портфолио AI-работ",
  description: "Кейсы AI-проектов — первые уже в работе.",
  glyph: (
    <Glyph>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 9h18M8 5v14M16 5v14" />
    </Glyph>
  ),
};

const AI_SEGMENTS_BLOCK: PageBlock = {
  id: "segments",
  label: "Кому подходит",
  description: "4 сегмента бизнеса и кейсы под каждый.",
  glyph: (
    <Glyph>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="1.5" />
    </Glyph>
  ),
};

const AI_TRUST_BLOCK: PageBlock = {
  id: "trust",
  label: "Почему мы",
  description: "Продюсерский центр полного цикла — 60% заказов возвращаются.",
  glyph: (
    <Glyph>
      <path d="M12 3 4 6.5V12c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6.5L12 3z" />
    </Glyph>
  ),
};

const AI_OFFER_BLOCK: PageBlock = {
  id: "offer",
  label: "Что делаем",
  description: "10 AI-услуг: боты, контент, аналитика.",
  glyph: (
    <Glyph>
      <path d="M12 3l8.5 4.5L12 12 3.5 7.5 12 3z" />
      <path d="M3.5 12L12 16.5 20.5 12" />
      <path d="M3.5 16.5L12 21l8.5-4.5" />
    </Glyph>
  ),
};

const AI_GUARANTEES_BLOCK: PageBlock = {
  id: "guarantees",
  label: "Условия и гарантии",
  description: "Права, SLA, сроки и команда, которая за этим стоит.",
  glyph: (
    <Glyph>
      <path d="M12 3v3M12 8l-6 2v4c0 3.5 2.5 6 6 7 3.5-1 6-3.5 6-7V10l-6-2z" />
    </Glyph>
  ),
};

const AI_PROCESS_BLOCK: PageBlock = {
  id: "process",
  label: "Как проходит внедрение",
  description: "Шесть шагов от аудита процессов до сопровождения.",
  glyph: (
    <Glyph>
      <path d="M4 6h11a3.5 3.5 0 0 1 0 7H7" />
      <path d="M9.5 10 6 13l3.5 3M14 18h6" />
    </Glyph>
  ),
};

const AI_CLOSE_BLOCK: PageBlock = {
  id: "close",
  label: "Цены и заявка",
  description: "Тарифы под задачу и старт проекта.",
  glyph: (
    <Glyph>
      <path d="M12 2.5l2.3 6.2 6.2 2.3-6.2 2.3L12 19.5l-2.3-6.2L3.5 11l6.2-2.3L12 2.5z" />
    </Glyph>
  ),
};

// /sites is now its own CinematicStage deck too (see (landing)/sites/page.tsx),
// six chapters, ids matching that page's own CHAPTERS exactly — same
// technique as /ai's block list above, needed because a plain-scroll page's
// generic block list (STATS_BLOCK, WORKS_BLOCK, ...) doesn't correspond to
// any real element id once the page is a pinned deck.
const SITES_PITCH_BLOCK: PageBlock = {
  id: "pitch",
  label: "Сайты на AI",
  description: "Уникальный дизайн и вёрстка вместо шаблонов — открывающий блок.",
  glyph: (
    <Glyph>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v7.5M20.8 7.5l-6.5 3.75M20.8 16.5l-6.5-3.75M12 21v-7.5M3.2 16.5l6.5-3.75M3.2 7.5l6.5 3.75" />
    </Glyph>
  ),
};

const SITES_METHOD_BLOCK: PageBlock = {
  id: "method",
  label: "Метод и кому подходит",
  description: "Как AI ускоряет черновик и три сегмента, которым это подходит.",
  glyph: (
    <Glyph>
      <path d="M8.5 8L3.5 12.5 8.5 17M15.5 8l5 4.5-5 4.5" />
      <path d="M13.2 5.5l-2.4 13" />
    </Glyph>
  ),
};

const SITES_OFFER_BLOCK: PageBlock = {
  id: "offer",
  label: "Что делаем",
  description: "От лендинга до сайта под ключ с интеграциями.",
  glyph: (
    <Glyph>
      <path d="M12 3l8.5 4.5L12 12 3.5 7.5 12 3z" />
      <path d="M3.5 12L12 16.5 20.5 12" />
      <path d="M3.5 16.5L12 21l8.5-4.5" />
    </Glyph>
  ),
};

const SITES_PROCESS_BLOCK: PageBlock = {
  id: "process",
  label: "Как проходит работа",
  description: "Пять шагов от брифа до запуска.",
  glyph: (
    <Glyph>
      <path d="M4 6h11a3.5 3.5 0 0 1 0 7H7" />
      <path d="M9.5 10 6 13l3.5 3M14 18h6" />
    </Glyph>
  ),
};

const SITES_GUARANTEES_BLOCK: PageBlock = {
  id: "guarantees",
  label: "Почему мы",
  description: "Фиксированные сроки, гарантия возврата и свой код.",
  glyph: (
    <Glyph>
      <path d="M12 3l7 3v5.5c0 4.3-2.9 8.1-7 9.5-4.1-1.4-7-5.2-7-9.5V6l7-3z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </Glyph>
  ),
};

const SITES_CLOSE_BLOCK: PageBlock = {
  id: "close",
  label: "Цены и заявка",
  description: "Три пакета и старт проекта.",
  glyph: (
    <Glyph>
      <path d="M12 2.5l2.3 6.2 6.2 2.3-6.2 2.3L12 19.5l-2.3-6.2L3.5 11l6.2-2.3L12 2.5z" />
    </Glyph>
  ),
};

// /smm became a CinematicStage deck of its own too (see (landing)/smm/page.tsx)
// — six chapters, ids matching that page's own CHAPTERS exactly (pitch/method/
// offer/process/guarantees/close), same as /ai and /sites above.
//
// This list used to be the ten generic plain-scroll blocks the page had before
// that rebuild (stats/works/finalcta/why/testimonials/services/ai/process/
// pricing/contact). Nine of those ten ids no longer exist anywhere in the
// page's DOM, which broke the rail on /smm in both of its jobs at once: the
// IntersectionObserver in useActiveRailId found no elements to watch, so no
// row ever lit up as the active section, and every row's "Обычная страница"
// action fell through to a `/smm#<dead-id>` anchor that scrolls nowhere —
// cinematicGoTo returns false for an id the deck doesn't know.
const SMM_PITCH_BLOCK: PageBlock = {
  id: "pitch",
  label: "SMM силами продакшена",
  description: "Съёмка, монтаж и ведение соцсетей одной командой — открывающий блок.",
  glyph: (
    <Glyph>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M10.5 18.5h3" />
    </Glyph>
  ),
};

const SMM_METHOD_BLOCK: PageBlock = {
  id: "method",
  label: "Не подрядчик",
  description: "Сравнение с фрилансером и сервисом — и кому это подходит.",
  glyph: (
    <Glyph>
      <path d="M8.5 8L3.5 12.5 8.5 17M15.5 8l5 4.5-5 4.5" />
      <path d="M13.2 5.5l-2.4 13" />
    </Glyph>
  ),
};

const SMM_OFFER_BLOCK: PageBlock = {
  id: "offer",
  label: "Что делаем",
  description: "Полный цикл ведения: от съёмки и монтажа до таргета и отчёта.",
  glyph: (
    <Glyph>
      <path d="M12 3l8.5 4.5L12 12 3.5 7.5 12 3z" />
      <path d="M3.5 12L12 16.5 20.5 12" />
      <path d="M3.5 16.5L12 21l8.5-4.5" />
    </Glyph>
  ),
};

const SMM_PROCESS_BLOCK: PageBlock = {
  id: "process",
  label: "Как проходит работа",
  description: "Пять шагов от аудита до еженедельного отчёта.",
  glyph: (
    <Glyph>
      <path d="M4 6h11a3.5 3.5 0 0 1 0 7H7" />
      <path d="M9.5 10 6 13l3.5 3M14 18h6" />
    </Glyph>
  ),
};

const SMM_GUARANTEES_BLOCK: PageBlock = {
  id: "guarantees",
  label: "Что входит",
  description: "Фиксированный пакет, согласование контента и отчёт каждую неделю.",
  glyph: (
    <Glyph>
      <path d="M12 3l7 3v5.5c0 4.3-2.9 8.1-7 9.5-4.1-1.4-7-5.2-7-9.5V6l7-3z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </Glyph>
  ),
};

const SMM_CLOSE_BLOCK: PageBlock = {
  id: "close",
  label: "Пакеты ведения",
  description: "Три месячных пакета и старт работы.",
  glyph: (
    <Glyph>
      <path d="M12 2.5l2.3 6.2 6.2 2.3-6.2 2.3L12 19.5l-2.3-6.2L3.5 11l6.2-2.3L12 2.5z" />
    </Glyph>
  ),
};

// Every one of the four service pages is a CinematicStage deck now, so each
// list below is exactly that page's own CHAPTERS ids, in order — the rail's
// scroll-spy and its "Обычная страница" jump both address the deck's runway
// divs by id, so a list that drifts from the page's chapters silently breaks
// both (see the note above SMM_PITCH_BLOCK for what that looked like).
const PAGE_BLOCKS: Record<string, PageBlock[]> = {
  "/content": [OPENING_BLOCK, WORKS_BLOCK, WHY_BLOCK, SERVICES_BLOCK, PROCESS_BLOCK, CONTACT_BLOCK],
  "/ai": [
    AI_PITCH_BLOCK,
    AI_PORTFOLIO_BLOCK,
    AI_SEGMENTS_BLOCK,
    AI_TRUST_BLOCK,
    AI_OFFER_BLOCK,
    AI_GUARANTEES_BLOCK,
    AI_PROCESS_BLOCK,
    AI_CLOSE_BLOCK,
  ],
  "/sites": [
    SITES_PITCH_BLOCK,
    SITES_METHOD_BLOCK,
    SITES_OFFER_BLOCK,
    SITES_PROCESS_BLOCK,
    SITES_GUARANTEES_BLOCK,
    SITES_CLOSE_BLOCK,
  ],
  "/smm": [
    SMM_PITCH_BLOCK,
    SMM_METHOD_BLOCK,
    SMM_OFFER_BLOCK,
    SMM_PROCESS_BLOCK,
    SMM_GUARANTEES_BLOCK,
    SMM_CLOSE_BLOCK,
  ],
};

// Real destination pages rather than in-page anchors — always the same
// three rows regardless of which service page the visitor is on, appended
// after that page's own blocks.
const CROSS_PAGE_ITEMS: RailItem[] = [
  {
    id: "catalog",
    label: "Все работы",
    description: "Полный каталог — 78 работ с фильтрами по формату и сфере.",
    href: "/works",
    glyph: (
      <Glyph>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.3" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.3" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.3" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.3" />
      </Glyph>
    ),
  },
  {
    id: "calculator",
    label: "Калькулятор",
    description: "Прикидка бюджета по формату, хронометражу и срокам.",
    href: "/calculator",
    glyph: (
      <Glyph>
        <rect x="4.5" y="3" width="15" height="18" rx="2" />
        <path d="M8 7.5h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h3.5" />
      </Glyph>
    ),
  },
  {
    id: "brief",
    label: "Бриф",
    description: "Формализуйте задачу — с этого сервис начинает работу.",
    href: "/brief",
    glyph: (
      <Glyph>
        <path d="M5 3.5h9l5 5V20a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 20V5a1.5 1.5 0 0 1 1-1.5z" />
        <path d="M14 3.5V9h5M8.5 13.5h7M8.5 17h4.5" />
      </Glyph>
    ),
  },
];

// This page's own blocks (own ids, own hrefs) followed by the fixed
// cross-page rows. A page not in PAGE_BLOCKS (e.g. /works itself) just gets
// the cross-page rows, matching the previous single-list behaviour.
function useRailItems(): { pageItems: RailItem[]; crossPageItems: RailItem[]; anchorIds: string[] } {
  const pathname = useCleanPathname();
  const blocks = PAGE_BLOCKS[pathname] ?? [];
  const pageItems = blocks.map((block) => ({ ...block, href: `${pathname}#${block.id}` }));
  return { pageItems, crossPageItems: CROSS_PAGE_ITEMS, anchorIds: blocks.map((b) => b.id) };
}

type ModeKey = "agent" | "session" | "personalize";

const MODES: { key: ModeKey; label: string; pitch: string; glyph: ReactNode }[] = [
  {
    key: "agent",
    label: "AI-агент",
    pitch: "Агент разбирает задачу и сам собирает КП по этому блоку — без брифа и созвона.",
    glyph: (
      <Glyph>
        <rect x="5" y="7" width="14" height="12" rx="3" />
        <path d="M9 7V4.5h6V7M9 13h.01M15 13h.01" />
        <path d="M3.5 12h1.5M19 12h1.5" />
      </Glyph>
    ),
  },
  {
    key: "session",
    label: "Креатив-сессия",
    pitch: "Живой разбор идеи с командой в реальном времени, по этому конкретному блоку.",
    glyph: (
      <Glyph>
        <path d="M4 6.5h13a2 2 0 0 1 2 2V14a2 2 0 0 1-2 2H10l-4 3.5V16H6a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2z" />
      </Glyph>
    ),
  },
  {
    key: "personalize",
    label: "Персонализировать",
    pitch: "Настраиваете вид и содержание блока под свой бренд — сами, без правок сервиса.",
    glyph: (
      <Glyph>
        <path d="M4 7h9M4 12h5M4 17h9" />
        <circle cx="17" cy="7" r="2.2" />
        <circle cx="12" cy="17" r="2.2" />
      </Glyph>
    ),
  },
];

function VibeModeWindow({ item, onClose }: { item: RailItem; onClose: () => void }) {
  const [revealed, setRevealed] = useState<ModeKey | null>(null);
  const cinematicGoTo = useCinematicGoTo();

  // Same bridge Header's own nav uses (see cinematic-nav.tsx): on a
  // CinematicStage page a plain `#id` anchor's native scroll-jump gets
  // misread by the deck's own scroll listener as trackpad-momentum overshoot
  // and clamped to one chapter away from the click. Stepping through the
  // registered deck directly lands exactly on the chapter clicked, with the
  // same eased glide (and blur hold) the deck's own gestures use — which is
  // the "switches together with the blocks" behaviour asked for. Falls
  // through to the plain anchor href on a page with no deck registered
  // (nothing to intercept there).
  const goToItem = (e: React.MouseEvent) => {
    onClose();
    if (cinematicGoTo(item.id)) e.preventDefault();
  };

  return (
    <div>
      <span className="inline-flex items-center gap-2 rounded-full border border-orange/35 bg-orange/10 px-3.5 py-1.5 font-display text-[11px] uppercase tracking-[0.18em] text-orange">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
        Vibe режим
      </span>

      <h2 className="mt-4 font-display text-[1.35rem] uppercase leading-[1.21] tracking-tight text-paper sm:text-[1.688rem]">
        {item.label}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-paper/60 sm:text-base">
        {item.description}
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {MODES.map((mode) => (
          <div
            key={mode.key}
            className="relative overflow-hidden rounded-2xl bg-paper/[0.05] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper/10 text-paper/80">
                {mode.glyph}
              </span>
              <span className="rounded-full bg-paper/10 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.14em] text-paper/45">
                Скоро
              </span>
            </div>
            <div className="mt-3 font-sans text-sm font-semibold text-paper">{mode.label}</div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={revealed === mode.key ? "note" : "teaser"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="mt-1.5 text-xs leading-relaxed text-paper/50"
              >
                {revealed === mode.key
                  ? "Записали интерес — эта функция в разработке, включим одной из первых."
                  : mode.pitch}
              </motion.p>
            </AnimatePresence>
            <button
              type="button"
              onClick={() => setRevealed(mode.key)}
              className="btn-neon mt-3 w-full justify-center !py-2 !text-[10px]"
            >
              Хочу так
            </button>
          </div>
        ))}

        <Link
          href={item.href}
          onClick={goToItem}
          className="group relative overflow-hidden rounded-2xl p-4"
          style={{ background: "linear-gradient(155deg, rgba(255,106,61,0.32), rgba(245,49,11,0.18))" }}
        >
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange/20 text-orange">
              <Glyph>
                <path d="M7 17 17 7M9 7h8v8" />
              </Glyph>
            </span>
            <span className="rounded-full bg-orange/25 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.14em] text-orange">
              Готово сейчас
            </span>
          </div>
          <div className="mt-3 font-sans text-sm font-semibold text-white">Обычная страница</div>
          <p className="mt-1.5 text-xs leading-relaxed text-paper/70">
            Смотреть блок как он есть на сайте — без персонализации.
          </p>
          <span className="btn-neon btn-warm mt-3 flex w-full justify-center !py-2 !text-[10px]">
            Перейти
          </span>
        </Link>
      </div>
    </div>
  );
}

/** One row of the mobile sheet. Labels always show there (no hover state to
 *  reveal them), so it carries the same white/thin treatment plus the active
 *  glow rather than the desktop row's expand logic. */
function SheetRow({
  item,
  active,
  onClick,
}: {
  item: RailItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={`group flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-opacity ${
        active ? "opacity-100" : "opacity-70"
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center text-white transition-transform duration-300 ${
          active ? "scale-[1.2] [&_svg]:stroke-[2.35]" : ""
        }`}
        style={
          active
            ? {
                filter:
                  "drop-shadow(0 0 3px rgba(255,255,255,1)) drop-shadow(0 0 9px rgba(255,255,255,0.9)) drop-shadow(0 0 22px rgba(255,255,255,0.6))",
              }
            : undefined
        }
      >
        {item.glyph}
      </span>
      <span className={`${RAIL_LABEL_CLASS} ${RAIL_LABEL_HOVER} text-[13px]`}>{item.label}</span>
    </button>
  );
}

export default function VibeRail() {
  const { pageItems, crossPageItems, anchorIds } = useRailItems();
  const activeRailId = useActiveRailId(anchorIds);
  const [pickerOpen, setPickerOpen] = useState(false);
  // Сфера открывает вайб-режим (анкета → персональное предложение), а
  // прежний выбор направлений остался ссылкой внутри этого окна.
  // Ссылка с `?vibe=1` (реклама, рассылка, соцсети) открывает окно сразу.
  const [vibeOpen, setVibeOpen] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("vibe")
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<RailItem | null>(null);
  // Header's desktop burger dropdown lives in roughly the same top-right
  // corner of the screen — stepping the rail out of the way while it's open
  // is simpler and more robust than trying to keep two floating panels from
  // ever overlapping by careful positioning alone.
  const { menuOpen: headerMenuOpen } = useHeaderMenu();
  // Цвет нано-сферы и света активной кнопки — градиент услуги этой страницы.
  const railPath = useCleanPathname();
  const accent = PAGE_GRADIENT[serviceOrder[Math.max(homeOf(railPath), 0)]];

  useBodyScrollLock(pickerOpen || sheetOpen || !!activeItem);

  const openItem = (item: RailItem) => {
    setSheetOpen(false);
    setActiveItem(item);
  };

  return (
    <>
      {/* Desktop rail. The icon column is on screen at all times — hovering
          it (or focusing a row via keyboard) is the only thing that widens
          it into the labelled panel; losing hover collapses it back to
          icons. No border/ring by design, only backdrop-blur over a very
          translucent fill, and a soft neon pulse kicks in only while
          expanded — the panel is meant to read as live, technical surface,
          not a static menu. */}
      {/* Rewritten from a single element animating `width` to a fixed-size
          shell (always 226px — the expanded size) with a separate
          decorative backdrop underneath that reveals via `clipPath`.
          `width` is a layout property: the browser has to reflow every
          frame it changes, and that reflow was running alongside `scale`
          (a transform, GPU-composited, on the *same* element) on a
          *different* duration (0.3s vs width's 0.45s) — two different
          rendering pipelines, arriving at different times, is what read as
          "кривая, дёргается". A fixed-size shell means content never
          reflows at all (rows stay `w-full` of a constant 226px, icons stay
          pinned to its right edge via flex-row-reverse exactly as before —
          the visible "narrow pill" state is just the backdrop showing less
          of that same fixed layout), and the backdrop's own clipPath is
          numeric-interpolated by Motion the same way boxShadow already is
          elsewhere in this file, on one shared duration with scale/opacity
          so the whole rail arrives together instead of in stages. */}
      {/* Вариант C (Егор, 2026-09-26): парящие стеклянные кнопки вместо
          раскрывающейся панели. Наверху — нано-сфера (открывает вайб-окно),
          ниже — разделы страницы и общие страницы, каждая кнопка своим
          матовым стеклом, как шапка. Раздел на экране — крупнее и в кольце
          света цвета страницы; подпись всплывает при наведении. */}
      <nav
        aria-label="Vibe"
        className={`fixed right-2 top-1/2 z-[65] hidden -translate-y-1/2 flex-col items-center gap-1.5 transition-opacity duration-300 lg:flex ${
          headerMenuOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        style={{ "--g-from": accent.from, "--g-to": accent.to } as CSSProperties}
      >
        <button
          type="button"
          onClick={() => setVibeOpen(true)}
          aria-label="Vibe-режим"
          aria-haspopup="dialog"
          className="vibe-bubble vibe-bubble--crown mb-1"
        >
          <NanoSphere size={36} from={accent.from} to={accent.to} />
          <span className="vibe-tip font-display">Vibe</span>
        </button>
        {[...pageItems, ...crossPageItems].map((item, i) => (
          <Fragment key={item.id}>
            {i === pageItems.length && pageItems.length > 0 && <span aria-hidden="true" className="my-0.5 h-px w-4 bg-paper/20" />}
            <button
              type="button"
              onClick={() => openItem(item)}
              aria-label={item.label}
              aria-current={item.id === activeRailId ? "true" : undefined}
              className={`vibe-bubble ${item.id === activeRailId ? "is-active" : ""}`}
            >
              {item.glyph}
              <span className="vibe-tip font-display">{item.label}</span>
            </button>
          </Fragment>
        ))}
      </nav>

      {/* Mobile entry point — the old floating "VIBE САЙТ" button's slot and
          role, same static round style as the desktop rail's trigger rather
          than the old button's constant animated glow. */}
      <div className="fixed bottom-6 right-6 z-[65] hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          aria-label="Vibe меню"
          // No disc behind it: the orb *is* the button here, so the mark keeps
          // the transparent background it's drawn for instead of sitting on a
          // gradient pill that would mute its own glow.
          className="vibe-orb-trigger flex h-12 w-12 items-center justify-center rounded-full"
        >
          <NanoSphere size={40} from={accent.from} to={accent.to} />
        </button>
      </div>

      {/* Mobile sheet — same rows, full-screen matte list instead of a hover-expanding rail */}
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            key="vibe-sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label="Vibe меню"
            className="fixed inset-0 z-[65] bg-ink/60 lg:hidden"
            onClick={() => setSheetOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.45, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "rgba(11,11,16,0.55)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
              }}
              className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-[1.75rem] px-5 pb-8 pt-5"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-paper/20" />

              <button
                type="button"
                onClick={() => {
                  setSheetOpen(false);
                  setVibeOpen(true);
                }}
                className="vibe-orb-trigger flex w-full items-center gap-3 rounded-xl px-2 py-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                  <NanoSphere size={28} from={accent.from} to={accent.to} />
                </span>
                <span className="font-display text-xs uppercase tracking-[0.16em] text-paper">
                  Vibe-режим — сайт под тебя
                </span>
              </button>

              <div className="my-2 h-px bg-paper/10" />

              <div className="px-2 pb-1 font-display text-[9px] uppercase tracking-[0.16em] text-paper/35">
                Vibe-режим
              </div>
              {/* Same white/thin label treatment as the desktop rail, and
                  the same active-section cue — the sheet used to render every
                  row identically, so on a phone there was no way to tell
                  which section you were actually standing on. */}
              <nav className="flex flex-col gap-0.5">
                {[...pageItems, null, ...crossPageItems].map((item, i) =>
                  item === null ? (
                    pageItems.length > 0 ? (
                      <div key="sep" className="mx-2 my-1.5 h-px bg-paper/10" />
                    ) : null
                  ) : (
                    <SheetRow
                      key={`${item.id}-${i}`}
                      item={item}
                      active={item.id === activeRailId}
                      onClick={() => openItem(item)}
                    />
                  )
                )}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vibe-mode window for one block */}
      <CenterModal open={!!activeItem} onClose={() => setActiveItem(null)} ariaLabel="Vibe режим">
        {activeItem && <VibeModeWindow item={activeItem} onClose={() => setActiveItem(null)} />}
      </CenterModal>

      <VibeMode open={vibeOpen} onClose={() => setVibeOpen(false)} onPickDirection={() => setPickerOpen(true)} />

      {/* Top "Vibe" row — the greeting / direction-picker widget, relocated
          verbatim from the old floating button. */}
      <CenterModal open={pickerOpen} onClose={() => setPickerOpen(false)} ariaLabel="Выбор направления" bare>
        <WelcomeWidget onClose={() => setPickerOpen(false)} skipGreeting />
      </CenterModal>
    </>
  );
}
