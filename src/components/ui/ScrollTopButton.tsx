"use client";

import { useEffect, useState } from "react";
import { useFullpage } from "@/lib/fullpage";
import { useCinematicFirstId } from "@/lib/cinematic-nav";
import { useHeaderMenu } from "@/lib/header-menu";
import { scrollToDeckStart } from "@/lib/page-hop";

// Круглая кнопка «наверх» — правый верхний угол, на каждой странице сайта.
//
// Живёт в корневом layout, а не в шаблонах страниц: Егор просил её «на
// каждой странице абсолютно», а страниц четыре вида (главная, основные
// разделы, подстраницы услуг, служебные). Один экземпляр в layout закрывает
// все сразу и гарантирует, что новая страница получит кнопку без правки.
//
// Появляется после первого экрана, а не висит всегда. На первом экране ей
// нечего делать — она бы только закрывала угол шапки, где и так стоит
// заголовок. Порог — 70% высоты окна: к этому моменту первый блок уже
// уехал, и возврат становится осмысленным действием.
//
// Двойная механика возврата — потому что на сайте два разных скролла.
// Основные разделы идут на fullpage (экран за экраном, wheel перехвачен),
// и обычный window.scrollTo там ничего не сдвинет: нужно попросить сам
// fullpage встать на нулевой слайд. На обычных длинных страницах fullpage
// не смонтирован, и работает штатный плавный скролл.
export default function ScrollTopButton() {
  const [scrolled, setScrolled] = useState(false);
  const fullpage = useFullpage();
  // Основные разделы (/content, /ai, /sites, /smm) листаются своим
  // кинематографическим деком — по нему узнаём, что мы на такой странице.
  const cinematicFirstId = useCinematicFirstId();
  // `ready` — на странице действительно зарегистрированы слайды. Провайдер
  // стоит в layout всегда, поэтому сам факт контекста ещё не значит, что
  // страница листается экранами.
  const slides = fullpage?.ready ? fullpage : null;

  useEffect(() => {
    // На fullpage-странице слушать нечего: страница физически не
    // прокручивается, scrollY там всегда 0, а «где я» приходит из самого
    // fullpage — см. `shown` ниже.
    if (slides) return;
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [slides]);

  // Видимость считается на рендере, а не складывается в состояние из
  // эффекта: для fullpage это чистая производная от активного слайда, и
  // лишнее состояние здесь дало бы каскад перерисовок на каждом переходе.
  // Пока открыта шторка меню, стрелка не висит поверх её пунктов.
  const { menuOpen } = useHeaderMenu();
  const shown = !menuOpen && (slides ? slides.activeIndex > 0 : scrolled);

  const toTop = () => {
    if (slides) {
      slides.goToIndex(0);
      return;
    }
    // Страница с деком (основные разделы): в самый верх документа, к
    // общему герою с видео. Раньше кнопка вставала на первую главу и
    // посетитель застревал на блоке выбора услуг под героем — Егор
    // передумал (2026-09-28): «вверх» значит к видео, как на любом сайте.
    if (cinematicFirstId) {
      // Телефон (Егор, 2026-10-03): стрелка ведёт к первой главе страницы —
      // заголовок и под ним карусель, а не к блоку с рукой и не в шапку с
      // видео: оттуда приходилось заново листать вниз. Тот же переход, что
      // у названия страницы в шапке. Десктоп остаётся как был.
      if (window.matchMedia("(max-width: 1023px)").matches) {
        scrollToDeckStart("smooth");
        return;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Обычная длинная страница: не в абсолютный ноль, а под приклеенную
    // шапку — иначе она накрывает первую строку первого блока.
    //
    // Высота шапки не захардкожена: она разная на телефоне и на десктопе и
    // меняется при скролле, поэтому берётся с самого элемента в момент
    // клика.
    const main = document.querySelector("main");
    const header = document.querySelector("header");
    const headerH = header?.getBoundingClientRect().height ?? 0;
    const top = main ? main.getBoundingClientRect().top + window.scrollY - headerH : 0;
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Наверх"
      // Кнопка не исчезает из разметки, а гаснет и перестаёт ловить клики:
      // размонтирование дёргало бы фокус и не давало сделать плавный вход.
      //
      // Правый верхний угол ниже шапки. Вертикальный «вайб-рельс» стоит
      // справа по центру экрана (fixed right-2 top-1/2), поэтому по высоте
      // они не встречаются.
      //
      // Без кружка. Первая версия сидела в круглой стеклянной подложке той
      // же ширины, что свёрнутый вайб-рельс — Егор посмотрел и сказал
      // прямо: «убери из кружка кнопки, оставь просто пульсирующую
      // стрелочку, сейчас забирает много внимания на себя». Здесь и так уже
      // висит рельс той же формы чуть ниже — вторая круглая подложка рядом
      // читалась как повтор одного и того же элемента. Стрелка без рамки и
      // фона гораздо тише и не спорит с рельсом за внимание.
      className={`scroll-top-btn fixed right-[18px] land:right-[max(18px,calc(env(safe-area-inset-right)+0.5rem))] top-[calc(6rem+10px+var(--sat))] sm:top-[calc(70px+3.5rem+10px+var(--sat))] land:!top-[calc(5.75rem+var(--sat))] z-[64] grid h-9 w-9 place-items-center before:absolute before:-inset-1 before:content-[''] text-paper/70 transition-[opacity,transform,color] duration-500 hover:text-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange lg:top-24 ${
        shown ? "pointer-events-auto opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      {/* Пульсирует сама стрелка, а не круг: мигающая кнопка целиком
          читается как уведомление об ошибке, а подрагивающая вверх стрелка —
          как подсказка направления.

          drop-shadow вместо подложки держит стрелку видимой на любом фоне
          страницы — светлом кадре или тёмном видео — раз своего стекла под
          ней больше нет. */}
      <svg
        className="scroll-top-arrow drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
