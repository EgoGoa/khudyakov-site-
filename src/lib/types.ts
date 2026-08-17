export type Service = {
  title: string;
  description: string;
};

export type Work = {
  id: string;
  title: string;
  client: string;
  /** Основная рубрика — она же первый чип на карточке. */
  category: string;
  /** Дополнительные рубрики: работа попадает и в их фильтр тоже. */
  tags?: string[];
  /** Сфера заказчика — вторая, независимая ось фильтра в портфолио. */
  sphere?: string;
  /** Длительность в секундах — выводится на карточке как мм:сс. */
  duration?: number;
  /** Дата публикации, ISO YYYY-MM-DD — выводится на карточке как ДД/ММ/ГГГГ. */
  date?: string;
  youtubeId?: string;
};

export type ProcessStep = {
  title: string;
  description: string;
};

export type PricingTier = {
  name: string;
  price: string;
  tagline: string;
  team: string;
  features: string[];
  pro: boolean;
};
