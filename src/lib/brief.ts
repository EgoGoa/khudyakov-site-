// The 20-question production brief. Ported from the standalone brief
// artifact so the site and that document stay in sync — question wording,
// order, options and required flags are kept verbatim.

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

export const SCENE_NAMES: Record<number, string> = {
  1: "О вас",
  2: "Цель",
  3: "Формат",
  4: "Стиль",
  5: "Логистика",
};

export const BRIEF_EMAIL = "khudyakov.yegor@gmail.com";

export const STEPS: BriefStep[] = [
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
