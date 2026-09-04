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

export type ContactValue = { email: string; phone: string };
export type AnswerValue = string | string[] | ContactValue | undefined;
export type Answers = Record<string, AnswerValue>;

// How much of a single answer is kept. Generous next to any real answer —
// the longest sensible reply here is a few sentences — but it bounds what the
// public /api/brief endpoint can be made to emit, since the same builder runs
// on the server against whatever a caller posts.
const MAX_ANSWER_LENGTH = 2000;

function clamp(value: string) {
  return value.length > MAX_ANSWER_LENGTH
    ? `${value.slice(0, MAX_ANSWER_LENGTH)}… (обрезано)`
    : value;
}

export function isAnswered(step: BriefStep, answers: Answers) {
  const v = answers[step.id];
  if (step.type === "chips") return Array.isArray(v) && v.length > 0;
  if (step.type === "contact") {
    const c = v as ContactValue | undefined;
    return Boolean(c?.email && c.email.trim());
  }
  return Boolean(v && String(v).trim());
}

export function formatAnswer(step: BriefStep, answers: Answers): string | null {
  const v = answers[step.id];

  if (step.type === "chips") {
    // Only options the step actually offers. On the server this list is what
    // stops a caller from posting arbitrary strings as "answers" to a
    // multiple-choice question.
    if (!Array.isArray(v) || v.length === 0) return null;
    const allowed = v.filter((opt) => typeof opt === "string" && step.options?.includes(opt));
    return allowed.length ? allowed.join(", ") : null;
  }
  if (step.type === "choice") {
    return typeof v === "string" && step.options?.includes(v) ? v : null;
  }
  if (step.type === "contact") {
    const c = v as ContactValue | undefined;
    if (!c?.email) return null;
    const parts: string[] = [];
    const name = answers.name;
    if (typeof name === "string" && name.trim()) parts.push(clamp(name.trim()));
    parts.push(clamp(c.email.trim()));
    if (typeof c.phone === "string" && c.phone.trim()) parts.push(clamp(c.phone.trim()));
    return parts.join(" · ");
  }
  if (step.type === "date") {
    if (typeof v !== "string" || !v) return null;
    const d = new Date(`${v}T00:00:00`);
    const out = Number.isNaN(d.getTime())
      ? clamp(v)
      : d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
    const note = answers[`${step.id}Note`];
    return typeof note === "string" && note.trim() ? `${out} — ${clamp(note.trim())}` : out;
  }
  return typeof v === "string" && v.trim() ? clamp(v.trim()) : null;
}

// The brief as plain text. Shared deliberately: the clipboard copy, the
// selectable fallback textarea and the Telegram message the server sends are
// all this one function, so what the visitor is shown they copied is exactly
// what we receive. Driven by STEPS rather than by the posted object's own
// keys, so only the twenty known questions can ever appear in the output.
export function buildBriefText(answers: Answers) {
  const lines: string[] = ["БРИФ НА ВИДЕОПРОДАКШН — HDKV.AGENCY", ""];
  const seen: number[] = [];
  STEPS.forEach((step) => {
    if (!seen.includes(step.scene)) {
      seen.push(step.scene);
      lines.push(`— ${SCENE_NAMES[step.scene].toUpperCase()} —`);
    }
    lines.push(step.title);
    lines.push(formatAnswer(step, answers) || "—");
    lines.push("");
  });
  return lines.join("\n");
}

export function briefSubject(answers: Answers) {
  const company = typeof answers.company === "string" ? answers.company.trim() : "";
  return `Бриф на видео — ${company ? clamp(company) : "новый проект"}`;
}

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
