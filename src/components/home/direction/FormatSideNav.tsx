"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { NeonChevron } from "@/components/home/ServicePicker";
import { PAGE_GRADIENT } from "@/components/home/PageSideNav";
import type { ServiceKey } from "@/lib/service-content";
import { siblingsOf } from "./siblings";

// Боковые стрелки на подстранице услуги: влево — предыдущий формат
// раздела, вправо — следующий, по кругу.
//
// Тот же жест, что и на четырёх основных страницах (PageSideNav), и тот же
// вид — но без карточки. Первая правка сняла обводку и заменила круглую
// кнопку на NeonChevron; вторая, эта, убирает и стеклянную подложку,
// которая появлялась вокруг стрелки на ховере. Егор посмотрел и сказал
// прямо: «кнопку выводить не нужно, сейчас это криво и как-то багнуто
// выглядит» — на подстраницах нужен голый неоновый жест, без единой рамки
// или плашки под ним. При наведении должно происходить ровно две вещи:
// подпись соседней страницы вылетает и светится неоном, и сама стрелка
// становится ярче. Никакого фона, бордера или blur вокруг них быть не
// должно.
//
// Почему копия разметки, а не общий компонент с PageSideNav: у того
// цель — четыре страницы разделов, он сам вычисляет соседа из
// serviceOrder и сам решает, показываться ли (TOP_LEVEL_ROUTES). Здесь
// кольцо другое — форматы внутри одного раздела (siblings.ts). Общей
// осталась визуальная часть: глиф, пульсация и градиент подписи — он
// берётся из одной и той же PAGE_GRADIENT.
//
// Стрелки закреплены на экране, а не стоят в шапке: Егор описал их как
// доступные, «пока я листаю всю эту страницу». В шапке они уехали бы
// вверх после первого экрана, и переключиться на соседний формат из
// середины страницы стало бы нельзя.
export default function FormatSideNav({
  section,
  slug,
}: {
  /** Раздел: content, sites, smm, ai. */
  section: string;
  /** Сегмент текущей страницы внутри раздела. */
  slug: string;
}) {
  const pair = siblingsOf(section, slug);
  if (!pair) return null;

  return (
    <>
      <SideArrow side="left" section={section} href={pair.prev.href} label={pair.prev.label} />
      <SideArrow side="right" section={section} href={pair.next.href} label={pair.next.label} />
    </>
  );
}

function SideArrow({
  side,
  section,
  href,
  label,
}: {
  side: "left" | "right";
  section: string;
  href: string;
  label: string;
}) {
  const isLeft = side === "left";
  // Подпись красится градиентом СВОЕГО раздела, а не страницы-цели: внутри
  // раздела все форматы делят один цвет, и подкрашивать соседа иначе
  // значило бы обещать переход в другой раздел.
  const gradient = PAGE_GRADIENT[section as ServiceKey] ?? PAGE_GRADIENT.content;

  const gradientStyle = {
    backgroundImage: gradient.via
      ? `linear-gradient(90deg, ${gradient.from} 0%, ${gradient.via} 55%, ${gradient.to} 100%)`
      : `linear-gradient(90deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    WebkitTextFillColor: "transparent",
    filter: `drop-shadow(0 0 6px ${gradient.from}aa) drop-shadow(0 0 16px ${gradient.to}99)`,
  } as const;

  return (
    // Показывается и на телефоне, в отличие от PageSideNav на основных
    // страницах (тот скрыт до sm). Причина в том, что здесь стрелка —
    // единственный способ попасть к соседнему формату, не возвращаясь в
    // раздел: на основной странице внизу лежит сама карусель, и на телефоне
    // соседей листают ею. Позиция bottom-24 держит стрелки над тумблером
    // вайб-рельса (fixed bottom-6 right-6, 48x48) с запасом.
    //
    // На телефоне стрелка ужата до 36x36 и прижата к самому краю (left-0),
    // а не отставлена от него: боковой отступ контента здесь всего 24px, и
    // хитбокс 44x44 с отступом 8px ложился поверх левого края «Получить
    // смету» — то есть перехватывал бы нажатия по главной кнопке страницы.
    //
    // Габарит ссылки — сам шеврон, ничего больше. Подпись лежит абсолютно
    // и с `pointer-events-none`, поэтому в покое элемент занимает 44x44 у
    // самого края экрана и не перехватывает клики по содержимому страницы
    // под собой. Никакого визуального фона у самой ссылки нет — только
    // глиф и (на ховере) текст рядом с ним.
    <Link
      href={href}
      aria-label={`${isLeft ? "Предыдущий" : "Следующий"} формат: ${label}`}
      className={`group fixed bottom-24 z-[63] flex h-9 w-9 items-center justify-center transition-transform duration-300 active:scale-90 active:duration-100 sm:h-11 sm:w-11 ${
        isLeft ? "left-0 sm:left-3 xl:left-6" : "right-0 sm:right-3 xl:right-6"
      }`}
      // Цвет ховер-пульсации — те же две точки градиента, что красят
      // подпись; выставлены один раз здесь как CSS-переменные и наследуются
      // и шевроном, и подписью (см. .format-nav-pulse в globals.css).
      style={{ "--pulse-a": gradient.from, "--pulse-b": gradient.to } as CSSProperties}
    >
      {/* Дышит в покое (.page-nav-arrow-pulse); на ховере не просто
          замирает на максимуме, а начинает пульсировать ярче и чаще
          (.format-nav-pulse) — Егор попросил прямо: «при наведении и
          название и стрелка ярко пульсировали». Никакой рамки или
          подложки вокруг неё нет: светится только сам глиф. */}
      <span className="page-nav-arrow-pulse format-nav-pulse relative transition-opacity duration-300">
        <NeonChevron flip={isLeft} className="h-9 w-9 sm:h-11 sm:w-11" />
      </span>

      {/* Название соседнего формата — сбоку от стрелки, а не под ней.
          Первая версия ставила подпись строкой ниже (top-full); Егор
          поправил: «название... не должно быть снизу, а должно быть
          сбоку от стрелки, так будет красивее». Стрелка стоит у самого
          края экрана, поэтому «сбоку» может быть только внутрь страницы —
          левая стрелка раскрывает подпись справа от себя, правая слева.
          В покое подпись сдвинута под стрелку и невидима; на ховере
          выезжает вбок и проявляется неоновым свечением — «вылетает», а
          не просто появляется. Абсолютное и без событий мыши — не растит
          зону клика и не закрывает текст под собой. */}
      <span
        className={`pointer-events-none absolute top-1/2 w-28 -translate-y-1/2 opacity-0 transition-all duration-300 ease-out group-hover:opacity-100 ${
          isLeft
            ? "left-full ml-3 translate-x-1 text-left group-hover:translate-x-0"
            : "right-full mr-3 -translate-x-1 text-right group-hover:translate-x-0"
        }`}
      >
        <span
          className="format-nav-pulse font-display text-[10px] uppercase leading-[1.15] tracking-tight"
          style={gradientStyle}
        >
          {label}
        </span>
      </span>
    </Link>
  );
}
