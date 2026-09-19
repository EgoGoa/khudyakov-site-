"use client";

import { usePathname } from "next/navigation";

// Статичный экспорт с trailingSlash отдаёт "/content/" вместо "/content" —
// а вся навигация сравнивает адрес строкой.
export function useCleanPathname(): string {
  const pathname = usePathname();
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}
