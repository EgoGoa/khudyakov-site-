"use client";

import { useCleanPathname } from "@/lib/use-clean-pathname";

// На планшете бар (на телефоне с 2026-09-29 он в строке шапки) страниц стоит второй строкой под логотипом и
// делает фиксированную шапку выше на 3.5rem. На подстраницах и общих
// страницах это закрывало начало текста — прокладка сдвигает страницу на
// высоту бара. На четырёх главных страницах не нужна: первый экран там
// отцентрован по высоте, и бар ложится поверх шоурила. На десктопе и у
// телефона боком бар встроен в строку шапки — прокладки нет.
const TOP = new Set(["/content", "/ai", "/sites", "/smm"]);

export default function PageBarSpacer() {
  const pathname = useCleanPathname();
  if (TOP.has(pathname) || pathname.startsWith("/admin")) return null;
  return <div aria-hidden="true" className="hidden h-14 sm:block lg:hidden land:!hidden" />;
}
