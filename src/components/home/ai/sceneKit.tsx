// Общие детали сцен таблички (см. SpotlightScene.tsx и SpotlightScenesContent.tsx).

import { createContext, useContext } from "react";

/** Сцена нарисована в карточке карусели, а не в широком окне. Карточка
 *  узкая и невысокая: «было → стало» внизу сцены там не помещается и
 *  налезло бы на название услуги (правило Егора: графика не нависает над
 *  названием), а вьюбокс обрезается по высоте до области над ним. */
export const CardCtx = createContext(false);

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

export function Frame({ children }: { children: React.ReactNode }) {
  const card = useContext(CardCtx);
  return (
    <svg viewBox={card ? "0 0 340 176" : "0 0 340 210"} className="h-full w-full" fill="none" aria-hidden="true">
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

/** Крупная цифра сцены — то, ради чего на неё смотрят. */
export function Headline({ value, note, mini }: { value: string; note: string; mini?: boolean }) {
  if (mini) return null;
  return (
    <In at={0}>
      <text x="16" y="36" className="sp-figure" fill="url(#sp-ramp)" fontSize="34">
        {value}
      </text>
      <text x="16" y="48" fill="rgba(255,255,255,0.55)" fontSize="8" letterSpacing="1.4" fontFamily="inherit">
        {note.toUpperCase()}
      </text>
    </In>
  );
}

/** «Было → стало» одной строкой внизу сцены: самая быстрая реклама, какая
 *  бывает — два состояния рядом, разница видна без объяснений. */
export function BeforeAfter({ before, after, mini }: { before: string; after: string; mini?: boolean }) {
  const card = useContext(CardCtx);
  if (mini || card) return null;
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

