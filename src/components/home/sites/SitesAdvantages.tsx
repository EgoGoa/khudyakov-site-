"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useChapterActive } from "@/components/ui/Appear";

// Преимущества заказа сайта у нас — три «слайда» разной формы и разного
// смысла, плавно сменяют друг друга справа от телефона (глава 02 /sites,
// Егор, 2026-10-03). Все три — про нас, но каждый про своё:
//   1. скорость / код / дизайн — три крупных слова;
//   2. срок — одна цифра и шкала до запуска;
//   3. надёжность — три плашки с гарантиями.
// Тексты взяты из того, что страница уже обещает (SitesGuarantees, FAQ,
// сравнительная таблица), без новых обещаний.
//
// Цена по ресурсам: смена — только opacity (композитится без перерисовки),
// один таймер на весь блок, и тот стоит, пока глава не на сцене, вкладка
// скрыта или включено «меньше движения». Слайды лежат стопкой в одной ячейке
// сетки, поэтому высота блока = самый высокий слайд, и вёрстка вокруг не
// прыгает при смене. Размеры шрифта идут от ширины самого блока (cqw), так
// что он сам ужимается в узкую колонку и никого не теснит.

const GRAD = "bg-gradient-to-r from-[#ff7a45] via-[#ff4fa3] to-[#8a8cff] bg-clip-text text-transparent";
const INTERVAL = 5600;

const BIG_WORDS = [
  { word: "Дни", note: "а не месяцы разработки", line: "#ff7a45" },
  { word: "Свой код", note: "сайт принадлежит вам", line: "#ff4fa3" },
  { word: "Не шаблон", note: "дизайн под вашу задачу", line: "#8a8cff" },
];

const PLATES = [
  { title: "Гарантия возврата", note: "Не понравится — вернём деньги", icon: "M12 3 4 6v6c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6l-8-3Zm-1.2 12-3-3 1.4-1.4 1.6 1.6 4-4 1.4 1.4-5.4 5.4Z" },
  { title: "Люди отвечают", note: "AI ускоряет, команда проверяет", icon: "M16 11a3 3 0 1 0-2.9-3.7A3 3 0 0 0 16 11ZM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2c-2.7 0-6 1.3-6 4v2h12v-2c0-2.7-3.3-4-6-4Zm8 0c-.3 0-.7 0-1 .1 1.2.9 2 2.1 2 3.9v2h6v-2c0-2.7-3.3-4-7-4Z" },
  { title: "Дата запуска", note: "Известна с первого дня", icon: "M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm-2 8h14v10H5V10Z" },
];

function WordsSlide() {
  return (
    <div className="space-y-[5cqw]">
      {BIG_WORDS.map((w) => (
        <div key={w.word} className="border-l-2 pl-[5cqw]" style={{ borderColor: w.line }}>
          <div className={`font-display text-[clamp(1.1rem,11.5cqw,1.75rem)] font-extrabold uppercase leading-[1.05] tracking-tight ${GRAD}`}>
            {w.word}
          </div>
          <div className="mt-1 font-sans text-[clamp(0.62rem,4.7cqw,0.78rem)] font-bold uppercase leading-snug tracking-[0.04em] text-white">
            {w.note}
          </div>
        </div>
      ))}
    </div>
  );
}

function TermSlide() {
  return (
    <div>
      <div className="font-sans text-[clamp(0.6rem,4.4cqw,0.75rem)] font-extrabold uppercase tracking-[0.2em] text-white">
        Лендинг
      </div>
      <div className={`mt-1 font-display text-[clamp(2rem,23cqw,3.4rem)] font-extrabold uppercase leading-none tracking-tight ${GRAD}`}>
        5 дней
      </div>
      <div className="mt-2 font-sans text-[clamp(0.62rem,4.7cqw,0.78rem)] font-bold uppercase leading-snug tracking-[0.04em] text-white">
        от брифа до запуска
      </div>
      {/* Шкала: пять точек на одной линии — плоская, без анимации. */}
      <div className="mt-[7cqw] flex items-center">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="contents">
            <span className="h-[3cqw] min-h-[9px] w-[3cqw] min-w-[9px] shrink-0 rounded-full bg-gradient-to-br from-[#ff7a45] to-[#ff4fa3]" />
            {i < 4 && <span className="h-[2px] flex-1 bg-gradient-to-r from-[#ff4fa3] to-[#8a8cff] opacity-80" />}
          </span>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between font-sans text-[clamp(0.55rem,3.8cqw,0.66rem)] font-bold uppercase tracking-[0.08em] text-white">
        <span>Бриф</span>
        <span>Запуск</span>
      </div>
    </div>
  );
}

function PlatesSlide() {
  return (
    <div className="space-y-[3cqw]">
      {PLATES.map((p) => (
        <div
          key={p.title}
          className="flex items-center gap-[4cqw] rounded-2xl bg-white/[0.06] px-[4cqw] py-[3cqw] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
        >
          <span className="grid h-[11cqw] min-h-8 w-[11cqw] min-w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#ff7a45] via-[#ff4fa3] to-[#8a8cff]">
            <svg viewBox="0 0 24 24" className="h-[50%] w-[50%] fill-white" aria-hidden="true">
              <path d={p.icon} />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block font-display text-[clamp(0.7rem,5.2cqw,0.86rem)] font-extrabold uppercase leading-tight tracking-tight text-white">
              {p.title}
            </span>
            <span className="mt-0.5 block font-sans text-[clamp(0.6rem,4.4cqw,0.74rem)] font-semibold leading-snug text-white">
              {p.note}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

const SLIDES: ReactNode[] = [<WordsSlide key="w" />, <TermSlide key="t" />, <PlatesSlide key="p" />];

export default function SitesAdvantages({ className = "" }: { className?: string }) {
  const chapterActive = useChapterActive();
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      mq.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    if (!chapterActive || !visible || still) return;
    const t = window.setTimeout(() => setIdx((i) => (i + 1) % SLIDES.length), INTERVAL);
    return () => window.clearTimeout(t);
  }, [idx, chapterActive, visible, still]);

  return (
    <div className={`@container ${className}`} style={{ containerType: "inline-size" }}>
      <div className="grid">
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            aria-hidden={i !== idx}
            className={`col-start-1 row-start-1 self-center transition-opacity duration-700 ease-out ${
              i === idx ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {slide}
          </div>
        ))}
      </div>
      <div className="mt-[6cqw] flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Преимущество ${i + 1}`}
            onClick={() => setIdx(i)}
            className={`h-1 rounded-full transition-all duration-500 ${i === idx ? "w-6 bg-white" : "w-2 bg-white/35"}`}
          />
        ))}
      </div>
    </div>
  );
}
