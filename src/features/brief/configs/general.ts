import type { BriefConfig } from "../types";
import { DEADLINE, opts } from "./helpers";

/** Запасной бриф для маршрутов без своей категории (в prod). */
export const general: BriefConfig = {
  id: "general",
  title: "Бриф на проект",
  intro: "Коротко о задаче — вернёмся с предложением",
  steps: [
    {
      id: "need",
      type: "single",
      allowCustom: true,
      title: "Что нужно?",
      options: opts(
        "content:Видео или фото",
        "site:Сайт",
        "smm:Ведение соцсетей",
        "ai:AI-решение для бизнеса",
        "unknown:Не знаю — нужна консультация"
      ),
    },
    { id: "details", type: "textarea", required: false, title: "Расскажите о задаче своими словами" },
    { id: "deadline", type: "deadline", title: "Когда нужен результат?", options: DEADLINE },
    {
      id: "budget",
      type: "budget",
      title: "Ориентир по бюджету?",
      options: opts("b1:До 100 000 ₽", "b2:100 000–300 000 ₽", "b3:От 300 000 ₽", "estimate:Нужна оценка"),
    },
    { id: "contact", type: "contact", title: "Как с вами связаться?" },
  ],
};
