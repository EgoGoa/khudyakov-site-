"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useHeaderMenu } from "@/lib/header-menu";
import { useCinematicGoTo } from "@/lib/cinematic-nav";
import WelcomeWidget from "@/components/home/WelcomeWidget";
import CenterModal from "@/components/ui/CenterModal";
import VibeOrb from "@/components/ui/VibeOrb";

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
  const pathname = usePathname();
  const [activeId, setActiveId] = useState("");
  const anchorKey = anchorIds.join(",");

  useEffect(() => {
    const pageMatch = PAGE_ACTIVE_ID[pathname];
    if (pageMatch) {
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

const EASE = [0.22, 1, 0.36, 1] as const;
const VIBE_RAIL_WIDTH = 48; // px — collapsed, icon-only width
// One duration for the whole expand/collapse state change — clipPath,
// scale, opacity and the backdrop's background all read it, so the rail
// arrives as one motion instead of several properties settling at
// different times (see the note on the outer motion.div below).
const RAIL_DUR = 0.32;

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
  description: "Продакшн, AI, сайты и SMM — весь стек услуг агентства.",
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
  description: "Что отличает агентство: опыт, подход и что получает клиент.",
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

const STATS_BLOCK: PageBlock = {
  id: "stats",
  label: "Цифры",
  description: "Опыт агентства в цифрах: клиенты, ролики, страны, команда.",
  glyph: (
    <Glyph>
      <path d="M5 19V10M12 19V5M19 19v-7" />
    </Glyph>
  ),
};

const FINALCTA_BLOCK: PageBlock = {
  id: "finalcta",
  label: "Призыв к действию",
  description: "Короткий питч и прямой путь к заявке или брифу.",
  glyph: (
    <Glyph>
      <path d="M13 3 5 13.5h6L11 21l8-10.5h-6z" />
    </Glyph>
  ),
};

const TESTIMONIALS_BLOCK: PageBlock = {
  id: "testimonials",
  label: "Отзывы",
  description: "Что говорят клиенты о работе с агентством после проекта.",
  glyph: (
    <Glyph>
      <path d="M4 6.5h13a2 2 0 0 1 2 2V14a2 2 0 0 1-2 2H10l-4 3.5V16H6a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2z" />
    </Glyph>
  ),
};

const AICONSULT_BLOCK: PageBlock = {
  id: "ai",
  label: "AI-консультация",
  description: "Чат с AI-консультантом — прикидка формата и бюджета без брифа.",
  glyph: (
    <Glyph>
      <rect x="5" y="7" width="14" height="12" rx="3" />
      <path d="M9 7V4.5h6V7M9 13h.01M15 13h.01" />
      <path d="M3.5 12h1.5M19 12h1.5" />
    </Glyph>
  ),
};

const PRICING_BLOCK: PageBlock = {
  id: "pricing",
  label: "Цены",
  description: "Форматы и стоимость услуг агентства.",
  glyph: (
    <Glyph>
      <path d="M12 3v18M8 7.5h5.5a2.5 2.5 0 0 1 0 5H9a2.5 2.5 0 0 0 0 5H16" />
    </Glyph>
  ),
};

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

// /content is the cinematic deck (CinematicStage): six chapters, ids come
// from its own runway divs at each scroll step (see content/page.tsx's
// CHAPTERS). /ai and /sites are their own decks too (see above). /smm is
// still the plain-scroll layout (see that page.tsx) — one entry here per
// section, in on-page order.
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
    STATS_BLOCK,
    WORKS_BLOCK,
    FINALCTA_BLOCK,
    WHY_BLOCK,
    TESTIMONIALS_BLOCK,
    SERVICES_BLOCK,
    AICONSULT_BLOCK,
    PROCESS_BLOCK,
    PRICING_BLOCK,
    CONTACT_BLOCK,
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
    description: "Формализуйте задачу — с этого агентство начинает работу.",
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
  const pathname = usePathname();
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
    pitch: "Настраиваете вид и содержание блока под свой бренд — сами, без правок агентства.",
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
      <span className="inline-flex items-center gap-2 rounded-full border border-orange/35 bg-orange/10 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-orange">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
        Vibe режим
      </span>

      <h2 className="mt-4 font-display text-2xl uppercase leading-[1.05] tracking-tight text-paper sm:text-3xl">
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
              <span className="rounded-full bg-paper/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-paper/45">
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
            <span className="rounded-full bg-orange/25 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-orange">
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

function RailRow({
  glyph,
  label,
  expanded,
  active = false,
  className = "",
  onClick,
}: {
  glyph: ReactNode;
  label: string;
  expanded: boolean;
  /** Extra classes on the row's button — used to mark the vibe row as the
   *  orb's hover trigger, so the whole row lights it, not just the sphere. */
  className?: string;
  /** This row's section is the one currently on screen — lights the icon
   *  up with the rail's own pink→cyan glow and carries a shared layoutId,
   *  so moving from one active row to the next animates as one glow
   *  sliding between them rather than one switching off and another on. */
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={expanded ? undefined : label}
      aria-label={label}
      aria-current={active ? "true" : undefined}
      // flex-row-reverse + justify-start (reversed, so visually flush right)
      // is what keeps the icon pinned to a constant distance from the page's
      // right edge no matter how wide the row grows — the label just grows
      // in to its left. Anchoring the icon to the row's *left* instead was
      // what made it visibly drift sideways as the panel widened.
      className={`group flex w-full flex-row-reverse items-center justify-start gap-2 rounded-xl py-2 pl-2.5 pr-3 text-right transition-colors hover:bg-paper/[0.08] ${
        active ? "text-white" : "text-paper/70 hover:text-paper"
      } ${className}`}
    >
      {/* Stroke thickens on top of the shared glow below when this row's
          section is the one on screen — the glow alone read as too subtle a
          difference between the active and idle rows at this icon size. */}
      <span
        className={`relative flex h-5 w-5 shrink-0 items-center justify-center [&_svg]:h-[18px] [&_svg]:w-[18px] ${
          active ? "[&_svg]:stroke-[2.35]" : ""
        }`}
      >
        {active && (
          <motion.span
            layoutId="vibe-rail-active-glow"
            transition={{ layout: { type: "spring", stiffness: 340, damping: 28 } }}
            className="vibe-rail-active-glow absolute -inset-[7px] -z-10 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(236,72,153,0.5) 0%, rgba(56,189,248,0.35) 65%, transparent 100%)",
            }}
          />
        )}
        {glyph}
      </span>
      <span
        // Opacity only — no width/max-width transition of its own. The
        // label used to animate its own max-width *at the same time* as the
        // rail's outer width, and the two animations (different easing,
        // different duration) fell out of step: the box clipped the text at
        // whatever width it happened to be mid-transition, which read as
        // the label flickering and getting cut in half. The rail's own
        // overflow-hidden already does 100% of the reveal/hide work as it
        // widens, so the label only needs to fade in once there's visibly
        // room for it — never clip itself again.
        className={`shrink-0 whitespace-nowrap font-mono text-[8px] uppercase leading-none tracking-[0.03em] [text-shadow:0_1px_6px_rgba(0,0,0,0.9)] transition-opacity ${
          expanded ? "opacity-100 duration-200 delay-200" : "opacity-0 duration-100"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

export default function VibeRail() {
  const { pageItems, crossPageItems, anchorIds } = useRailItems();
  const activeRailId = useActiveRailId(anchorIds);
  const [expanded, setExpanded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<RailItem | null>(null);
  // Header's desktop burger dropdown lives in roughly the same top-right
  // corner of the screen — stepping the rail out of the way while it's open
  // is simpler and more robust than trying to keep two floating panels from
  // ever overlapping by careful positioning alone.
  const { menuOpen: headerMenuOpen } = useHeaderMenu();

  useBodyScrollLock(pickerOpen || sheetOpen || !!activeItem);

  const openItem = (item: RailItem) => {
    setSheetOpen(false);
    setExpanded(false);
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
      <motion.div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onFocus={() => setExpanded(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setExpanded(false);
        }}
        animate={{
          // Steps out of the way (see the headerMenuOpen comment above)
          // rather than trying to out-position the burger dropdown.
          // Parked quiet and restored on approach: 40% opacity and 70% scale
          // at rest, both full once the pointer or keyboard focus enters
          // (`expanded` is already set by this element's own
          // mouseenter/focus handlers above, so there is no second piece of
          // state to keep in sync). Both drive the *whole* rail — backdrop
          // and content alike — since opacity/transform on a parent apply to
          // its entire rendered subtree, not just itself.
          opacity: headerMenuOpen ? 0 : expanded ? 1 : 0.4,
          scale: expanded ? 1 : 0.7,
          // The vertical centring has to live here too, not in the className.
          // Motion composes every transform value in this object into one
          // `transform` that *replaces* whatever CSS set — the moment `scale`
          // joined, the class's own `-translate-y-1/2` was dropped and the
          // rail fell out of centre (and out from under the pointer, which is
          // also why hover stopped registering). Keeping y here means one
          // system owns the whole transform.
          y: "-50%",
          // Moved here from the decorative backdrop below, and this is the
          // fix for "раскрывается слишком рано": this outer element is the
          // one with onMouseEnter, and its own hit-test box used to be the
          // full 226px shell at every state — the backdrop's clipPath only
          // ever masked what got *painted*, not what could catch the
          // pointer. So the collapsed rail was already listening across the
          // whole 226px-wide strip, invisible bulk included, and firing
          // `setExpanded(true)` the moment the cursor crossed into that
          // empty space — well before it ever touched the visible pill.
          // clip-path clips hit-testing along with paint (unlike width,
          // it's not a layout property, so this doesn't reintroduce the
          // reflow this component was rewritten to avoid — see the note
          // above), so putting the same expression here makes the
          // interactive area match the visible shape at every state: a
          // narrow strip collapsed, the full panel once it actually opens.
          clipPath: expanded
            ? "inset(0px 0px 0px 0px round 26px)"
            : `inset(0px 0px 0px ${226 - VIBE_RAIL_WIDTH}px round 999px)`,
        }}
        transition={{
          opacity: { duration: RAIL_DUR, ease: EASE },
          scale: { duration: RAIL_DUR, ease: EASE },
          y: { duration: 0 },
          clipPath: { duration: RAIL_DUR, ease: EASE },
        }}
        // origin-right so the rest-state shrink pulls the rail toward the
        // screen edge it is parked against rather than floating it inward.
        className={`fixed right-2 top-1/2 z-[65] hidden w-[226px] origin-right pb-2.5 pt-0.5 lg:block ${
          headerMenuOpen ? "pointer-events-none" : ""
        }`}
      >
        {/* The decorative backdrop — background, blur and glow, separated
            from the content above it so content never has to reflow (see
            the note above). The pill/panel SHAPE itself is no longer
            clipped here: it lives on the outer wrapper's own `clipPath` now
            (see that element's `animate`), because hit-testing needed to
            follow the same shape as the paint — see the note there for why.
            This element just fills whatever area the parent leaves clipped.
            `pointer-events-none`: this layer is paint only, every click
            still reaches the real buttons stacked on top of it. */}
        <motion.div
          aria-hidden="true"
          animate={{
            // A touch darker once labels appear, but staying translucent —
            // going fully opaque here made the panel read as a flat solid
            // card instead of glass. Legibility over busy backgrounds now
            // comes from the label's own text-shadow instead (see RailRow),
            // the same trick the rest of the site uses over video/photo.
            background: expanded ? "rgba(9,9,14,0.4)" : "rgba(11,11,16,0.16)",
            // Same pink→cyan family as the "VIBE САЙТ" pill and the CenterModal
            // window it lights up (see GLASS_BTN.vibe in WelcomeOverlay.tsx),
            // just pushed brighter here — the rail is the thing you're meant
            // to notice first. A dim, steady default (below) so it never reads
            // as fully off; the pulsing wider/more-saturated version on expand
            // is a plain CSS animation (.vibe-rail-backdrop-glow) rather than a
            // Framer `boxShadow: [...]` loop — the loop ran on the JS thread
            // via an inline-style rewrite every frame, competing with click
            // handling and CinematicStage's own scroll rAF for main-thread
            // time the whole time the rail was expanded.
          }}
          transition={{
            background: { duration: RAIL_DUR, ease: EASE },
          }}
          style={{
            // Deliberately no border/ring — just a translucent fill over a
            // strong blur, so the rail reads as glass the page shows through
            // rather than a bordered panel sitting on top of it.
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            boxShadow: "0 0 16px rgba(236,72,153,0.25), 0 0 24px rgba(56,189,248,0.2)",
          }}
          className={`pointer-events-none absolute inset-0 ${expanded ? "vibe-rail-backdrop-glow" : ""}`}
        />
        {/* The rail's crown: the vibe orb replaces the old gradient "V" disc.
            Sized to sit inside the pill's rounded cap with a couple of pixels
            of clearance, so its limb traces the rail's own curve — collapsed
            (a full semicircular cap) and expanded (a 26px corner) alike, since
            it stays pinned to the same corner in both. */}
        <button
          type="button"
          onClick={() => {
            setExpanded(false);
            setPickerOpen(true);
          }}
          aria-label="Vibe"
          aria-haspopup="dialog"
          className="vibe-orb-trigger flex w-full flex-row-reverse items-center justify-start gap-2 pl-2.5 pr-1 text-right"
        >
          <VibeOrb size={40} />
          <span
            className={`shrink-0 whitespace-nowrap font-mono text-[8px] uppercase leading-none tracking-[0.03em] text-paper/70 [text-shadow:0_1px_6px_rgba(0,0,0,0.9)] transition-opacity ${
              expanded ? "opacity-100 duration-200 delay-200" : "opacity-0 duration-100"
            }`}
          >
            Vibe
          </span>
        </button>

        <div className="overflow-hidden">
          <nav className="flex flex-col gap-0.5">
            <div className="mx-3 my-1.5 h-px bg-paper/10" />
            {/* Distinguishes this rail from Header's ordinary nav — without
                it the two read as duplicate menus, since several rows below
                point at the same sections/pages Header already links to.
                Opacity-only, same reveal timing as RailRow's own label, so
                it appears together with the rest of the panel's text. */}
            <div
              className={`px-3 pb-0.5 pt-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-paper/35 transition-opacity ${
                expanded ? "opacity-100 duration-200 delay-200" : "opacity-0 duration-100"
              }`}
            >
              Vibe-режим
            </div>
            {pageItems.map((item) => (
              <RailRow
                key={item.id}
                glyph={item.glyph}
                label={item.label}
                expanded={expanded}
                active={item.id === activeRailId}
                onClick={() => openItem(item)}
              />
            ))}
            {pageItems.length > 0 && <div className="mx-3 my-1.5 h-px bg-paper/10" />}
            {crossPageItems.map((item) => (
              <RailRow
                key={item.id}
                glyph={item.glyph}
                label={item.label}
                expanded={expanded}
                active={item.id === activeRailId}
                onClick={() => openItem(item)}
              />
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Mobile entry point — the old floating "VIBE САЙТ" button's slot and
          role, same static round style as the desktop rail's trigger rather
          than the old button's constant animated glow. */}
      <div className="fixed bottom-6 right-6 z-[65] lg:hidden">
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
          <VibeOrb size={40} />
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
                  setPickerOpen(true);
                }}
                className="vibe-orb-trigger flex w-full items-center gap-3 rounded-xl px-2 py-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                  <VibeOrb size={28} />
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-paper">
                  Vibe — выбор направления
                </span>
              </button>

              <div className="my-2 h-px bg-paper/10" />

              <div className="px-2 pb-1 font-mono text-[9px] uppercase tracking-[0.16em] text-paper/35">
                Vibe-режим
              </div>
              <nav className="flex flex-col gap-0.5">
                {pageItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openItem(item)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left text-paper/80"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center">{item.glyph}</span>
                    <span className="font-sans text-sm">{item.label}</span>
                  </button>
                ))}
                {pageItems.length > 0 && <div className="mx-2 my-1.5 h-px bg-paper/10" />}
                {crossPageItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openItem(item)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left text-paper/80"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center">{item.glyph}</span>
                    <span className="font-sans text-sm">{item.label}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vibe-mode window for one block */}
      <CenterModal open={!!activeItem} onClose={() => setActiveItem(null)} ariaLabel="Vibe режим">
        {activeItem && <VibeModeWindow item={activeItem} onClose={() => setActiveItem(null)} />}
      </CenterModal>

      {/* Top "Vibe" row — the greeting / direction-picker widget, relocated
          verbatim from the old floating button. */}
      <CenterModal open={pickerOpen} onClose={() => setPickerOpen(false)} ariaLabel="Выбор направления">
        <WelcomeWidget onClose={() => setPickerOpen(false)} />
      </CenterModal>
    </>
  );
}
