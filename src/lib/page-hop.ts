// Стрелки между четырьмя страницами (PageSideNav) должны приводить в тот же
// по смыслу блок: стоял на «Этапах работы» — попал на «Этапы работы» соседней
// страницы. Названия глав у страниц разные (у /content «services», у /ai
// «offer»), поэтому у каждой главы есть роль, а сопоставление идёт по ролям.
//
// Передача между страницами — обычная переменная модуля: клиентский переход
// Next не перезагружает JS, так что она доживает до монтирования новой колоды.

type Role = "intro" | "works" | "why" | "trust" | "offer" | "guarantees" | "process" | "close";

const ROLES: Record<string, Record<string, Role>> = {
  content: { opening: "intro", works: "works", why: "why", services: "offer", process: "process", contact: "close" },
  ai: {
    pitch: "intro",
    portfolio: "works",
    segments: "why",
    trust: "trust",
    offer: "offer",
    guarantees: "guarantees",
    process: "process",
    close: "close",
  },
  sites: { pitch: "intro", method: "why", offer: "offer", process: "process", guarantees: "guarantees", close: "close" },
  smm: { pitch: "intro", method: "why", offer: "offer", process: "process", guarantees: "guarantees", close: "close" },
};

// Если у целевой страницы нет такой роли — ближайшая по смыслу.
const FALLBACK: Record<Role, Role[]> = {
  intro: [],
  works: ["intro", "why"],
  why: ["trust", "works", "intro"],
  trust: ["why", "offer"],
  offer: ["process"],
  guarantees: ["process", "offer"],
  process: ["guarantees", "offer", "close"],
  close: ["process"],
};

let activeChapterId: string | null = null;
let pendingChapterId: string | null = null;

/** Стадия пишет сюда, какая глава сейчас на экране. */
export function reportActiveChapter(id: string | null) {
  activeChapterId = id;
  // Вайб-бар подсвечивает главу по этому же сигналу, а не по своей
  // слежке за видимостью блоков (см. VibeRail).
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(CHAPTER_EVENT, { detail: id }));
}

export const CHAPTER_EVENT = "hdkv:chapter";
export function currentChapterId(): string | null {
  return activeChapterId;
}

/** Переход из шапки (названия страниц): всегда в первую главу — первый
 *  блок под общим блоком с рукой (Егор, 2026-09-28). */
export function queueFirstChapter() {
  pendingChapterId = FIRST;
  scrollToDeckStart();
}

/** Встаёт на первую главу текущей страницы ещё ДО перехода. Общий герой и
 *  блок с рукой одинаковы на всех четырёх страницах, поэтому первая глава
 *  новой страницы окажется ровно здесь же — переход идёт без прокрутки
 *  (scroll: false), и колоде новой страницы не с чем гоняться. Раньше
 *  прыжок делался после монтирования и спорил с автосинхронизацией
 *  колоды по старому положению прокрутки. */
export function scrollToDeckStart() {
  const wrap = document.querySelector<HTMLElement>("[data-stage-wrap]");
  if (!wrap) return;
  window.scrollTo({ top: wrap.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
}
const FIRST = "\u0000first";

/** Боковые стрелки: на соседней странице — тот же по смыслу блок (стоял
 *  на тарифах — попал на тарифы). Если посетитель ещё на общем герое или
 *  подходящей главы нет — первая глава, а не верх с видео. */
export function queueChapterHop(fromSlug: string, toSlug: string) {
  pendingChapterId = FIRST;
  // Роль берём до прокрутки — scrollToDeckStart ниже сменит активную главу.
  const hop = () => scrollToDeckStart();
  const from = ROLES[fromSlug];
  const to = ROLES[toSlug];
  if (from && to && activeChapterId && from[activeChapterId]) {
    const role = from[activeChapterId];
    const byRole = (r: Role) => Object.keys(to).find((id) => to[id] === r) ?? null;
    pendingChapterId = byRole(role) ?? FALLBACK[role].map(byRole).find(Boolean) ?? FIRST;
  }
  hop();
}

/** Колода забирает ожидающую главу один раз — повторные монтирования её не видят. */
export function takePendingChapter(chapterIds: string[]): number {
  const id = pendingChapterId;
  // Не сразу null: в dev React монтирует эффект дважды, и второй заход
  // должен увидеть ту же главу. Через секунду переход уже состоялся.
  if (id) window.setTimeout(() => {
    if (pendingChapterId === id) pendingChapterId = null;
  }, 1000);
  if (id === FIRST) return chapterIds.length ? 0 : -1;
  return id ? chapterIds.indexOf(id) : -1;
}
