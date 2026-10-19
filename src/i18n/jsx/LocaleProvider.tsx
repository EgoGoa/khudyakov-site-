"use client";

import { useEffect } from "react";
import { LocaleContext, registerDict } from "./core";
import enDict from "../../../messages/en.packed.json";

// Клиентская часть английской ветки: кладёт язык в контекст, регистрирует
// словарь и помечает запросы к серверу языком страницы (заявки, ИИ-чат и
// голосовой ассистент отвечают по-английски). Импортируется только из
// (en)-layout, поэтому в русскую сборку словарь не попадает.
registerDict(enDict as unknown as Parameters<typeof registerDict>[0]);

const API = /^\/(api\/|lead\.php|voice\.php|tts\.php)/;
let patched = false;

function patchFetch(locale: string) {
  if (patched || typeof window === "undefined") return;
  patched = true;
  const original = window.fetch.bind(window);
  window.fetch = (input, init) => {
    try {
      const url = typeof input === "string" ? input : input instanceof URL ? input.pathname : input.url;
      const path = url.startsWith("http") ? new URL(url).pathname : url;
      if (API.test(path)) {
        const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
        headers.set("X-Site-Locale", locale);
        return original(input, { ...init, headers });
      }
    } catch {
      /* без пометки языка запрос всё равно уйдёт */
    }
    return original(input, init);
  };
}

export default function LocaleProvider({ locale, children }: { locale: string; children: React.ReactNode }) {
  const Ctx = LocaleContext!;
  useEffect(() => patchFetch(locale), [locale]);
  return <Ctx.Provider value={locale}>{children}</Ctx.Provider>;
}
