"use client";

// Кто владеет касанием: карусель или лист страницы.
//
// На сайте три почти одинаковых обработчика полностраничной навигации —
// CinematicStage, PhotoStage и fullpage. Каждый слушает касания на всём окне и
// зовёт preventDefault на touchmove, чтобы страница не уезжала под ним.
// Побочный эффект этого вызова — браузер снимает с касания указатель и шлёт
// pointercancel: карусель, которая живёт на pointer-событиях, получает «жест
// прерван» на первом же миллиметре движения пальца, и смахивание колоды не
// работает вообще. Мышью при этом всё исправно: у мыши нет touchmove, и
// отменять нечего.
//
// Правило простое: касание, начатое на рельсе колоды, принадлежит колоде, пока
// движение горизонтальное. Как только палец явно пошёл вверх или вниз, жест
// забирает себе лист страницы — иначе с карточки нельзя было бы уехать со
// страницы.
//
// Живёт отдельным модулем именно потому, что обработчиков три: одна копия
// правила на всех, чтобы четвёртый обработчик не появился без неё, а
// существующие не разъехались между собой.

/** Рельса карусели помечает себя этим атрибутом (см. useDeckDrag в deckFan). */
export const DECK_RAIL_SELECTOR = "[data-deck-rail]";

/** На сколько пикселей вертикаль должна обогнать горизонталь, чтобы жест
 *  перестал считаться жестом колоды. */
const VERTICAL_BIAS = 6;

export type DeckGuard = ReturnType<typeof makeDeckGuard>;

export function makeDeckGuard() {
  let active = false;
  let startX = 0;
  let startY = 0;

  return {
    /** Вызывать из touchstart. */
    start(e: TouchEvent) {
      const target = e.target;
      active = target instanceof Element && !!target.closest(DECK_RAIL_SELECTOR);
      startX = e.touches[0]?.clientX ?? 0;
      startY = e.touches[0]?.clientY ?? 0;
    },
    /** Вызывать первой строкой в touchmove. `true` — выйти из обработчика, не
     *  трогая ни скролл, ни preventDefault: жест сейчас ведёт колода. */
    owns(e: TouchEvent) {
      if (!active) return false;
      const dx = Math.abs((e.touches[0]?.clientX ?? 0) - startX);
      const dy = Math.abs((e.touches[0]?.clientY ?? 0) - startY);
      if (dy > dx + VERTICAL_BIAS) {
        // Палец ушёл в вертикаль — дальше это обычный свайп по главам, и
        // отсчитывать его надо отсюда, а не от точки касания.
        active = false;
        return false;
      }
      return true;
    },
    /** Вызывать в touchend. `true` — жест так и остался жестом колоды, странице
     *  из него ничего не причитается. */
    end() {
      const wasDeck = active;
      active = false;
      return wasDeck;
    },
  };
}
