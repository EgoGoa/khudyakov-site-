// Interactive version of pricingByCategory.ai's three tiers (see
// lib/service-content.ts) — same names, taglines, team sizes and price
// floors/ceilings, just split into checkable line items instead of three
// flat bullets, so a visitor can see roughly where their own price would
// land inside the tier's own already-published range as they add or drop
// scope. /ai only for now; /content, /sites, /smm keep the plain static
// cards (see Close.tsx's `interactiveTiers` prop — optional, this is the
// only page that passes it).
//
// No new numbers are invented anywhere here: `min`/`max` are exactly the
// bounds already printed on the static card ($500–1500, $1500–4000, "от
// $4000" with no stated ceiling), and every item's price effect comes from
// linearly interpolating inside that same range — not from a per-feature
// price list, which nobody has confirmed. `required` items are the part of
// the original bullet that defines the tier's own floor and can't be
// unchecked; `optional` items are literally the rest of that tier's
// original three bullets, split into their named parts (e.g. "2–3
// AI-инструмента (контент + коммуникация/продажи)" becomes two checkable
// lines, one per instrument named in the original sentence) rather than
// invented additions.

export type PriceItem = { label: string; required?: boolean };

export type InteractiveTier = {
  name: string;
  tagline: string;
  team: string;
  pro: boolean;
  currency: "$";
  min: number;
  /** Undefined means the tier is open-ended ("от $X/мес") — no confirmed
   *  ceiling exists to interpolate toward, so the price stays fixed at
   *  `min` regardless of which optional items are checked (see
   *  InteractiveTierCard's own handling). */
  max?: number;
  suffix: string;
  items: PriceItem[];
};

export const AI_INTERACTIVE_TIERS: InteractiveTier[] = [
  {
    name: "Старт",
    tagline: "Один процесс, быстрый результат",
    team: "Команда: 1–2 специалиста",
    pro: false,
    currency: "$",
    min: 500,
    max: 1500,
    suffix: " (разово)",
    items: [
      { label: "Аудит + 1 AI-инструмент под задачу", required: true },
      { label: "Настройка и запуск за 1–2 недели" },
      { label: "Базовая инструкция для команды клиента" },
    ],
  },
  {
    name: "Рост",
    tagline: "AI встроен в несколько процессов",
    team: "Команда: 2–3 специалиста",
    pro: true,
    currency: "$",
    min: 1500,
    max: 4000,
    suffix: "/мес",
    items: [
      { label: "AI-инструмент для контента", required: true },
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
    currency: "$",
    min: 4000,
    // No stated ceiling on the static card ("от $4000/мес") — kept open
    // here too rather than inventing one.
    max: undefined,
    suffix: "/мес",
    items: [
      { label: "AI-внедрение в контент", required: true },
      { label: "AI-внедрение в продажи" },
      { label: "AI-внедрение в аналитику" },
      { label: "AI-внедрение во внутренние процессы" },
      { label: "Персональный AI-стратег" },
      { label: "Приоритетная поддержка" },
      { label: "Еженедельная отчётность" },
    ],
  },
];
