import { works } from "./data";
import {
  pricingByCategory,
  processByCategory,
  serviceMeta,
  whyByCategory,
  type ServiceKey,
} from "./service-content";
import type { PricingTier, ProcessStep, Work } from "./types";

// Vibe-режим (Егор, 2026-09-26). Суть фишки: интерактивная анкета на ~3
// минуты → автоматически собранная лендинг (/offer) в фирменном стиле
// сайта: под сферу, задачу и бюджет клиента, с решением, кейсами и
// тарифами, чтобы он заказал, уже всё изучив.
//
// Лендинг собирается прямо в браузере из ответов и данных сайта, без сервера и
// без AI-запроса: главный домен hdkv-ai.ru — статичная выгрузка. Ответы
// едут в адресе страницы (/offer?p=…), поэтому ссылку можно переслать, и
// она же приходит Егору в письме с заявкой. Имени и телефона в адресе нет —
// они остаются только в заявке и в браузере самого клиента.

/** Заголовки и подсказки анкеты размечают акцентные слова *звёздочками*
 *  (Егор: «в каждом заголовке и подзаголовке одно-два слова в акцентах»).
 *  Для заявок и подписей разметку снимаем. */
export function plainAccent(text: string): string {
  return text.replace(/\*/g, "");
}

export type VibeKind = "single" | "chips" | "multi" | "range" | "text";
export type VibeOption = { value: string; label: string };
type Branch = "content" | "sites" | "ai" | "smm";

export type VibeQuestion = {
  id: string;
  kind: VibeKind;
  title: string;
  hint: string;
  options?: VibeOption[];
  /** Можно ответить своими словами (single/chips/multi). */
  own?: boolean;
  optional?: boolean;
  placeholder?: string;
  /** Только для этих веток направления. Без поля — вопрос для всех. */
  branch?: Branch[];
  /** Реплика ассистента под вопросом, когда ответ выбран. */
  react?: (value: VibeValue, answers: VibeAnswers) => string | null;
};

/** Ответ: значение варианта, «~текст» для своего ответа, число для ползунка. */
export type VibeValue = string | string[];
export type VibeAnswers = Record<string, VibeValue>;

export const OWN_PREFIX = "~";
export const isOwn = (v: string) => v.startsWith(OWN_PREFIX);

// ---------- Бюджет: ползунок ----------
export const BUDGET_STEPS = [30_000, 50_000, 75_000, 100_000, 150_000, 200_000, 300_000, 400_000, 600_000, 800_000, 1_000_000];
export function formatBudget(n: number): string {
  if (n >= 1_000_000) return "1 млн ₽ и больше";
  return `${n.toLocaleString("ru-RU")} ₽`;
}

function branchOf(answers: VibeAnswers): Branch {
  const d = answers.direction;
  return d === "content" || d === "ai" || d === "smm" ? d : "sites";
}

const DIRECTION_WORD: Record<string, string> = {
  content: "видео",
  sites: "сайт",
  ai: "AI-решение",
  smm: "SMM",
  complex: "комплекс под ключ",
};

export const VIBE_QUESTIONS: VibeQuestion[] = [
  // ---------- Общие ----------
  {
    id: "direction",
    kind: "single",
    title: "Что *запускаем*?",
    hint: "Выбери главное — вопросы дальше *подстроятся* под это",
    options: [
      { value: "content", label: "Видео и контент" },
      { value: "sites", label: "Сайт или лендинг" },
      { value: "ai", label: "AI-решение для бизнеса" },
      { value: "smm", label: "Соцсети и SMM" },
      { value: "complex", label: "Всё вместе, под ключ" },
    ],
    react: (v) => `Отлично, собираю лендинг под ${DIRECTION_WORD[String(v)] ?? "задачу"}`,
  },
  {
    id: "sphere",
    kind: "chips",
    title: "В какой ты *сфере*?",
    hint: "По сфере подберём *кейсы*, похожие на твой проект",
    options: [
      { value: "Авто", label: "Авто" },
      { value: "Медицина", label: "Медицина" },
      { value: "Красота и фэшн", label: "Красота и фэшн" },
      { value: "HoReCa и кофейни", label: "Кафе и рестораны" },
      { value: "Туризм и отели", label: "Туризм и отели" },
      { value: "Образование", label: "Образование" },
      { value: "Спорт и фитнес", label: "Спорт и фитнес" },
      { value: "IT и финтех", label: "IT и финтех" },
      { value: "Промышленность и B2B", label: "Производство и B2B" },
      { value: "Ритейл", label: "Ритейл" },
      { value: "Недвижимость и стройка", label: "Недвижимость" },
      { value: "События и шоу", label: "События и шоу" },
    ],
    own: true,
    react: (v) => {
      const s = String(v);
      if (isOwn(s)) return "Запомнила сферу — найдём самые близкие кейсы";
      const n = works.filter((w) => w.sphere === s).length;
      return n > 0 ? `В этой сфере у нас ${n} ${plural(n, "проект", "проекта", "проектов")} — покажу лучшие на лендинге` : "Подберём кейсы из соседних сфер";
    },
  },
  {
    id: "company",
    kind: "text",
    title: "Как называется твой *проект*?",
    hint: "Название компании или бренда — оно встанет в *заголовок* лендинга",
    placeholder: "Например, «Мотор Авто»",
    optional: true,
  },
  {
    id: "goal",
    kind: "single",
    title: "Какая главная *цель*?",
    hint: "От цели зависит, с чего начнётся *решение*",
    options: [
      { value: "leads", label: "Больше заявок и продаж" },
      { value: "launch", label: "Запустить новый продукт" },
      { value: "brand", label: "Имидж и узнаваемость" },
      { value: "automate", label: "Автоматизировать рутину" },
    ],
    own: true,
  },
  {
    id: "audience",
    kind: "multi",
    title: "Кто твои *клиенты*?",
    hint: "Можно выбрать *несколько*",
    options: [
      { value: "b2c-young", label: "Молодёжь 18–30" },
      { value: "b2c-family", label: "Семьи" },
      { value: "b2c-premium", label: "Премиум-сегмент" },
      { value: "b2b", label: "Бизнес, B2B" },
      { value: "local", label: "Жители города" },
      { value: "russia", label: "Вся Россия" },
    ],
    own: true,
  },
  {
    id: "stage",
    kind: "single",
    title: "Что у тебя *уже есть*?",
    hint: "Чтобы не делать заново то, что уже *работает*",
    options: [
      { value: "zero", label: "Ничего — начинаем с нуля" },
      { value: "refresh", label: "Сайт или соцсети, пора обновить" },
      { value: "content", label: "Есть материалы, нужна упаковка" },
      { value: "team", label: "Есть команда, нужны руки и идеи" },
    ],
    own: true,
  },

  // ---------- Ветка: видео ----------
  {
    id: "videoFormat",
    kind: "single",
    branch: ["content"],
    title: "Какое *видео* нужно?",
    hint: "*Главный* формат — остальные можно добавить позже",
    options: [
      { value: "ad", label: "Рекламный ролик" },
      { value: "image", label: "Имиджевый фильм о компании" },
      { value: "social", label: "Видео для соцсетей" },
      { value: "edu", label: "Обучающее или объясняющее" },
      { value: "fpv", label: "Съёмка с дрона, FPV" },
      { value: "ai", label: "AI-видео без съёмки" },
    ],
    own: true,
  },
  {
    id: "videoLength",
    kind: "single",
    branch: ["content"],
    title: "Какой *длины* ролик?",
    hint: "Ориентир — точно определим на *сценарии*",
    options: [
      { value: "15", label: "До 15 секунд" },
      { value: "30", label: "30 секунд" },
      { value: "60", label: "Около минуты" },
      { value: "180", label: "2–3 минуты и больше" },
    ],
  },
  {
    id: "videoPlaces",
    kind: "multi",
    branch: ["content"],
    title: "Где будут *показывать*?",
    hint: "Под каждую площадку сделаем *свою версию*",
    options: [
      { value: "tv", label: "ТВ" },
      { value: "youtube", label: "YouTube" },
      { value: "reels", label: "Reels, клипы VK" },
      { value: "site", label: "Сайт" },
      { value: "events", label: "Выставки и экраны" },
      { value: "ads", label: "Таргетированная реклама" },
    ],
  },
  {
    id: "videoExtras",
    kind: "multi",
    branch: ["content"],
    title: "Что понадобится в *кадре*?",
    hint: "Выбери всё, что *представляешь*",
    options: [
      { value: "actors", label: "Актёры" },
      { value: "drone", label: "Дрон" },
      { value: "studio", label: "Студия" },
      { value: "voice", label: "Дикторская озвучка" },
      { value: "graphics", label: "Графика и 3D" },
      { value: "ai", label: "AI-эффекты" },
    ],
    optional: true,
  },
  {
    id: "videoCount",
    kind: "single",
    branch: ["content"],
    title: "Сколько *роликов*?",
    hint: "Серия выходит *выгоднее* за штуку",
    options: [
      { value: "1", label: "Один ролик" },
      { value: "3", label: "2–3 ролика" },
      { value: "series", label: "Серия из 5+" },
      { value: "monthly", label: "Регулярно каждый месяц" },
    ],
  },

  // ---------- Ветка: сайт ----------
  {
    id: "siteType",
    kind: "single",
    branch: ["sites"],
    title: "Какой *сайт* нужен?",
    hint: "Если не уверен — выбери ближайшее, *подскажем*",
    options: [
      { value: "landing", label: "Лендинг — одна продающая страница" },
      { value: "card", label: "Сайт-визитка компании" },
      { value: "catalog", label: "Каталог товаров или услуг" },
      { value: "shop", label: "Интернет-магазин" },
      { value: "turnkey", label: "Большой сайт под ключ" },
    ],
    own: true,
  },
  {
    id: "sitePages",
    kind: "single",
    branch: ["sites"],
    title: "Сколько примерно *страниц*?",
    hint: "Карточки товаров *не считаем*",
    options: [
      { value: "1", label: "Одна" },
      { value: "5", label: "До 5" },
      { value: "15", label: "До 15" },
      { value: "more", label: "Больше 15" },
    ],
  },
  {
    id: "siteFeatures",
    kind: "multi",
    branch: ["sites"],
    title: "Что должен *уметь* сайт?",
    hint: "Выбери нужные *функции*",
    options: [
      { value: "forms", label: "Заявки и квиз" },
      { value: "pay", label: "Онлайн-оплата" },
      { value: "booking", label: "Онлайн-запись" },
      { value: "cabinet", label: "Личный кабинет" },
      { value: "chat", label: "AI-консультант" },
      { value: "crm", label: "Связь с CRM" },
      { value: "blog", label: "Блог и статьи" },
    ],
    optional: true,
  },
  {
    id: "siteContent",
    kind: "single",
    branch: ["sites"],
    title: "*Тексты и фото* для сайта есть?",
    hint: "Если нет — *снимем и напишем* сами",
    options: [
      { value: "ready", label: "Всё есть" },
      { value: "part", label: "Что-то есть" },
      { value: "none", label: "Нужно создать с нуля" },
    ],
  },
  {
    id: "siteSeo",
    kind: "single",
    branch: ["sites"],
    title: "Нужно *продвижение* в поиске?",
    hint: "SEO под *Яндекс и Google*",
    options: [
      { value: "yes", label: "Да, сразу" },
      { value: "later", label: "Позже" },
      { value: "no", label: "Не нужно" },
    ],
  },

  // ---------- Ветка: AI ----------
  {
    id: "aiTasks",
    kind: "multi",
    branch: ["ai"],
    title: "Что хочешь отдать *AI*?",
    hint: "Выбери всё, что сейчас отнимает *время*",
    options: [
      { value: "support", label: "Ответы клиентам" },
      { value: "sales", label: "Продажи и запись" },
      { value: "content", label: "Создание контента" },
      { value: "docs", label: "Документы и отчёты" },
      { value: "analytics", label: "Аналитика" },
      { value: "hr", label: "Найм и обучение" },
    ],
    own: true,
  },
  {
    id: "aiChannels",
    kind: "multi",
    branch: ["ai"],
    title: "Где общаешься с *клиентами*?",
    hint: "Туда и подключим *ассистента*",
    options: [
      { value: "site", label: "Сайт" },
      { value: "tg", label: "Telegram" },
      { value: "wa", label: "WhatsApp" },
      { value: "vk", label: "VK" },
      { value: "phone", label: "Телефон" },
      { value: "avito", label: "Авито" },
    ],
  },
  {
    id: "aiVolume",
    kind: "single",
    branch: ["ai"],
    title: "Сколько *обращений* в день?",
    hint: "Чтобы рассчитать *нагрузку*",
    options: [
      { value: "10", label: "До 10" },
      { value: "50", label: "10–50" },
      { value: "200", label: "50–200" },
      { value: "more", label: "Больше 200" },
    ],
  },
  {
    id: "aiStack",
    kind: "multi",
    branch: ["ai"],
    title: "С чем *связать*?",
    hint: "Системы, в которых ты *уже работаешь*",
    options: [
      { value: "amo", label: "amoCRM" },
      { value: "bitrix", label: "Битрикс24" },
      { value: "1c", label: "1С" },
      { value: "sheets", label: "Таблицы" },
      { value: "none", label: "Ничего нет" },
    ],
    optional: true,
  },

  // ---------- Ветка: SMM ----------
  {
    id: "smmNets",
    kind: "multi",
    branch: ["smm"],
    title: "Какие *соцсети* ведём?",
    hint: "Можно выбрать *несколько*",
    options: [
      { value: "vk", label: "VK" },
      { value: "tg", label: "Telegram" },
      { value: "yt", label: "YouTube" },
      { value: "dzen", label: "Дзен" },
      { value: "inst", label: "Instagram*" },
      { value: "rutube", label: "Rutube" },
    ],
  },
  {
    id: "smmFreq",
    kind: "single",
    branch: ["smm"],
    title: "Как часто *публиковать*?",
    hint: "*Регулярность* важнее количества",
    options: [
      { value: "3", label: "3 раза в неделю" },
      { value: "5", label: "5 раз в неделю" },
      { value: "daily", label: "Каждый день" },
    ],
  },
  {
    id: "smmScope",
    kind: "multi",
    branch: ["smm"],
    title: "Что берём *на себя*?",
    hint: "Выбери всё *нужное*",
    options: [
      { value: "shoot", label: "Съёмка" },
      { value: "design", label: "Дизайн" },
      { value: "texts", label: "Тексты" },
      { value: "target", label: "Таргет" },
      { value: "influence", label: "Блогеры и посевы" },
      { value: "community", label: "Ответы подписчикам" },
    ],
  },
  {
    id: "smmNow",
    kind: "single",
    branch: ["smm"],
    title: "Сколько *подписчиков* сейчас?",
    hint: "Точка отсчёта для *роста*",
    options: [
      { value: "0", label: "Начинаем с нуля" },
      { value: "1k", label: "До 1 000" },
      { value: "10k", label: "1 000–10 000" },
      { value: "more", label: "Больше 10 000" },
    ],
  },

  // ---------- Общие, финал ----------
  {
    id: "budget",
    kind: "range",
    title: "Какой *бюджет* на проект?",
    hint: "Двигай ползунок — под бюджет подберём *тариф*",
    react: (v, a) => {
      const tier = pickTier(branchKey(a), Number(v));
      return `Под этот бюджет подходит тариф «${tier.name}» — ${tier.price}`;
    },
  },
  {
    id: "deadline",
    kind: "single",
    title: "Когда нужен *результат*?",
    hint: "Под сроки соберём *команду* нужного размера",
    options: [
      { value: "asap", label: "Вчера — горит" },
      { value: "month", label: "За 2–4 недели" },
      { value: "quarter", label: "За 1–2 месяца" },
      { value: "calm", label: "Не спешу, важно качество" },
    ],
  },
  {
    id: "style",
    kind: "single",
    title: "Какой *стиль* тебе ближе?",
    hint: "В этом духе предложим *решение*",
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
    kind: "text",
    title: "Есть ссылка на проект или *референсы*?",
    hint: "Сайт, соцсети или то, что *нравится*. Можно пропустить",
    placeholder: "Ссылка или пара слов",
    optional: true,
  },
];

/** Вопросы для текущих ответов: общие плюс ветка выбранной услуги. */
export function questionsFor(answers: VibeAnswers): VibeQuestion[] {
  const b = branchOf(answers);
  return VIBE_QUESTIONS.filter((q) => !q.branch || q.branch.includes(b));
}

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

function branchKey(answers: VibeAnswers): ServiceKey {
  return branchOf(answers);
}

function minPrice(tier: PricingTier): number {
  const digits = tier.price.replace(/\s/g, "").match(/\d+/);
  return digits ? Number(digits[0]) : 0;
}

/** Самый полный тариф, чья нижняя цена укладывается в бюджет. */
export function pickTier(key: ServiceKey, budget: number): PricingTier {
  const tiers = pricingByCategory[key];
  if (!budget) return tiers[Math.min(1, tiers.length - 1)];
  const fits = tiers.filter((t) => minPrice(t) <= budget);
  return fits.length ? fits[fits.length - 1] : tiers[0];
}

/** Подпись ответа для людей: вариант, свой текст или сумма. */
export function answerLabel(q: VibeQuestion, v: VibeValue | undefined): string {
  if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) return "";
  if (q.kind === "range") return formatBudget(Number(v));
  const one = (x: string) => (isOwn(x) ? x.slice(1) : q.options?.find((o) => o.value === x)?.label ?? x);
  return Array.isArray(v) ? v.map(one).join(", ") : one(v);
}

// ---------- Ссылка на лендинг ----------
// Ответы — короткий JSON в base64url. Только ответы анкеты, никаких
// контактов.
export function encodeAnswers(answers: VibeAnswers): string {
  const json = JSON.stringify(answers);
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeAnswers(s: string): VibeAnswers | null {
  try {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    const json = new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
    const data = JSON.parse(json);
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;
    const out: VibeAnswers = {};
    for (const [k, v] of Object.entries(data)) {
      if (typeof v === "string") out[k] = v.slice(0, 300);
      else if (Array.isArray(v)) out[k] = v.filter((x): x is string => typeof x === "string").map((x) => x.slice(0, 300)).slice(0, 12);
    }
    return out;
  } catch {
    return null;
  }
}

// ---------- Сборка лендинга ----------
const VIDEO_PRODUCT: Record<string, string> = {
  ad: "Рекламный ролик",
  image: "Имиджевый фильм",
  social: "Видео для соцсетей",
  edu: "Обучающее видео",
  fpv: "FPV-съёмка с дрона",
  ai: "AI-видео",
};
const SITE_PRODUCT: Record<string, string> = {
  landing: "Лендинг",
  card: "Сайт-визитка",
  catalog: "Сайт-каталог",
  shop: "Интернет-магазин",
  turnkey: "Сайт под ключ",
};
const VIDEO_CATEGORY: Record<string, string[]> = {
  ad: ["Рекламные"],
  image: ["Имиджевые и презентации", "Рекламные"],
  fpv: ["FPV и дроны"],
};

const GOAL_LINE: Record<string, string> = {
  leads: "Главная задача — больше заявок и продаж, поэтому всё решение работает на конверсию.",
  launch: "Главная задача — громко и понятно запустить новый продукт.",
  brand: "Главная задача — имидж и узнаваемость: чтобы о тебе говорили и запоминали.",
  automate: "Главная задача — снять рутину с команды и сэкономить время.",
};

const DEADLINE_LINE: Record<string, string> = {
  asap: "Срочный запуск: соберём расширенную команду и начнём в ближайшие дни.",
  month: "Запуск за 2–4 недели — укладываемся без спешки и потери качества.",
  quarter: "1–2 месяца: есть время на 2–3 концепции и тесты до запуска.",
  calm: "Без спешки: делаем максимально выверенно, с запасом на доработки.",
};

export type VibeOffer = {
  key: ServiceKey;
  product: string;
  company: string | null;
  title: string;
  sphere: string | null;
  goalLine: string | null;
  deadlineLine: string | null;
  budget: number;
  tier: PricingTier;
  tiers: PricingTier[];
  /** «Мы поняли задачу так» — пары вопрос/ответ для инфографики. */
  brief: { label: string; value: string }[];
  /** Что конкретно сделаем — пункты решения. */
  solution: string[];
  process: ProcessStep[];
  why: ProcessStep[];
  cases: Work[];
  video?: string;
};

export function buildOffer(answers: VibeAnswers): VibeOffer {
  const key = branchKey(answers);
  const direction = String(answers.direction ?? "sites");
  const qs = questionsFor(answers);
  const lbl = (id: string) => {
    const q = qs.find((x) => x.id === id);
    return q ? answerLabel(q, answers[id]) : "";
  };

  let product: string;
  if (direction === "complex") product = "Комплекс под ключ";
  else if (key === "content") product = VIDEO_PRODUCT[String(answers.videoFormat)] ?? (lbl("videoFormat") || "Видеопродакшн");
  else if (key === "sites") product = SITE_PRODUCT[String(answers.siteType)] ?? (lbl("siteType") || "Сайт");
  else if (key === "ai") product = "AI-ассистент для бизнеса";
  else product = "Ведение соцсетей";

  const companyRaw = typeof answers.company === "string" ? answers.company.trim() : "";
  const company = companyRaw ? companyRaw.replace(/^[«"]|[»"]$/g, "") : null;
  const sphere = lbl("sphere") || null;
  const title = company ? `${product} для «${company}»` : sphere ? `${product} для сферы «${sphere}»` : product;

  const budget = Number(answers.budget) || 0;
  const tier = pickTier(key, budget);

  const brief = [
    { label: "Сфера", value: sphere ?? "" },
    { label: "Цель", value: lbl("goal") },
    { label: "Клиенты", value: lbl("audience") },
    { label: "Сейчас есть", value: lbl("stage") },
    { label: "Бюджет", value: budget ? formatBudget(budget) : "" },
    { label: "Сроки", value: lbl("deadline") },
    { label: "Стиль", value: lbl("style") },
  ].filter((b) => b.value);

  const solution: string[] = [];
  if (key === "content") {
    const len = lbl("videoLength");
    const count = lbl("videoCount");
    solution.push(`${product}${len ? ` · ${len.toLowerCase()}` : ""}${count ? ` · ${count.toLowerCase()}` : ""}`);
    if (lbl("videoPlaces")) solution.push(`Версии под площадки: ${lbl("videoPlaces")}`);
    if (lbl("videoExtras")) solution.push(`В производстве: ${lbl("videoExtras").toLowerCase()}`);
    solution.push("2–3 творческие концепции до договора — бесплатно");
  } else if (key === "sites") {
    solution.push(`${product}${lbl("sitePages") ? ` · страниц: ${lbl("sitePages").toLowerCase()}` : ""}`);
    if (lbl("siteFeatures")) solution.push(`Функции: ${lbl("siteFeatures")}`);
    if (answers.siteContent === "none" || answers.siteContent === "part") solution.push("Тексты, фото и видео для сайта создаём сами");
    if (answers.siteSeo === "yes") solution.push("SEO-продвижение в Яндексе и Google с первого дня");
    solution.push("Адаптивная вёрстка — одинаково красиво на телефоне и компьютере");
  } else if (key === "ai") {
    if (lbl("aiTasks")) solution.push(`AI берёт на себя: ${lbl("aiTasks").toLowerCase()}`);
    if (lbl("aiChannels")) solution.push(`Подключаем в каналы: ${lbl("aiChannels")}`);
    if (lbl("aiStack")) solution.push(`Интеграция: ${lbl("aiStack")}`);
    solution.push("Обучаем ассистента на твоих данных и тоне общения");
  } else {
    if (lbl("smmNets")) solution.push(`Ведём: ${lbl("smmNets")}`);
    if (lbl("smmFreq")) solution.push(`Публикации: ${lbl("smmFreq").toLowerCase()}`);
    if (lbl("smmScope")) solution.push(`Берём на себя: ${lbl("smmScope").toLowerCase()}`);
    solution.push("Контент-план и отчёт по цифрам каждый месяц");
  }
  if (direction === "complex") solution.push("Видео и SMM для запуска — в одной команде, одним договором");
  if (typeof answers.refs === "string" && answers.refs.trim()) solution.push(`Учтём твои референсы: ${answers.refs.trim()}`);

  // Кейсы: сфера клиента → формат ролика → свежие шоурилы.
  const byDate = (a: Work, b: Work) => (b.date ?? "").localeCompare(a.date ?? "");
  const sphereValue = typeof answers.sphere === "string" && !isOwn(answers.sphere) ? answers.sphere : null;
  const cats = VIDEO_CATEGORY[String(answers.videoFormat)] ?? [];
  const inSphere = sphereValue ? works.filter((w) => w.sphere === sphereValue).sort(byDate) : [];
  const inFormat = works.filter((w) => cats.includes(w.category) || w.tags?.some((t) => cats.includes(t))).sort(byDate);
  const reels = works.filter((w) => w.category === "Шоурилы").sort(byDate);
  const cases: Work[] = [];
  for (const w of [...inSphere, ...inFormat, ...reels]) {
    if (!cases.includes(w)) cases.push(w);
    if (cases.length === 6) break;
  }

  return {
    key,
    product,
    company,
    title,
    sphere,
    goalLine: GOAL_LINE[String(answers.goal)] ?? null,
    deadlineLine: DEADLINE_LINE[String(answers.deadline)] ?? null,
    budget,
    tier,
    tiers: pricingByCategory[key],
    brief,
    solution,
    process: processByCategory[key],
    why: whyByCategory[key].reasons,
    cases,
    video: serviceMeta[key].video,
  };
}

/** Ответы анкеты в виде полей письма (/api/lead, lead.php). */
export function vibeAnswersToFields(answers: VibeAnswers): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const q of questionsFor(answers)) {
    fields[plainAccent(q.title)] = answerLabel(q, answers[q.id]) || "—";
  }
  return fields;
}
