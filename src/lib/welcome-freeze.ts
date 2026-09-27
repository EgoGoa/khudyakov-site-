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
