import type { AnyBriefId, BriefConfig, BriefId } from "./types";
import { ai } from "./configs/ai";
import { content } from "./configs/content";
import { general } from "./configs/general";
import { sites } from "./configs/sites";
import { smm } from "./configs/smm";
import { stripLocale } from "@/i18n/href";

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

const LAST_KEY = "hdkv-last-service";

/** Запоминает услугу, на странице которой был посетитель: бриф и калькулятор
 *  с общих страниц (главная, работы) открываются под неё. */
export function rememberService(pathname: string) {
  const id = getBriefIdForRoute(pathname);
  if (!id) return;
  try {
    window.localStorage.setItem(LAST_KEY, id);
  } catch {
    /* хранилище закрыто — не страшно */
  }
}

/** Текущая услуга: по адресу страницы услуги, иначе последняя посещённая,
 *  иначе выбранная в меню, иначе контент. Спрашивать посетителя не нужно. */
export function currentServiceId(): BriefId {
  const fromPath = getBriefIdForRoute(stripLocale(window.location.pathname));
  if (fromPath) return fromPath;
  try {
    for (const key of [LAST_KEY, "hdkv-active-service"]) {
      const saved = window.localStorage.getItem(key);
      if (saved && saved in briefConfigs) return saved as BriefId;
    }
  } catch {
    /* хранилище закрыто — берём контент */
  }
  return "content";
}

export const currentBriefHref = () => `/brief/${currentServiceId()}`;
export const currentCalculatorHref = () => `/calculator/${currentServiceId()}`;

/** Ссылка на бриф/калькулятор для серверного рендера и меню: по адресу
 *  страницы; на общих страницах ведёт на редирект (/brief, /calculator). */
export function serviceHrefForRoute(base: "brief" | "calculator", route: string): string {
  const id = getBriefIdForRoute(route);
  return id ? `/${base}/${id}` : `/${base}`;
}

/** Все адреса брифов — для предзагрузки, чтобы бриф открывался мгновенно. */
export const BRIEF_HREFS = BRIEF_PAGE_IDS.map((id) => `/brief/${id}`);
export const CALCULATOR_HREFS = (["content", "sites", "smm", "ai"] as const).map((id) => `/calculator/${id}`);
