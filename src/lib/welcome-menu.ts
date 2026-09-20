import { ringOf } from "@/components/home/direction/siblings";
import { serviceMeta, serviceOrder, type ServiceKey } from "./service-content";

// Второй шаг вайб-окна: выбрав направление, посетитель сразу видит его
// форматы и попадает на нужную страницу одним кликом — вместо того чтобы
// сначала приехать на страницу раздела и там встретить ещё одно окно.
//
// Списки берутся из того же кольца, что крутят боковые стрелки подстраниц
// (siblings.ts), поэтому порядок форматов в меню и в стрелках не может
// разойтись. Исключение — /ai: инструментов там одиннадцать, столько кнопок
// в окне читаются как прайс-лист, поэтому здесь живёт короткий отобранный
// набор, а полный список остаётся на самой странице раздела.

export type MenuLink = { href: string; label: string };

const AI_PICKS = ["chat-hub", "agent", "content", "ops"];

export function submenuFor(key: ServiceKey): MenuLink[] {
  const ring = ringOf(serviceMeta[key].slug);
  if (key === "ai") {
    const picked = AI_PICKS.map((slug) => ring.find((item) => item.href.endsWith(`/${slug}`))).filter(
      (item): item is MenuLink => Boolean(item)
    );
    return picked.length ? picked : ring.slice(0, 4);
  }
  return ring;
}

// Голосовой словарь второго шага: слово из подписи формата достаточно, чтобы
// попасть на него голосом («хочу лендинг», «расскажи про сторис»). Строится
// из тех же подписей, поэтому новый формат подхватывается сам.
export function matchSubmenu(key: ServiceKey, transcript: string): MenuLink | null {
  const t = transcript.toLowerCase();
  return (
    submenuFor(key).find((item) => {
      const words = item.label.toLowerCase().split(/[\s-]+/);
      return words.some((w) => w.length > 3 && t.includes(w.slice(0, Math.max(4, w.length - 2))));
    }) ?? null
  );
}

export const allServices = serviceOrder;
