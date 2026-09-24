import type React from "react";
import type { ReactNode } from "react";
import type { TeamMember } from "@/lib/team";

// «Человек команды как сервис» — Егор задал механику целиком
// (2026-09-24): мини-окошко стоит в вёрстке блока → через 5 секунд
// стекает в кружок с «сообщением» → наведение раскрывает его снова →
// «Пообщаться» открывает большое окно в стиле окошек услуг → «Начать
// чат» превращает текстовую половину окна в бриф по сценарию. Всё, что
// говорит конкретный человек, лежит в одном объекте этого типа, чтобы
// следующий участник команды добавлялся файлом с текстами, а не правкой
// вёрстки.

export type TeamPulseScene = "concepts" | "lead" | "catalog" | "rebrand" | "timeline" | "calendar" | "contact" | "team";

/** Сцена чата — по одной на вопрос, показывает варианты ответа. */
export type TeamPulseChatVisual = "what" | "ref" | "mood" | "goal" | "speed" | "stage" | "deadline" | "approver" | "channel";

export type TeamPulseThesis = {
  title: string;
  sub: string;
  desc: ReactNode;
  chip: string;
  chipWord: string;
  chipText: string;
  scene: TeamPulseScene;
};

export type TeamPulseChatStep = {
  /** Ключ ответа в заявке — так Егор в письме видит, на какой вопрос что
   *  ответили, а не просто поток реплик. */
  key: string;
  ask: string;
  options: string[];
  /** Показать скрепку для референса на этом шаге. */
  attach?: boolean;
  /** Сцена слева на этом вопросе: варианты ответа картинками. */
  visual: TeamPulseChatVisual;
};

export type TeamPulseData = {
  member: TeamMember;
  /** Короткая роль для подписи — полная `member.role` местами длиннее, чем
   *  влезает в строку мини-окошка. */
  role: string;
  /** Цвета страницы, на которой стоит человек (у /sites — SITES_ACCENT):
   *  свечение, градиенты и графика окна берут их, а не свой цвет. */
  accent: { from: string; to: string };
  /** Кадр под стеклом большого окна — как у окошек услуг. */
  image: string;
  /** Строки; *звёздочками* выделяются слова в градиенте страницы. */
  offers: string[];
  notes: string[];
  windowCta: string;
  theses: TeamPulseThesis[];
  stats: { value: string; label: string }[];
  chat: TeamPulseChatStep[];
  /** После брифа: «как двигаемся дальше?» — полный бриф или «готов заказать». */
  nextAsk: string;
  briefHref: string;
  /** «Готов заказать» → когда удобно перезвонить. */
  callAsk: string;
  callOptions: string[];
  contactAsk: string;
  doneText: string;
  /** Название заказа, под которым заявка встанет в личном кабинете. */
  orderTitle: string;
  /** Подпись в заявке: откуда пришёл человек. */
  source: string;
};

const rgb = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

/** CSS-переменные акцента: --sp-* читают сцены sceneKit, --tp-* и
 *  --card-glow-rgb — свечение окошка, кружка и окна. */
export function accentVars(accent: { from: string; to: string }): React.CSSProperties {
  return {
    "--sp-from": accent.from,
    "--sp-to": accent.to,
    "--tp-from-rgb": rgb(accent.from),
    "--tp-to-rgb": rgb(accent.to),
    "--card-glow-rgb": rgb(accent.to),
  } as React.CSSProperties;
}
