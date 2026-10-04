"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { modIndex, useDeckDrag, useDeckSpring, wrapOffset } from "@/components/ui/deckFan";
import { PAGE_GRADIENT } from "@/components/home/PageSideNav";
import { BOOT, useBootStage } from "@/lib/boot-sequence";
import { PROMOS, PROMO_BADGE, discountOf, type PromoSection } from "@/lib/promos";

// Акции в шапке главной (Егор, 2026-10-03): лента-карусель по центру внизу
// шапки, как плеер на его референсе — крупная карточка в центре, по бокам
// меньшие и чуть развёрнутые. Все 8 акций по кругу вперемешку, смена раз в
// 3 секунды, карточки плавно заезжают друг за другом.
//
// Листание рукой (Егор, 2026-10-04): карусель ведётся пальцем и мышью тем же
// жестом, что колоды на страницах услуг (useDeckDrag + пружина useDeckSpring
// из deckFan): карточки едут за рукой один в один, короткий смах листает,
// бросок доносит инерцией. Позы считаются из непрерывного положения, а не из
// целых смещений, поэтому CSS-переходы у карточек выключены.
//
// Почти без нагрузки на процессор:
//   · часы — CSS-анимация полоски-таймера, а не setInterval: её конец
//     (onAnimationEnd) листает ленту. Пауза при наведении — одна строка CSS,
//     а под полноэкранными окнами сайт и так ставит все анимации на паузу;
//   · анимируются только transform и opacity, без размытия и теней;
//   · картинки у карточек, которые не видны, не грузятся.

const SECTION_LABEL: Record<PromoSection, string> = {
  content: "Контент",
  ai: "AI",
  sites: "Сайты",
  smm: "SMM",
};

// Положение карточки по модулю смещения от центра: сдвиг в px, масштаб,
// поворот, прозрачность и размытие (как у колод на страницах услуг).
// Егор, 2026-10-03: из-под передней карточки виден только край соседней
// (~30%), за ней — следующие; ярко светится одна передняя.
const STEPS = [
  { x: 0, s: 1, r: 0, a: 1, b: 0 },
  { x: 76, s: 0.84, r: 9, a: 0.5, b: 1.5 },
  { x: 122, s: 0.7, r: 14, a: 0.3, b: 2.5 },
  { x: 148, s: 0.58, r: 18, a: 0, b: 2.5 },
  { x: 160, s: 0.5, r: 20, a: 0, b: 2.5 },
];

function shuffled(n: number) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Поза карточки по непрерывному расстоянию от центра: те же ступени STEPS,
// но с плавным переходом между ними. Размытие — по целым ступеням (дробное
// пересчитывало бы растр карточки каждый кадр, см. blurAt в deckFan).
function poseOf(o: number) {
  const a = Math.min(Math.abs(o), STEPS.length - 1);
  const lo = Math.min(Math.floor(a), STEPS.length - 2);
  const t = a - lo;
  const A = STEPS[lo];
  const B = STEPS[lo + 1];
  const mix = (k: "x" | "s" | "r" | "a") => A[k] + (B[k] - A[k]) * t;
  const sign = Math.sign(o);
  return {
    x: sign * mix("x"),
    r: -sign * mix("r"),
    s: mix("s"),
    a: mix("a"),
    b: STEPS[Math.min(STEPS.length - 1, Math.round(a))].b,
    z: 10 - Math.round(a),
  };
}

export default function HeroPromoStack({ className = "" }: { className?: string }) {
  const ready = useBootStage(BOOT.blocks);
  const rootRef = useRef<HTMLDivElement>(null);
  // Первый кадр (и сервер) — исходный порядок; перемешиваем после монтажа,
  // иначе разметка сервера и браузера не совпадёт.
  const [order, setOrder] = useState(() => PROMOS.map((_, i) => i));
  // Счётчик без обёртки (как в колодах): fanSlots-логика считает по нему.
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [offscreen, setOffscreen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- перемешивание только в браузере (см. выше)
    setOrder(shuffled(PROMOS.length));
  }, []);

  // Шапка ушла с экрана — таймер стоит.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Вкладка в фоне — таймер стоит.
  useEffect(() => {
    const sync = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const n = order.length;
  const step = useCallback((delta: number) => {
    setActive((a) => a + delta);
    setCycle((c) => c + 1);
  }, []);
  const goTo = useCallback(
    (target: number) => {
      setActive((a) => a + wrapOffset(target - modIndex(a, n), n));
      setCycle((c) => c + 1);
    },
    [n],
  );

  // Жест и пружина — те же, что у колод услуг. 76 — расстояние между
  // центральной и соседней карточкой (STEPS[1].x).
  const { drag, dragging, bind } = useDeckDrag({ count: n, spacing: STEPS[1].x, onSettle: step });
  const { lag, moving } = useDeckSpring(active, drag, dragging);
  const paused = offscreen || hidden || dragging || moving;
  const pos = modIndex(active, n);

  return (
    <div
      ref={rootRef}
      className={`hero-promo ${ready ? "is-ready" : ""} ${paused ? "is-paused" : ""} ${className}`}
      aria-roledescription="карусель"
      aria-label="Акции месяца"
    >
      <div className="hero-promo-stage" {...bind}>
        {order.map((idx, i) => {
          // Непрерывное расстояние до центра по кругу: палец и пружина уже
          // внутри drag/lag, поэтому карточки идут за рукой один в один.
          const o = wrapOffset(i - active + drag + lag, n);
          return <PromoCard key={PROMOS[idx].id} index={idx} offset={o} onPick={() => goTo(i)} />;
        })}
      </div>
      <div className="hero-promo-foot">
        <span className="hero-promo-track" aria-hidden="true">
          {ready && <span key={cycle} className="hero-promo-timer" onAnimationEnd={() => step(1)} />}
        </span>
        <span className="hero-promo-dots">
          {order.map((idx, i) => (
            <button
              key={PROMOS[idx].id}
              type="button"
              onClick={() => goTo(i)}
              className={`hero-promo-dot ${i === pos ? "is-on" : ""}`}
              aria-label={`Акция: ${PROMOS[idx].title}`}
              aria-current={i === pos}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

function PromoCard({ index, offset, onPick }: { index: number; offset: number; onPick: () => void }) {
  const p = PROMOS[index];
  const g = PAGE_GRADIENT[p.section];
  const off = discountOf(p.price, p.oldPrice);
  const abs = Math.abs(offset);
  const front = abs < 0.5;
  const far = abs > 2.2;
  const pose = poseOf(offset);
  // Боковую карточку нажатием выводим в центр, а не открываем по ссылке.
  const click = (e: MouseEvent) => {
    if (!front) {
      e.preventDefault();
      onPick();
    }
  };
  return (
    <div
      className="hero-promo-slot"
      data-offset={Math.round(offset)}
      style={
        {
          "--x": pose.x,
          "--r": `${pose.r}deg`,
          "--sc": pose.s,
          "--op": pose.a,
          "--bl": `${pose.b}px`,
          "--z": pose.z,
          "--hp-from": g.from,
          "--hp-to": g.to,
          // Позу ведёт жест и пружина — CSS-переход только мешал бы.
          transition: "none",
          visibility: abs > 3.2 ? "hidden" : undefined,
          pointerEvents: abs > 3.2 ? "none" : undefined,
        } as CSSProperties
      }
    >
      {/* «Акция месяца» — за рамкой, на верхнем краю, подсвечена. */}
      <span className="promo-card-badge-lift hero-promo-badge" aria-hidden="true">
        <span className="hero-promo-badge-dot" aria-hidden="true" />
        {PROMO_BADGE}
      </span>
      <Link
        href={p.href}
        onClick={click}
        tabIndex={front ? 0 : -1}
        aria-hidden={!front}
        className="hero-promo-card promo-card promo-card-poster hero-promo-noborder"
      >
        {/* У AI-видео — его jpg-постер: видео в шапке не грузим. */}
        {!far && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            style={{ objectPosition: p.imageAlign ?? "center 35%" }}
            className="promo-card-image pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        )}
        <span className="promo-card-tint pointer-events-none absolute inset-0" aria-hidden="true" />
        <span className="relative z-10 flex h-full flex-col">
          <span className="hero-promo-section">
            <span className="hero-promo-section-dot" aria-hidden="true" />
            {SECTION_LABEL[p.section]}
          </span>
          <span className="hero-promo-title">{p.title}</span>
          <span className="mt-auto flex items-end justify-between gap-2">
            <span className="flex items-center gap-1.5">
              {off > 0 && <span className="hero-promo-disc kw">−{off}%</span>}
              <span className="flex flex-col">
                <span className="hero-promo-price">{p.price}</span>
                <span className="hero-promo-old">{p.oldPrice}</span>
              </span>
            </span>
            <span className="hero-promo-cta" aria-hidden="true">→</span>
          </span>
        </span>
      </Link>
    </div>
  );
}
