import { serviceMeta, type ServiceKey } from "./service-content";

// Данные вступительной сцены: четыре направления и блоки каждого из них.
//
// Зачем отдельный файл. Сцена показывает ровно то, что посетитель встретит
// на самой странице — те же заголовки глав, тот же акцент, тот же кадр. Если
// бы подписи жили внутри компонента сцены, они бы разошлись со страницами
// при первой же правке текста на странице. Здесь они лежат рядом друг с
// другом, и расхождение видно глазом в одном экране кода.
//
// `id` каждого блока — это id главы из CHAPTERS на соответствующей странице
// (см. app/(landing)/<slug>/page.tsx). CinematicStage рисует по такому id
// якорь и умеет встать на него по хешу при загрузке, поэтому переход из
// сцены — обычная ссылка вида `/smm#offer`, без своего механизма.

/** Первый шаг: карточка направления. Видео — полный ролик страницы
 *  (тот же, что играет за главами), а не короткая петля-фон: Егор просил,
 *  чтобы на карточке шёл весь сюжет раздела. */
export type DirectionCard = {
  key: ServiceKey;
  label: string;
  tagline: string;
  /** Десктопный файл. Лёгкий «-mobile» вариант подставляет общесайтовый
   *  MediaGovernor на узких экранах — здесь он не перечисляется, чтобы
   *  порог «что считать телефоном» жил в одном месте на весь сайт. */
  video: string;
  poster: string;
};

export const directionCards: DirectionCard[] = [
  {
    key: "content",
    label: serviceMeta.content.label,
    tagline: "Съёмка, монтаж и графика под площадку",
    video: "/video/content-reel.mp4",
    poster: "/images/content-reel-poster.jpg",
  },
  {
    key: "ai",
    label: serviceMeta.ai.label,
    tagline: "Внедряем ИИ туда, где он ускоряет результат",
    video: "/video/ai-reel.mp4",
    poster: "/images/ai-reel-poster.jpg",
  },
  {
    key: "sites",
    label: serviceMeta.sites.label,
    tagline: "Сайты на AI — дни, а не месяцы",
    video: "/video/sites-reel.mp4",
    poster: "/images/sites-reel-poster.jpg",
  },
  {
    key: "smm",
    label: serviceMeta.smm.label,
    tagline: "Ведение и продвижение силами продакшена",
    video: "/video/smm-reel.mp4",
    poster: "/images/smm-reel-poster.jpg",
  },
];

/** Роль главы — она же выбирает инфографику справа на карточке блока.
 *  Тот же словарь ролей, которым page-hop.ts сопоставляет главы соседних
 *  страниц: одна глава — одна роль на весь сайт. */
export type BlockRole = "intro" | "works" | "why" | "trust" | "offer" | "guarantees" | "process" | "close";

export type BlockCard = {
  /** id главы на странице раздела — он же якорь перехода. */
  id: string;
  /** Номер главы, как его показывает рельса слева на самой странице. */
  num: string;
  title: string;
  /** Слово заголовка, которое на странице набрано градиентом (`.kw`). */
  keyword: string;
  subtitle: string;
  role: BlockRole;
  image: string;
};

const BLOCKS: Record<ServiceKey, BlockCard[]> = {
  content: [
    { id: "opening", num: "01", title: "Основные направления", keyword: "направления", subtitle: "Пять форматов съёмки — от презентационного фильма до 3D", role: "intro", image: "/images/blocks/stock-clapper.jpg" },
    { id: "works", num: "02", title: "Наши работы", keyword: "работы", subtitle: "Кейсы с производств, отелей и брендов", role: "works", image: "/images/blocks/stock-directing.jpg" },
    { id: "why", num: "03", title: "Именно мы", keyword: "мы", subtitle: "Команда художников вместо большого сервиса", role: "why", image: "/images/blocks/stock-crew.jpg" },
    { id: "services", num: "04", title: "Лучшие в этом", keyword: "этом", subtitle: "Что входит в работу и чем она отличается", role: "offer", image: "/images/blocks/stock-lights.jpg" },
    { id: "process", num: "05", title: "PRO хронология", keyword: "хронология", subtitle: "Путь от брифа до готового ролика по шагам", role: "process", image: "/images/blocks/stock-briefing.jpg" },
    { id: "contact", num: "06", title: "Персональные условия", keyword: "условия", subtitle: "Смета под задачу и ответ в течение дня", role: "close", image: "/images/blocks/stock-papers.jpg" },
  ],
  ai: [
    { id: "pitch", num: "01", title: "AI-решения быстрее рынка", keyword: "AI-решения", subtitle: "Инструменты в продакшн, а не презентация про нейросети", role: "intro", image: "/images/blocks/ai-neon-desk.jpg" },
    { id: "portfolio", num: "02", title: "Портфолио AI-работ", keyword: "AI-работ", subtitle: "Ролики, аватары и генерация, уже ушедшие в эфир", role: "works", image: "/images/blocks/ai-neon-abstract.jpg" },
    { id: "segments", num: "03", title: "Кому подходит", keyword: "подходит", subtitle: "Сегменты бизнеса и задачи, которые закрывает ИИ", role: "why", image: "/images/blocks/ai-corridor-neon.jpg" },
    { id: "trust", num: "04", title: "Продюсерский центр, не коробка", keyword: "не коробка", subtitle: "Почему это не подписка на сервис, а работа команды", role: "trust", image: "/images/blocks/ai-nightwork.jpg" },
    { id: "offer", num: "05", title: "Лучшие в AI", keyword: "AI", subtitle: "Одиннадцать инструментов и что каждый из них делает", role: "offer", image: "/images/blocks/ai-keyboard-neon.jpg" },
    { id: "guarantees", num: "06", title: "Условия и гарантии", keyword: "гарантии", subtitle: "Что фиксируем в договоре до старта", role: "guarantees", image: "/images/blocks/ai-server-green.jpg" },
    { id: "process", num: "07", title: "Как проходит внедрение", keyword: "внедрение", subtitle: "От пилота на одной задаче до работы в контуре", role: "process", image: "/images/stock/holo-keyboard.webp" },
    { id: "close", num: "08", title: "Персональные условия", keyword: "условия", subtitle: "Расчёт под ваш объём и ответ в течение дня", role: "close", image: "/images/stock/robot-hand-chip.webp" },
  ],
  sites: [
    { id: "pitch", num: "01", title: "Сайты на AI — дни, не месяцы", keyword: "AI", subtitle: "Срок и цена вместо трёхмесячной разработки", role: "intro", image: "/images/stock/hologram-laptop.webp" },
    { id: "method", num: "02", title: "Никакой магии", keyword: "магии", subtitle: "Как устроен метод и кому он подходит", role: "why", image: "/images/stock/devs-night.webp" },
    { id: "offer", num: "03", title: "Что мы делаем", keyword: "делаем", subtitle: "Лендинг, визитка, сайт под ключ, редизайн", role: "offer", image: "/images/stock/desk-aerial.webp" },
    { id: "process", num: "04", title: "Как проходит работа", keyword: "работа", subtitle: "Этапы от брифа до передачи доступов", role: "process", image: "/images/stock/planner-desk.webp" },
    { id: "guarantees", num: "05", title: "Почему мы", keyword: "мы", subtitle: "Что берём на себя и что фиксируем", role: "guarantees", image: "/images/stock/platform-speed.webp" },
    { id: "close", num: "06", title: "Персональные условия", keyword: "условия", subtitle: "Смета под задачу и ответ в течение дня", role: "close", image: "/images/stock/man-laptop-dark.webp" },
  ],
  smm: [
    { id: "pitch", num: "01", title: "SMM силами продакшена", keyword: "продакшена", subtitle: "Контент снимает та же команда, что снимает рекламу", role: "intro", image: "/images/stock/smm-collage-phone.webp" },
    { id: "method", num: "02", title: "Не подрядчик", keyword: "подрядчик", subtitle: "Как мы ведём аккаунт и за что отвечаем", role: "why", image: "/images/stock/smm-collage-megaphone.webp" },
    { id: "offer", num: "03", title: "Что делаем", keyword: "делаем", subtitle: "Reels, сторис, карусели, таргет, блогеры", role: "offer", image: "/images/stock/smm-phone-bokeh.webp" },
    { id: "process", num: "04", title: "Как проходит работа", keyword: "работа", subtitle: "Съёмочный день, контент-план, публикации", role: "process", image: "/images/stock/night-lights.webp" },
    { id: "guarantees", num: "05", title: "Что входит", keyword: "входит", subtitle: "Объём месяца без звёздочек и допов", role: "guarantees", image: "/images/stock/speaker-neon-swirl.webp" },
    { id: "close", num: "06", title: "Пакеты ведения", keyword: "ведения", subtitle: "Тарифы и расчёт под вашу задачу", role: "close", image: "/images/stock/dj-neon.webp" },
  ],
};

export function blocksFor(key: ServiceKey): BlockCard[] {
  return BLOCKS[key];
}

/** Ссылка на главу: хеш подхватывает CinematicStage при загрузке страницы. */
export function blockHref(key: ServiceKey, block: BlockCard): string {
  return `/${serviceMeta[key].slug}#${block.id}`;
}
