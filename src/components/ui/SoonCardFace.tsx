"use client";
// Лицо карточки «скоро» в конце каруселей /sites, /ai, /smm.
//
// Стиль вводных окон (WelcomeIntro, макет v6): графитовая плитка, фирменный
// градиент на цифре, стеклянная метка. Карточка никуда не ведёт — показывает,
// что формат собирается. Когда карточка становится передней, процент
// «загружается» с нуля до своего значения, а метка «Скоро» пульсирует
// (только масштабом — свечение box-shadow даёт прямоугольные рамки).
import { useEffect, useState, type CSSProperties } from "react";

export type SoonVariant = "bento" | "ring" | "steps";

const LOAD_MS = 2400;

export default function SoonCardFace({
  percent,
  accent,
  live,
  image,
  variant = "bento",
}: {
  percent: number;
  /** Цвет страницы: "r, g, b". */
  accent: string;
  /** Загрузка и пульс идут только у передней карточки. */
  live: boolean;
  /** Кадр-подложка, как у остальных карточек колоды. */
  image: string;
  variant?: SoonVariant;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!live) {
      setV(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(percent);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / LOAD_MS);
      setV(Math.round(percent * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live, percent]);

  const R = 40;
  const C = 2 * Math.PI * R;
  const lit = Math.round((v / 100) * 5);

  return (
    <div
      className={`soon-face soon-v-${variant} ${live ? "is-live" : ""}`}
      style={{ "--soon-rgb": accent, "--soon-p": `${v}%` } as CSSProperties}
    >
      <img src={image} alt="" aria-hidden="true" loading="lazy" className="soon-photo" />
      <span className="soon-scrim" aria-hidden="true" />

      {variant === "ring" && (
        <div className="soon-ringwrap">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
            <circle
              cx="50" cy="50" r={R} fill="none" stroke="url(#soon-g)" strokeWidth="5" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - v / 100)} transform="rotate(-90 50 50)"
            />
            <defs>
              <linearGradient id="soon-g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#f5310b" />
                <stop offset="0.55" stopColor="#ec4899" />
                <stop offset="1" stopColor={`rgb(${accent})`} />
              </linearGradient>
            </defs>
          </svg>
          <div className="soon-num soon-num--ring">
            {v}
            <small>%</small>
          </div>
        </div>
      )}

      {variant !== "ring" && (
        <div className="soon-num">
          {v}
          <small>%</small>
        </div>
      )}

      {variant === "bento" && (
        <div className="soon-bento" aria-hidden="true">
          <b style={{ gridColumn: "1 / 3", ["--d" as string]: "0s" }} />
          <b style={{ ["--d" as string]: "0.5s" }} />
          <b style={{ ["--d" as string]: "1s" }} />
          <b style={{ gridColumn: "1 / 3", ["--d" as string]: "1.5s" }} />
          <span className="soon-beam" />
        </div>
      )}

      {variant === "steps" && (
        <div className="soon-steps" aria-hidden="true">
          {["Идея", "Дизайн", "Сборка", "Тесты", "Запуск"].map((s, i) => (
            <div key={s} className={i < lit ? "is-on" : ""}>
              <i />
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}

      {variant !== "steps" && (
        <div className="soon-bar" aria-hidden="true">
          <i />
        </div>
      )}
    </div>
  );
}
