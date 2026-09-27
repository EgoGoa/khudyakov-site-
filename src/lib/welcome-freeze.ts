// Пока открыто стартовое окно, сайт за ним «замирает»: видео на паузе,
// CSS-анимации остановлены, покадровые холсты (дым курсора, сферы, волны)
// не рисуют. Окно погашено и перекрывает сайт — работа за ним никому не
// видна, а в момент сборки окна она отнимала кадры у самого окна (Егор:
// «сайт начинает сильно троить, когда это всё появляется»).
//
// Флаг — атрибут на <html>: его ставит скрипт в <head> ещё до отрисовки и
// снимает WelcomeOverlay, когда окно закрывается.
export const WELCOME_OPEN_ATTR = "data-welcome-open";

export function isWelcomeOpen(): boolean {
  return typeof document !== "undefined" && document.documentElement.hasAttribute(WELCOME_OPEN_ATTR);
}

// Та же заморозка под вайб-окнами (Егор, 2026-09-27: сфера в окне «глючит
// и тормозит»). Стекло окна размывает сайт под собой, и пока там идут видео,
// дым и сферы бара, браузер пересчитывает это размытие каждый кадр — кадры
// отнимаются у самого окна. Пока открыто окно, сайт за ним стоит картинкой.
export const OVERLAY_OPEN_ATTR = "data-overlay-open";
/** Окна, внутри которых анимация продолжается, пока сайт заморожен. */
export const LIVE_HOSTS = ".welcome-shell, .vibe-mode, .block-vibe";

/** Сайт за окном заморожен: открыто стартовое окно или вайб-окно. */
export function isSiteFrozen(): boolean {
  if (typeof document === "undefined") return false;
  const html = document.documentElement;
  return html.hasAttribute(WELCOME_OPEN_ATTR) || html.hasAttribute(OVERLAY_OPEN_ATTR);
}

/** Проверка заморозки для конкретного холста. За стартовым окном стоит всё,
 *  что не в нём самом. За вайб-окном — всё, кроме самого окна и сферы
 *  вайб-бара (`.vibe-live`): пока открыт вайб-режим, она «разогрета» и
 *  светится ярче (Егор, 2026-09-27). */
export function frozenFor(el: Element): () => boolean {
  const inWelcome = !!el.closest(".welcome-shell");
  const inOverlay = !!el.closest(".vibe-mode, .vibe-live");
  return () => {
    const html = document.documentElement;
    return (!inWelcome && html.hasAttribute(WELCOME_OPEN_ATTR)) || (!inOverlay && html.hasAttribute(OVERLAY_OPEN_ATTR));
  };
}
