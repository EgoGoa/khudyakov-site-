// Разделы каждой из четырёх страниц направлений и общие страницы — один
// список на боковое меню (VibeRail) и шторку шапки (Header), чтобы пункты и
// иконки в обоих местах совпадали (Егор, 2026-10-08). Раньше шторка на всех
// страницах показывала разделы /content, и на /ai, /sites, /smm её пункты
// вели в никуда.

import type { SectionIconName } from "@/components/ui/SectionIcon";

export type RailItem = {
  id: string;
  label: string;
  /** Shown inside the Vibe-mode window under the section's name. */
  description: string;
  /** Where "Обычная страница" actually goes. */
  href: string;
  icon: SectionIconName;
};

// A block belongs to exactly one page and is rendered with an in-page
// `#id` anchor computed from the current route (see PAGE_BLOCKS here, useRailItems
// in VibeRail.tsx) — unlike CROSS_PAGE_ITEMS, whose href is a real destination page.
export type PageBlock = Omit<RailItem, "href">;

const WORKS_BLOCK: PageBlock = {
  id: "works",
  label: "Работы",
  description: "78 проектов портфолио: реклама, шоурилы, 3D и моушн.",
  icon: "reel",
};

const SERVICES_BLOCK: PageBlock = {
  id: "services",
  label: "Что делаем",
  description: "Продакшн, AI, сайты и SMM — весь стек услуг сервиса.",
  icon: "moviecam",
};

const CONTACT_BLOCK: PageBlock = {
  id: "contact",
  label: "Цены и заявка",
  description: "Сроки, бюджет и как быстрее всего оставить заявку.",
  icon: "priceTag",
};

const PROCESS_BLOCK: PageBlock = {
  id: "process",
  label: "Как мы работаем",
  description: "Шесть шагов пути: от оценки проекта до сдачи и поддержки.",
  icon: "storyboard",
};

const WHY_BLOCK: PageBlock = {
  id: "why",
  label: "Почему мы",
  description: "Что отличает сервис: опыт, подход и что получает клиент.",
  icon: "trophy",
};

// The cinematic deck's opening chapter on /content — its id comes from
// CinematicStage's own runway div (see CHAPTERS in content/page.tsx), not
// from the Opening component itself.
const OPENING_BLOCK: PageBlock = {
  id: "opening",
  label: "Интро",
  description: "Ключевой месседж и цифры результата — открывающий кадр.",
  icon: "clapper",
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
  icon: "robot",
};

const AI_PORTFOLIO_BLOCK: PageBlock = {
  id: "portfolio",
  label: "Портфолио AI-работ",
  description: "Кейсы AI-проектов — первые уже в работе.",
  icon: "gallery",
};

const AI_SEGMENTS_BLOCK: PageBlock = {
  id: "segments",
  label: "Кому подходит",
  description: "4 сегмента бизнеса и кейсы под каждый.",
  icon: "pie",
};

const AI_TRUST_BLOCK: PageBlock = {
  id: "trust",
  label: "Почему мы",
  description: "Продюсерский центр полного цикла — 60% заказов возвращаются.",
  icon: "boomerang",
};

const AI_OFFER_BLOCK: PageBlock = {
  id: "offer",
  label: "Что делаем",
  description: "10 AI-услуг: боты, контент, аналитика.",
  icon: "chip",
};

const AI_GUARANTEES_BLOCK: PageBlock = {
  id: "guarantees",
  label: "Условия и гарантии",
  description: "Права, SLA, сроки и команда, которая за этим стоит.",
  icon: "shieldCheck",
};

const AI_PROCESS_BLOCK: PageBlock = {
  id: "process",
  label: "Как проходит внедрение",
  description: "Шесть шагов от аудита процессов до сопровождения.",
  icon: "plug",
};

const AI_CLOSE_BLOCK: PageBlock = {
  id: "close",
  label: "Цены и заявка",
  description: "Тарифы под задачу и старт проекта.",
  icon: "rubleCoin",
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
  icon: "browserCursor",
};

const SITES_METHOD_BLOCK: PageBlock = {
  id: "method",
  label: "Метод и кому подходит",
  description: "Как AI ускоряет черновик и три сегмента, которым это подходит.",
  icon: "wand",
};

const SITES_OFFER_BLOCK: PageBlock = {
  id: "offer",
  label: "Что делаем",
  description: "От лендинга до сайта под ключ с интеграциями.",
  icon: "layout",
};

const SITES_PROCESS_BLOCK: PageBlock = {
  id: "process",
  label: "Как проходит работа",
  description: "Пять шагов от брифа до запуска.",
  icon: "rocket",
};

const SITES_GUARANTEES_BLOCK: PageBlock = {
  id: "guarantees",
  label: "Почему мы",
  description: "Фиксированные сроки, гарантия возврата и свой код.",
  icon: "key",
};

const SITES_CLOSE_BLOCK: PageBlock = {
  id: "close",
  label: "Цены и заявка",
  description: "Три пакета и старт проекта.",
  icon: "tiers",
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
  icon: "phoneCam",
};

const SMM_METHOD_BLOCK: PageBlock = {
  id: "method",
  label: "Не подрядчик",
  description: "Сравнение с фрилансером и сервисом — и кому это подходит.",
  icon: "badge",
};

const SMM_OFFER_BLOCK: PageBlock = {
  id: "offer",
  label: "Что делаем",
  description: "Полный цикл ведения: от съёмки и монтажа до таргета и отчёта.",
  icon: "heartBubble",
};

const SMM_PROCESS_BLOCK: PageBlock = {
  id: "process",
  label: "Как проходит работа",
  description: "Пять шагов от аудита до еженедельного отчёта.",
  icon: "growth",
};

const SMM_GUARANTEES_BLOCK: PageBlock = {
  id: "guarantees",
  label: "Что входит",
  description: "Фиксированный пакет, согласование контента и отчёт каждую неделю.",
  icon: "gift",
};

const SMM_CLOSE_BLOCK: PageBlock = {
  id: "close",
  label: "Пакеты ведения",
  description: "Три месячных пакета и старт работы.",
  icon: "calendar",
};

// Every one of the four service pages is a CinematicStage deck now, so each
// list below is exactly that page's own CHAPTERS ids, in order — the rail's
// scroll-spy and its "Обычная страница" jump both address the deck's runway
// divs by id, so a list that drifts from the page's chapters silently breaks
// both (see the note above SMM_PITCH_BLOCK for what that looked like).
export const PAGE_BLOCKS: Record<string, PageBlock[]> = {
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
export const CROSS_PAGE_ITEMS: RailItem[] = [
  {
    id: "catalog",
    label: "Все работы",
    description: "Полный каталог — 78 работ с фильтрами по формату и сфере.",
    href: "/works",
    icon: "catalog",
  },
  {
    id: "calculator",
    label: "Калькулятор",
    description: "Прикидка бюджета по формату, хронометражу и срокам.",
    href: "/calculator",
    icon: "calculator",
  },
  {
    id: "brief",
    label: "Бриф",
    description: "Формализуйте задачу — с этого сервис начинает работу.",
    href: "/brief",
    icon: "brief",
  },
];
