// The production brief, plus three shorter direction-specific briefs (AI,
// SMM, sites) that reuse the exact same BriefForm mechanics — see
// BriefForm.tsx. The video brief was ported from the standalone brief
// artifact so wording/order/options stay in sync with it; the other three
// are original, drafted from what's actually asked in each of those
// markets (chat-bot/voice-AI briefs, SMM onboarding forms, website scoping
// questionnaires) since there's no matching standalone doc to mirror.

export type BriefVariant = "video" | "ai" | "smm" | "sites";

export type BriefStepType =
  | "text"
  | "textarea"
  | "contact"
  | "chips"
  | "choice"
  | "date";

export type BriefStep = {
  id: string;
  page: 1 | 2;
  scene: number;
  type: BriefStepType;
  title: string;
  help?: string;
  placeholder?: string;
  options?: string[];
  required: boolean;
};

export const BRIEF_EMAIL = "khudyakov.yegor@gmail.com";

// Everything a page needs to present itself as "this brief, not the others":
// the hero word, the badge naming the direction, the CSS class that repaints
// the shared orange/cyan brief palette into that direction's own accent (see
// the .brief-ai/.brief-smm/.brief-sites rules in globals.css), the document
// title used in both the on-screen heading and the mailto fallback, and the
// `type` sent to /api/lead so the email subject says which brief it was.
export const BRIEF_META: Record<
  BriefVariant,
  {
    badge: string;
    heroWord: string;
    docTitle: string;
    subjectNoun: string;
    wrapClass: string;
    leadType: "brief" | "brief-ai" | "brief-smm" | "brief-sites";
  }
> = {
  video: {
    badge: "Видеопродакшн",
    heroWord: "Съёмка",
    docTitle: "БРИФ НА ВИДЕОПРОДАКШН",
    subjectNoun: "видео",
    wrapClass: "",
    leadType: "brief",
  },
  ai: {
    badge: "AI-решения",
    heroWord: "Внедрение",
    docTitle: "БРИФ НА AI-РЕШЕНИЕ",
    subjectNoun: "AI",
    wrapClass: "brief-ai",
    leadType: "brief-ai",
  },
  smm: {
    badge: "SMM",
    heroWord: "Продвижение",
    docTitle: "БРИФ НА SMM",
    subjectNoun: "SMM",
    wrapClass: "brief-smm",
    leadType: "brief-smm",
  },
  sites: {
    badge: "Сайты",
    heroWord: "Сайт",
    docTitle: "БРИФ НА САЙТ",
    subjectNoun: "сайт",
    wrapClass: "brief-sites",
    leadType: "brief-sites",
  },
};

export const SCENE_NAMES_BY_VARIANT: Record<BriefVariant, Record<number, string>> = {
  video: {
    1: "О вас",
    2: "Цель",
    3: "Формат",
    4: "Стиль",
    5: "Логистика",
  },
  ai: {
    1: "О вас",
    2: "Задача",
    3: "Каналы и данные",
    4: "Бюджет и сроки",
  },
  smm: {
    1: "О вас",
    2: "Задача и аудитория",
    3: "Формат работы",
    4: "Бюджет и сроки",
  },
  sites: {
    1: "О вас",
    2: "Задача",
    3: "Готовность материалов",
    4: "Бюджет и сроки",
  },
};

const VIDEO_STEPS: BriefStep[] = [
  {
    id: "company",
    page: 1,
    scene: 1,
    type: "text",
    title: "Как называется ваш бренд?",
    help: "Так мы будем называть проект в переписке.",
    placeholder: "Ivan Coffee",
    required: true,
  },
  {
    id: "field",
    page: 1,
    scene: 1,
    type: "text",
    title: "Чем занимается компания?",
    help: "Пары слов о сфере достаточно.",
    placeholder: "Сеть кофеен, 12 точек по Москве",
    required: true,
  },
  {
    id: "name",
    page: 1,
    scene: 1,
    type: "text",
    title: "Как вас зовут?",
    placeholder: "Иван",
    required: true,
  },
  {
    id: "contact",
    page: 1,
    scene: 1,
    type: "contact",
    title: "Как с вами связаться?",
    help: "Email обязателен, остальное — по желанию.",
    required: true,
  },

  {
    id: "videoType",
    page: 1,
    scene: 2,
    type: "chips",
    title: "Какой ролик нужен?",
    help: "Можно выбрать несколько вариантов.",
    options: [
      "Реклама",
      "Имиджевое видео",
      "Контент для соцсетей",
      "Съёмка мероприятия",
      "Motion design / анимация",
      "AI-контент",
      "Другое",
    ],
    required: true,
  },
  {
    id: "goal",
    page: 1,
    scene: 2,
    type: "textarea",
    title: "Что должен сделать зритель после просмотра?",
    help: "Купить, оставить заявку, подписаться, узнать бренд — что угодно.",
    placeholder: "Перейти на сайт и оставить заявку на пробное занятие",
    required: true,
  },
  {
    id: "audience",
    page: 1,
    scene: 2,
    type: "textarea",
    title: "Кто ваша аудитория?",
    placeholder: "Женщины 25–40, интересуются йогой и ЗОЖ",
    required: true,
  },
  {
    id: "placement",
    page: 1,
    scene: 2,
    type: "chips",
    title: "Где будет жить ролик?",
    options: [
      "YouTube",
      "Instagram / Reels",
      "TikTok",
      "Сайт",
      "ТВ / наружная реклама",
      "Экран на мероприятии",
      "Другое",
    ],
    required: true,
  },

  {
    id: "duration",
    page: 2,
    scene: 3,
    type: "choice",
    title: "Какой хронометраж нужен?",
    options: [
      "До 15 секунд",
      "15–30 секунд",
      "30–60 секунд",
      "1–3 минуты",
      "3+ минуты",
      "Пока не знаю",
    ],
    required: true,
  },
  {
    id: "cutdowns",
    page: 2,
    scene: 3,
    type: "choice",
    title: "Нужны версии под сторис и шортсы?",
    options: ["Да", "Нет", "Обсудим на созвоне"],
    required: true,
  },
  {
    id: "script",
    page: 2,
    scene: 3,
    type: "choice",
    title: "Сценарий уже есть?",
    options: ["Да, готов", "Есть только идея", "Нужна разработка с нуля"],
    required: true,
  },
  {
    id: "style",
    page: 2,
    scene: 3,
    type: "chips",
    title: "Какая подача ближе?",
    options: [
      "Игровой ролик",
      "Интервью / говорящая голова",
      "Анимация / motion",
      "Репортаж",
      "Смешанный формат",
    ],
    required: true,
  },

  {
    id: "message",
    page: 2,
    scene: 4,
    type: "textarea",
    title: "Какое сообщение должно прозвучать?",
    help: "Оффер, УТП или главная мысль ролика.",
    placeholder: "Первое занятие бесплатно для новых учеников",
    required: true,
  },
  {
    id: "references",
    page: 2,
    scene: 4,
    type: "textarea",
    title: "Есть ролики, которые нравятся по стилю?",
    help: "Ссылки на YouTube, Reels — по одной на строку.",
    placeholder: "https://…",
    required: false,
  },
  {
    id: "avoid",
    page: 2,
    scene: 4,
    type: "textarea",
    title: "Чего точно нужно избежать?",
    help: "Антиреференсы, стоп-слова, ограничения бренда.",
    required: false,
  },
  {
    id: "brandkit",
    page: 2,
    scene: 4,
    type: "choice",
    title: "Есть фирменный стиль?",
    options: ["Есть брендбук", "Есть только лого и цвета", "Нет, начинаем с нуля"],
    required: true,
  },

  {
    id: "shooting",
    page: 2,
    scene: 5,
    type: "choice",
    title: "Нужна съёмка или работаем с готовым материалом?",
    options: ["Нужна съёмка", "Работаем с готовыми материалами", "И то, и другое"],
    required: true,
  },
  {
    id: "logistics",
    page: 2,
    scene: 5,
    type: "textarea",
    title: "Локация, актёры, дикторы?",
    help: "Если съёмка не нужна — можно пропустить.",
    required: false,
  },
  {
    id: "budget",
    page: 2,
    scene: 5,
    type: "choice",
    title: "Какой бюджет закладываете?",
    options: [
      "До 150 000 ₽",
      "150 000–400 000 ₽",
      "400 000–800 000 ₽",
      "800 000 ₽ и выше",
      "Обсудим на созвоне",
    ],
    required: true,
  },
  {
    id: "deadline",
    page: 2,
    scene: 5,
    type: "date",
    title: "К какой дате нужен готовый ролик?",
    help: "Ориентировочно — точный план обсудим на созвоне.",
    required: false,
  },
];

const AI_STEPS: BriefStep[] = [
  {
    id: "company",
    page: 1,
    scene: 1,
    type: "text",
    title: "Как называется ваш бренд?",
    help: "Так мы будем называть проект в переписке.",
    placeholder: "Ivan Coffee",
    required: true,
  },
  {
    id: "field",
    page: 1,
    scene: 1,
    type: "text",
    title: "Чем занимается компания?",
    placeholder: "Сеть кофеен, 12 точек по Москве",
    required: true,
  },
  {
    id: "name",
    page: 1,
    scene: 1,
    type: "text",
    title: "Как вас зовут?",
    placeholder: "Иван",
    required: true,
  },
  {
    id: "contact",
    page: 1,
    scene: 1,
    type: "contact",
    title: "Как с вами связаться?",
    help: "Email обязателен, остальное — по желанию.",
    required: true,
  },
  {
    id: "aiFormat",
    page: 1,
    scene: 2,
    type: "chips",
    title: "Какой AI-инструмент нужен?",
    help: "Можно выбрать несколько вариантов.",
    options: [
      "Чат-бот для сайта / соцсетей",
      "Голосовой AI",
      "AI-видео и генеративный контент",
      "Автоматизация CRM и лидов",
      "AI-ассистент для сотрудников",
      "Другое",
    ],
    required: true,
  },
  {
    id: "goal",
    page: 1,
    scene: 2,
    type: "textarea",
    title: "Какую задачу должен закрыть AI?",
    help: "Что именно должно перестать делать руками после внедрения.",
    placeholder: "Отвечать на вопросы по наличию и доставке, пока менеджер занят",
    required: true,
  },
  {
    id: "channels",
    page: 2,
    scene: 3,
    type: "chips",
    title: "Где должен работать AI?",
    options: [
      "Telegram",
      "WhatsApp",
      "Instagram",
      "Сайт",
      "Звонки / голос",
      "CRM и внутренние системы",
      "Другое",
    ],
    required: true,
  },
  {
    id: "knowledgeBase",
    page: 2,
    scene: 3,
    type: "choice",
    title: "Есть база знаний или скрипты продаж?",
    options: ["Да, готовы передать", "Есть частично", "Нужно собрать с нуля"],
    required: true,
  },
  {
    id: "integrations",
    page: 2,
    scene: 3,
    type: "textarea",
    title: "С какими системами нужна интеграция?",
    help: "CRM, календарь, склад — что уже используете. Можно пропустить.",
    required: false,
  },
  {
    id: "budget",
    page: 2,
    scene: 4,
    type: "choice",
    title: "Какой бюджет закладываете?",
    options: [
      "До 100 000 ₽",
      "100 000–300 000 ₽",
      "300 000–700 000 ₽",
      "700 000 ₽ и выше",
      "Обсудим на созвоне",
    ],
    required: true,
  },
  {
    id: "deadline",
    page: 2,
    scene: 4,
    type: "date",
    title: "К какой дате нужен рабочий пилот?",
    help: "Ориентировочно — точный план обсудим на созвоне.",
    required: false,
  },
];

const SMM_STEPS: BriefStep[] = [
  {
    id: "company",
    page: 1,
    scene: 1,
    type: "text",
    title: "Как называется ваш бренд?",
    help: "Так мы будем называть проект в переписке.",
    placeholder: "Ivan Coffee",
    required: true,
  },
  {
    id: "field",
    page: 1,
    scene: 1,
    type: "text",
    title: "Чем занимается компания?",
    placeholder: "Сеть кофеен, 12 точек по Москве",
    required: true,
  },
  {
    id: "name",
    page: 1,
    scene: 1,
    type: "text",
    title: "Как вас зовут?",
    placeholder: "Иван",
    required: true,
  },
  {
    id: "contact",
    page: 1,
    scene: 1,
    type: "contact",
    title: "Как с вами связаться?",
    help: "Email обязателен, остальное — по желанию.",
    required: true,
  },
  {
    id: "smmGoal",
    page: 1,
    scene: 2,
    type: "chips",
    title: "Что нужно от SMM?",
    help: "Можно выбрать несколько вариантов.",
    options: [
      "Ведение соцсетей",
      "Контент-план и съёмки",
      "Таргет / продвижение",
      "Комьюнити-менеджмент",
      "Работа с блогерами",
      "Другое",
    ],
    required: true,
  },
  {
    id: "platforms",
    page: 1,
    scene: 2,
    type: "chips",
    title: "Где нужно продвижение?",
    options: ["Instagram", "VK", "Telegram", "TikTok", "YouTube", "Другое"],
    required: true,
  },
  {
    id: "audience",
    page: 1,
    scene: 2,
    type: "textarea",
    title: "Кто ваша аудитория?",
    placeholder: "Женщины 25–40, интересуются йогой и ЗОЖ",
    required: true,
  },
  {
    id: "currentState",
    page: 2,
    scene: 3,
    type: "choice",
    title: "Соцсети уже ведутся?",
    options: ["Да, есть активные аккаунты", "Есть, но давно не ведём", "Нужно начать с нуля"],
    required: true,
  },
  {
    id: "contentSource",
    page: 2,
    scene: 3,
    type: "choice",
    title: "Съёмки материала на вашей стороне или нужны мы?",
    options: ["Своя команда и материалы", "Нужна съёмка от вас", "Обсудим на созвоне"],
    required: true,
  },
  {
    id: "budget",
    page: 2,
    scene: 4,
    type: "choice",
    title: "Какой бюджет закладываете в месяц?",
    options: [
      "До 60 000 ₽",
      "60 000–150 000 ₽",
      "150 000–350 000 ₽",
      "350 000 ₽ и выше",
      "Обсудим на созвоне",
    ],
    required: true,
  },
  {
    id: "deadline",
    page: 2,
    scene: 4,
    type: "date",
    title: "Когда хотите начать?",
    help: "Ориентировочно — точный план обсудим на созвоне.",
    required: false,
  },
];

const SITES_STEPS: BriefStep[] = [
  {
    id: "company",
    page: 1,
    scene: 1,
    type: "text",
    title: "Как называется ваш бренд?",
    help: "Так мы будем называть проект в переписке.",
    placeholder: "Ivan Coffee",
    required: true,
  },
  {
    id: "field",
    page: 1,
    scene: 1,
    type: "text",
    title: "Чем занимается компания?",
    placeholder: "Сеть кофеен, 12 точек по Москве",
    required: true,
  },
  {
    id: "name",
    page: 1,
    scene: 1,
    type: "text",
    title: "Как вас зовут?",
    placeholder: "Иван",
    required: true,
  },
  {
    id: "contact",
    page: 1,
    scene: 1,
    type: "contact",
    title: "Как с вами связаться?",
    help: "Email обязателен, остальное — по желанию.",
    required: true,
  },
  {
    id: "siteType",
    page: 1,
    scene: 2,
    type: "chips",
    title: "Какой сайт нужен?",
    options: [
      "Лендинг",
      "Корпоративный сайт",
      "Интернет-магазин",
      "Сайт на AI (генеративный)",
      "Редизайн текущего сайта",
      "Другое",
    ],
    required: true,
  },
  {
    id: "goal",
    page: 1,
    scene: 2,
    type: "textarea",
    title: "Какую задачу должен решать сайт?",
    placeholder: "Собирать заявки на замер, показывать портфолио, продавать онлайн",
    required: true,
  },
  {
    id: "pages",
    page: 1,
    scene: 2,
    type: "choice",
    title: "Сколько разделов примерно нужно?",
    options: ["1 страница (лендинг)", "2–5 страниц", "6–15 страниц", "15+ страниц", "Пока не знаю"],
    required: true,
  },
  {
    id: "hasContent",
    page: 2,
    scene: 3,
    type: "choice",
    title: "Тексты и фото/видео для сайта уже есть?",
    options: ["Да, всё готово", "Частично", "Нужно готовить с нуля"],
    required: true,
  },
  {
    id: "hasDomainHosting",
    page: 2,
    scene: 3,
    type: "choice",
    title: "Домен и хостинг уже есть?",
    options: ["Да, всё есть", "Есть частично", "Нужно всё подобрать"],
    required: true,
  },
  {
    id: "references",
    page: 2,
    scene: 3,
    type: "textarea",
    title: "Есть сайты, которые нравятся по стилю?",
    help: "Ссылки — по одной на строку. Можно пропустить.",
    placeholder: "https://…",
    required: false,
  },
  {
    id: "budget",
    page: 2,
    scene: 4,
    type: "choice",
    title: "Какой бюджет закладываете?",
    options: [
      "До 100 000 ₽",
      "100 000–300 000 ₽",
      "300 000–700 000 ₽",
      "700 000 ₽ и выше",
      "Обсудим на созвоне",
    ],
    required: true,
  },
  {
    id: "deadline",
    page: 2,
    scene: 4,
    type: "date",
    title: "К какой дате нужен готовый сайт?",
    help: "Ориентировочно — точный план обсудим на созвоне.",
    required: false,
  },
];

export const STEPS_BY_VARIANT: Record<BriefVariant, BriefStep[]> = {
  video: VIDEO_STEPS,
  ai: AI_STEPS,
  smm: SMM_STEPS,
  sites: SITES_STEPS,
};

// Shared components (Trust/Offer/Process/Close) render on /content, /ai,
// /smm and /sites alike and pick their copy from `useService().active`
// already — this is the same switch, applied to which brief their "Заполнить
// бриф" button opens. /content keeps the general video brief.
export function briefHrefFor(active: "content" | "ai" | "sites" | "smm"): string {
  if (active === "content") return "/brief";
  return `/brief/${active}`;
}
