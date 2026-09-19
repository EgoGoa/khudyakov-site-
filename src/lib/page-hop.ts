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
}

/** Куда попасть на странице `toSlug`, если сейчас открыта `fromSlug`. */
export function queueChapterHop(fromSlug: string, toSlug: string) {
  pendingChapterId = null;
  const from = ROLES[fromSlug];
  const to = ROLES[toSlug];
  if (!from || !to || !activeChapterId) return;
  const role = from[activeChapterId];
  if (!role) return;
  const byRole = (r: Role) => Object.keys(to).find((id) => to[id] === r) ?? null;
  pendingChapterId = byRole(role) ?? FALLBACK[role].map(byRole).find(Boolean) ?? null;
}

/** Колода забирает ожидающую главу один раз — повторные монтирования её не видят. */
export function takePendingChapter(chapterIds: string[]): number {
  const id = pendingChapterId;
  pendingChapterId = null;
  return id ? chapterIds.indexOf(id) : -1;
}
