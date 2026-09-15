// /ai's own tier data for Close.tsx's `interactiveTiers` prop — same names,
// taglines, team sizes and prices already published in pricingByCategory.ai
// (lib/service-content.ts), just split into the same granular line items
// content and sites' plain tiers don't have: "2–3 AI-инструмента (контент +
// коммуникация/продажи)" becomes two separate lines, one per instrument
// named in the original sentence, rather than staying one dense bullet.
//
// This used to be togglable — a visitor could check/uncheck optional items
// and watch the price interpolate between the tier's floor and ceiling (see
// InteractiveTierCard.tsx's git history). Egor's call: the checkboxes read
// as a form and the unchecked items' strikethrough text read as "missing"
// rather than "optional", so the whole thing is static now. What's kept
// from that version is the one part that actually worked — three tiers with
// visibly different item counts (3 → 5 → 7) is what tells a visitor "Рост"
// carries more than "Старт" without having to read every line, exactly the
// same way /content's plain tier cards already do it.
//
// No new numbers are invented anywhere here: every `priceLabel` is the exact
// string already printed on pricingByCategory.ai's own cards.

export type PriceItem = { label: string };

export type InteractiveTier = {
  name: string;
  tagline: string;
  team: string;
  pro: boolean;
  priceLabel: string;
  items: PriceItem[];
};

export const AI_INTERACTIVE_TIERS: InteractiveTier[] = [
  {
    name: "Старт",
    tagline: "Один процесс, быстрый результат",
    team: "Команда: 1–2 специалиста",
    pro: false,
    priceLabel: "50 000–150 000 ₽ (разово)",
    items: [
      { label: "Аудит + 1 AI-инструмент под задачу" },
      { label: "Настройка и запуск за 1–2 недели" },
      { label: "Базовая инструкция для команды клиента" },
    ],
  },
  {
    name: "Рост",
    tagline: "AI встроен в несколько процессов",
    team: "Команда: 2–3 специалиста",
    pro: true,
    priceLabel: "150 000–350 000 ₽/мес",
    items: [
      { label: "AI-инструмент для контента" },
      { label: "AI-инструмент для коммуникации / продаж" },
      { label: "Интеграция с CRM" },
      { label: "Интеграция с соцсетями" },
      { label: "Ежемесячная донастройка по метрикам" },
    ],
  },
  {
    name: "Полный цикл",
    tagline: "AI как часть операционки бизнеса",
    team: "Команда: 3–5 специалистов",
    pro: false,
    priceLabel: "от 350 000 ₽/мес",
    items: [
      { label: "AI-внедрение в контент" },
      { label: "AI-внедрение в продажи" },
      { label: "AI-внедрение в аналитику" },
      { label: "AI-внедрение во внутренние процессы" },
      { label: "Персональный AI-стратег" },
      { label: "Приоритетная поддержка" },
      { label: "Еженедельная отчётность" },
    ],
  },
];
