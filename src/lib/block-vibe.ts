import { useSyncExternalStore } from "react";
import { works } from "./data";
import { pricingByCategory, type ServiceKey } from "./service-content";
import { pickTier } from "./vibe-quiz";
import type { PricingTier, Work } from "./types";

// Vibe-блок (Егор, 2026-09-27): клик по иконке вайб-бара едет к блоку и
// открывает рядом с баром короткое окошко — 5 шагов про ЭТОТ блок (сфера,
// два своих вопроса блока, примеры, контакт). После ответов блок на странице
// перестраивается под задачу, а бриф уходит продюсеру.
//
// Блоков на сайте 26, но смысловых видов всего семь (интро, работы, кому
// подходит, почему мы, что делаем, процесс, цены) — вопросы и сборка текста
// пишутся на вид блока, а услуга страницы (видео/сайт/AI/SMM) подставляет
// свои слова. Так один модуль закрывает все четыре страницы.

/** «Обсудить этот блок» в собранном блоке открывает окошко вайб-бара. */
export const OPEN_BLOCK_VIBE_EVENT = "hdkv:open-block-vibe";

export type BlockKind = "intro" | "works" | "audience" | "why" | "offer" | "process" | "price";

/** Главы каждой страницы по порядку — ровно как CHAPTERS страницы и
 *  PAGE_BLOCKS вайб-бара. CinematicSection знает только свой индекс, а
 *  здесь по нему находится id блока. */
const PAGE_CHAPTERS: Record<string, [string, BlockKind][]> = {
  "/content": [
    ["opening", "intro"],
    ["works", "works"],
    ["why", "why"],
    ["services", "offer"],
    ["process", "process"],
    ["contact", "price"],
  ],
  "/ai": [
    ["pitch", "intro"],
    ["portfolio", "works"],
    ["segments", "audience"],
    ["trust", "why"],
    ["offer", "offer"],
    ["guarantees", "why"],
    ["process", "process"],
    ["close", "price"],
  ],
  "/sites": [
    ["pitch", "intro"],
    ["method", "audience"],
    ["offer", "offer"],
    ["process", "process"],
    ["guarantees", "why"],
    ["close", "price"],
  ],
  "/smm": [
    ["pitch", "intro"],
    ["method", "audience"],
    ["offer", "offer"],
    ["process", "process"],
    ["guarantees", "why"],
    ["close", "price"],
  ],
};

export function blockIdAt(path: string, index: number): string | null {
  return PAGE_CHAPTERS[path]?.[index]?.[0] ?? null;
}

export function blockKind(path: string, id: string): BlockKind | null {
  return PAGE_CHAPTERS[path]?.find(([b]) => b === id)?.[1] ?? null;
}

export function serviceOf(path: string): ServiceKey {
  const s = path.slice(1);
  return s === "content" || s === "ai" || s === "smm" ? s : "sites";
}

// ---------- Вопросы ----------

export type BlockOption = { value: string; label: string };
export type BlockQuestion = {
  id: string;
  title: string;
  /** Сколько вариантов можно выбрать; без поля — один. */
  multi?: number;
  options: BlockOption[];
};
export type BlockAnswers = Record<string, string | string[]>;

const opt = (pairs: [string, string][]): BlockOption[] => pairs.map(([value, label]) => ({ value, label }));

/** Сфера — первый вопрос каждого блока: от неё зависят все слова сборки.
 *  Значения те же, что в большой анкете (lib/vibe-quiz) и у работ. */
export const SPHERE_QUESTION: BlockQuestion = {
  id: "sphere",
  title: "В какой ты *сфере*?",
  // Сфер может быть несколько: «авто и медицина» (Егор, 2026-09-27).
  multi: 3,
  options: opt([
    ["Авто", "Авто"],
    ["Медицина", "Медицина"],
    ["Красота и фэшн", "Красота"],
    ["HoReCa и кофейни", "Кафе и рестораны"],
    ["Туризм и отели", "Отели"],
    ["Образование", "Образование"],
    ["Спорт и фитнес", "Фитнес"],
    ["IT и финтех", "IT"],
    ["Промышленность и B2B", "B2B"],
    ["Ритейл", "Ритейл"],
    ["Недвижимость и стройка", "Недвижимость"],
    ["События и шоу", "События"],
  ]),
};

const NEED: Record<ServiceKey, [string, string, string][]> = {
  sites: [
    ["landing", "Лендинг", "Одна страница, которая ведёт к заявке"],
    ["card", "Сайт-визитка", "Коротко о тебе, услуги и контакты"],
    ["shop", "Магазин", "Каталог, корзина и онлайн-оплата"],
    ["turnkey", "Сайт под ключ", "Много страниц и интеграции"],
  ],
  content: [
    ["ad", "Рекламный ролик", "Продаёт за 15–60 секунд"],
    ["image", "Имиджевый фильм", "О бренде, людях и ценностях"],
    ["social", "Видео для соцсетей", "Серия коротких роликов"],
    ["motion", "3D и моушн", "Графика там, где не снять камерой"],
  ],
  ai: [
    ["bot", "Чат-бот", "Отвечает клиентам 24/7 и собирает заявки"],
    ["gen", "AI-контент", "Тексты, картинки и видео на потоке"],
    ["analytics", "Аналитика", "Отчёты и прогнозы без ручной работы"],
    ["automate", "Автоматизация", "Рутина уходит в систему"],
  ],
  smm: [
    ["full", "Ведение под ключ", "Стратегия, съёмка, посты и отчёт"],
    ["content", "Только контент", "Съёмка и монтаж для твоих соцсетей"],
    ["ads", "Таргет", "Реклама, которая приводит заявки"],
    ["audit", "Аудит", "Разбор аккаунтов и план роста"],
  ],
};

const MUST: Record<ServiceKey, [string, string][]> = {
  sites: [["crm", "Заявки в CRM"], ["catalog", "Каталог"], ["pay", "Оплата"], ["seo", "SEO"], ["texts", "Тексты и фото"]],
  content: [["script", "Сценарий"], ["actors", "Актёры"], ["drone", "Аэросъёмка"], ["versions", "Версии под площадки"], ["music", "Музыка"]],
  ai: [["tg", "Telegram"], ["site", "Сайт"], ["crm", "CRM"], ["voice", "Голос"], ["docs", "Мои документы"]],
  smm: [["shoot", "Съёмка"], ["reels", "Reels и клипы"], ["design", "Дизайн"], ["ads", "Таргет"], ["report", "Отчёты"]],
};

function kindQuestions(kind: BlockKind, service: ServiceKey): BlockQuestion[] {
  switch (kind) {
    case "intro":
      return [
        { id: "goal", title: "Какая главная *цель*?", options: opt([["leads", "Больше заявок"], ["launch", "Запустить новое"], ["brand", "Имидж"], ["automate", "Меньше рутины"]]) },
        { id: "stage", title: "Что уже *есть*?", options: opt([["none", "Пока ничего"], ["old", "Есть, но устарело"], ["works", "Работает — усилить"]]) },
      ];
    case "works":
      return [
        { id: "style", title: "Какой *стиль* ближе?", options: opt([["premium", "Премиум"], ["bold", "Ярко и дерзко"], ["warm", "Тепло и просто"], ["tech", "Технологично"]]) },
        { id: "show", title: "Что важнее *показать*?", options: opt([["product", "Продукт"], ["people", "Людей"], ["process", "Процесс"], ["numbers", "Результат в цифрах"]]) },
      ];
    case "audience":
      return [
        { id: "who", title: "Кто твои *клиенты*?", options: opt([["b2c", "Частные люди"], ["b2b", "Бизнес"], ["both", "И те и другие"]]) },
        { id: "size", title: "Какой у тебя *масштаб*?", options: opt([["start", "Только запускаюсь"], ["small", "Малый бизнес"], ["mid", "Средний"], ["big", "Крупная компания"]]) },
      ];
    case "why":
      return [
        { id: "priority", title: "Что важнее в *подрядчике*?", multi: 2, options: opt([["speed", "Сроки"], ["price", "Цена"], ["quality", "Качество"], ["guarantee", "Гарантии"], ["care", "Внимание"]]) },
        { id: "past", title: "Был опыт с *подрядчиками*?", options: opt([["first", "Первый раз"], ["bad", "Был неудачный"], ["good", "Был хороший"]]) },
      ];
    case "offer":
      return [
        { id: "need", title: "Что *нужно*?", multi: 3, options: NEED[service].map(([value, label]) => ({ value, label })) },
        { id: "must", title: "Что *обязательно*?", multi: 3, options: opt(MUST[service]) },
      ];
    case "process":
      return [
        { id: "when", title: "Когда нужен *результат*?", options: opt([["asap", "Срочно"], ["month", "За месяц"], ["quarter", "За 2–3 месяца"], ["calm", "Без спешки"]]) },
        { id: "talk", title: "Как удобнее *общаться*?", options: opt([["tg", "Telegram"], ["calls", "Созвоны"], ["mail", "Почта"], ["meet", "Лично"]]) },
      ];
    case "price":
      return [
        { id: "budget", title: "Какой *бюджет*?", options: opt([["50000", "До 50 тыс ₽"], ["150000", "50–150 тыс"], ["300000", "150–300 тыс"], ["600000", "300–600 тыс"], ["1000000", "От 600 тыс"]]) },
        { id: "pay", title: "Как удобнее *платить*?", options: opt([["stages", "Поэтапно"], ["once", "Сразу"], ["monthly", "Помесячно"]]) },
      ];
  }
}

/** Три вопроса-выбора блока: сфера + два своих. Примеры и контакт —
 *  отдельные шаги окошка, общие для всех блоков. */
export function blockQuestions(kind: BlockKind, service: ServiceKey): BlockQuestion[] {
  return [SPHERE_QUESTION, ...kindQuestions(kind, service)];
}

export function answerText(q: BlockQuestion, v: string | string[] | undefined): string {
  const list = Array.isArray(v) ? v : v ? [v] : [];
  return list.map((x) => q.options.find((o) => o.value === x)?.label ?? x).join(", ");
}

// ---------- Примеры: только из своей услуги ----------
// Егор (2026-09-27): на шаге «покажи, что нравится» — варианты именно той
// услуги, из которой пришёл человек. На /ai — единый чат, чат-боты,
// генерация; выбрал «3D и моушн» — работы моушн-графики. Ролики подряд
// везде не показываем.

export type BlockExample = { id: string; title: string; image: string };

/** Форматы каждой услуги — те же карточки и кадры, что в колодах страниц
 *  (AiDeck, SitesDeck, SmmDeck). У видео вместо них — работы портфолио. */
const CATALOG: Record<Exclude<ServiceKey, "content">, BlockExample[]> = {
  ai: [
    { id: "chathub", title: "Единый AI-чат для мессенджеров", image: "/images/stock/devs-night.webp" },
    { id: "bots", title: "Чат-боты и AI-агенты", image: "/images/stock/robot-hand-chip.webp" },
    { id: "gen", title: "Генерация видео и фото", image: "/images/stock/holi-face.webp" },
    { id: "auto", title: "Автоматизация коммуникации", image: "/images/stock/man-laptop-dark.webp" },
    { id: "text", title: "Текстовый контент", image: "/images/stock/ink-pink.webp" },
    { id: "inner", title: "Ассистенты для процессов", image: "/images/stock/planner-desk.webp" },
    { id: "crm", title: "AI внутри CRM", image: "/images/stock/brain-circuit.webp" },
    { id: "voice", title: "Голосовые решения", image: "/images/stock/hologram-laptop.webp" },
    { id: "analytics", title: "AI-аналитика", image: "/images/stock/platform-speed.webp" },
  ],
  sites: [
    { id: "landing", title: "Лендинг", image: "/images/stock/desk-aerial.webp" },
    { id: "card", title: "Сайт-визитка", image: "/images/stock/design-tablet.webp" },
    { id: "turnkey", title: "Сайт под ключ", image: "/images/stock/team-night-office.webp" },
    { id: "assistant", title: "AI-ассистент на сайте", image: "/images/stock/holo-keyboard.webp" },
    { id: "redesign", title: "Редизайн", image: "/images/stock/paint-purple-macro.webp" },
  ],
  smm: [
    { id: "reels", title: "Reels", image: "/images/stock/smm-phone-bokeh.webp" },
    { id: "stories", title: "Сторис", image: "/images/stock/night-lights.webp" },
    { id: "carousel", title: "Карусели", image: "/images/stock/dj-neon.webp" },
    { id: "ads", title: "Таргет", image: "/images/stock/brain-circuit.webp" },
    { id: "bloggers", title: "Блогеры", image: "/images/stock/vr-neon-triangle.webp" },
  ],
};

/** Выбранное «что нужно» поднимает свои форматы в начало. */
const NEED_FIRST: Record<string, string[]> = {
  bot: ["bots", "chathub", "voice"],
  gen: ["gen", "text"],
  analytics: ["analytics", "crm"],
  automate: ["auto", "inner", "crm"],
  landing: ["landing"],
  card: ["card"],
  shop: ["turnkey"],
  turnkey: ["turnkey", "assistant"],
  content: ["reels", "stories", "carousel"],
  ads: ["ads", "bloggers"],
};

/** Видео: «что нужно» → категории портфолио. */
const NEED_CATEGORY: Record<string, string[]> = {
  ad: ["Рекламные"],
  image: ["Имиджевые и презентации", "Корпоративные", "Документальные"],
  social: ["Фэшн и арт", "Событийные", "Тревел", "Музыкальные"],
  motion: ["Моушн и 3D"],
};

/** Шесть примеров для шага «покажи, что нравится». */
export function blockExamples(service: ServiceKey, a: BlockAnswers): BlockExample[] {
  const needs = many(a, "need");
  if (service !== "content") {
    const all = CATALOG[service];
    const first = needs.flatMap((n) => NEED_FIRST[n] ?? []);
    return [...all].sort((x, y) => rank(first, x.id) - rank(first, y.id)).slice(0, 6);
  }
  const byDate = (x: Work, y: Work) => (y.date ?? "").localeCompare(x.date ?? "");
  const spheres = many(a, "sphere");
  const cats = needs.flatMap((n) => NEED_CATEGORY[n] ?? []);
  // Выбран формат — только его работы; сфера клиента поднимает свои выше.
  const pool = cats.length ? works.filter((w) => cats.includes(w.category) || w.tags?.some((t) => cats.includes(t))) : works;
  const sorted = [...pool].sort((x, y) => {
    const s = Number(spheres.includes(y.sphere ?? "")) - Number(spheres.includes(x.sphere ?? ""));
    return s || byDate(x, y);
  });
  return sorted.slice(0, 6).map((w) => ({ id: w.id, title: w.title, image: workThumb(w) }));
}

const rank = (order: string[], id: string) => {
  const i = order.indexOf(id);
  return i < 0 ? order.length : i;
};

export const workThumb = (w: Work) => `/images/works/${w.youtubeId ?? w.id}.jpg`;

// ---------- Сборка блока ----------

type SphereWords = { gen: string; clients: string; scene: string; action: string };

const SPHERE: Record<string, SphereWords> = {
  Авто: { gen: "автосалона", clients: "покупателей", scene: "машины в движении", action: "запись на тест-драйв" },
  Медицина: { gen: "клиники", clients: "пациентов", scene: "врачей и заботу", action: "запись на приём" },
  "Красота и фэшн": { gen: "салона и бренда", clients: "клиентов", scene: "образы и детали", action: "запись на услугу" },
  "HoReCa и кофейни": { gen: "кафе и ресторана", clients: "гостей", scene: "блюда и атмосферу", action: "бронь столика" },
  "Туризм и отели": { gen: "отеля", clients: "гостей", scene: "номера и виды", action: "бронирование" },
  Образование: { gen: "школы и курсов", clients: "учеников", scene: "занятия и результаты", action: "запись на курс" },
  "Спорт и фитнес": { gen: "фитнес-клуба", clients: "клиентов", scene: "тренировки и энергию", action: "пробное занятие" },
  "IT и финтех": { gen: "IT-продукта", clients: "пользователей", scene: "продукт в работе", action: "демо и регистрация" },
  "Промышленность и B2B": { gen: "производства", clients: "B2B-клиентов", scene: "производство и масштаб", action: "запрос цены" },
  Ритейл: { gen: "магазина", clients: "покупателей", scene: "товары вживую", action: "заказ" },
  "Недвижимость и стройка": { gen: "девелопера", clients: "покупателей жилья", scene: "объекты и виды", action: "запись на просмотр" },
  "События и шоу": { gen: "событий и шоу", clients: "зрителей", scene: "эмоции зала", action: "покупка билета" },
};
const SPHERE_FALLBACK: SphereWords = { gen: "твоего бизнеса", clients: "клиентов", scene: "твой продукт", action: "заявка" };

const PRODUCT: Record<ServiceKey, string> = { content: "Видео", sites: "Сайт", ai: "AI-ассистент", smm: "SMM" };

export type TunedCard = { title: string; text: string; image?: string };
export type TunedCopy = {
  /** Заголовок; *слово* — акцент градиентом страницы. */
  title: string;
  lead: string;
  cards: TunedCard[];
};

const one = (a: BlockAnswers, id: string) => {
  const v = a[id];
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
};
const many = (a: BlockAnswers, id: string) => {
  const v = a[id];
  return Array.isArray(v) ? v : v ? [v] : [];
};
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function tuneBlock(kind: BlockKind, service: ServiceKey, a: BlockAnswers): TunedCopy {
  const sw = SPHERE[one(a, "sphere")] ?? SPHERE_FALLBACK;
  const product = PRODUCT[service];
  const label = (id: string) => {
    const q = blockQuestions(kind, service).find((x) => x.id === id);
    return q ? answerText(q, a[id]) : "";
  };

  switch (kind) {
    case "intro": {
      const lead: Record<string, string> = {
        leads: `Главное — заявки: каждый экран ведёт ${sw.clients} к шагу «${sw.action}».`,
        launch: "Запуск с нуля: упаковка, первые клиенты и понятный путь к заказу.",
        brand: "Сильный образ: тебя запоминают и выбирают среди конкурентов.",
        automate: `Рутина уходит в систему, а команда занимается ${sw.clients === "B2B-клиентов" ? "клиентами" : "людьми"}.`,
      };
      const stage: Record<string, TunedCard> = {
        none: { title: "С нуля", text: "Смысл, дизайн и запуск — всё соберём сами" },
        old: { title: "Перезапуск", text: "Обновим устаревшее и сохраним то, что работает" },
        works: { title: "Усиление", text: "Добавим то, чего не хватает для роста" },
      };
      return {
        title: `${product} для *${sw.gen}*`,
        lead: lead[one(a, "goal")] ?? lead.leads,
        cards: [
          stage[one(a, "stage")] ?? stage.none,
          { title: `Цель — ${label("goal").toLowerCase() || "заявки"}`, text: `Понятный путь к шагу «${sw.action}»` },
          { title: "Твоя сфера", text: `Показываем ${sw.scene} — ${sw.clients} узнают себя` },
        ],
      };
    }
    case "works": {
      const own = works.filter((w) => many(a, "sphere").includes(w.sphere ?? ""));
      const picked = many(a, "works")
        .map((id) => works.find((w) => w.id === id))
        .filter((w): w is Work => Boolean(w));
      const list: Work[] = [];
      const fresh = [...works].sort((x, y) => (y.date ?? "").localeCompare(x.date ?? ""));
      for (const w of [...picked, ...own, ...fresh]) {
        if (!list.includes(w)) list.push(w);
        if (list.length === 3) break;
      }
      return {
        title: `Работы для *${sw.gen}*`,
        lead: `Стиль — ${label("style").toLowerCase() || "твой"}, в центре — ${label("show").toLowerCase() || "продукт"}. Вот самые близкие проекты.`,
        cards: list.map((w) => ({ title: w.title, text: w.client, image: workThumb(w) })),
      };
    }
    case "audience": {
      const who: Record<string, string> = {
        b2c: "С частными людьми говорим просто и по делу.",
        b2b: "Бизнесу — цифры, сроки и выгода на первом экране.",
        both: "Два сценария: для частных людей и для бизнеса.",
      };
      const size: Record<string, string> = {
        start: "Без лишних затрат — только то, что даст первые заявки.",
        small: "Быстрый результат и фиксированный бюджет.",
        mid: "Система, которая растёт вместе с тобой.",
        big: "Процессы, согласования и гарантии в договоре.",
      };
      return {
        title: `Как это работает для *${sw.gen}*`,
        lead: `${who[one(a, "who")] ?? who.b2c} ${size[one(a, "size")] ?? ""}`.trim(),
        cards: [
          { title: "Видят", text: `${cap(sw.clients)} видят ${sw.scene}` },
          { title: "Доверяют", text: "Кейсы и цифры из твоей сферы" },
          { title: "Действуют", text: `«${cap(sw.action)}» в один шаг` },
        ],
      };
    }
    case "why": {
      const reasons: Record<string, TunedCard> = {
        speed: { title: "Сроки в договоре", text: "Фиксируем дату сдачи и держим её" },
        price: { title: "Честная цена", text: "Команда художников вместо раздутого агентства" },
        quality: { title: "Качество", text: "8 лет в продакшене и 450+ проектов" },
        guarantee: { title: "Гарантии", text: "Правки и возврат прописаны заранее" },
        care: { title: "Внимание", text: "Продюсер на связи и отвечает за результат" },
      };
      const order = [...many(a, "priority"), "quality", "price", "guarantee", "speed", "care"];
      const cards: TunedCard[] = [];
      for (const k of order) {
        const r = reasons[k];
        if (r && !cards.includes(r)) cards.push(r);
        if (cards.length === 3) break;
      }
      const past: Record<string, string> = {
        first: "Первый опыт — поэтому ведём за руку на каждом шаге.",
        bad: "Знаем, как бывает. Поэтому всё фиксируем в договоре заранее.",
        good: "Сделаем не хуже — и быстрее, своей командой.",
      };
      return { title: `Почему мы — для *${sw.gen}*`, lead: past[one(a, "past")] ?? past.first, cards };
    }
    case "offer": {
      const need = NEED[service].find(([v]) => v === one(a, "need")) ?? NEED[service][0];
      const feature: Record<ServiceKey, string> = {
        sites: `Сценарий «${sw.action}» в один клик`,
        content: `В кадре — ${sw.scene}`,
        ai: `Бот сам ведёт «${sw.action}»`,
        smm: `Рубрика про ${sw.scene}`,
      };
      return {
        title: `${need[1]} для *${sw.gen}*`,
        lead: "Состав — под твою задачу и сферу.",
        cards: [
          { title: need[1], text: need[2] },
          { title: "Обязательно", text: label("must") || "Соберём состав на созвоне" },
          { title: "Фишка сферы", text: feature[service] },
        ],
      };
    }
    case "process": {
      const plan: Record<string, [string, string][]> = {
        asap: [["Сегодня", "Бриф и оценка"], ["3–5 дней", "Концепция"], ["1–2 недели", "Запуск"]],
        month: [["1–2 дня", "Бриф и оценка"], ["1-я неделя", "Концепция"], ["3–4 недели", "Запуск"]],
        quarter: [["Неделя", "Бриф и исследование"], ["Месяц", "2–3 концепции"], ["2–3 месяца", "Запуск и тесты"]],
        calm: [["Неделя", "Бриф"], ["Без спешки", "Концепции и доработки"], ["Когда готово", "Выверенный запуск"]],
      };
      const steps = plan[one(a, "when")] ?? plan.month;
      return {
        title: `Твой *план* запуска`,
        lead: `${product} для ${sw.gen}. Связь — ${label("talk").toLowerCase() || "в Telegram"}, продюсер ведёт каждый шаг.`,
        cards: steps.map(([title, text]) => ({ title, text })),
      };
    }
    case "price": {
      const tier: PricingTier = pickTier(service, Number(one(a, "budget")) || 0);
      const pay: Record<string, string> = {
        stages: "оплата поэтапно, по готовности частей",
        once: "разовая оплата за весь проект",
        monthly: "помесячная оплата",
      };
      return {
        title: `Тариф *«${tier.name}»*`,
        lead: `${tier.price} · ${pay[one(a, "pay")] ?? pay.stages}.`,
        cards: tier.features.slice(0, 3).map((f, i) => ({ title: ["Входит", "Плюс", "И ещё"][i], text: f })),
      };
    }
  }
}

// ---------- Ориентир цены и срока ----------
// Живая оценка в окошке (Егор выбрал «цена и срок вживую»): старт от
// младшего тарифа услуги, дальше — формат, число обязательных пунктов и
// срочность. Это ориентир «≈ от», точную цифру даёт продюсер.

const NEED_K: Record<string, number> = {
  landing: 1, card: 0.7, shop: 2.2, turnkey: 3,
  ad: 1, image: 1.6, social: 0.8, motion: 1.4,
  bot: 1, gen: 0.8, analytics: 1.3, automate: 1.6,
  full: 1.5, content: 1, ads: 0.8, audit: 0.5,
};
const BASE_DAYS: Record<ServiceKey, number> = { sites: 10, content: 14, ai: 14, smm: 30 };

export type BlockEstimate = { price: string; days: string };

export function estimateBlock(service: ServiceKey, a: BlockAnswers): BlockEstimate {
  const first = pricingByCategory[service][0].price.match(/\d[\d\s]*/)?.[0] ?? "0";
  let price = Number(first.replace(/\s/g, "")) || 30_000;
  let days = BASE_DAYS[service];
  const need = NEED_K[one(a, "need")] ?? 1;
  price *= need;
  days *= Math.sqrt(need);
  const must = many(a, "must").length;
  price *= 1 + must * 0.12;
  days += must;
  const when = one(a, "when");
  if (when === "asap") {
    price *= 1.25;
    days *= 0.6;
  } else if (when === "calm") days *= 1.3;
  const budget = Number(one(a, "budget"));
  if (budget) price = Math.min(Math.max(price, budget * 0.6), budget);
  const rounded = Math.max(5_000, Math.round(price / 5_000) * 5_000);
  const d = Math.max(3, Math.round(days));
  return {
    price: `≈ от ${rounded.toLocaleString("ru-RU")} ₽${service === "smm" ? "/мес" : ""}`,
    days: service === "smm" ? "старт за 7 дней" : `${d} ${d % 10 === 1 && d % 100 !== 11 ? "день" : d % 10 >= 2 && d % 10 <= 4 && (d % 100 < 10 || d % 100 >= 20) ? "дня" : "дней"}`,
  };
}

// ---------- Хранилище собранных блоков ----------
// Только в браузере посетителя: собранный блок остаётся собранным после
// перезагрузки, пока он сам не нажмёт «Вернуть как было».

const KEY = "hdkv_block_vibe";
type Store = Record<string, BlockAnswers>;
let cache: Store | null = null;
const listeners = new Set<() => void>();

function read(): Store {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Store;
  } catch {
    cache = {};
  }
  return cache;
}

function write(next: Store) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

export function setTunedBlock(path: string, id: string, answers: BlockAnswers | null) {
  const next = { ...read() };
  if (answers) next[`${path}#${id}`] = answers;
  else delete next[`${path}#${id}`];
  write(next);
}

const EMPTY: Store = {};
function useStore(): Store {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => EMPTY
  );
}

export function useTunedBlock(path: string, id: string | null): BlockAnswers | null {
  const store = useStore();
  return id ? store[`${path}#${id}`] ?? null : null;
}

/** Сколько блоков страницы уже собрано — для прогресса «2 из 6». */
export function useTunedProgress(path: string): { done: number; total: number } {
  const store = useStore();
  const ids = PAGE_CHAPTERS[path]?.map(([id]) => id) ?? [];
  return { done: ids.filter((id) => store[`${path}#${id}`]).length, total: ids.length };
}

/** Сфера из последнего собранного блока — подставляется в следующий. */
export function lastSphere(): string | string[] | undefined {
  const all = Object.values(read());
  return all[all.length - 1]?.sphere;
}
