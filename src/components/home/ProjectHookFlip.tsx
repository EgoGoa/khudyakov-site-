"use client";
// «Крючок» на карточке Егора в первом блоке /content: каждые шесть секунд она
// переворачивается по вертикали и показывает «Ваш проект в работе — 97%»
// того же размера и на том же месте. Клик по любой из сторон делает то же,
// что карточка Егора (открывает чат) — это решает родитель, сюда приходит
// только вид. Пока курсор над карточкой, она стоит лицом Егора, чтобы по ней
// можно было спокойно кликнуть.
import { useEffect, useRef, useState, type ReactNode } from "react";

const FLIP_MS = 6000;
const COUNT_MS = 900;

export default function ProjectHookFlip({
  front,
  percent = 97,
}: {
  front: ReactNode;
  percent?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [hover, setHover] = useState(false);
  const [back, setBack] = useState(false);
  const [v, setV] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!inView || hover || reduced) {
      setBack(false);
      return;
    }
    const t = setInterval(() => setBack((b) => !b), FLIP_MS);
    return () => clearInterval(t);
  }, [inView, hover, reduced]);

  // Процент «догружается» каждый раз, когда карточка показывает эту сторону.
  useEffect(() => {
    if (!back) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / COUNT_MS);
      setV(Math.round(percent * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [back, percent]);

  return (
    <div
      ref={ref}
      className="relative h-full [perspective:1100px]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="relative h-full transition-transform duration-[700ms] ease-[cubic-bezier(0.45,0.05,0.2,1)] [transform-style:preserve-3d] motion-reduce:transition-none"
        style={{ transform: back ? "rotateX(180deg)" : "none" }}
      >
        <div className="h-full [backface-visibility:hidden]">{front}</div>
        <div
          aria-hidden={!back}
          className="project-hook absolute inset-0 flex items-center gap-4 overflow-hidden rounded-2xl px-5 [backface-visibility:hidden] [transform:rotateX(180deg)]"
        >
          <div className="flex shrink-0 flex-col items-start gap-1.5">
            <div className="project-hook-num">
              {v}
              <small>%</small>
            </div>
            <span className="font-display text-[9px] uppercase tracking-[0.16em] text-paper/70">готовность</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="m-0 font-display text-sm uppercase leading-[1.15] tracking-tight text-white sm:text-base">
              Ваш проект в работе
            </p>
            <div className="project-hook-bar mt-3" aria-hidden="true">
              <i style={{ width: `${v}%` }} />
            </div>
          </div>
          <span aria-hidden="true" className="text-2xl text-orange">
            →
          </span>
        </div>
      </div>
    </div>
  );
}
