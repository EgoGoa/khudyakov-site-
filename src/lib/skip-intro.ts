// Клик во время вступительной анимации — «не хочу ждать» (Егор, 2026-10-03):
// заставка, сборка меню, сферы и очередь загрузки страницы быстро и плавно
// доигрывают до конца, а не обрываются.
export const SKIP_INTRO_EVENT = "hdkv:skip-intro";

export function skipIntros() {
  window.dispatchEvent(new Event(SKIP_INTRO_EVENT));
}

/** Клик пришёлся в пустое место, а не по кнопке/ссылке/полю. */
export function isBareClick(target: EventTarget | null) {
  return !(target instanceof Element && target.closest("a,button,input,textarea,select,label,[role=button]"));
}
