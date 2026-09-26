import { aiToolLinks } from "./toolRegistry";

// Кольцо соседних подстраниц внутри одного раздела.
//
// Егор попросил механику каруселей главных страниц перенести на сами
// страницы услуг: «захожу на страницу Reels — справа и слева такие же
// стрелочки, вправо идёт на Сторис, влево на Блогеров». То есть внутри
// раздела формат — не тупик, а позиция в кольце, и переход к соседу должен
// стоить одного клика, не возврата в раздел и не открытия карусели заново.
//
// Кольцо, а не отрезок: на первом формате «влево» ведёт на последний, на
// последнем «вправо» — на первый. Отрезок дал бы две страницы из пяти с
// одной работающей стрелкой, и стрелка-заглушка читалась бы как поломка.
//
// Порядок в каждом списке — тот же, что в карусели раздела (SmmDeck,
// SitesDeck, AiDeck) и в реестре страниц. Один порядок в трёх местах: если
// стрелки поведут в другом порядке, чем крутится карусель, посетитель
// решит, что попал не туда.

export type Sibling = { href: string; label: string };

/** Подписи короткие — это ярлык на кнопке, а не заголовок страницы.
 *  Берутся из `hero.eyebrow` соответствующей страницы, но подрезаны до
 *  того, что помещается рядом со стрелкой.
 *
 *  Мерка буквальная: подпись раскрывается под шевроном в блоке шириной
 *  128px (см. FormatSideNav), и слово, которое туда не влезает, просто
 *  обрезается краем стеклянной карточки. Поэтому «Презентационные фильмы»
 *  здесь живёт как «Презентации» — в ярлыке у стрелки важен раздел, а не
 *  полное имя страницы. */
const RINGS: Record<string, Sibling[]> = {
  content: [
    { href: "/content/presentation", label: "Презентации" },
    { href: "/content/advertising", label: "Реклама" },
    { href: "/content/image", label: "Имидж" },
    { href: "/content/ai-video", label: "AI-видео" },
    { href: "/content/graphics", label: "Моушн и 3D" },
  ],
  sites: [
    { href: "/sites/landing", label: "Лендинг" },
    { href: "/sites/card", label: "Сайт-визитка" },
    { href: "/sites/turnkey", label: "Сайт под ключ" },
    { href: "/sites/assistant", label: "AI-ассистент" },
    { href: "/sites/redesign", label: "Редизайн" },
  ],
  smm: [
    { href: "/smm/reels", label: "Reels" },
    { href: "/smm/stories", label: "Сторис" },
    { href: "/smm/carousel", label: "Карусели" },
    { href: "/smm/ads", label: "Таргет" },
    { href: "/smm/bloggers", label: "Блогеры" },
  ],
  // Единственный раздел, который не перечисляется здесь вручную: список
  // инструментов уже живёт в toolRegistry и используется меню, поэтому
  // второй его экземпляр рано или поздно разошёлся бы с первым.
  ai: aiToolLinks.map((t) => ({ href: `/ai/${t.slug}`, label: t.label })),
};

/** Соседи страницы `slug` внутри раздела `section`. */
export function siblingsOf(
  section: keyof typeof RINGS | string,
  slug: string
): { prev: Sibling; next: Sibling } | null {
  const ring = RINGS[section];
  if (!ring || ring.length < 2) return null;
  const i = ring.findIndex((item) => item.href.endsWith(`/${slug}`));
  if (i < 0) return null;
  return {
    prev: ring[(i - 1 + ring.length) % ring.length],
    next: ring[(i + 1) % ring.length],
  };
}

/** Всё кольцо раздела целиком — для меню, которым выбирают формат, а не
 *  шагают по соседям (см. welcome-menu.ts). Копия списка, не сам массив:
 *  вызывающий код не должен уметь переставить порядок стрелок. */
export function ringOf(section: string): Sibling[] {
  return RINGS[section] ? [...RINGS[section]] : [];
}

/** Build-time guard, called from each [param] route's generateStaticParams:
 *  every page that builds must sit in its section's ring (arrows, menus), and
 *  the ring must not point at pages that don't exist. Fails the build with the
 *  exact slugs instead of shipping a page no menu links to. */
export function assertRingCovers(section: string, slugs: string[], metaKeys?: string[]) {
  const ring = (RINGS[section] ?? []).map((s) => s.href.split("/").pop() ?? "");
  const missing = slugs.filter((s) => !ring.includes(s));
  const extra = ring.filter((s) => !slugs.includes(s));
  const noMeta = metaKeys ? slugs.filter((s) => !metaKeys.includes(s)) : [];
  if (missing.length || extra.length || noMeta.length) {
    throw new Error(
      `[${section}] ссылки и страницы разошлись — нет в меню/стрелках: ${missing.join(", ") || "—"}; ` +
        `в меню, но страницы нет: ${extra.join(", ") || "—"}; нет title/description: ${noMeta.join(", ") || "—"}`
    );
  }
}
