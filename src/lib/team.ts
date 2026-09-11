export type TeamMember = {
  id: string;
  name: string;
  /** Dative form of `name` — Russian declines by case, and "Написать Макс"
   *  reads as broken where "Написать Максу" doesn't. Used anywhere the name
   *  follows "написать"/"позвонить"/etc. */
  nameDative: string;
  role: string;
  /** What this person can help with, in the instrumental case — this always
   *  follows "помогу с:" ("помогу с чем?" asks for the instrumental), shown
   *  as the modal's opening line so a visitor knows *why* to write to this
   *  specific person rather than a generic "оставить заявку". */
  helpsWith: string;
  photo: string;
};

// Egor's ask: every page should feel like it's run by real people, not a
// faceless agency — two team bubbles per page, each tied to that page's own
// topic, so a visitor writes to the person who actually owns that kind of
// work instead of a generic inbox.
export const TEAM: Record<string, TeamMember> = {
  egor: {
    id: "egor",
    name: "Егор",
    nameDative: "Егору",
    role: "генеральный продюсер",
    helpsWith: "сроками, бюджетом и любыми вопросами по проекту",
    photo: "/team/egor.jpg",
  },
  dima: {
    id: "dima",
    name: "Вадим",
    nameDative: "Вадиму",
    role: "моушн и монтаж",
    helpsWith: "AI-генерациями, монтажом и моушн-графикой",
    photo: "/team/dima.jpg",
  },
  max: {
    id: "max",
    name: "Макс",
    nameDative: "Максу",
    role: "креативный сценарист",
    helpsWith: "сценарием и концепцией ролика",
    photo: "/team/max.jpg",
  },
  sasha: {
    id: "sasha",
    name: "Саша",
    nameDative: "Саше",
    role: "визуальный дизайнер",
    helpsWith: "стилем, вёрсткой и дизайном сайта",
    photo: "/team/sasha.jpg",
  },
  tanya: {
    id: "tanya",
    name: "Таня",
    nameDative: "Тане",
    role: "SMM-специалист",
    helpsWith: "продвижением и рекламой в соцсетях",
    photo: "/team/tanya.jpg",
  },
};

// Which two bubbles show up on each service page — Egor everywhere (he
// answers anything), plus the specialist whose work the page is actually
// about.
export const PAGE_TEAM: Record<"content" | "ai" | "sites" | "smm", [TeamMember, TeamMember]> = {
  content: [TEAM.egor, TEAM.max],
  ai: [TEAM.egor, TEAM.dima],
  sites: [TEAM.egor, TEAM.sasha],
  smm: [TEAM.egor, TEAM.tanya],
};

// The Trust chapter's own "ask a person" slot (the card that used to be a
// plain "Написать в Telegram" link) — a different specialist and a real,
// specific question per page instead of the same generic "есть вопрос?"
// everywhere. Only /content and /ai render the Trust chapter today.
export const TRUST_ASK: Record<
  "content" | "ai",
  { member: TeamMember; question: string; pitch: string; actionLabel: string }
> = {
  content: {
    member: TEAM.max,
    question: "Не знаете, какой сценарий выбрать?",
    pitch: "Разберу задачу и предложу 2–3 варианта подачи — до брифа, бесплатно.",
    actionLabel: "Обсудить сценарий",
  },
  ai: {
    member: TEAM.dima,
    question: "Какая AI-модель решит вашу задачу?",
    pitch: "Подберу инструмент под формат — видео, голос или графику — и покажу примеры.",
    actionLabel: "Подобрать модель",
  },
};
