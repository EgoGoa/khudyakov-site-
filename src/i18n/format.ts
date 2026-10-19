import { activeLocale } from "@/i18n/jsx/core";

// Локаль для чисел и дат: на английской версии — en-US, иначе ru-RU.
// Вызывается во время рендера, поэтому язык берётся из контекста страницы.
export const numLocale = () => (activeLocale() === "en" ? "en-US" : "ru-RU");
