import type { Option } from "../types";

/** "id:Подпись" → Option. Id — латиница в kebab-case, подпись дословно из ТЗ. */
export const opts = (...items: string[]): Option[] =>
  items.map((s) => {
    const i = s.indexOf(":");
    return { id: s.slice(0, i), label: s.slice(i + 1) };
  });

export const INDUSTRY = opts(
  "horeca:HoReCa",
  "beauty:Бьюти и здоровье",
  "realty:Недвижимость",
  "production:Производство",
  "expert:Онлайн-школа / эксперт",
  "events:Ивенты",
  "retail:Ритейл и e-commerce"
);

export const DEADLINE_ID = "specific";

export const DEADLINE = opts(
  "urgent:Срочно, до 7 дней",
  "weeks:2–3 недели",
  "month:В течение месяца",
  "relaxed:Не горит",
  `${DEADLINE_ID}:Конкретная дата`
);
