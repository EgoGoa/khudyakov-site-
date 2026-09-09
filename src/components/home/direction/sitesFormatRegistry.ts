import type { CompactToolContent } from "./types";
import { sitesLandingContent } from "./content/sites-landing";
import { sitesCardContent } from "./content/sites-card";
import { sitesTurnkeyContent } from "./content/sites-turnkey";
import { sitesAssistantContent } from "./content/sites-assistant";
import { sitesRedesignContent } from "./content/sites-redesign";

// Страницы форматов внутри /sites/[format] — Лендинг, Сайт-визитка, Сайт
// под ключ, AI-ассистент, Редизайн (карточки карусели SitesDeck).
//
// Тот же приём, что у smmFormatRegistry.ts: один реестр, один компактный
// шаблон (CompactToolPage, 7 экранов) для всех пяти сразу — здесь нет
// наследия из "первой пятёрки на полном DirectionPage", как у /ai/[tool],
// поэтому развилка между двумя шаблонами не нужна.
export const sitesFormatPages: Record<string, CompactToolContent> = {
  [sitesLandingContent.slug]: sitesLandingContent,
  [sitesCardContent.slug]: sitesCardContent,
  [sitesTurnkeyContent.slug]: sitesTurnkeyContent,
  [sitesAssistantContent.slug]: sitesAssistantContent,
  [sitesRedesignContent.slug]: sitesRedesignContent,
};

/** Короткие тексты для <head>. Формат добавляется сюда в тот же момент,
 *  что и в `sitesFormatPages` выше. */
export const sitesFormatMeta: Record<string, { title: string; description: string }> = {
  landing: {
    title: "Лендинг — Vibe сайты",
    description:
      "Одна страница под конкретный оффер — 5 рабочих дней до запуска, средняя конверсия по рынку 6,6%, у лучших страниц выше 11%.",
  },
  card: {
    title: "Сайт-визитка — Vibe сайты",
    description:
      "До 5 страниц, представляющих компанию — первое впечатление формируется за 0,05 секунды, и 75% судят о надёжности именно по дизайну.",
  },
  turnkey: {
    title: "Сайт под ключ — Vibe сайты",
    description:
      "Каталог, формы и интеграция с CRM одним проектом — 10+ страниц, AI-ассистент на сайте по запросу.",
  },
  assistant: {
    title: "AI-ассистент на сайте — Vibe сайты",
    description:
      "Отвечает посетителям сайта до подключения менеджера — та же экономика первых минут ответа, что и в мессенджерах.",
  },
  redesign: {
    title: "Редизайн сайта — Vibe сайты",
    description:
      "Обновление без потери SEO-позиций — устаревший дизайн стоит компании доверия за 0,05 секунды первого впечатления.",
  },
};
