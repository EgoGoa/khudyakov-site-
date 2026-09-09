"use client";

import Link from "next/link";
import { NeonChevron } from "@/components/home/ServicePicker";
import { PAGE_GRADIENT } from "@/components/home/PageSideNav";
import type { ServiceKey } from "@/lib/service-content";
import { siblingsOf } from "./siblings";

// Боковые стрелки на подстранице услуги: влево — предыдущий формат
// раздела, вправо — следующий, по кругу.
//
// Это тот же жест, что и на четырёх основных страницах (PageSideNav), и
// теперь буквально тот же вид. Первая версия рисовала стрелку по образцу
// кнопок карусели — шеврон в круге с обводкой и полупрозрачной подложкой;
// Егор попросил ровно обратного: «такие же, как на основных страницах —
// неоновые и без обводки, и так же пульсировали». Поэтому здесь стоит
// NeonChevron и класс `.page-nav-arrow-pulse` из globals.css, а не
// собственная кнопка в круге.
//
// Почему копия разметки, а не общий компонент с PageSideNav: у того
// цель — четыре страницы разделов, он сам вычисляет соседа из
// serviceOrder и сам решает, показываться ли (TOP_LEVEL_ROUTES). Здесь
// кольцо другое — форматы внутри одного раздела (siblings.ts). Общей
// осталась вся визуальная часть: глиф, пульсация, стеклянная карточка на
// ховере и градиент подписи — он берётся из одной и той же PAGE_GRADIENT.
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
    filter: `drop-shadow(0 0 6px ${gradient.from}77) drop-shadow(0 0 14px ${gradient.to}77)`,
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
    // кнопка 44x44 с отступом 8px ложилась поверх левого края «Получить
    // смету» — то есть перехватывала бы нажатия по главной кнопке страницы.
    // У края от неё остаётся только скруглённый угол пилюли.
    //
    // Габарит ссылки — сам шеврон, ничего больше. Стеклянная карточка и
    // подпись лежат абсолютно и с `pointer-events-none`, поэтому в покое
    // элемент занимает 44x44 у самого края экрана и не перехватывает клики
    // по содержимому страницы под собой. Ровно та же причина, по которой
    // так устроен PageSideNav.
    <Link
      href={href}
      aria-label={`${isLeft ? "Предыдущий" : "Следующий"} формат: ${label}`}
      className={`group fixed bottom-24 z-[63] flex h-9 w-9 items-center justify-center transition-transform duration-300 active:scale-90 active:duration-100 sm:h-11 sm:w-11 ${
        isLeft ? "left-0 sm:left-3 xl:left-6" : "right-0 sm:right-3 xl:right-6"
      }`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-4 -top-3 -bottom-12 rounded-2xl border border-paper/10 bg-ink/70 opacity-0 shadow-[0_0_20px_rgba(255,79,216,0.45),0_0_38px_rgba(255,106,61,0.32)] backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100"
      />

      {/* Дышит в покое (.page-nav-arrow-pulse) и замирает на полной яркости
          под курсором: когда на стрелку уже смотрят, движущаяся
          прозрачность только мешает. */}
      <span className="page-nav-arrow-pulse relative transition-opacity duration-300">
        <NeonChevron flip={isLeft} className="h-9 w-9 sm:h-11 sm:w-11" />
      </span>

      {/* Название соседнего формата. Абсолютное и без событий мыши — не
          растит зону клика и не закрывает текст под собой. Слова в столбик:
          подписи здесь длиннее, чем у разделов («Презентационные фильмы»),
          и одной строкой такая ушла бы за край экрана.

          Прижата к своей стороне, а не отцентрована под шевроном, как в
          PageSideNav: там подписи — одно-два коротких слова, а тут блок
          шириной 96px, отцентрованный по стрелке у самого края, вылезал
          за границу экрана и обрезался. */}
      <span
        className={`pointer-events-none absolute top-full mt-1 w-32 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
          isLeft ? "left-0" : "right-0"
        }`}
      >
        <span className="block text-center font-display text-[10px] uppercase leading-[1.05] tracking-tight">
          {label.split(" ").map((word, i) => (
            <span key={i} className="block" style={gradientStyle}>
              {word}
            </span>
          ))}
        </span>
      </span>
    </Link>
  );
}
