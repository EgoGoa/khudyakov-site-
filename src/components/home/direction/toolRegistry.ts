import type { CompactToolContent, DirectionContent } from "./types";
import { aiAgentContent } from "./content/ai-agent";
import { aiContentContent } from "./content/ai-content";
import { aiVideoAdsContent } from "./content/ai-video-ads";
import { aiVoiceContent } from "./content/ai-voice";
import { aiOpsContent } from "./content/ai-ops";
import { aiCommsContent } from "./content/ai-comms";
import { aiCrmContent } from "./content/ai-crm";
import { aiPersonalizationContent } from "./content/ai-personalization";
import { aiAnalyticsContent } from "./content/ai-analytics";
import { aiTrainingContent } from "./content/ai-training";

// Страницы отдельных AI-инструментов внутри /ai.
//
// Тот же приём, что и с направлениями в registry.ts: вёрстка общая
// (DirectionPage), инструмент — это файл данных. Реестр отдельный, потому
// что маршруты разные (/content/[direction] и /ai/[tool]) и списки не должны
// перемешиваться: направление «AI-видео» живёт в контенте, а агент по
// заявкам — в инструментах, хотя оба про нейросети.
//
// Согласованный порядок топ-5 (Егор подтвердил): агент по заявкам → контент
// для карточек и соцсетей → AI-видеореклама и аватары → озвучка и
// локализация → AI внутри операционки.
//
// Порядок объекта здесь — это и порядок ссылок на /ai, поэтому менять его
// местами без причины не стоит: первым идёт инструмент с самой измеримой
// болью (потерянные заявки), последним — внутренний, где клиент не
// маркетинг, а сам собственник.
export const aiToolPages: Record<string, DirectionContent> = {
  [aiAgentContent.slug]: aiAgentContent,
  [aiContentContent.slug]: aiContentContent,
  [aiVideoAdsContent.slug]: aiVideoAdsContent,
  [aiVoiceContent.slug]: aiVoiceContent,
  [aiOpsContent.slug]: aiOpsContent,
};

/** Вторая пятёрка — компактный шаблон (см. CompactToolPage), 7 экранов
 *  вместо 12. Отдельный реестр, а не общий с `aiToolPages`, потому что
 *  страница /ai/[tool] должна знать, каким компонентом рендерить каждый
 *  slug — DirectionPage или CompactToolPage, — и Record с двумя формами
 *  значения внутри был бы источником путаницы, а не решением. */
export const aiCompactToolPages: Record<string, CompactToolContent> = {
  [aiCommsContent.slug]: aiCommsContent,
  [aiCrmContent.slug]: aiCrmContent,
  [aiPersonalizationContent.slug]: aiPersonalizationContent,
  [aiAnalyticsContent.slug]: aiAnalyticsContent,
  [aiTrainingContent.slug]: aiTrainingContent,
};

/** Короткие подписи для ссылок на /ai. Отдельно от `aiToolMeta`, потому что
 *  в строку ссылки нужен ярлык в два-три слова, а не заголовок страницы. */
export const aiToolLinks: { slug: string; label: string }[] = [
  { slug: "agent", label: "Агент по заявкам" },
  { slug: "content", label: "Карточки и контент" },
  { slug: "video", label: "Видеореклама" },
  { slug: "voice", label: "Озвучка и языки" },
  { slug: "ops", label: "Внутренние процессы" },
  { slug: "comms", label: "Фильтр обращений" },
  { slug: "crm", label: "AI в CRM" },
  { slug: "personalization", label: "Персонализация" },
  { slug: "analytics", label: "AI-аналитика" },
  { slug: "training", label: "Обучение команды" },
];

/** Короткие тексты для <head> — держатся рядом с реестром, чтобы новый
 *  инструмент добавлялся одной правкой в одном месте. */
export const aiToolMeta: Record<string, { title: string; description: string }> = {
  agent: {
    title: "AI-агент по заявкам",
    description:
      "Отвечает клиентам за секунды в мессенджерах и на сайте, уточняет детали и передаёт менеджеру только горячие заявки.",
  },
  content: {
    title: "AI-контент для карточек и соцсетей",
    description:
      "Фото товара, инфографика, описания и посты партиями — без съёмочного дня и с себестоимостью кадра ниже съёмки.",
  },
  video: {
    title: "AI-видеореклама и аватары",
    description:
      "Рекламные ролики и говорящие аватары без съёмочной группы: линейка креативов вместо одной дорогой ставки.",
  },
  voice: {
    title: "Озвучка и локализация видео",
    description:
      "Перевод, закадровый голос и дубляж с сохранением голоса спикера — в разы дешевле студийной локализации.",
  },
  ops: {
    title: "AI внутри операционки",
    description:
      "Расшифровки встреч, поиск по своим документам и отчёты без ручного сведения — начинаем с одного процесса.",
  },
  comms: {
    title: "Автоматизация коммуникации",
    description:
      "Отсеивает спам, дубли и нерелевантные обращения до того, как они дойдут до менеджера.",
  },
  crm: {
    title: "AI внутри CRM",
    description:
      "Размечает заявку, оценивает вероятность сделки и направляет её менеджеру с наибольшим шансом закрыть.",
  },
  personalization: {
    title: "Персонализация контента",
    description:
      "Разные версии одного сообщения под разные сегменты аудитории — без ручной пересборки под каждый.",
  },
  analytics: {
    title: "AI-аналитика",
    description:
      "Один дашборд вместо скриншотов из десяти кабинетов, который сам находит аномалии и объясняет их.",
  },
  training: {
    title: "Обучение команды работе с AI",
    description:
      "Учим пользоваться конкретным внедрённым инструментом на ваших задачах — не общему курсу про нейросети.",
  },
};
