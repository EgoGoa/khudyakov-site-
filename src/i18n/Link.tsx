"use client";

import type { ComponentProps } from "react";
import NextLink from "next/link";
import { useLocale } from "next-intl";
import { localizeHref } from "@/i18n/href";
import type { Locale } from "@/i18n/routing";

// Ссылка, которая сама ставит префикс /en на английской версии. Клиентский
// компонент, а не Link из next-intl/navigation: тот на сервере читает язык
// из заголовков запроса, и русские страницы перестали бы быть статичными.
type Props = Omit<ComponentProps<typeof NextLink>, "locale"> & { locale?: Locale };

export function Link({ href, locale, ...rest }: Props) {
  const current = useLocale() as Locale;
  const lang = locale ?? current;
  const to =
    typeof href === "string"
      ? localizeHref(href, lang)
      : href.pathname
        ? { ...href, pathname: localizeHref(href.pathname, lang) }
        : href;
  return <NextLink href={to} {...rest} />;
}
