// Общие кусочки брифов: адрес получателя, проверка email и типы шагов
// видеоброфа базы отдыха. Сами интерактивные брифы — src/features/brief.

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Loose shape check — catches dictation slips like "собака" instead of "@". */
export function looksLikeEmail(value: string | undefined): boolean {
  return EMAIL_RE.test((value ?? "").trim());
}


/** Страница брифа раздела. /content теперь тоже имеет свой бриф. */
export function briefHrefFor(active: "content" | "ai" | "sites" | "smm"): string {
  return `/brief/${active}`;
}
