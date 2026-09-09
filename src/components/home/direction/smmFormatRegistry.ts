import type { CompactToolContent } from "./types";
import { smmReelsContent } from "./content/smm-reels";
import { smmStoriesContent } from "./content/smm-stories";
import { smmCarouselContent } from "./content/smm-carousel";
import { smmAdsContent } from "./content/smm-ads";
import { smmBloggersContent } from "./content/smm-bloggers";

// Страницы форматов внутри /smm/[format] — Reels, Сторис, Карусели, Таргет,
// Блогеры (карточки карусели SmmDeck, см. SmmPitch).
//
// Отдельный реестр от toolRegistry.ts (AI), а не общий: маршрут другой
// (/smm/[format] вместо /ai/[tool]), и /smm пока не заводит свой аналог
// DirectionPage — все пять форматов идут на компактном шаблоне
// (CompactToolPage, 7 экранов), тот же, что у второй пятёрки инструментов
// /ai. Порядок объекта — тот же, что в SmmDeck.FORMATS: Reels, Сторис,
// Карусели, Таргет, Блогеры.
export const smmFormatPages: Record<string, CompactToolContent> = {
  [smmReelsContent.slug]: smmReelsContent,
  [smmStoriesContent.slug]: smmStoriesContent,
  [smmCarouselContent.slug]: smmCarouselContent,
  [smmAdsContent.slug]: smmAdsContent,
  [smmBloggersContent.slug]: smmBloggersContent,
};

/** Короткие тексты для <head>. Формат добавляется сюда в тот же момент,
 *  что и в `smmFormatPages` выше. */
export const smmFormatMeta: Record<string, { title: string; description: string }> = {
  reels: {
    title: "Reels — SMM",
    description:
      "Короткое вертикальное видео с максимальным охватом среди форматов соцсетей — снимаем и монтируем той же командой, что делает рекламные ролики.",
  },
  stories: {
    title: "Сторис — SMM",
    description:
      "Ежедневный контакт с аудиторией между Reels и каруселями — снимается в день выхода, без отдельной съёмочной группы.",
  },
  carousel: {
    title: "Карусели — SMM",
    description:
      "Формат с вовлечённостью выше, чем у Reels, и главный инструмент на сохранения — удерживает аудиторию, которую уже привёл охват.",
  },
  ads: {
    title: "Таргетированная реклама — SMM",
    description:
      "Настройка и тесты креативов в VK и Telegram Ads — воронка ведёт в канал, бота или Mini App, а не теряет аудиторию на переходе на сайт.",
  },
  bloggers: {
    title: "Блогеры — SMM",
    description:
      "Подбор блогеров под аудиторию и бюджет — 94% интеграций в России укладываются в бюджет одного рекламного ролика.",
  },
};
