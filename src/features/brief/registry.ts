import type { AnyBriefId, BriefConfig, BriefId } from "./types";
import { ai } from "./configs/ai";
import { content } from "./configs/content";
import { general } from "./configs/general";
import { sites } from "./configs/sites";
import { smm } from "./configs/smm";

// Единственное место, где страница услуги связывается с брифом. Никакого
// определения по тексту заголовка, глобальному состоянию или порядку блоков.
// scripts/check-briefs.mjs роняет сборку, если у страницы услуги нет записи
// или ссылка «Бриф» на ней ведёт на бриф чужой категории.

export const briefConfigs: Record<BriefId, BriefConfig> = { content, sites, smm, ai };

/** Маршрут (раздел или отдельная страница) → бриф. Подстраницы раздела
 *  (/ai/agent, /sites/landing…) наследуют бриф раздела по самому длинному
 *  совпавшему префиксу. */
export const serviceBriefMap: Record<string, BriefId> = {
  "/content": "content",
  "/sites": "sites",
  "/smm": "smm",
  "/smm/cases": "smm",
  "/smm/pricing": "smm",
  "/ai": "ai",
};

/** Фон страницы брифа — стоковая картинка по теме услуги (свой домен, не внешний хост). */
export const briefBackground: Record<AnyBriefId, string> = {
  content: "/images/blocks/stock-directing.jpg",
  sites: "/images/stock/devs-night.webp",
  smm: "/images/stock/smm-phone-bokeh.webp",
  ai: "/images/blocks/ai-neon-desk.jpg",
  general: "/images/blocks/stock-briefing.jpg",
};

/** Куда ведёт «Вернуться к услугам» после отправки. */
export const briefHome: Record<AnyBriefId, string> = {
  content: "/content",
  sites: "/sites",
  smm: "/smm",
  ai: "/ai",
  general: "/content",
};

export const BRIEF_PAGE_IDS: AnyBriefId[] = ["content", "sites", "smm", "ai", "general"];

const clean = (route: string) => (route.split(/[?#]/)[0].replace(/\/+$/, "") || "/");

export function getBriefIdForRoute(route: string): BriefId | null {
  const path = clean(route);
  let best: string | null = null;
  for (const key of Object.keys(serviceBriefMap)) {
    if ((path === key || path.startsWith(`${key}/`)) && (!best || key.length > best.length)) best = key;
  }
  return best ? serviceBriefMap[best] : null;
}

export function getBriefConfig(id: AnyBriefId): BriefConfig {
  return id === "general" ? general : briefConfigs[id];
}

/** Ссылка на страницу брифа для страницы услуги. Нет привязки → общая
 *  страница выбора /brief. */
export function briefHrefForRoute(route: string): string {
  const id = getBriefIdForRoute(route);
  return id ? `/brief/${id}` : "/brief";
}

/** Бриф «текущей» категории из браузера: по адресу страницы услуги, а на
 *  общих страницах (главная, работы, калькулятор) — по выбранной в меню
 *  услуге (hdkv-active-service). Спрашивать «какой бриф» не нужно. */
export function currentBriefHref(): string {
  const id = getBriefIdForRoute(window.location.pathname);
  if (id) return `/brief/${id}`;
  try {
    const saved = window.localStorage.getItem("hdkv-active-service");
    if (saved && saved in briefConfigs) return `/brief/${saved}`;
  } catch {
    /* хранилище закрыто — берём контент */
  }
  return "/brief/content";
}
