"use client";

import { useRef, type ReactNode } from "react";
import { useInView } from "framer-motion";
import { ChapterActiveProvider } from "@/components/ui/Appear";

// Мост между общесайтовой механикой появления и обычным длинным скроллом.
//
// На /content, /ai, /sites и /smm элементы появляются через <Appear>, а тот
// смотрит на контекст «эта глава сейчас на сцене» — его выставляет
// приколотый дек CinematicStage. На странице направления дека нет, поэтому
// вместо изобретения второй системы анимации этот компонент выставляет тот
// же самый контекст по попаданию блока в экран.
//
// В итоге вся хореография — задержки BEAT, длительности DUR, вход с
// размытием, направления входа — буквально общая с основными страницами,
// отличается только триггер. Именно этого просил Егор: одна механика везде,
// без параллельных решений.
//
// `once: false`: блок проигрывает вход каждый раз, когда возвращается в
// экран — как глава на основных страницах, которая переигрывает вход при
// повторном заходе. `margin` держит нижнюю границу выше края экрана, чтобы
// анимация начиналась, когда блок уже виден, а не в момент, когда его
// верхний пиксель только выглянул снизу.
export default function SectionStage({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: false, margin: "-12% 0px -18% 0px" });

  return (
    <section ref={ref} id={id} className={className}>
      <ChapterActiveProvider active={inView}>{children}</ChapterActiveProvider>
    </section>
  );
}
