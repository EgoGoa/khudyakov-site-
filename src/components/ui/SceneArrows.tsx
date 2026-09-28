"use client";

/** Стрелки «назад / вперёд» поверх анимационной сцены в окнах (окна
 *  команды, окошки услуг). Стоят в нижних углах окошка со сценой, а не за рамкой
 *  окна: так видно, что сцены листаются, и на телефоне тоже. Родитель
 *  должен быть `relative`. */
export default function SceneArrows({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <>
      <button type="button" aria-label="Предыдущая сцена" onClick={onPrev} className="scene-arrow scene-arrow-prev">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <button type="button" aria-label="Следующая сцена" onClick={onNext} className="scene-arrow scene-arrow-next">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </>
  );
}
