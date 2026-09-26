import { works } from "./data";
import { pricingByCategory, serviceMeta, type ServiceKey } from "./service-content";
import type { PricingTier, Work } from "./types";

// Vibe-режим (Егор, 2026-09-26): короткая анкета по одному вопросу, после
// неё — мгновенный черновик личного лендинга, а полную страницу команда
// присылает в течение часа.
//
// Черновик собирается прямо в браузере из того, что уже есть на сайте
// (тарифы направлений и кейсы портфолио), а не через /api/ask: главный домен
// hdkv-ai.ru — статичная выгрузка без сервера, и AI-запрос там просто не
// дойдёт. Правила подбора простые и предсказуемые — «ассистент» здесь
// честно подбирает из готового, а пишет страницу уже команда.

export type VibeOption = { value: string; label: string };

export type VibeQuestion = {
  id: string;
  title: string;
  hint: string;
  options: VibeOption[];
  /** Много коротких вариантов — сетка чипов вместо крупных карточек. */
  chips?: boolean;
  /** Можно ответить своими словами. */
  own?: boolean;
  /** Вопрос можно пропустить. */
  optional?: boolean;
  /** Реплика ассистента под вопросом, когда ответ выбран. */
  react?: (answer: VibeAnswer) => string | null;
};

export type VibeAnswer = { value: string; label: string; own?: boolean };
export type VibeAnswers = Record<string, VibeAnswer>;

const DIRECTION_LABEL: Record<string, string> = {
  sites: "сайт",
  content: "видео",
  ai: "AI-решение",
  smm: "SMM",
  complex: "комплекс",
};

export const VIBE_QUESTIONS: VibeQuestion[] = [
  {
    id: "direction",
    title: "Что запускаем?",
    hint: "Выбери главное — остальное подберём вместе",
    options: [
      { value: "sites", label: "Сайт или лендинг" },
      { value: "content", label: "Видео и контент" },
      { value: "ai", label: "AI-решение для бизнеса" },
      { value: "smm", label: "Соцсети и SMM" },
      { value: "complex", label: "Всё вместе, под ключ" },
    ],
    own: true,
    react: (a) =>
      a.own ? "Интересно. Разберём задачу и подберём формат" : `Отлично, собираю черновик под ${DIRECTION_LABEL[a.value] ?? "задачу"}`,
  },
  {
    id: "sphere",
    title: "В какой ты сфере?",
    hint: "По сфере подберём кейсы, похожие на твой проект",
    chips: true,
    options: [
      { value: "Медицина", label: "Медицина" },
      { value: "Красота и фэшн", label: "Красота и фэшн" },
      { value: "HoReCa и кофейни", label: "Кафе и рестораны" },
      { value: "Туризм и отели", label: "Туризм и отели" },
      { value: "Образование", label: "Образование" },
      { value: "Спорт и фитнес", label: "Спорт и фитнес" },
      { value: "Авто", label: "Авто" },
      { value: "IT и финтех", label: "IT и финтех" },
      { value: "Промышленность и B2B", label: "Производство и B2B" },
      { value: "Ритейл", label: "Ритейл" },
      { value: "Недвижимость и стройка", label: "Недвижимость" },
      { value: "События и шоу", label: "События и шоу" },
    ],
    own: true,
    react: (a) => {
      if (a.own) return "Запомнила сферу — найдём самые близкие кейсы";
      const n = works.filter((w) => w.sphere === a.value).length;
      return n > 0 ? `В этой сфере у нас ${n} ${plural(n, "проект", "проекта", "проектов")} — покажу лучшие` : "Подберём кейсы из соседних сфер";
    },
  },
  {
    id: "goal",
    title: "Какая главная цель?",
    hint: "От цели зависит, с чего начнётся твоя страница",
    options: [
      { value: "leads", label: "Больше заявок и продаж" },
      { value: "launch", label: "Запустить новый продукт" },
      { value: "brand", label: "Имидж и узнаваемость" },
      { value: "automate", label: "Автоматизировать рутину" },
    ],
    own: true,
  },
  {
    id: "stage",
    title: "Что у тебя уже есть?",
    hint: "Чтобы не делать заново то, что уже работает",
    options: [
      { value: "zero", label: "Ничего — начинаем с нуля" },
      { value: "refresh", label: "Сайт или соцсети, пора обновить" },
      { value: "content", label: "Есть материалы, нужна упаковка" },
      { value: "team", label: "Есть команда, нужны руки и идеи" },
    ],
    own: true,
  },
  {
    id: "budget",
    title: "Какой бюджет на проект?",
    hint: "Это только ориентир — под него подберём тариф",
    options: [
      { value: "50", label: "До 50 000 ₽" },
      { value: "150", label: "50–150 000 ₽" },
      { value: "400", label: "150–400 000 ₽" },
      { value: "max", label: "Больше 400 000 ₽" },
      { value: "help", label: "Пока не знаю — подскажите" },
    ],
    own: true,
    react: () => "Подберу тариф, который уложится в этот бюджет",
  },
  {
    id: "deadline",
    title: "Когда нужен результат?",
    hint: "Под сроки соберём команду нужного размера",
    options: [
      { value: "asap", label: "Вчера — горит" },
      { value: "month", label: "За 2–4 недели" },
      { value: "quarter", label: "За 1–2 месяца" },
      { value: "calm", label: "Не спешу, важно качество" },
    ],
    own: true,
  },
  {
    id: "style",
    title: "Какой стиль тебе ближе?",
    hint: "В этом стиле соберём и твой лендинг",
    options: [
      { value: "minimal", label: "Чистый минимализм" },
      { value: "bold", label: "Ярко и смело" },
      { value: "premium", label: "Дорого, премиально" },
      { value: "warm", label: "Тепло и по-человечески" },
    ],
    own: true,
  },
  {
    id: "refs",
    title: "Есть ссылка на проект или референсы?",
    hint: "Сайт, соцсети или то, что нравится. Можно пропустить",
    options: [],
    own: true,
    optional: true,
  },
];

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

const BUDGET_CAP: Record<string, number> = { "50": 50_000, "150": 150_000, "400": 400_000, max: Infinity };

function minPrice(tier: PricingTier): number {
  const digits = tier.price.replace(/\s/g, "").match(/\d+/);
  return digits ? Number(digits[0]) : 0;
}

export type VibeDraft = {
  key: ServiceKey;
  directionLabel: string;
  sphereLabel: string | null;
  tier: PricingTier;
  cases: Work[];
  headline: string;
};

/** Мгновенный черновик: направление → тариф по бюджету → кейсы по сфере. */
export function buildVibeDraft(answers: VibeAnswers): VibeDraft {
  const dir = answers.direction?.value;
  const key: ServiceKey = dir === "content" || dir === "ai" || dir === "smm" ? dir : "sites";
  const tiers = pricingByCategory[key];

  const budget = answers.budget?.value;
  const cap = budget ? BUDGET_CAP[budget] : undefined;
  let tier = tiers[Math.min(1, tiers.length - 1)];
  if (cap !== undefined) {
    const fits = tiers.filter((t) => minPrice(t) <= cap);
    tier = fits.length ? fits[fits.length - 1] : tiers[0];
  }

  const sphere = answers.sphere && !answers.sphere.own ? answers.sphere.value : null;
  const byDate = (a: Work, b: Work) => (b.date ?? "").localeCompare(a.date ?? "");
  const matched = sphere ? works.filter((w) => w.sphere === sphere).sort(byDate) : [];
  const fill = works.filter((w) => w.category === "Шоурилы" && !matched.includes(w)).sort(byDate);
  const cases = [...matched, ...fill].slice(0, 3);

  const sphereLabel = answers.sphere?.label ?? null;
  const what = dir === "complex" ? "Комплекс под ключ" : serviceMeta[key].label;
  const headline = sphereLabel ? `${what} для сферы «${sphereLabel}»` : what;

  return { key, directionLabel: what, sphereLabel, tier, cases, headline };
}

/** Ответы анкеты в виде полей письма (/api/lead, lead.php). */
export function vibeAnswersToFields(answers: VibeAnswers): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const q of VIBE_QUESTIONS) {
    const a = answers[q.id];
    fields[q.title] = a ? `${a.label}${a.own ? " (свой ответ)" : ""}` : "—";
  }
  return fields;
}
