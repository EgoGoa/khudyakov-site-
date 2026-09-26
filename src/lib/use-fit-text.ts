"use client";

import { useLayoutEffect, type RefObject } from "react";

// Подгонка текста под готовую ячейку сетки. Егор: если окошко растянуто
// под соседей, текст внутри должен заполнять его ровно — не обрываться и
// не оставлять пустых полей. Высоту ячейки задают соседи по ряду, а текст
// лишь подбирает самый крупный кегль, при котором ещё помещается, — поэтому
// ряд от подгонки не растёт и цикла «текст вырос → ячейка выросла» нет.

/** Бинарный поиск самого большого значения в [min, max], при котором
 *  `fits()` ещё true. `apply` выставляет пробное значение в DOM. */
export function fitValue(apply: (v: number) => void, fits: () => boolean, min: number, max: number) {
  let lo = min;
  let hi = max;
  apply(lo);
  if (!fits()) return lo;
  for (let i = 0; i < 8; i++) {
    const mid = (lo + hi) / 2;
    apply(mid);
    if (fits()) lo = mid;
    else hi = mid;
  }
  apply(lo);
  return lo;
}

/** Пересчитывает подгонку при изменении размера элемента и после загрузки
 *  шрифтов (до неё метрики текста другие). */
export function useRefit(target: RefObject<HTMLElement | null>, refit: () => void, key: string) {
  useLayoutEffect(() => {
    const el = target.current;
    if (!el) return;
    let raf = 0;
    const run = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(refit);
    };
    refit();
    const ro = new ResizeObserver(run);
    ro.observe(el);
    document.fonts?.ready.then(run).catch(() => {});
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
