import type { BriefId } from "@/features/brief/types";

// Калькулятор под каждую услугу: свои типы работ, шкала объёма и опции,
// свой акцент, фон и тексты. Страница /calculator/<услуга> берёт всё отсюда.

export type CalcType = { id: string; label: string; hint: string; min: number; max: number };
export type CalcScale = { id: string; label: string; mult: number };
export type CalcAddon = { id: string; label: string; hint: string; pct: number };
export type CalcTier = { name: string; ceiling: number };

export type CalcConfig = {
  id: BriefId;
  parent: { href: string; label: string };
  accent: { from: string; to: string };
  headingClass: string;
  /** Подзаголовки полей. */
  legends: { type: string; scale: string };
  /** Подпись цены: за проект или в месяц. */
  priceSuffix: string;
  types: CalcType[];
  defaultType: number;
  scales: CalcScale[];
  defaultScale: number;
  addons: CalcAddon[];
  tiers: CalcTier[];
  premiumFrom: number;
  hero: { lead: string; leadAccent: string; photo: string; photoPosition: string; askQuestion: string; askMember: string };
  media: { why: string; calc: string; close: string };
  reasons: { anchor: string; title: string; text: string }[];
  stats: { value: string; label: string }[];
  summary: string;
};

const stats = (a: string): { value: string; label: string }[] => [
  { value: "8 лет", label: a },
  { value: "450+", label: "созданных проектов" },
  { value: "350+", label: "довольных клиентов" },
  { value: "5 стран", label: "международный опыт" },
];

export const calcConfigs: Record<BriefId, CalcConfig> = {
  content: {
    id: "content",
    parent: { href: "/content", label: "Создание контента" },
    accent: { from: "#ff4fd8", to: "#ff6a3d" },
    headingClass: "content-warm-headings",
    legends: { type: "Тип ролика", scale: "Хронометраж" },
    priceSuffix: "",
    types: [
      { id: "social", label: "Контент для соцсетей", hint: "Reels, шортсы, TikTok", min: 35000, max: 90000 },
      { id: "event", label: "Съёмка мероприятия", hint: "Конференции, ивенты, форумы", min: 75000, max: 150000 },
      { id: "image", label: "Имиджевое видео", hint: "О компании, продукте, команде", min: 90000, max: 180000 },
      { id: "motion", label: "Motion design / анимация", hint: "2D-анимация, инфографика", min: 90000, max: 220000 },
      { id: "ad", label: "Рекламный ролик", hint: "Для ТВ и запуска на YouTube", min: 120000, max: 255000 },
      { id: "vfx", label: "3D-визуализация / VFX", hint: "Сложная графика, спецэффекты", min: 250000, max: 900000 },
    ],
    defaultType: 3,
    scales: [
      { id: "xs", label: "До 30 секунд", mult: 0.8 },
      { id: "s", label: "30–60 секунд", mult: 1 },
      { id: "m", label: "1–3 минуты", mult: 1.35 },
      { id: "l", label: "3+ минуты", mult: 1.8 },
    ],
    defaultScale: 1,
    addons: [
      { id: "cutdowns", label: "Доп. версии под сторис / шортсы", hint: "Несколько форматов из одной съёмки", pct: 0.1 },
      { id: "rush", label: "Срочное производство", hint: "Сжатые сроки съёмки и монтажа", pct: 0.25 },
      { id: "script", label: "Разработка сценария с нуля", hint: "Идея, драматургия, раскадровка", pct: 0.12 },
      { id: "voice", label: "Озвучка / диктор", hint: "Профессиональная начитка текста", pct: 0.08 },
      { id: "cast", label: "Актёры / кастинг", hint: "Подбор и работа с актёрами", pct: 0.15 },
      { id: "vfx", label: "3D / VFX-элементы", hint: "Спецэффекты, композитинг", pct: 0.2 },
      { id: "brand", label: "Брендбук с нуля", hint: "Лого, цвета, гайдлайны", pct: 0.1 },
    ],
    tiers: [
      { name: "Стартовый", ceiling: 75000 },
      { name: "Профессиональный", ceiling: 255000 },
      { name: "Премиальный", ceiling: Infinity },
    ],
    premiumFrom: 900000,
    hero: {
      lead: "Снимаем рекламу, имиджевые видео, контент для соцсетей и мероприятия, усиливаем результат AI-инструментами.",
      leadAccent: "Посчитайте ориентировочный бюджет ниже",
      photo: "/images/blocks/stock-directing.jpg",
      photoPosition: "50% 30%",
      askQuestion: "Нужна точная смета, не вилка?",
      askMember: "egor",
    },
    media: {
      why: "/images/stock/design-tablet.webp",
      calc: "/images/stock/planner-desk.webp",
      close: "/images/stock/woman-tablet-white.webp",
    },
    reasons: [
      { anchor: "01", title: "Продюсерский центр полного цикла", text: "От идеи и сценария до готового ролика — без подрядчиков на стороне." },
      { anchor: "02", title: "2–3 концепции бесплатно", text: "Разрабатываем творческие идеи под задачу перед стартом работы." },
      { anchor: "03", title: "Цены ниже, чем в Москве и СПб", text: "Тот же уровень качества — заметно доступнее для регионов." },
    ],
    stats: stats("в видеопроизводстве"),
    summary: "типа ролика, хронометража и",
  },

  sites: {
    id: "sites",
    parent: { href: "/sites", label: "Сайты" },
    accent: { from: "#ff6f61", to: "#00c2b2" },
    headingClass: "sites-warm-headings",
    legends: { type: "Тип сайта", scale: "Объём сайта" },
    priceSuffix: "",
    types: [
      { id: "landing", label: "Лендинг", hint: "Одна страница под одну задачу", min: 60000, max: 130000 },
      { id: "card", label: "Сайт-визитка", hint: "Коротко о компании и контакты", min: 45000, max: 95000 },
      { id: "corporate", label: "Корпоративный сайт", hint: "Услуги, кейсы, команда, блог", min: 150000, max: 320000 },
      { id: "shop", label: "Интернет-магазин", hint: "Каталог, корзина, оплата", min: 250000, max: 650000 },
      { id: "redesign", label: "Редизайн сайта", hint: "Новый дизайн и структура", min: 80000, max: 220000 },
      { id: "service", label: "Веб-сервис / приложение", hint: "Личные кабинеты, логика", min: 400000, max: 1200000 },
    ],
    defaultType: 0,
    scales: [
      { id: "p1", label: "1 страница", mult: 0.8 },
      { id: "p5", label: "2–5 страниц", mult: 1 },
      { id: "p15", label: "6–15 страниц", mult: 1.5 },
      { id: "p15plus", label: "Больше 15 страниц", mult: 2.2 },
    ],
    defaultScale: 1,
    addons: [
      { id: "admin", label: "Админка для обновления", hint: "Менять тексты и фото самим", pct: 0.1 },
      { id: "pay", label: "Онлайн-оплата", hint: "Приём платежей на сайте", pct: 0.12 },
      { id: "account", label: "Личный кабинет", hint: "Вход и история заказов", pct: 0.25 },
      { id: "ai", label: "AI-ассистент / чат-бот", hint: "Отвечает посетителям 24/7", pct: 0.15 },
      { id: "motion", label: "Анимации и 3D", hint: "Вау-эффекты при прокрутке", pct: 0.2 },
      { id: "crm", label: "Интеграции CRM и аналитики", hint: "amoCRM, Битрикс24, Метрика", pct: 0.1 },
      { id: "content", label: "Тексты и фото с нуля", hint: "Копирайтинг и съёмка", pct: 0.15 },
      { id: "rush", label: "Срочный запуск", hint: "Сжатые сроки разработки", pct: 0.25 },
    ],
    tiers: [
      { name: "Стартовый", ceiling: 100000 },
      { name: "Профессиональный", ceiling: 320000 },
      { name: "Премиальный", ceiling: Infinity },
    ],
    premiumFrom: 1000000,
    hero: {
      lead: "Делаем сайты, которые собирают заявки: от лендинга до интернет-магазина, с дизайном, разработкой и AI-ассистентом.",
      leadAccent: "Посчитайте ориентировочный бюджет сайта ниже",
      photo: "/images/stock/devs-night.webp",
      photoPosition: "50% 40%",
      askQuestion: "Нужна точная смета на сайт?",
      askMember: "sasha",
    },
    media: {
      why: "/images/stock/man-laptop-dark.webp",
      calc: "/images/stock/devs-night.webp",
      close: "/images/stock/desk-aerial.webp",
    },
    reasons: [
      { anchor: "01", title: "Дизайн и разработка в одной команде", text: "Без передачи между подрядчиками: от прототипа до запуска." },
      { anchor: "02", title: "Фиксированная смета", text: "Согласуем стоимость до старта — без доплат по ходу работы." },
      { anchor: "03", title: "Запуск от 7 дней", text: "Лендинг можно запустить за неделю, сложный проект — по этапам." },
    ],
    stats: stats("в разработке и дизайне"),
    summary: "типа сайта, объёма и",
  },

  smm: {
    id: "smm",
    parent: { href: "/smm", label: "SMM" },
    accent: { from: "#38bdf8", to: "#8b5cf6" },
    headingClass: "smm-violet-headings",
    legends: { type: "Что нужно", scale: "Площадки" },
    priceSuffix: " / мес",
    types: [
      { id: "full", label: "Ведение под ключ", hint: "Стратегия, контент, публикации", min: 60000, max: 150000 },
      { id: "production", label: "Производство контента", hint: "Reels, сторис, карусели", min: 35000, max: 90000 },
      { id: "audit", label: "Аудит и стратегия", hint: "Разбор аккаунта и контент-план", min: 30000, max: 60000 },
      { id: "launch", label: "Запуск аккаунта с нуля", hint: "Упаковка и первые публикации", min: 70000, max: 140000 },
      { id: "ads", label: "Таргетированная реклама", hint: "Настройка и ведение кампаний", min: 25000, max: 80000 },
      { id: "bloggers", label: "Работа с блогерами", hint: "Подбор, договорённости, отчёт", min: 40000, max: 200000 },
    ],
    defaultType: 0,
    scales: [
      { id: "one", label: "1 площадка", mult: 0.8 },
      { id: "two", label: "2–3 площадки", mult: 1 },
      { id: "many", label: "4 и больше площадок", mult: 1.5 },
    ],
    defaultScale: 1,
    addons: [
      { id: "stories", label: "Сторис каждый день", hint: "Ежедневная подача и вовлечение", pct: 0.15 },
      { id: "reels", label: "Выездные съёмки Reels", hint: "Съёмочный день раз в месяц", pct: 0.25 },
      { id: "community", label: "Комментарии и директ", hint: "Отвечаем подписчикам", pct: 0.1 },
      { id: "ads", label: "Таргетированная реклама", hint: "Настройка и ведение", pct: 0.2 },
      { id: "ai", label: "AI-генерация контента", hint: "Фото и видео нейросетями", pct: 0.12 },
      { id: "report", label: "Расширенная аналитика", hint: "Еженедельные отчёты", pct: 0.08 },
    ],
    tiers: [
      { name: "Стартовый", ceiling: 50000 },
      { name: "Профессиональный", ceiling: 120000 },
      { name: "Премиальный", ceiling: Infinity },
    ],
    premiumFrom: 300000,
    hero: {
      lead: "Ведём соцсети под ключ: стратегия, Reels, сторис и реклама — чтобы аккаунт приводил клиентов, а не просто копил подписчиков.",
      leadAccent: "Посчитайте бюджет на месяц ниже",
      photo: "/images/stock/smm-phone-bokeh.webp",
      photoPosition: "60% 40%",
      askQuestion: "Нужен точный бюджет на месяц?",
      askMember: "tanya",
    },
    media: {
      why: "/images/stock/smm-collage-phone.webp",
      calc: "/images/stock/smm-collage-megaphone.webp",
      close: "/images/stock/smm-phone-bokeh.webp",
    },
    reasons: [
      { anchor: "01", title: "Всё в одном месте", text: "Стратегия, съёмка, монтаж и публикации делает одна команда." },
      { anchor: "02", title: "Тестовый месяц", text: "Можно начать с короткого формата и оценить результат." },
      { anchor: "03", title: "Понятные отчёты", text: "Показываем цифры: охваты, заявки, стоимость клиента." },
    ],
    stats: stats("в соцсетях и контенте"),
    summary: "формата работы, площадок и",
  },

  ai: {
    id: "ai",
    parent: { href: "/ai", label: "AI-инструменты" },
    accent: { from: "#c8f169", to: "#10b981" },
    headingClass: "ai-cool-headings",
    legends: { type: "Что внедряем", scale: "Нагрузка" },
    priceSuffix: "",
    types: [
      { id: "agent", label: "AI-агент / ассистент", hint: "Отвечает и выполняет задачи", min: 80000, max: 200000 },
      { id: "automation", label: "Автоматизация процессов", hint: "Заявки, отчёты, документы", min: 60000, max: 180000 },
      { id: "content", label: "AI-генерация фото и видео", hint: "Реклама и предметная съёмка", min: 40000, max: 120000 },
      { id: "chatbot", label: "Чат-бот для продаж", hint: "Telegram, WhatsApp, сайт", min: 50000, max: 150000 },
      { id: "training", label: "Обучение команды", hint: "Работа с AI-инструментами", min: 30000, max: 90000 },
      { id: "consult", label: "Консультация и аудит", hint: "Где AI даст эффект", min: 20000, max: 50000 },
    ],
    defaultType: 0,
    scales: [
      { id: "l50", label: "До 50 обращений в день", mult: 0.8 },
      { id: "l300", label: "50–300 обращений", mult: 1 },
      { id: "l300plus", label: "Больше 300 обращений", mult: 1.6 },
    ],
    defaultScale: 1,
    addons: [
      { id: "crm", label: "Интеграция с CRM", hint: "amoCRM, Битрикс24, Таблицы", pct: 0.12 },
      { id: "voice", label: "Голос и звонки", hint: "Голосовые и телефонные ответы", pct: 0.25 },
      { id: "kb", label: "Сборка базы знаний", hint: "Документы, FAQ, прайсы", pct: 0.1 },
      { id: "secure", label: "Закрытый контур", hint: "Для коммерческой тайны", pct: 0.3 },
      { id: "support", label: "Поддержка и развитие", hint: "Доработки после запуска", pct: 0.15 },
      { id: "rush", label: "Срочный запуск", hint: "Сжатые сроки внедрения", pct: 0.2 },
    ],
    tiers: [
      { name: "Стартовый", ceiling: 60000 },
      { name: "Профессиональный", ceiling: 160000 },
      { name: "Премиальный", ceiling: Infinity },
    ],
    premiumFrom: 400000,
    hero: {
      lead: "Внедряем AI-агентов, чат-ботов и автоматизацию: берут на себя рутину, отвечают клиентам и экономят время команды.",
      leadAccent: "Посчитайте ориентировочный бюджет внедрения ниже",
      photo: "/images/blocks/ai-neon-desk.jpg",
      photoPosition: "50% 40%",
      askQuestion: "Нужна точная оценка под ваш бизнес?",
      askMember: "dima",
    },
    media: {
      why: "/images/blocks/ai-keyboard-neon.jpg",
      calc: "/images/blocks/ai-neon-abstract.jpg",
      close: "/images/blocks/ai-corridor-neon.jpg",
    },
    reasons: [
      { anchor: "01", title: "Решение под вашу задачу", text: "Не шаблонный бот, а агент, обученный на ваших данных." },
      { anchor: "02", title: "Запуск за недели", text: "Первый рабочий результат — быстро, дальше развиваем." },
      { anchor: "03", title: "Безопасность данных", text: "При необходимости — закрытый контур для чувствительной информации." },
    ],
    stats: stats("в цифровых решениях"),
    summary: "решения, нагрузки и",
  },
};
