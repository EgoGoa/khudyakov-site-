import type { Metadata } from "next";

// Страница сама объявляет заголовок и описание для превью ссылок: иначе
// og:/twitter: наследуются из общего layout и у всех страниц совпадают с главной.
export function pageMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}
