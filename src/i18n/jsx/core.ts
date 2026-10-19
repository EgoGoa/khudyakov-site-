import * as React from "react";
import { jsx as rawJsx } from "react/jsx-runtime";
import { hashKey } from "@/i18n/hash";

// Перевод всего выводимого текста на английской версии. Подмена jsx-runtime
// (tsconfig: jsxImportSource) прогоняет каждую строку-потомка и текстовые
// атрибуты через словарь RU → EN. Русская версия проходит мимо за одну
// проверку языка. Словарь подключает только английская ветка (registerDict),
// поэтому в русскую сборку он не попадает.

type Packed = { h: Record<string, string>; p: [string, string][] };

const CYR = /[А-Яа-яЁё]/;
const NBSP = /[\u00A0\u202F\u2009]/g;

let dict: Record<string, string> | null = null;
let patterns: [RegExp, string][] = [];
const memo = new Map<string, string>();

export const norm = (s: string) => s.replace(NBSP, " ").replace(/\s+/g, " ").trim();

/** Подключает упакованный словарь (messages/en.packed.json): ключи — хеши. */
export function registerDict(d: Packed) {
  dict = d.h;
  patterns = d.p.map(([src, tpl]) => [new RegExp(src), tpl] as [RegExp, string]);
  // Более длинные (то есть более конкретные) шаблоны проверяются первыми.
  patterns.sort((a, b) => b[0].source.length - a[0].source.length);
}

const sp = (s: string) => s.replace(NBSP, " ").replace(/\s+/g, " ");

// Числа по-русски («50 000», «30,8») → по-английски («50,000», «30.8»).
function fixNumbers(s: string): string {
  return s
    .replace(/(\d{1,3})(?:[ \u00A0\u202F](\d{3}))+(?!\d)/g, (m) => m.replace(/[ \u00A0\u202F]/g, ","))
    .replace(/(\d),(\d{1,2})(?!\d)/g, "$1.$2");
}

const DECIMAL_COMMA = /(\d),(\d{1,2})(?!\d)/g;
const HAS_DECIMAL_COMMA = /\d,\d{1,2}(?!\d)/;
function plainFix(s: string): string {
  const r = s.includes("₽") ? fixRub(s) : s;
  return HAS_DECIMAL_COMMA.test(r) ? r.replace(DECIMAL_COMMA, "$1.$2") : r;
}

function fixRub(s: string): string {
  return s.replace(/(\d[\d \u00A0\u202F,.]*\d|\d)\s?₽/g, (_, n: string) => "₽" + fixNumbers(n));
}

function lookup(str: string): string | undefined {
  const key = norm(str);
  const hit = dict![hashKey(key)];
  if (hit !== undefined) return hit;
  const key2 = sp(str);
  for (const [re, tpl] of patterns) {
    const m = re.exec(key2) ?? re.exec(key);
    if (m) {
      // части, подставленные в шаблон, переводим отдельно (названия, суммы)
      return fixNumbers(tpl.replace(/\$(\d)/g, (_, i) => translate(m[Number(i)] ?? "")));
    }
  }
  // «Заголовок — HUD.SERVICE», «Раздел · пункт»: переводим по частям
  for (const sep of [" — ", " · ", ": "]) {
    if (!key.includes(sep)) continue;
    const parts = key.split(sep);
    const out = parts.map((p) => (CYR.test(p) ? lookup(p) : fixRub(p)));
    if (out.every((x) => x !== undefined)) return out.join(sep);
  }
  return undefined;
}

/** Перевод одной строки (нужен зарегистрированный словарь; язык проверяет вызывающий). */
export function translate(str: string): string {
  if (!dict) return str;
  // Суммы и дроби без кириллицы («50 000 ₽», «98,2%») → «₽50,000», «98.2%»
  if (!CYR.test(str)) return plainFix(str);
  const cached = memo.get(str);
  if (cached !== undefined) return cached;
  let out = lookup(str);
  if (out !== undefined && dict[hashKey(norm(str))] !== undefined) {
    const lead = /^\s*/.exec(str)![0];
    const trail = /\s*$/.exec(str)![0];
    out = lead + out + trail;
  }
  if (out === undefined) {
    reportMissing(norm(str));
    out = str;
  }
  memo.set(str, out);
  return out;
}

/** Перевод строки в коде (не в JSX): для сообщений, поиска, метаданных. */
export function tr(str: string, locale?: string): string {
  const l = locale ?? activeLocale();
  return l === "en" ? translate(str) : str;
}

const missing = new Set<string>();
function reportMissing(key: string) {
  if (missing.has(key)) return;
  missing.add(key);
  if (typeof window !== "undefined") {
    const w = window as unknown as { __missingI18n?: string[] };
    (w.__missingI18n ||= []).push(key);
  } else if (process.env.I18N_LOG_MISSING) {
    console.log("[i18n-missing]", key);
  }
}

// ── какой сейчас язык ───────────────────────────────────────────────────
// Клиент / SSR: контекст (его кладёт LocaleProvider в английском layout).
// Сервер (RSC): React.cache — свой на каждый запрос, язык ставит layout.
type R = typeof React & { cache?: <T>(f: () => T) => () => T; use?: <T>(c: React.Context<T>) => T };
const R_ = React as R;
const isRsc = typeof R_.createContext !== "function";

export const LocaleContext: React.Context<string> | null = isRsc ? null : React.createContext<string>("ru");

const serverHolder = isRsc && R_.cache ? R_.cache(() => ({ locale: "ru" })) : null;

export function setServerLocale(locale: string) {
  if (serverHolder) serverHolder().locale = locale;
}

export function activeLocale(): string {
  if (serverHolder) return serverHolder().locale;
  if (LocaleContext && R_.use) {
    try {
      return R_.use(LocaleContext);
    } catch {
      /* вызов вне рендера (обработчик, модуль) */
    }
  }
  if (typeof document !== "undefined") return document.documentElement.lang || "ru";
  return "ru";
}

const ATTRS = ["aria-label", "title", "alt", "placeholder", "aria-description", "aria-roledescription"];

function tNode(n: unknown): unknown {
  if (typeof n === "string") return translate(n);
  if (Array.isArray(n)) {
    let changed = false;
    const out = n.map((c) => {
      const t = tNode(c);
      if (t !== c) changed = true;
      return t;
    });
    return changed ? out : n;
  }
  return n;
}

// ── ленивый перевод текста обычных тегов ────────────────────────────────
// Данные вроде `title: (<>Смета в трёх <span>вариантах</span></>)` собираются
// при загрузке модуля, а модуль загружается один раз — иногда прямо посреди
// рендера, когда язык уже «выбран» первой страницей. Определить такой момент
// надёжно нельзя, поэтому русский текст внутри обычных тегов и фрагментов
// всегда оборачивается в <T>, который переводит строку в тот момент, когда
// её реально выводят. У пользовательских компонентов children остаются
// строкой (например, MetaText делит её по цифрам) и переводятся сразу.

/** Переводит строку при рендере. */
export function T({ s }: { s: string }) {
  return activeLocale() === "en" ? translate(s) : s;
}

// Что вообще стоит прогонять через перевод: кириллица, рубли и десятичная запятая.
const NEEDS_FIX = /[А-Яа-яЁё₽]|\d,\d/;

const NO_WRAP = new Set(["option", "textarea", "title", "script", "style", "pre"]);

function wrapNode(n: unknown, key: string): unknown {
  if (typeof n === "string") return NEEDS_FIX.test(n) ? rawJsx(T, { s: n }, key) : n;
  if (Array.isArray(n)) {
    let changed = false;
    const out = n.map((c, i) => {
      const w = wrapNode(c, `${key}.${i}`);
      if (w !== c) changed = true;
      return w;
    });
    return changed ? out : n;
  }
  return n;
}

/** Переводит children и текстовые атрибуты; для русской версии — сразу props. */
export function localize(type: unknown, props: Record<string, unknown>): Record<string, unknown> {
  let next = props;
  const ch = props.children;
  if (typeof ch === "string" || Array.isArray(ch)) {
    const lazy = !process.env.NEXT_PUBLIC_NO_LAZY_T && ((typeof type === "string" && !NO_WRAP.has(type)) || type === R_.Fragment);
    if (lazy) {
      const w = wrapNode(ch, "t");
      if (w !== ch) next = { ...next, children: w };
    } else if (dict && activeLocale() === "en") {
      const t = tNode(ch);
      if (t !== ch) next = { ...next, children: t };
    }
  }
  if (!dict || activeLocale() !== "en") return next;
  // aria-label/alt/placeholder переводим у любых элементов (в том числе у Link
  // и Image), а title — только у обычных тегов: у компонентов это часто данные.
  for (const a of ATTRS) {
    if (a === "title" && typeof type !== "string") continue;
    const v = props[a];
    if (typeof v === "string" && CYR.test(v)) {
      if (next === props) next = { ...props };
      next[a] = translate(v);
    }
  }
  return next;
}
