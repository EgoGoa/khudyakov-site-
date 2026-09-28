// Общие детали сцен таблички (см. SpotlightScene.tsx и SpotlightScenesContent.tsx).

"use client";

import { createContext, useContext, useLayoutEffect, useRef } from "react";

/** Сцена нарисована в карточке карусели, а не в широком окне. Карточка
 *  узкая и невысокая: «было → стало» внизу сцены там не помещается и
 *  налезло бы на название услуги (правило Егора: графика не нависает над
 *  названием), а вьюбокс обрезается по высоте до области над ним. */
export const CardCtx = createContext(false);

/** Сцена стоит в блоке-перебивке на странице направления (SceneBreak):
 *  цифра и «было → стало» вынесены в текст справа крупно, поэтому в самой
 *  сцене их нет, а вьюбокс обрезан до полосы с графикой (y = 58…176). */
export const BareCtx = createContext(false);

export type SceneProps = { mini?: boolean };

/** Элемент сцены, который приходит в свой черёд.
 *
 *  Раньше всё в сцене жило бесконечными пульсациями и начиналось
 *  одновременно: картинка дрожала целиком и читалась как шум. Егор
 *  попросил плавнее и последовательнее — поэтому теперь сцена
 *  СОБИРАЕТСЯ на глазах, элемент за элементом (`at` — порядковый номер), а
 *  постоянное движение осталось ровно там, где оно что-то значит: бегущий
 *  пунктир на линии — это идущее сообщение.
 *
 *  Перезапускается само: при смене шага AnimatePresence размонтирует
 *  старую сцену и монтирует новую, так что CSS-анимация входа играет
 *  заново без единой строчки состояния. */
export function In({
  at = 0,
  children,
}: {
  at?: number;
  children: React.ReactNode;
}) {
  return (
    <g className="sp-in" style={{ animationDelay: `${0.18 + at * 0.18}s` }}>
      {children}
    </g>
  );
}

/* ── Общие детали сцены ──────────────────────────────────────────────── */

/** Подписи сцены не вылезают за свои плашки и за край сцены (Егор показал
 *  «Инвестор», налезающий на рамку). Сцен больше сотни, и подписи в них
 *  местами крупнее, чем рассчитаны плашки, — поэтому не правка каждой
 *  координаты руками, а общая подгонка: после отрисовки каждая <text>
 *  меряется, для неё ищется плашка-<rect> в той же группе, внутри которой
 *  она стоит, и если текст шире доступного места, кегль уменьшается ровно
 *  настолько, чтобы влезть (не меньше 60% исходного). Координаты
 *  пользовательские, поэтому от размера окна результат не зависит. */
function fitSceneText(svg: SVGSVGElement) {
  const vb = svg.viewBox.baseVal;
  const groups = new Map<string, { scale: number; items: SVGTextElement[] }>();
  const rects: { g: Node | null; b: DOMRect }[] = [];
  svg.querySelectorAll("rect").forEach((r) => {
    try {
      const b = r.getBBox();
      if (b.width > 0 && b.height > 0) rects.push({ g: r.parentNode, b });
    } catch {}
  });
  svg.querySelectorAll("text").forEach((t) => {
    const base = t.dataset.fitBase ?? t.getAttribute("font-size") ?? "";
    t.dataset.fitBase = base;
    if (base) t.setAttribute("font-size", base);
    let b: DOMRect;
    try {
      b = t.getBBox();
    } catch {
      return;
    }
    if (!b.width) return;
    const cy = b.y + b.height / 2;
    const cx = b.x + b.width / 2;
    const box = rects
      .filter((r) => r.g === t.parentNode && r.b.height > b.height * 0.8 && cy > r.b.y && cy < r.b.y + r.b.height && cx > r.b.x && cx < r.b.x + r.b.width)
      .sort((a, c) => a.b.width * a.b.height - c.b.width * c.b.height)[0];
    const pad = box ? Math.min(6, box.b.height / 3) : 2;
    const left = (box ? box.b.x : vb.x) + pad;
    const right = (box ? box.b.x + box.b.width : vb.x + vb.width) - pad;
    const anchor = getComputedStyle(t).textAnchor;
    const avail =
      anchor === "middle"
        ? 2 * Math.min(cx - left, right - cx)
        : anchor === "end"
          ? b.x + b.width - left
          : right - b.x;
    const scale = Math.max(0.6, Math.min(1, avail / b.width));
    // Подписи одного списка (тот же исходный кегль и та же x) уменьшаются
    // одинаково — иначе «Тендер» оставался крупным рядом с ужатым
    // «Инвестором», и столбик читался неровным.
    const key = `${base}|${t.getAttribute("x")}|${anchor}`;
    const prev = groups.get(key);
    groups.set(key, { scale: Math.min(prev?.scale ?? 1, scale), items: [...(prev?.items ?? []), t] });
  });
  groups.forEach(({ scale, items }) => {
    if (scale >= 0.99) return;
    items.forEach((t) => {
      const size = parseFloat(t.dataset.fitBase || getComputedStyle(t).fontSize) || 12;
      t.setAttribute("font-size", (size * scale).toFixed(2));
    });
  });
}

export function Frame({ children }: { children: React.ReactNode }) {
  const card = useContext(CardCtx);
  const bare = useContext(BareCtx);
  const ref = useRef<SVGSVGElement>(null);
  useLayoutEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    fitSceneText(svg);
    // Шрифт сайта догружается позже первого кадра — перемеряем с ним.
    let alive = true;
    document.fonts?.ready.then(() => alive && ref.current && fitSceneText(ref.current));
    return () => {
      alive = false;
    };
  });
  return (
    <svg ref={ref} viewBox={bare ? "0 58 340 118" : card ? "0 0 340 176" : "0 0 340 210"} className="h-full w-full" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="sp-ramp" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--sp-from)" />
          <stop offset="100%" stopColor="var(--sp-to)" />
        </linearGradient>
        <radialGradient id="sp-glow">
          <stop offset="0%" stopColor="var(--sp-from)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--sp-from)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {children}
    </svg>
  );
}

/** Крупная цифра сцены — то, ради чего на неё смотрят, — и подзаголовок под
 *  ней. Тезис (`value`, градиент страницы) прижат к самому верху сцены, а
 *  подпись под ним теперь набрана как настоящий подзаголовок сайта: белым,
 *  жирным и крупно — раньше это была блёклая серая капслок-строка 8px,
 *  которая физически не читалась рядом с крупной цифрой (правило сайта:
 *  основной текст белый с акцентами, никогда приглушённо-серый). */
export function Headline({ value, note, mini }: { value: string; note: string; mini?: boolean }) {
  const bare = useContext(BareCtx);
  if (mini || bare) return null;
  return (
    <In at={0}>
      <text x="16" y="34" className="sp-figure" fill="url(#sp-ramp)" fontSize="34">
        {value}
      </text>
      <text x="16" y="54" fill="rgba(255,255,255,0.94)" fontSize="14" fontWeight="700" letterSpacing="0.3" fontFamily="inherit">
        {note}
      </text>
    </In>
  );
}

/** «Было → стало» одной строкой внизу сцены: самая быстрая реклама, какая
 *  бывает — два состояния рядом, разница видна без объяснений. */
export function BeforeAfter({ before, after, mini }: { before: string; after: string; mini?: boolean }) {
  const card = useContext(CardCtx);
  const bare = useContext(BareCtx);
  if (mini || card || bare) return null;
  return (
    <In at={6}>
      <rect x="14" y="180" width="118" height="20" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" />
      <text x="24" y="193.5" fill="rgba(255,255,255,0.45)" fontSize="8" fontFamily="inherit">
        {before}
      </text>
      <path d="M 138 190 L 152 190" stroke="var(--sp-to)" strokeWidth="1.4" className="sp-flow" />
      <rect x="158" y="180" width="140" height="20" rx="10" fill="rgba(255,255,255,0.07)" stroke="var(--sp-to)" strokeOpacity="0.55" />
      <text x="168" y="193.5" fill="#fff" fontSize="8" fontWeight="600" fontFamily="inherit">
        {after}
      </text>
    </In>
  );
}

