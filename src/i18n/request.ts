import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

// Без middleware язык страницы задаёт она сама: английские обёртки
// (app/(en)/en/**) вызывают setRequestLocale("en"), русские ничего не
// вызывают — тогда язык по умолчанию.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
