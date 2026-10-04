"use client";

import { useEffect } from "react";

// Экран ожидания при слабом интернете (Егор, 2026-10-04): вместо рваной
// прогрузки сайт приглушается, по центру крутится кольцо цвета бренда, и
// только когда страница собралась (скрипты подтянулись, окно загрузилось),
// экран плавно гаснет. Сам слой рисуется в HTML страницы (layout.tsx,
// #slow-veil) и показывается чистым CSS с задержкой 1.3с: на быстрой связи
// страница успевает собраться раньше, и экран не мелькает вовсе. Этот
// компонент только говорит «готово» — ставит data-veil-done на <html>.
export default function SlowLoadVeil() {
  useEffect(() => {
    const root = document.documentElement;
    const done = () => {
      root.setAttribute("data-veil-done", "");
    };
    if (document.readyState === "complete") done();
    else window.addEventListener("load", done, { once: true });
    // Страховка: если окно так и не «догрузилось» (вечно висящая картинка),
    // экран всё равно уходит.
    const cap = window.setTimeout(done, 10000);
    return () => {
      window.removeEventListener("load", done);
      window.clearTimeout(cap);
    };
  }, []);
  return null;
}
