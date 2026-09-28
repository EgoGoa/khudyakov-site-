"use client";

import { useSyncExternalStore } from "react";
import { WELCOME_OPEN_ATTR } from "@/lib/welcome-freeze";

// Очередь загрузки страницы (Егор, 2026-09-27): раньше при открытии всё
// стартовало в одну секунду — фоновое видео и ещё десяток роликов ниже,
// первый экран, ~70 CSS-анимаций (неоновые кнопки, пульсации), сфера
// вайб-бара, волна ассистента, дым за курсором — и процессор захлёбывался.
// Теперь этапы идут друг за другом:
//   1. media   — качается только фоновое видео первого экрана;
//   2. content — первый экран каскадом: заголовок → подзаголовок → кнопки →
//                цифры → боковые стрелки, ~1,2 с;
//   3. blocks  — оживают CSS-анимации сайта (до этого стоят на паузе,
//                globals.css) и начинают подгружаться остальные ролики;
//   4. sphere  — сфера вайб-бара собирается своей анимацией;
//   5. rail    — меню вайб-бара плавно опускается из-под сферы по кнопке;
//   6. voice   — волна голосового ассистента внизу;
//   7. smoke   — дым за курсором (самый тяжёлый и чисто декоративный).
// Сначала ~2 с на экране только видео (Егор, 2026-09-28: иначе видео
// готово за доли секунды и последовательность не читается глазом), потом
// блоки. Если видео грузится дольше — ждём его, но не больше 3 с. Если
// открыто стартовое окно, видео качается под ним, а этап 2 и дальше
// начинаются только после его закрытия — окну достаётся весь процессор.
// Очередь идёт один раз за загрузку: при переходах внутри сайта всё уже
// на месте.

export const BOOT = { media: 1, content: 2, blocks: 3, sphere: 4, rail: 5, voice: 6, smoke: 7 } as const;

// Пауза перед каждым следующим этапом: сколько длится анимация предыдущего.
const STEPS: [number, number][] = [
  [BOOT.blocks, 1200], // каскад первого экрана
  [BOOT.sphere, 700], // блоки и анимации ожили
  [BOOT.rail, 1000], // сфера собралась
  [BOOT.voice, 900], // меню опустилось
  [BOOT.smoke, 700], // волна появилась
];
// От начала загрузки страницы: не раньше MIN и не позже MAX.
const MEDIA_MIN_MS = 2000;
const MEDIA_MAX_MS = 3000;
// Страницы с фоновым видео в первом экране (Hero). Адрес с .html — статика
// на hdkv-ai.ru.
const MEDIA_PAGES = /^\/(content|ai|sites|smm)(\/|\.html)?$/;

let stage = 0;
let started = false;
let mediaReady = false;
let minPassed = false;
const listeners = new Set<() => void>();

function setStage(n: number) {
  if (n <= stage) return;
  stage = n;
  document.documentElement.setAttribute("data-boot", String(n));
  listeners.forEach((f) => f());
}

// Следующий этап — через паузу и в простое браузера, чтобы не наложиться
// на ещё идущую анимацию предыдущего.
function after(ms: number, cb: () => void) {
  window.setTimeout(() => {
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(cb, { timeout: 800 });
    else cb();
  }, ms);
}

function welcomeBlocking() {
  return (
    document.documentElement.hasAttribute(WELCOME_OPEN_ATTR) && !!document.querySelector(".welcome-shell")
  );
}

let observer: MutationObserver | null = null;

function tryContent() {
  if (stage >= BOOT.content || !mediaReady || !minPassed || welcomeBlocking()) return;
  observer?.disconnect();
  setStage(BOOT.content);
  const next = (i: number) => {
    const step = STEPS[i];
    if (step) after(step[1], () => {
      setStage(step[0]);
      next(i + 1);
    });
  };
  next(0);
}

function start() {
  if (started) return;
  started = true;
  setStage(BOOT.media);
  // Ждать нечего: страница без фонового видео или слабое устройство (там
  // MediaGovernor видео не грузит вовсе, остаётся кадр-заставка).
  if (!MEDIA_PAGES.test(window.location.pathname) || document.documentElement.hasAttribute("data-lite")) {
    mediaReady = true;
    minPassed = true;
  }
  const since = performance.now();
  window.setTimeout(() => {
    mediaReady = true;
    tryContent();
  }, Math.max(0, MEDIA_MAX_MS - since));
  window.setTimeout(() => {
    minPassed = true;
    tryContent();
  }, Math.max(0, MEDIA_MIN_MS - since));
  observer = new MutationObserver(tryContent);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [WELCOME_OPEN_ATTR] });
  tryContent();
}

/** Фоновое видео первого экрана готово играть (или не загрузилось). */
export function markMediaReady() {
  mediaReady = true;
  if (started) tryContent();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  start();
  return () => listeners.delete(cb);
}

/** true, когда очередь дошла до этапа `n`. На сервере и в первом рендере —
 *  false, так что гидрация не расходится. */
export function useBootStage(n: number): boolean {
  return useSyncExternalStore(
    subscribe,
    () => stage >= n,
    () => false,
  );
}

/** preload для роликов ниже первого экрана: «none», пока качается фоновое
 *  видео и собирается первый экран, потом — обычный. */
export function useBootPreload(preload: "metadata" | "auto" = "metadata"): "none" | "metadata" | "auto" {
  return useBootStage(BOOT.blocks) ? preload : "none";
}
