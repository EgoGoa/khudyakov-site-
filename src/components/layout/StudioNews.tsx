"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { getStudioNews, type StudioNewsItem } from "@/lib/studioNews";

// Новости студии — единый блок: каждая новость это карточка, где слева своя
// карусель слайдов (сама листается раз в 3 с), справа текст. Сами новости тоже
// листаются по горизонтали (карусель из каруселей). Одна новость — без внешних
// стрелок. Акценты в заголовках — сплошные цвета бренда, без градиентов.

const news = getStudioNews();

const ORANGE = "#ff6a3d";
const LIME = "#c8f169";
const SLIDE_MS = 3000;

function longDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }).replace(" г.", "");
}

// Подсвечивает во фразе нужный кусок сплошным цветом.
function Accent({ text, accent, color }: { text: string; accent?: string; color: string }): ReactNode {
  if (!accent || !text.includes(accent)) return text;
  const [before, ...rest] = text.split(accent);
  return (
    <>
      {before}
      <span style={{ color }}>{accent}</span>
      {rest.join(accent)}
    </>
  );
}

function Slides({ item }: { item: StudioNewsItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const idx = useRef(0);
  const pausedUntil = useRef(0);
  const visible = useRef(false);
  const last = item.slides.length - 1;

  const go = (to: number) => {
    const el = ref.current;
    if (!el) return;
    const k = Math.min(last, Math.max(0, to));
    el.scrollTo({ left: k * el.clientWidth, behavior: "smooth" });
  };

  // Автолистание раз в 3 с: стоит на паузе, пока слайды не на экране, пока
  // пользователь листает сам (8 с после касания), и при reduce-motion.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    const hold = () => (pausedUntil.current = Date.now() + 8000);
    el.addEventListener("pointerdown", hold);
    el.addEventListener("wheel", hold, { passive: true });
    el.addEventListener("mouseenter", hold);
    if (reduce) return () => io.disconnect();
    const t = window.setInterval(() => {
      if (!visible.current || document.hidden || Date.now() < pausedUntil.current) return;
      go(idx.current >= last ? 0 : idx.current + 1);
    }, SLIDE_MS);
    return () => {
      window.clearInterval(t);
      io.disconnect();
      el.removeEventListener("pointerdown", hold);
      el.removeEventListener("wheel", hold);
      el.removeEventListener("mouseenter", hold);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [last]);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const k = Math.round(el.scrollLeft / el.clientWidth);
    idx.current = k;
    setI(k);
  };

  return (
    <div ref={wrap} className="relative mx-auto w-full max-w-[420px]">
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex aspect-[4/5] snap-x snap-mandatory overflow-x-auto rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)" }}
      >
        {item.slides.map((src, k) => (
          <img
            key={src}
            src={src}
            alt={`Слайд ${k + 1} из ${item.slides.length}`}
            loading={k === 0 ? "eager" : "lazy"}
            draggable={false}
            className="h-full w-full shrink-0 snap-center object-cover"
          />
        ))}
      </div>
      <button
        type="button"
        aria-label="Предыдущий слайд"
        onClick={() => {
          pausedUntil.current = Date.now() + 8000;
          go(i - 1);
        }}
        disabled={i === 0}
        className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-lg text-white backdrop-blur transition disabled:opacity-0"
      >
        ←
      </button>
      <button
        type="button"
        aria-label="Следующий слайд"
        onClick={() => {
          pausedUntil.current = Date.now() + 8000;
          go(i + 1);
        }}
        disabled={i === last}
        className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-lg text-white backdrop-blur transition disabled:opacity-0"
      >
        →
      </button>
      <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
        {item.slides.map((_, k) => (
          <span
            key={k}
            className="h-1.5 rounded-full transition-all"
            style={{ width: k === i ? 22 : 6, background: k === i ? ORANGE : "rgba(255,255,255,0.3)" }}
          />
        ))}
      </div>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function Text({ item }: { item: StudioNewsItem }) {
  const [open, setOpen] = useState(false);
  const toggle = (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      aria-expanded={open}
      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-display text-[12px] font-bold uppercase tracking-wider text-[#0b0b10] transition hover:brightness-110 active:scale-[0.98]"
      style={{ background: open ? "rgba(255,255,255,0.92)" : ORANGE }}
    >
      {open ? "Свернуть" : "Читать полностью"}
      <Chevron open={open} />
    </button>
  );

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <time
          dateTime={item.date}
          className="rounded-full px-3 py-1 font-display text-[13px] font-bold text-[#0b0b10]"
          style={{ background: LIME }}
        >
          {longDate(item.date)}
        </time>
        <span className="text-[13px] font-semibold text-white/60">Новости студии</span>
      </div>
      <div className="mt-4 font-display text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: ORANGE }}>
        {item.eyebrow}
      </div>
      <h3 className="mt-2 font-display text-[1.5rem] font-extrabold leading-[1.15] tracking-tight text-white sm:text-[2.1rem]">
        <Accent text={item.title} accent={item.titleAccent} color={ORANGE} />
      </h3>
      <p className="mt-4 text-[16px] font-semibold leading-relaxed text-white">
        <Accent text={item.lead} accent={item.leadAccent} color={LIME} />
      </p>

      <div
        className={`mt-4 space-y-5 overflow-hidden text-[14px] font-medium leading-relaxed text-white/85 transition-[max-height] duration-500 ${
          open ? "max-h-[4000px]" : "max-h-[7.5rem] [mask-image:linear-gradient(#000_55%,transparent)]"
        }`}
      >
        {item.body.map((s, k) => (
          <section key={k} className="space-y-2">
            {s.h && (
              <h4 className="flex items-center gap-3 font-display text-[15px] font-extrabold text-white">
                <span className="font-display text-[12px] font-bold" style={{ color: ORANGE }}>
                  {String(k + 1).padStart(2, "0")}
                </span>
                <span className="h-[3px] w-6 rounded-full" style={{ background: ORANGE }} />
                {s.h}
              </h4>
            )}
            {s.p?.map((t, j) => <p key={j}>{t}</p>)}
            {s.ul && (
              <ul className="space-y-1.5">
                {s.ul.map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: LIME }} />
                    {t}
                  </li>
                ))}
              </ul>
            )}
            {s.ol && (
              <ol className="space-y-1.5">
                {s.ol.map((t, j) => (
                  <li key={t} className="flex gap-2.5">
                    <b className="font-display text-[13px]" style={{ color: LIME }}>{j + 1}</b>
                    {t}
                  </li>
                ))}
              </ol>
            )}
            {s.after?.map((t, j) => <p key={`a${j}`}>{t}</p>)}
          </section>
        ))}
        {open && <div className="pt-1">{toggle}</div>}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        {toggle}
        {item.cta && (
          <Link
            href={item.cta.href}
            className="text-[14px] font-bold text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
          >
            {item.cta.label}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function StudioNews() {
  const outer = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);
  if (news.length === 0) return null;

  const go = (to: number) => {
    const el = outer.current;
    if (!el) return;
    const k = Math.min(news.length - 1, Math.max(0, to));
    el.scrollTo({ left: k * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="mb-14">
      <h2 className="font-display text-[1.7rem] font-extrabold uppercase leading-none tracking-tight text-paper sm:text-4xl">
        Новости <span style={{ color: ORANGE }}>студии</span>
      </h2>

      <div className="relative mt-8">
        <div
          ref={outer}
          onScroll={() => {
            const el = outer.current;
            if (el) setN(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {news.map((item) => (
            <Fragment key={item.id}>
              <article
                className="grid w-full shrink-0 snap-center items-start gap-8 rounded-3xl p-5 sm:p-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-12"
                style={{ background: "rgba(255,255,255,0.04)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" }}
              >
                <Slides item={item} />
                <Text item={item} />
              </article>
            </Fragment>
          ))}
        </div>

        {news.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <button type="button" aria-label="Предыдущая новость" onClick={() => go(n - 1)} className="text-xl text-white/80 hover:text-white">
              ←
            </button>
            <span className="font-display text-[11px] font-semibold tracking-widest text-white/70">
              {n + 1} / {news.length}
            </span>
            <button type="button" aria-label="Следующая новость" onClick={() => go(n + 1)} className="text-xl text-white/80 hover:text-white">
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
