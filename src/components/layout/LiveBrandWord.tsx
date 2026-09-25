"use client";

import { useEffect, useRef } from "react";

// «.SERVICE» в шапке — живой градиент (идея Егора): пока человек двигает
// мышь, листает или меняет блоки, наклонный градиент из всех фирменных
// цветов медленно течёт по буквам; как только движение прекратилось,
// поток за ~полсекунды мягко тормозит и замирает на том месте, где
// остановился. Следующее движение — снова плавно разгоняется.
//
// Почему JS, а не CSS-анимация: CSS умеет только «играть/пауза» рывком,
// а нужно плавное торможение и продолжение с того же места.

const PERIOD = 600; // длина одного круга цветов вдоль наклона, px — Егор попросил растянуть вдвое, чтобы не было «радуги»
const ANGLE = 115; // наклон градиента, градусы
const SPEED = 34; // px/с — медленно, чтобы это было «переливание», а не бег
const IDLE_MS = 140; // столько тишины — и начинаем тормозить
const EASE = 0.16; // постоянная времени разгона/торможения, с (≈0.5 с до полной остановки)

// Фирменные цвета сайта по кругу; первый повторён в конце, чтобы круг
// замыкался без шва.
const COLORS = ["#10b981", "#00d2ff", "#a855f7", "#ff4fd8", "#ff6a3d", "#ffc53d", "#7cf2b0", "#10b981"];

export default function LiveBrandWord({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Горизонтальный период наклонного повторяющегося градиента: сдвиг
    // фона ровно на него даёт ту же картинку — поэтому круг бесконечный.
    const hPeriod = PERIOD / Math.abs(Math.sin((ANGLE * Math.PI) / 180));
    el.style.backgroundImage = `repeating-linear-gradient(${ANGLE}deg, ${COLORS.map((c, i) => `${c} ${Math.round((i / (COLORS.length - 1)) * PERIOD)}px`).join(", ")})`;
    el.style.backgroundSize = `calc(100% + ${Math.ceil(hPeriod)}px) 100%`;
    el.style.backgroundRepeat = "no-repeat";

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let offset = 0;
    let speed = 0;
    let lastActivity = -Infinity;
    let last = 0;
    let raf = 0;

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      const target = now - lastActivity < IDLE_MS ? 1 : 0;
      speed += (target - speed) * (1 - Math.exp(-dt / EASE));
      offset = (offset + speed * SPEED * dt) % hPeriod;
      el.style.backgroundPosition = `${-offset}px 0`;
      if (target === 0 && speed < 0.002) {
        speed = 0;
        raf = 0;
        last = 0;
        return; // замерли — цикл спит до следующего движения
      }
      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      lastActivity = performance.now();
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const events = ["pointermove", "wheel", "scroll", "touchmove", "keydown", "pointerdown"] as const;
    events.forEach((e) => window.addEventListener(e, wake, { passive: true, capture: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, wake, { capture: true }));
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <span ref={ref} className="brand-word brand-word-live">
      {children}
    </span>
  );
}
