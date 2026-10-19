import type { Locale } from "./routing";

// Помощники для кода, который работает с адресом напрямую (window.location,
// регулярки по пути), а не через Link/useRouter из ./navigation.

/** Язык открытой страницы — по <html lang>, который ставит корневой layout. */
export function currentLocale(): Locale {
  if (typeof document === "undefined") return "ru";
  return document.documentElement.lang === "en" ? "en" : "ru";
}

/** Путь без префикса /en: "/en/ai" → "/ai", "/en" → "/". */
export function stripLocale(pathname: string): string {
  if (pathname === "/en" || pathname === "/en/") return "/";
  return pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
}

/** Внутренний путь с префиксом нужного языка: "/ai" → "/en/ai" на английском. */
export function localizeHref(href: string, locale: Locale = currentLocale()): string {
  if (locale !== "en" || !href.startsWith("/") || href.startsWith("//")) return href;
  if (href === "/en" || href.startsWith("/en/") || href.startsWith("/en?") || href.startsWith("/en#")) return href;
  return href === "/" ? "/en" : `/en${href}`;
}
