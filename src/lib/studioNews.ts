import data from "../../content/blog/news.json";

// Новости студии: крупные материалы с каруселью слайдов и полным текстом.
// Данные — content/blog/news.json. Слайды лежат в public/images/blog/…
// (только свой домен — аудитория открывает сайт без VPN).

export type NewsSection = {
  h?: string;
  p?: string[];
  ul?: string[];
  ol?: string[];
  after?: string[];
};

export type StudioNewsItem = {
  id: string;
  date: string;
  eyebrow: string;
  title: string;
  /** Кусок заголовка, подсвеченный акцентным цветом. */
  titleAccent?: string;
  lead: string;
  /** Кусок вступления, подсвеченный акцентным цветом. */
  leadAccent?: string;
  slides: string[];
  cta?: { label: string; href: string };
  body: NewsSection[];
};

export function getStudioNews(): StudioNewsItem[] {
  return (data.news as StudioNewsItem[]).slice().sort((a, b) => b.date.localeCompare(a.date));
}
