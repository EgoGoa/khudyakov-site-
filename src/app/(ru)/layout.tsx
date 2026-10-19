import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import SiteShell, { siteMetadata, siteViewport } from "@/components/layout/SiteShell";
import "../globals.css";

// Корневой layout русской версии (адреса без префикса). Вся оболочка
// сайта — в SiteShell, общая с английской веткой app/(en).
export const viewport = siteViewport;

export function generateMetadata(): Promise<Metadata> {
  return siteMetadata("ru");
}

export default function RuLayout({ children }: { children: React.ReactNode }) {
  // Без этого next-intl читает язык из заголовков запроса и страницы
  // перестают быть статичными (на reg.ru — `output: "export"`).
  setRequestLocale("ru");
  return <SiteShell locale="ru">{children}</SiteShell>;
}
