// Схема интерактивного брифа. Конфиги в configs/*, привязка страниц — registry.ts.

export type BriefId = "content" | "sites" | "smm" | "ai";
/** `general` — короткий запасной бриф, не привязанный к услуге. */
export type AnyBriefId = BriefId | "general";

export type Option = {
  id: string;
  label: string;
  /** Подпись мелким шрифтом под вариантом. */
  hint?: string;
  icon?: string;
};

export type StepType =
  | "single" // карточки, выбор одного, авто-переход
  | "multi" // карточки, выбор нескольких, кнопка «Дальше»
  | "budget" // карточки-диапазоны (single) с отдельным стилем
  | "deadline" // карточки + «Конкретная дата» с date-picker
  | "text" // однострочный ввод
  | "textarea" // многострочный ввод
  | "links" // список ссылок
  | "contact"; // имя + способ связи + контакт + комментарий

export type Step = {
  id: string;
  type: StepType;
  /** Сам вопрос. */
  title: string;
  subtitle?: string;
  options?: Option[];
  /** Карточка «Свой вариант» → поле ввода. */
  allowCustom?: boolean;
  /** По умолчанию true; false → «Пропустить». */
  required?: boolean;
  min?: number;
  max?: number;
  showIf?: { stepId: string; anyOf: string[] };
};

export type BriefConfig = {
  id: AnyBriefId;
  title: string;
  intro: string;
  steps: Step[];
};

/** Ответ на один шаг. Поля используются по типу шага. */
export type Answer = {
  ids?: string[];
  customOn?: boolean;
  custom?: string;
  date?: string;
  text?: string;
  links?: string[];
  name?: string;
  method?: ContactMethod;
  contact?: string;
  comment?: string;
  consent?: boolean;
};

export type Answers = Record<string, Answer>;

export type ContactMethod = "telegram" | "whatsapp" | "call" | "email";
