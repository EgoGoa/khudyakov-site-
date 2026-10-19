"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCleanPathname } from "@/lib/use-clean-pathname";
import { localizeHref } from "@/i18n/href";
import { routing, type Locale } from "@/i18n/routing";

const LABEL: Record<Locale, string> = { ru: "RU", en: "EN" };

/** Пилюля RU | EN в шапке. Ведёт на ту же страницу в другом языке (с тем же
 *  ?query и #якорем) и запоминает выбор в cookie NEXT_LOCALE. Переход —
 *  обычная загрузка страницы: у языков разные корневые layout. Активный язык
 *  подсвечен градиентом раздела (--g-from/--g-to ставит шапка). */
export default function LocaleSwitch({ className = "" }: { className?: string }) {
  const locale = useLocale() as Locale;
  const pathname = useCleanPathname();
  const t = useTranslations("header");

  const go = (e: React.MouseEvent<HTMLAnchorElement>, next: Locale) => {
    e.preventDefault();
    if (next === locale) return;
    try {
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      /* без cookie выбор просто не запомнится */
    }
    window.location.assign(localizeHref(pathname, next) + window.location.search + window.location.hash);
  };

  return (
    <div
      role="group"
      aria-label={t("switchLanguage")}
      className={`locale-switch font-display ${className}`}
    >
      {routing.locales.map((l) => (
        <a
          key={l}
          href={localizeHref(pathname, l)}
          hrefLang={l}
          lang={l}
          aria-current={l === locale ? "true" : undefined}
          onClick={(e) => go(e, l)}
          className={`locale-switch__item ${l === locale ? "is-active" : ""}`}
        >
          {LABEL[l]}
        </a>
      ))}
    </div>
  );
}
