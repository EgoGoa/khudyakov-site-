"use client";

import { usePathname } from "@/i18n/navigation";

// Статичный экспорт с trailingSlash отдаёт "/content/" вместо "/content" —
// а вся навигация сравнивает адрес строкой. Путь — без префикса /en
// (usePathname из next-intl его снимает), так что сравнения одни на оба языка.
export function useCleanPathname(): string {
  const pathname = usePathname();
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}
