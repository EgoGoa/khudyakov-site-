"use client";

import { useEffect } from "react";

// Останавливает CSS-анимации в секциях, которых нет на экране.
//
// Зачем. На странице направления одновременно крутится ~46 бесконечных
// анимаций, и 38 из них (83%) приходятся на блоки далеко за пределами
// экрана. Почти все они анимируют `box-shadow` (team-photo-pulse,
// btn-neon-breathe, consult-card-pulse, process-step-sequential-glow) —
// свойство, которое браузер не умеет отдать видеокарте и пересчитывает
// заново на каждом кадре. Пока блок за экраном, эта работа не даёт
// ничего, кроме просадки FPS на том блоке, который посетитель реально
// читает.
//
// Почему именно пауза, а не `content-visibility: auto`. Тот вариант
// сильнее — он пропускает и layout, и отрисовку, — но включает paint
// containment, а фон блока в BlockMedia намеренно вылезает за границы
// своей секции (top/bottom: -OVERFLOW плюс альфа-маска), чтобы соседние
// блоки перетекали друг в друга. Containment обрезал бы этот вылет и
// вернул видимые стыки между блоками — ровно то, что Егор просил убрать.
// Пауза анимации такого побочного эффекта не даёт.
//
// Почему пауза, а не остановка. `animation-play-state: paused` замораживает
// анимацию на текущем кадре, и при возвращении в экран она продолжается с
// того же места, а не дёргается с нуля.
//
// Наблюдатель один на всю страницу и следит за <section> — это и блоки
// направлений (SectionStage), и секции главных страниц. `rootMargin` даёт
// запас в пол-экрана, чтобы анимация успела ожить до того, как блок
// реально появится в кадре.
export default function OffscreenAnimationPause() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("anim-offscreen", !entry.isIntersecting);
        }
      },
      { rootMargin: "50% 0px 50% 0px" }
    );

    let known = 0;
    const observe = () => {
      const sections = document.querySelectorAll("section");
      if (sections.length === known) return;
      known = sections.length;
      for (const section of sections) observer.observe(section);
    };
    observe();

    // Секции приезжают и после первого рендера (переход между страницами,
    // подгрузка блока), поэтому список надо пересобирать.
    //
    // Но НЕ через MutationObserver по всему поддереву: framer-motion
    // переписывает инлайновые стили анимируемых элементов на каждом кадре,
    // так что такой наблюдатель срабатывает десятки раз в секунду и сам
    // становится источником тормозов — замер показал, что он съедал больше,
    // чем экономила пауза анимаций. Редкий опрос дешевле: новые секции
    // появляются только при навигации, задержка в пару секунд незаметна, а
    // выход из цикла по неизменившемуся количеству делает проверку почти
    // бесплатной.
    const poll = window.setInterval(observe, 2000);

    return () => {
      observer.disconnect();
      window.clearInterval(poll);
    };
  }, []);

  return null;
}
