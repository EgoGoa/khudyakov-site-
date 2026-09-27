"use client";

import { useEffect } from "react";
import { LIVE_HOSTS, OVERLAY_OPEN_ATTR } from "@/lib/welcome-freeze";

// Сколько вайб-окон сейчас держат заморозку: окно заказа может открыться
// поверх вайб-окна, и закрытие одного не должно размораживать сайт.
let holders = 0;
const held = new Set<HTMLVideoElement>();

function hold(v: HTMLVideoElement) {
  if (v.closest(LIVE_HOSTS) || v.paused) return;
  v.pause();
  held.add(v);
}
function onPlay(e: Event) {
  if (e.target instanceof HTMLVideoElement) hold(e.target);
}

/** Пока компонент смонтирован, сайт за окном замирает: CSS-анимации на
 *  паузе (globals.css), холсты не рисуют (isSiteFrozen), видео стоят и после
 *  закрытия продолжают с того же кадра. Вызывать внутри самого окна — оно
 *  размонтируется после анимации ухода, и сайт оживает, когда окна уже нет. */
export function useSiteFreeze() {
  useEffect(() => {
    holders += 1;
    if (holders === 1) {
      document.documentElement.setAttribute(OVERLAY_OPEN_ATTR, "");
      document.querySelectorAll("video").forEach(hold);
      document.addEventListener("play", onPlay, true);
    }
    return () => {
      holders -= 1;
      if (holders > 0) return;
      document.documentElement.removeAttribute(OVERLAY_OPEN_ATTR);
      document.removeEventListener("play", onPlay, true);
      held.forEach((v) => void v.play().catch(() => {}));
      held.clear();
    };
  }, []);
}
