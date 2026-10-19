import type { Metadata } from "next";
import { translate } from "@/i18n/jsx/core";

// Перевод метаданных страницы (title, description, OpenGraph, Twitter) для
// английской ветки по тому же словарю, что и текст страниц.
const t = (v: unknown) => (typeof v === "string" ? translate(v) : v);

export function localizeMetadata(meta: Metadata): Metadata {
  const m = { ...meta } as Record<string, unknown>;
  const title = m.title as unknown;
  if (typeof title === "string") m.title = translate(title);
  else if (title && typeof title === "object") {
    const o = { ...(title as Record<string, unknown>) };
    for (const k of ["default", "absolute", "template"]) if (k in o) o[k] = t(o[k]);
    m.title = o;
  }
  m.description = t(m.description);
  for (const k of ["openGraph", "twitter"]) {
    const v = m[k];
    if (v && typeof v === "object") {
      const o = { ...(v as Record<string, unknown>) };
      o.title = t(o.title);
      o.description = t(o.description);
      m[k] = o;
    }
  }
  return m as Metadata;
}
