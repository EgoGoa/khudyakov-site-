"use client";

import { useEffect } from "react";

// Module-scoped, not per-instance: WelcomeOverlay and ServiceMenuOverlay can
// both be mounted at once (a fresh landing on /content mounts both), so a
// naive "restore to whatever it was before" per component would have
// whichever one closes first unlock scroll while the other is still open.
// Reference-counting means body stays locked until the last one releases it.
let lockCount = 0;

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lockCount += 1;
    if (lockCount === 1) {
      // Компенсация полосы прокрутки. `overflow: hidden` убирает её, страница
      // на её ширину становится шире — и в момент открытия и закрытия окна
      // весь сайт под ним дёргается вбок. Добавляем ровно эту ширину полем
      // справа, чтобы ширина содержимого не менялась. Там, где полоса
      // наложенная (macOS), зазор нулевой и ничего не происходит.
      const gap = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    }
    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }
    };
  }, [active]);
}
