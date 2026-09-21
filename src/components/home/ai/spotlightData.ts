import { aiCompactToolPages, aiToolLinks, aiToolMeta, aiToolPages } from "@/components/home/direction/toolRegistry";
import { directionSpotlight } from "@/components/home/ai/spotlightDirections";
import { siteSpotlight } from "@/components/home/ai/spotlightSites";
import type { DirectionStat, DirectionTechItem } from "@/components/home/direction/types";

// Данные для развёрнутой таблички под блоком (см. ToolSpotlight.tsx).
//
// Ничего своего тут не пишется: всё вытягивается из уже готовых страниц
// инструментов (/ai/[tool]) — Егор выбрал именно этот вариант, чтобы текст
// в подсказке и текст на странице не разъезжались. Один инструмент = один
// источник правды, правка на странице сразу видна в табличке.
//
// Тезисы берём из блока «Под капотом» (`tech.items`): это единственное
// место в контенте инструмента, где преимущество уже сформулировано парой
// «короткая подпись + одно предложение» — ровно то, что нужно строке,
// которая появляется и исчезает в такт инфографике. Там, где у страницы
// нет `tech` (полный шаблон разрешает его не иметь), падаем на «кому
// подходит»: роль сегмента становится подписью.

export type SpotlightBenefit = {
  /** Подпись слева — одно-два слова: «Каналы», «Обучение». Это категория,
   *  то, ПРО ЧТО тезис. */
  label: string;
  /** Само преимущество — ОДНО слово. Егор попросил именно так: в окне и на
   *  кнопке крупно стоит одно слово-выгода, а предложение под ним его
   *  объясняет. Фраза целиком («не выдумывает цены и условия») на этом
   *  месте читается как ещё одна строка текста, а слово — как вывод.
   *
   *  Единственное, что здесь написано руками, а не взято со страницы
   *  инструмента: в контенте такого поля нет, вытащить одно слово из
   *  предложения автоматически нельзя. Порядок слов совпадает с порядком
   *  тезисов в `tech.items` этого инструмента. */
  punch: string;
  text: string;
  /** Фрагмент `text`, который подсвечивается акцентом. */
  accent?: string;
};

export type Spotlight = {
  slug: string;
  /** Заголовок окна — из <head> инструмента, там он уже отредактирован. */
  title: string;
  /** Подзаголовок — оттуда же. */
  sub: string;
  /** Короткое имя в два-три слова — для кнопки, где полный заголовок не
   *  помещается. Берётся из того же списка ссылок, что и меню /ai, чтобы
   *  услуга везде называлась одинаково. */
  short: string;
  /** Тезис-подзаголовок под названием. */
  tagline: string;
  /** Короткая строка над заголовком. */
  eyebrow: string;
  /** Тот же кадр, что несёт карточка в карусели и шапка страницы. */
  image: string;
  accent: { from: string; to: string };
  benefits: SpotlightBenefit[];
  stats: DirectionStat[];
  href: string;
};

const MAX_BENEFITS = 4;

/** Сильный тезис-подзаголовок инструмента — одна строка под названием, в
 *  цвете страницы. Написан руками: это продающая формулировка, а не пересказ
 *  описания, которое лежит в окне ниже. Цифры взяты из `stats` страниц
 *  инструментов (те же, что видит клиент после клика). */
const TAGLINE: Record<string, string> = {
  "chat-hub": "Все мессенджеры — одна лента, ответ за 3 секунды",
  agent: "Отвечает первым — а 78% покупают у того, кто ответил первым",
  content: "Себестоимость карточки −70…90% против съёмки",
  video: "Ролик от первого лица: CTR ×4, цена клика −50%",
  voice: "Один голос на всех языках — за часы, не за недели",
  ops: "Первый работающий процесс — за 2 недели",
  comms: "Спам отсеян на 98,2% — менеджер видит только живое",
  crm: "70% рутины в CRM берёт на себя AI",
  personalization: "+41% дохода от персонализированных рассылок",
  analytics: "Отчёт за 15 минут вместо 3 дней",
  training: "Команда реально пользуется инструментом — проверим через месяц",
};

/** Какие пункты «Под капотом» показывать (`pick` — индексы в `tech.items`) и
 *  слово-выгода к каждому (`punch`), СТРОГО в порядке сцен инструмента.
 *
 *  Раньше брались первые четыре пункта подряд, но сцены у части инструментов
 *  нарисованы на другие пункты (у AI-чата четвёртая сцена — про доработку, а
 *  четвёртый пункт — про единую ленту), и картинка расходилась с текстом. Пара
 *  «пункт — сцена» теперь задана явно. */
const BENEFITS: Record<string, { pick: number[]; punch: string[] }> = {
  "chat-hub": { pick: [0, 1, 2, 4], punch: ["Достоверность", "Охват", "Непрерывность", "Рост"] },
  agent: { pick: [0, 1, 2, 3], punch: ["Охват", "Точность", "Квалификация", "Порядок"] },
  content: { pick: [0, 1, 3, 4], punch: ["Единообразие", "Узнаваемость", "Точность", "Качество"] },
  video: { pick: [0, 1, 2, 4], punch: ["Продажи", "Стиль", "Постоянство", "Охват"] },
  voice: { pick: [0, 1, 2, 3], punch: ["Точность", "Живость", "Узнаваемость", "Синхрон"] },
  ops: { pick: [0, 1, 3, 4], punch: ["Простота", "Достоверность", "Безопасность", "Удобство"] },
  comms: { pick: [0, 1, 2, 3], punch: ["Точность", "Охват", "Приоритет", "Скорость"] },
  crm: { pick: [0, 1, 2, 3], punch: ["Совместимость", "Оценка", "Маршрут", "Прогноз"] },
  personalization: { pick: [0, 1, 2, 3], punch: ["Релевантность", "Голос", "Масштаб", "Доказательность"] },
  analytics: { pick: [0, 1, 2, 3], punch: ["Единство", "Порядок", "Контроль", "Ясность"] },
  training: { pick: [0, 1, 2, 3], punch: ["Диагноз", "Точность", "Практика", "Результат"] },
};

function fromTech(slug: string, items: DirectionTechItem[]): SpotlightBenefit[] {
  const rule = BENEFITS[slug];
  const chosen = rule ? rule.pick.map((i) => items[i]).filter(Boolean) : items.slice(0, MAX_BENEFITS);
  return chosen.map((item, i) => ({
    label: item.label,
    // Без заданного слова категория пункта работает заглушкой: она тоже в
    // одно-два слова и не ломает вёрстку.
    punch: rule?.punch[i] ?? item.label,
    text: item.text,
    accent: item.accent,
  }));
}

export function spotlightFor(slug: string): Spotlight | null {
  const dir = directionSpotlight(slug) ?? siteSpotlight(slug);
  if (dir) return dir;
  const full = aiToolPages[slug];
  const compact = aiCompactToolPages[slug];
  const content = full ?? compact;
  if (!content) return null;

  const meta = aiToolMeta[slug];
  const tech = content.tech;
  const benefits = tech
    ? fromTech(slug, tech.items)
    : content.audience.items.slice(0, MAX_BENEFITS).map((item, i) => ({
        label: item.role,
        punch: BENEFITS[slug]?.punch[i] ?? item.role,
        text: item.text,
        accent: item.accent,
      }));

  return {
    slug,
    title: meta?.title ?? content.hero.eyebrow,
    tagline: TAGLINE[slug] ?? "",
    short: aiToolLinks.find((l) => l.slug === slug)?.label ?? content.hero.eyebrow,
    sub: meta?.description ?? "",
    eyebrow: content.hero.eyebrow,
    image: content.hero.photo ?? "/images/stock/devs-night.webp",
    accent: content.backdrop,
    benefits,
    stats: content.stats.slice(0, 3),
    href: `/ai/${slug}`,
  };
}
