import type { SmmServiceContent } from "@/components/home/direction/types";
import { smmShootingContent } from "@/components/home/direction/content/smm-shooting";
import { smmCommunityContent } from "@/components/home/direction/content/smm-community";
import { smmTargetingContent } from "@/components/home/direction/content/smm-targeting";
import { smmAnalyticsContent } from "@/components/home/direction/content/smm-analytics";
import { smmBloggersContent } from "@/components/home/direction/content/smm-bloggers";
import { smmStrategyContent } from "@/components/home/direction/content/smm-strategy";

// Страницы отдельных услуг SMM — /smm/[service].
//
// Тот же приём, что у AI-инструментов (см. direction/toolRegistry.ts):
// раскладка общая (SmmServicePage, 5 экранов — см. её комментарий и
// SmmServiceContent в types.ts), услуга — это файл данных. Реестр отдельный
// от aiToolPages/aiCompactToolPages, потому что маршруты разные (/ai/[tool]
// и /smm/[service]) и слуги не должны пересекаться.
//
// Порядок — тот же, в котором услуги перечислены в service-content.ts
// (servicesByCategory.smm) и в чём рендерятся в SmmOffer на /smm.
export const smmServicePages: Record<string, SmmServiceContent> = {
  [smmShootingContent.slug]: smmShootingContent,
  [smmCommunityContent.slug]: smmCommunityContent,
  [smmTargetingContent.slug]: smmTargetingContent,
  [smmAnalyticsContent.slug]: smmAnalyticsContent,
  [smmBloggersContent.slug]: smmBloggersContent,
  [smmStrategyContent.slug]: smmStrategyContent,
};

/** Ярлыки для ссылок из SmmOffer — по одному слову-два меньше, чем
 *  service.title в service-content.ts, а не заголовок страницы. */
export const smmServiceSlugByTitle: Record<string, string> = {
  "Съёмка и монтаж контента": "shooting",
  "Комьюнити-менеджмент": "community",
  "Таргетированная реклама": "targeting",
  "Аналитика и отчётность": "analytics",
  "Блогеры и инфлюенс-маркетинг": "bloggers",
  "Контент-стратегия": "strategy",
};

export const smmServiceMeta: Record<string, { title: string; description: string }> = {
  shooting: {
    title: "Съёмка и монтаж контента",
    description: "Reels, сторис и карусели снимает и монтирует та же продакшн-команда, без подрядчиков на стороне.",
  },
  community: {
    title: "Комьюнити-менеджмент",
    description: "Отвечаем в директ и комментарии от лица бренда по вашим формулировкам, с прозрачной перепиской.",
  },
  targeting: {
    title: "Таргетированная реклама",
    description: "Настройка, тест креативов и оптимизация бюджета — с отчётом по каждой рекламной связке.",
  },
  analytics: {
    title: "Аналитика и отчётность",
    description: "Еженедельный отчёт с выводами: что сделано, что сработало и что меняем в плане дальше.",
  },
  bloggers: {
    title: "Блогеры и инфлюенс-маркетинг",
    description: "Подбор блогеров под аудиторию и бюджет с проверкой на накрутку до оплаты размещения.",
  },
  strategy: {
    title: "Контент-стратегия",
    description: "План публикаций на месяц вперёд: рубрики, форматы и цель каждого поста прописаны заранее.",
  },
};
