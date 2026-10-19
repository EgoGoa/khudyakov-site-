import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import SiteShell, { siteMetadata, siteViewport } from "@/components/layout/SiteShell";
import LocaleProvider from "@/i18n/jsx/LocaleProvider";
import { enableEnglishForRequest } from "@/i18n/jsx/server";
import "../globals.css";

// Корневой layout английской версии (/en/**). Страницы внутри — обёртки над
// русскими, их генерирует scripts/gen-en-routes.mjs. Весь русский текст
// компонентов переводится словарём messages/en.strings.json на лету при
// рендере (src/i18n/jsx), так что тексты хранятся в одном месте.
export const viewport = siteViewport;

export function generateMetadata(): Promise<Metadata> {
  setRequestLocale("en");
  enableEnglishForRequest();
  return siteMetadata("en");
}

export default function EnLayout({ children }: { children: React.ReactNode }) {
  setRequestLocale("en");
  enableEnglishForRequest();
  return (
    <SiteShell locale="en" Wrap={LocaleProvider}>
      {children}
    </SiteShell>
  );
}
