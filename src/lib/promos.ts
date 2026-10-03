import type { PromoDetail } from "@/components/home/PromoCard";

// Все акции сайта одним списком (Егор, 2026-10-03): страницы услуг берут
// отсюда данные своих окошек (PromoCard), а шапка главной — всю ленту
// (HeroPromoStack). Плашка у всех одна — «Акция месяца», без названия
// месяца, чтобы тексты не устаревали.

export type PromoSection = "content" | "ai" | "sites" | "smm";

export type Promo = {
  id: string;
  section: PromoSection;
  title: string;
  subtitle: string;
  short?: string;
  details?: PromoDetail[];
  price: string;
  oldPrice: string;
  image: string;
  imageAlign?: string;
  video?: string;
  href: string;
  leadPrefill: { format: string; wishes: string };
};

export const PROMO_BADGE = "Акция месяца";

export const PROMOS: Promo[] = [
  {
    id: "ai-video",
    section: "content",
    title: "AI-видеоконтент",
    subtitle: "Что входит в акцию — 10 секунд, которые работают на заявки:",
    short: "AI Reels со сценарием, зацепом в первую секунду и призывом в финале",
    details: [
      { lead: "AI Reels", rest: "на актуальных моделях генерации" },
      { lead: "Сценарий + маркетинг", rest: "внутри ролика, не просто красивый кадр" },
      { lead: "Зацеп в 1-ю секунду", rest: "и удержание до конца" },
      { lead: "Призыв в финале", rest: "— понятное действие" },
    ],
    price: "9 500 ₽",
    oldPrice: "17 500 ₽",
    image: "/images/works/aishowreel.jpg",
    video: "/video/works/aishowreel.mp4",
    href: "/content/ai-video",
    leadPrefill: { format: "AI-видео", wishes: "Акция месяца — 10-секундный ролик за 9 500 ₽" },
  },
  {
    id: "image-video",
    section: "content",
    title: "Имиджевое видео",
    subtitle: "Что входит в акцию:",
    short: "Ролик по вашему сценарию, вертикаль и горизонталь, 2 круга правок",
    details: [
      "— имиджевое видео по вашему сценарию;",
      "— адаптация под вертикаль и горизонталь;",
      "— 2 круга правок без доплаты;",
      "— обложки и нарезки под Reels, сразу готовые к публикации.",
    ],
    price: "42 000 ₽",
    oldPrice: "60 000 ₽",
    image: "/images/service-video.jpg",
    href: "/content/image",
    leadPrefill: { format: "Имиджевое видео", wishes: "Акция месяца — 30-секундный имиджевый ролик за 42 000 ₽" },
  },
  {
    id: "ai-chat",
    section: "ai",
    title: "AI-чат для мессенджеров",
    subtitle: "Telegram, WhatsApp, Instagram и сайт — один ассистент отвечает везде и сводит переписку в одну ленту.",
    price: "40 000 ₽",
    oldPrice: "50 000 ₽",
    image: "/images/stock/ai-desk-ui.webp",
    href: "/brief/ai",
    leadPrefill: { format: "AI-чат для мессенджеров", wishes: "Акция месяца — пилот за 40 000 ₽ вместо 50 000 ₽" },
  },
  {
    id: "ai-generation",
    section: "ai",
    title: "AI-генерация видео и фото",
    subtitle: "Контент под бренд без съёмочной группы: продуктовые ролики, аватары, визуалы для соцсетей.",
    price: "60 000 ₽",
    oldPrice: "75 000 ₽",
    image: "/images/stock/hologram-laptop.webp",
    href: "/brief/ai",
    leadPrefill: { format: "AI-генерация видео и фото", wishes: "Акция месяца — пилот за 60 000 ₽ вместо 75 000 ₽" },
  },
  {
    id: "site-card",
    section: "sites",
    title: "Сайт-визитка",
    subtitle: "Несколько страниц: о компании, услуги, контакты — без раздутого бюджета.",
    price: "96 000 ₽",
    oldPrice: "120 000 ₽",
    image: "/images/stock/desk-aerial.webp",
    href: "/brief/sites",
    leadPrefill: { format: "Сайт-визитка", wishes: "Акция месяца — от 120 000 до 96 000 ₽" },
  },
  {
    id: "landing",
    section: "sites",
    title: "Лендинг под продукт",
    subtitle: "Одна страница, которая доводит трафик до заявки.",
    price: "48 000 ₽",
    oldPrice: "60 000 ₽",
    image: "/images/stock/design-tablet.webp",
    href: "/brief/sites",
    leadPrefill: { format: "Лендинг", wishes: "Акция месяца — от 60 000 до 48 000 ₽" },
  },
  {
    id: "smm-shooting",
    section: "smm",
    title: "Съёмка и монтаж контента",
    subtitle: "Reels, сторис, карусели снимаем и монтируем сами.",
    price: "36 000 ₽/мес",
    oldPrice: "45 000 ₽/мес",
    image: "/images/blocks/stock-clapper.jpg",
    href: "/brief/smm",
    leadPrefill: { format: "Съёмка и монтаж контента", wishes: "Акция месяца — от 45 000 до 36 000 ₽/мес" },
  },
  {
    id: "community",
    section: "smm",
    title: "Комьюнити-менеджмент",
    subtitle: "Отвечаем в директ и комментарии от лица бренда.",
    price: "36 000 ₽/мес",
    oldPrice: "45 000 ₽/мес",
    image: "/images/stock/smm-collage-phone.webp",
    href: "/brief/smm",
    leadPrefill: { format: "Комьюнити-менеджмент", wishes: "Акция месяца — от 45 000 до 36 000 ₽/мес" },
  },
];

/** Скидка в процентах из строк цен («9 500 ₽», «17 500 ₽») — 0, если не посчитать. */
export function discountOf(price: string, oldPrice: string): number {
  const toNum = (v: string) => Number(v.replace(/\D/g, ""));
  const off = toNum(oldPrice) ? Math.round((1 - toNum(price) / toNum(oldPrice)) * 100) : 0;
  return off > 0 ? off : 0;
}

/** Пропсы PromoCard для акции по id: `<PromoCard {...promo("landing")} />`. */
export function promo(id: string) {
  const p = PROMOS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown promo: ${id}`);
  const { id: _id, section: _section, ...props } = p;
  void _id;
  void _section;
  return { ...props, badge: PROMO_BADGE };
}
