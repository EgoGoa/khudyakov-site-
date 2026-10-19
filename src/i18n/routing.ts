import { defineRouting } from "next-intl/routing";

// Русский — на старых адресах без префикса, английский — под /en.
// Middleware нет и не будет: боевой домен — статичный export (reg.ru),
// поэтому /en — это настоящие страницы в app/(en)/en, а cookie только
// запоминает выбор переключателя (никаких автопереходов по языку).
export const routing = defineRouting({
  locales: ["ru", "en"],
  defaultLocale: "ru",
  localePrefix: "as-needed",
  localeDetection: false,
  localeCookie: { name: "NEXT_LOCALE", maxAge: 60 * 60 * 24 * 365 },
});

export type Locale = (typeof routing.locales)[number];
