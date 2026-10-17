import type { BriefConfig } from "../types";
import { INDUSTRY, opts } from "./helpers";

export const smm: BriefConfig = {
  id: "smm",
  title: "Бриф: SMM",
  intro: "Расскажите о проекте — предложим стратегию и контент-план",
  steps: [
    {
      id: "service",
      type: "single",
      allowCustom: true,
      title: "Что нужно?",
      options: opts(
        "full:Ведение под ключ",
        "production:Только производство контента",
        "audit:Аудит и стратегия",
        "launch:Запуск аккаунта с нуля",
        "promo:Продвижение и реклама"
      ),
    },
    {
      id: "platforms",
      type: "multi",
      allowCustom: true,
      title: "На каких площадках?",
      options: opts(
        "instagram:Instagram",
        "vk:VK",
        "telegram:Telegram",
        "youtube:YouTube",
        "tiktok:TikTok",
        "dzen:Дзен"
      ),
    },
    {
      id: "audience_size",
      type: "single",
      title: "Сколько подписчиков сейчас?",
      options: opts("none:Аккаунта нет", "k1:До 1 000", "k10:1 000–10 000", "k50:10 000–50 000", "k50plus:Больше 50 000"),
    },
    {
      id: "brand_type",
      type: "single",
      title: "Чей это аккаунт?",
      options: opts("company:Компании", "personal:Личный бренд эксперта", "product:Товара или продукта", "event:Мероприятия"),
    },
    { id: "industry", type: "single", allowCustom: true, title: "Ваша сфера?", options: INDUSTRY },
    {
      id: "goal",
      type: "multi",
      allowCustom: true,
      title: "Главные цели?",
      options: opts(
        "sales:Продажи и заявки",
        "growth:Рост подписчиков",
        "awareness:Узнаваемость",
        "loyalty:Лояльность и комьюнити",
        "launch:Запуск продукта"
      ),
    },
    {
      id: "age",
      type: "multi",
      title: "Возраст вашей аудитории?",
      options: opts("a18:18–24", "a25:25–34", "a35:35–44", "a45:45–54", "a55:55+"),
    },
    {
      id: "audience",
      type: "textarea",
      title: "Кто ваши клиенты?",
      subtitle: "Чем занимаются, что их волнует, почему выбирают вас",
    },
    {
      id: "formats",
      type: "multi",
      allowCustom: true,
      title: "Какие форматы нужны?",
      options: opts(
        "reels:Reels / Shorts",
        "carousels:Карусели",
        "stories:Сторис",
        "posts:Посты",
        "long-video:Длинные видео",
        "live:Прямые эфиры"
      ),
    },
    {
      id: "frequency",
      type: "single",
      allowCustom: true,
      title: "Как часто публиковать?",
      options: opts(
        "f2-3:2–3 раза в неделю",
        "daily:Каждый день",
        "reels-stories:Reels 3–4 раза в неделю + сторис ежедневно",
        "discuss:Обсудим"
      ),
    },
    {
      id: "tone",
      type: "single",
      allowCustom: true,
      title: "Тон общения?",
      options: opts("expert:Экспертно", "friendly:Дружески", "humor:С юмором", "bold:Дерзко", "premium:Премиально"),
    },
    {
      id: "face",
      type: "single",
      title: "Готовы появляться в кадре?",
      options: opts("yes:Да, готов сниматься", "sometimes:Иногда", "no:Нет — без лица или AI-аватар"),
    },
    {
      id: "production",
      type: "single",
      title: "Откуда брать контент?",
      options: opts(
        "shoots:Нужны выездные съёмки",
        "own:Есть свои материалы",
        "ai:AI-генерация контента",
        "mix:Комбинировать"
      ),
    },
    {
      id: "ads",
      type: "single",
      title: "Нужна таргетированная реклама?",
      options: opts("yes:Да", "have-contractor:Уже есть подрядчик", "no:Пока без рекламы"),
    },
    {
      id: "community",
      type: "single",
      title: "Отвечать на комментарии и директ?",
      options: opts("yes:Да, ведите", "self:Отвечаем сами"),
    },
    { id: "refs", type: "links", required: false, title: "Аккаунты, которые нравятся" },
    { id: "tried", type: "textarea", required: false, title: "Что уже пробовали и что не сработало?" },
    {
      id: "term",
      type: "single",
      title: "Формат сотрудничества?",
      options: opts("test:Тестовый месяц", "m3:3 месяца", "long:Долгосрочно, от 6 месяцев", "discuss:Обсудим"),
    },
    {
      id: "budget",
      type: "budget",
      title: "Бюджет в месяц?",
      options: opts(
        "b1:До 35 000 ₽",
        "b2:35 000–75 000 ₽",
        "b3:75 000–150 000 ₽",
        "b4:От 150 000 ₽",
        "estimate:Нужна оценка"
      ),
    },
    { id: "contact", type: "contact", title: "Как с вами связаться?" },
  ],
};
