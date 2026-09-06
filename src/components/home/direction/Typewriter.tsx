"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useChapterActive } from "@/components/ui/Appear";

// Печатающийся заголовок — ровно один на страницу.
//
// Егор выбрал «один блок на страницу, разный»: на каждой странице печатается
// свой элемент, а не все подряд. Мигающий курсор в пяти местах читается как
// шум, один — как акцент.
//
// Печать стартует не по маунту, а по попаданию блока в экран — берём тот же
// признак «блок на сцене», что и все остальные анимации на странице (см.
// SectionStage). Иначе текст напечатается, пока посетитель ещё листает
// первый экран, и до него доедет уже готовая строка.
//
// В `prefers-reduced-motion` строка выводится целиком без анимации: эффект
// печати — это движение, а не содержание, и терять смысл он не должен.
export default function Typewriter({
  text,
  className = "",
  /** Секунд на символ. 0.045 ≈ 22 знака в секунду — быстрее живой печати,
   *  но глаз ещё успевает читать по мере появления. */
  speed = 0.045,
  /** Задержка перед первым символом, чтобы печать начиналась после того,
   *  как блок долетел до места. Совпадает с DIRECTION_BEAT.title. */
  delay = 0.35,
}: {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}) {
  const active = useChapterActive();
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduced || !active) return;

    let frame = 0;
    // Сброс живёт внутри таймаута, а не в теле эффекта: синхронный setState
    // при монтировании запускает лишний каскад рендеров (и справедливо
    // ругается линтер), а здесь он всё равно нужен ровно перед стартом
    // печати.
    const start = window.setTimeout(() => {
      setCount(0);
      frame = window.setInterval(() => {
        setCount((c) => {
          if (c >= text.length) {
            window.clearInterval(frame);
            return c;
          }
          return c + 1;
        });
      }, speed * 1000);
    }, delay * 1000);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(frame);
    };
  }, [active, reduced, text, speed, delay]);

  if (reduced) return <span className={className}>{text}</span>;

  // Пока блок не на сцене — строка пустая, без записи этого в состояние.
  const shown = active ? count : 0;
  const done = shown >= text.length;

  return (
    <span className={className}>
      {/* Полная строка лежит невидимой распоркой: без неё блок под
          заголовком дёргается вверх-вниз на каждом символе, потому что
          число строк меняется по мере печати. */}
      <span className="invisible" aria-hidden="true">
        {text}
      </span>
      <span className="absolute inset-0">
        {text.slice(0, shown)}
        <span
          className={`ml-[0.06em] inline-block w-[0.06em] self-stretch bg-orange align-[-0.05em] ${
            done ? "animate-pulse" : ""
          }`}
          style={{ height: "0.82em" }}
          aria-hidden="true"
        />
      </span>
    </span>
  );
}
