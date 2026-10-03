"use client";

import { useEffect } from "react";

// Единая механика размера заголовков глав (Егор, 2026-10-03): все слова
// заголовка ВСЕГДА одного размера. Раньше длинное слово («продакшена»)
// ужимали отдельным span'ом — оно выглядело меньше соседей. Теперь, если
// слово не влезает в колонку или заголовок наезжает на соседний блок,
// уменьшается весь заголовок целиком вместе с подзаголовком под ним —
// через `zoom` на обёртке, который масштабирует все слова одинаково.
//
// Работает только вниз от размера, заданного вёрсткой, и не меньше FLOOR:
// дальше читаемость важнее. Пересчёт — при загрузке, смене размера окна и
// когда шрифт доехал (иначе замер идёт по запасному шрифту).

const SELECTOR = '[data-chapter-pane] h2[class*="chapter-neon"]';
const STEP = 0.05;
const FLOOR = 0.6;

function fits(h: HTMLElement): boolean {
  const box = h.parentElement;
  if (!box) return true;

  // 1. Ни одно слово не шире колонки. overflow-wrap: break-word прячет
  //    проблему (рвёт слово посреди: «ПОДРЯДЧ/ИК»), поэтому на замер он
  //    выключается. Мерка ширины — max-width заголовка, он в em и растёт
  //    вместе с кеглем, так что уменьшением не лечится: если слово не лезет
  //    даже в нём, этот потолок снимается и мерка — сама колонка.
  const prevWrap = h.style.overflowWrap;
  h.style.overflowWrap = "normal";
  let wordFits = h.scrollWidth <= h.clientWidth + 1;
  if (!wordFits && getComputedStyle(h).maxWidth !== "none") {
    h.style.maxWidth = "none";
    wordFits = h.scrollWidth <= h.clientWidth + 1;
  }
  h.style.overflowWrap = prevWrap;
  if (!wordFits) return false;

  // 2. Заголовок с подзаголовком не заезжают на следующий блок.
  const group = box.getBoundingClientRect();
  const next = box.nextElementSibling;
  if (next) {
    const n = next.getBoundingClientRect();
    if (n.height > 0 && group.bottom > n.top + 1 && group.top < n.top) return false;
  }
  return true;
}

function fit(h: HTMLElement) {
  const box = h.parentElement;
  if (!box) return;
  // Подзаголовок масштабируется вместе с заголовком — они одна группа.
  const group = [h, ...Array.from(box.children).filter((c) => c !== h && c.tagName === "P")] as HTMLElement[];
  const apply = (z: number) => group.forEach((el) => (el.style.zoom = z === 1 ? "" : String(z)));

  let z = 1;
  apply(z);
  while (!fits(h) && z > FLOOR) {
    z = Math.max(FLOOR, Math.round((z - STEP) * 100) / 100);
    apply(z);
  }
}

export default function HeadingFit() {
  useEffect(() => {
    let raf = 0;
    const run = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => document.querySelectorAll<HTMLElement>(SELECTOR).forEach(fit));
    };
    run();
    void document.fonts?.ready.then(run);

    window.addEventListener("resize", run);
    const mo = new MutationObserver(run);
    mo.observe(document.body, { childList: true, subtree: true });
    const t = window.setTimeout(run, 1500); // когда Appear доиграл вход

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      window.removeEventListener("resize", run);
      mo.disconnect();
    };
  }, []);

  return null;
}
