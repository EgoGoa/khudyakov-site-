import type { BriefConfig } from "../types";
import { DEADLINE, INDUSTRY, opts } from "./helpers";

export const content: BriefConfig = {
  id: "content",
  title: "Бриф: Создание контента",
  intro: "Расскажите о задаче — подготовим концепцию и смету",
  steps: [
    {
      id: "format",
      type: "single",
      allowCustom: true,
      title: "Что нужно создать?",
      options: opts(
        "promo:Рекламный ролик",
        "image-film:Имиджевый фильм",
        "reels:Серия Reels / Shorts",
        "clip:Музыкальный клип",
        "aftermovie:Видео с мероприятия (aftermovie)",
        "photo:Фотосъёмка"
      ),
    },
    {
      id: "goal",
      type: "multi",
      allowCustom: true,
      title: "Какая главная цель контента?",
      options: opts(
        "sales:Продажи и заявки",
        "awareness:Узнаваемость бренда",
        "launch:Запуск продукта",
        "socials:Наполнение соцсетей",
        "hr:HR и найм",
        "partners:Презентация для партнёров/инвесторов"
      ),
    },
    { id: "industry", type: "single", allowCustom: true, title: "Ваша сфера?", options: INDUSTRY },
    {
      id: "placement",
      type: "multi",
      allowCustom: true,
      title: "Где будет размещён контент?",
      options: opts(
        "instagram:Instagram",
        "vk:VK",
        "telegram:Telegram",
        "youtube:YouTube",
        "site:Сайт",
        "tv-outdoor:ТВ / наружная реклама",
        "event-screens:Экраны на мероприятиях"
      ),
    },
    {
      id: "aspect",
      type: "multi",
      title: "Какой формат кадра?",
      options: opts(
        "vertical:Вертикальный 9:16",
        "horizontal:Горизонтальный 16:9",
        "square:Квадрат 1:1",
        "feed:4:5 для ленты",
        "unknown:Пока не знаю"
      ),
    },
    {
      id: "duration",
      type: "single",
      title: "Примерный хронометраж?",
      options: opts(
        "s15:До 15 секунд",
        "s30:15–30 секунд",
        "s60:30–60 секунд",
        "m3:1–3 минуты",
        "long:Больше 3 минут"
      ),
    },
    {
      id: "volume",
      type: "single",
      allowCustom: true,
      title: "Сколько единиц контента нужно?",
      options: opts("one:Один ролик", "few:2–5 роликов", "many:6–15 роликов", "monthly:Регулярно каждый месяц"),
    },
    {
      id: "style",
      type: "single",
      allowCustom: true,
      title: "Какое настроение ближе?",
      options: opts(
        "cinematic:Кинематографично",
        "dynamic:Динамично и клипово",
        "minimal-premium:Минимализм и премиум",
        "documentary:Документально, живо",
        "humor:С юмором"
      ),
    },
    {
      id: "script",
      type: "single",
      title: "Есть ли сценарий или идея?",
      options: opts(
        "ready:Есть готовый сценарий",
        "idea:Есть идея, нужна доработка",
        "from-scratch:Нужна концепция с нуля"
      ),
    },
    {
      id: "cast",
      type: "multi",
      allowCustom: true,
      title: "Кто будет в кадре?",
      options: opts(
        "owner:Собственник / эксперт",
        "staff:Сотрудники",
        "actors:Актёры или модели",
        "clients:Клиенты",
        "product-only:Без людей, только продукт"
      ),
    },
    {
      id: "location",
      type: "single",
      allowCustom: true,
      title: "Где снимаем?",
      options: opts(
        "our-site:У нас на площадке",
        "studio:В студии",
        "city:В городе",
        "nature:На природе",
        "several:Несколько локаций",
        "help:Помогите подобрать"
      ),
    },
    {
      id: "ai",
      type: "single",
      title: "Использовать AI в производстве?",
      options: opts(
        "live-only:Только живая съёмка",
        "live-ai:Съёмка + AI-графика и доработка",
        "full-ai:Полностью AI-видео",
        "advise:Посоветуйте"
      ),
    },
    {
      id: "extras",
      type: "multi",
      allowCustom: true,
      required: false,
      title: "Что ещё понадобится?",
      options: opts(
        "motion:Графика и моушн",
        "3d:3D",
        "color:Цветокоррекция",
        "sound:Саунд-дизайн",
        "voiceover:Диктор / озвучка",
        "subtitles:Субтитры",
        "music:Лицензионная музыка"
      ),
    },
    {
      id: "refs",
      type: "links",
      required: false,
      title: "Пришлите референсы, которые нравятся",
      subtitle: "Ролики, аккаунты, фильмы — что угодно",
    },
    { id: "dislikes", type: "textarea", required: false, title: "Чего точно не должно быть?" },
    {
      id: "brand",
      type: "single",
      title: "Есть ли фирменный стиль?",
      options: opts("brandbook:Есть брендбук", "logo-colors:Есть логотип и цвета", "none:Пока ничего нет"),
    },
    { id: "deadline", type: "deadline", title: "Когда нужен результат?", options: DEADLINE },
    {
      id: "budget",
      type: "budget",
      title: "Ориентир по бюджету?",
      options: opts(
        "b1:До 50 000 ₽",
        "b2:50 000–150 000 ₽",
        "b3:150 000–300 000 ₽",
        "b4:300 000–900 000 ₽",
        "b5:От 900 000 ₽",
        "estimate:Нужна оценка"
      ),
    },
    {
      id: "decision",
      type: "single",
      title: "Кто принимает решение?",
      options: opts("me:Решаю сам", "team:Согласую с командой", "boss:Нужно согласование руководства"),
    },
    { id: "contact", type: "contact", title: "Как с вами связаться?" },
  ],
};
