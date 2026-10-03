"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Бренд-столбик героя «Digital / AI / Creative» (Егор, 2026-09-28).
// Основа — серо-белые слова и тонкое «AI» в фирменном градиенте. По кругу
// надпись ненадолго перевоплощается в один из эффектов и возвращается к
// основе: основа → контур → основа → хром → … Основа и эффект — разные
// слои, которые плавно перетекают друг в друга (класс fx-on). Сами эффекты —
// в globals.css по атрибуту data-fx.
// Только эффекты, которые не меняют размер, положение и наклон букв —
// «разлёт» и «скорость» Егор убрал (2026-09-28).
const FX = ["outline", "chrome", "glitch", "dots", "scan"] as const;
const BASE_MS = 3000;
const FX_MS = 2600;
const FADE_MS = 900;

export default function HeroWordmark({ shown }: { shown: object | undefined }) {
  const reduced = useReducedMotion();
  const [fx, setFx] = useState<string>("");
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (reduced) return;
    // Смена стилей идёт на всех устройствах, и на телефоне тоже (Егор,
    // 2026-10-03: «на мобильном такая же анимация, как на компьютере»): шапка
    // — исключение из облегчения, а слои эффекта — это прозрачность и
    // фон текста, без фильтров и размытия.
    let i = 0;
    let timer = 0;
    // Основа держится BASE_MS → слой эффекта наплывает (0.9 с) и держится
    // FX_MS → уплывает обратно в основу. Стиль эффекта меняется только пока
    // его слой невидим, поэтому смена никогда не видна скачком.
    const showFx = () => {
      setFx(FX[i++ % FX.length]);
      timer = window.setTimeout(() => {
        setOn(true);
        timer = window.setTimeout(hideFx, FADE_MS + FX_MS);
      }, 60);
    };
    const hideFx = () => {
      setOn(false);
      timer = window.setTimeout(showFx, FADE_MS + BASE_MS);
    };
    timer = window.setTimeout(showFx, BASE_MS);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={shown ? { opacity: 1, x: 0 } : undefined}
      transition={{ duration: 0.8, delay: 0 }}
      className={`hero-wm font-display uppercase${on ? " fx-on" : ""}`}
      data-fx={fx || undefined}
      aria-label="Digital AI Creative"
      role="img"
    >
      {(["Digital", "AI", "Creative"] as const).map((w, i) => (
        <span
          key={w}
          aria-hidden="true"
          className={`hero-wm-word${w === "AI" ? " is-ai" : ""}`}
          style={{ "--wm-i": i } as CSSProperties}
        >
          <span className="hero-wm-base">{w}</span>
          <span className="hero-wm-fill">{w}</span>
          <span className="hero-wm-line">{w}</span>
        </span>
      ))}
    </motion.div>
  );
}
