"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { getStudioNews, type StudioNewsItem } from "@/lib/studioNews";
import { WIN } from "@/lib/motion";

// Новости студии — лента компактных карточек (видно сразу несколько новостей).
// Клик по карточке раскрывает новость в большую: слева своя карусель слайдов
// (сама листается раз в 3 с), справа текст. Акценты в заголовках — сплошные
// цвета бренда, без градиентов.

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

// Компактная карточка новости в ленте: обложка, дата, заголовок, вступление.
// Клик раскрывает новость целиком в большую карточку под лентой.
function NewsCard({ item, active, onOpen }: { item: StudioNewsItem; active: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-expanded={active}
      className="group flex w-[calc(50%-8px)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl text-left transition duration-300 hover:-translate-y-1 sm:w-[260px]"
      style={{
        background: "rgba(255,255,255,0.04)",
        boxShadow: active
          ? `inset 0 0 0 2px ${ORANGE}, 0 0 28px -6px ${ORANGE}`
          : "inset 0 0 0 1px rgba(255,255,255,0.12)",
      }}
    >
      <img
        src={item.slides[0]}
        alt=""
        loading="lazy"
        draggable={false}
        className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <time
          dateTime={item.date}
          className="self-start rounded-full px-2.5 py-0.5 font-display text-[11px] font-bold text-[#0b0b10] sm:text-[12px]"
          style={{ background: LIME }}
        >
          {longDate(item.date)}
        </time>
        <h3 className="font-display text-[14px] font-extrabold leading-[1.2] text-white sm:text-[16px]">
          <Accent text={item.title} accent={item.titleAccent} color={ORANGE} />
        </h3>
        <p className="hidden text-[13px] font-semibold leading-snug text-white sm:block">
          <Accent text={item.lead} accent={item.leadAccent} color={LIME} />
        </p>
        <span className="mt-auto pt-1 font-display text-[11px] font-bold uppercase tracking-wider" style={{ color: ORANGE }}>
          {active ? "Свернуть ↑" : "Открыть ↓"}
        </span>
      </div>
    </button>
  );
}

export default function StudioNews() {
  const [openId, setOpenId] = useState<string | null>(null);
  const big = useRef<HTMLDivElement>(null);
  if (news.length === 0) return null;
  const open = news.find((x) => x.id === openId) ?? null;

  const toggle = (id: string) => {
    setOpenId((cur) => (cur === id ? null : id));
    // Раскрытая новость встаёт в кадр, когда окно уже начало раскрываться.
    window.setTimeout(() => big.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
  };

  return (
    <div className="mb-14">
      <h2 className="font-display text-[1.7rem] font-extrabold uppercase leading-none tracking-tight text-paper sm:text-4xl">
        Новости <span style={{ color: ORANGE }}>студии</span>
      </h2>

      <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {news.map((item) => (
          <NewsCard key={item.id} item={item} active={item.id === openId} onOpen={() => toggle(item.id)} />
        ))}
      </div>

      <div ref={big} className="scroll-mt-24">
        <AnimatePresence mode="wait" initial={false}>
          {open && (
            <motion.article
              key={open.id}
              {...WIN}
              className="relative mt-6 grid items-start gap-8 rounded-3xl p-5 sm:p-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-12"
              style={{ background: "rgba(255,255,255,0.04)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" }}
            >
              <button
                type="button"
                aria-label="Свернуть новость"
                onClick={() => setOpenId(null)}
                className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-lg text-white transition hover:bg-white/20"
              >
                ×
              </button>
              <Slides item={open} />
              <Text item={open} />
            </motion.article>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
