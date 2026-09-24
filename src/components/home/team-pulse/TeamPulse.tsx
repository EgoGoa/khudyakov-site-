"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { accentVars, type TeamPulseData } from "./types";
import TeamPulseWindow from "./TeamPulseWindow";
import { marks, plain } from "./marks";

// Мини-окошко человека команды, встроенное в вёрстку блока.
//
// Жизненный цикл, который задал Егор: блок на экране → окошко стоит
// развёрнутым 5 секунд, пока Саша «печатает» оффер → оно сворачивается в
// стеклянное уведомление в духе iOS (маленькая аватарка, «сейчас», одна
// строка) → наведение мягко, на пружине, раскрывает окошко снова, и печать
// идёт уже следующего оффера → клик открывает большое окно.
//
// Уведомление — не мигающий кружок: Егор попросил убрать сильное мигание и
// крупное фото. Пульс остался одним тихим кольцом вокруг маленькой
// аватарки, а свечение уведомления дышит медленно.
//
// Высота контейнера одна на оба состояния: окошко живёт в потоке блока, и
// всё, что стоит под ним (акция, таблица), не должно подпрыгивать.
const COLLAPSE_MS = 5000;
const TYPE_MS = 28;
const HOLD_MS = 2200;
const NOTE_MS = 4200;
const SPRING = { type: "spring", stiffness: 340, damping: 30, mass: 0.9 } as const;

/** Печатает строку с цветовой разметкой (*градиент* ^тёплый^ ~серый~, см.
 *  marks.tsx): считает только видимые буквы, метки переключают цвет. */
const MARK_CLS: Record<string, string> = { "*": "team-pulse-acc", "^": "team-pulse-warm", "~": "team-pulse-muted" };

function segments(text: string) {
  const out: { text: string; cls?: string }[] = [];
  const re = /([*^~])([^*^~]+)\1/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    out.push({ text: m[2], cls: MARK_CLS[m[1]] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

function TypedOffer({ text, count }: { text: string; count: number }) {
  const parts = segments(text);
  const starts = parts.map((_, k) => parts.slice(0, k).reduce((n, p) => n + p.text.length, 0));
  return (
    <>
      {parts.map((part, k) => {
        const shown = part.text.slice(0, Math.max(0, count - starts[k]));
        if (!shown) return null;
        return (
          <span key={k} className={part.cls}>
            {shown}
          </span>
        );
      })}
      <span className="team-pulse-caret" aria-hidden="true" />
    </>
  );
}

export default function TeamPulse({
  data: base,
  className = "",
  compact = false,
  source,
}: {
  data: TeamPulseData;
  className?: string;
  /** Для узких слотов (карточки команды в финальных блоках, блок цен):
   *  в вёрстке стоит только уведомление, а окошко с оффером раскрывается
   *  поверх, вверх, не сдвигая ничего вокруг — главы там подогнаны под
   *  один экран. */
  compact?: boolean;
  /** Подпись «откуда» в заявке, если этот человек стоит в другом блоке. */
  source?: string;
}) {
  const data = source ? { ...base, source } : base;
  const ref = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);
  const reduced = useReducedMotion();
  const [inView, setInView] = useState(false);
  const [collapsed, setCollapsed] = useState(compact);
  const [peek, setPeek] = useState(false);
  const [offer, setOffer] = useState(0);
  const [count, setCount] = useState(0);
  const [note, setNote] = useState(0);
  const [open, setOpen] = useState(false);
  // После первого открытия окна кольцо вокруг аватарки больше не пульсирует
  // (правило «анимация один раз за визит»).
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || collapsed || open) return;
    const t = setTimeout(() => {
      setCollapsed(true);
      setNote((n) => (n + 1) % (data.notes.length + data.offers.length));
    }, COLLAPSE_MS);
    return () => clearTimeout(t);
  }, [inView, collapsed, open, data.notes.length, data.offers.length]);

  const showCard = !collapsed || peek;
  const text = data.offers[offer];
  const full = plain(text).length;

  // Печать: буква за буквой, потом пауза и следующий оффер. Пока окошко
  // свёрнуто, печать стоит — при раскрытии Саша начинает новый оффер.
  useEffect(() => {
    if (!showCard || !inView) return;
    if (reduced) {
      const t = setTimeout(() => setCount(full), 0);
      return () => clearTimeout(t);
    }
    if (count < full) {
      const t = setTimeout(() => setCount((c) => c + 1), TYPE_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setOffer((o) => (o + 1) % data.offers.length);
      setCount(0);
    }, HOLD_MS);
    return () => clearTimeout(t);
  }, [showCard, inView, reduced, count, full, data.offers.length]);

  // Тап на телефоне раскрывает окошко без наведения — оно само сворачивается
  // обратно через те же 5 секунд.
  useEffect(() => {
    if (!peek || open) return;
    const t = setTimeout(() => {
      if (!hovering.current) setPeek(false);
    }, COLLAPSE_MS);
    return () => clearTimeout(t);
  }, [peek, open]);

  // Свёрнутое уведомление не стоит на месте: сообщения и офферы Саши
  // приходят по очереди, как новые уведомления, — без наведения (Егор:
  // «офферы не меняются, если не навести на Сашу, а должны»).
  const messages = [...data.notes, ...data.offers];
  useEffect(() => {
    if (!collapsed || peek || !inView || reduced) return;
    const t = setInterval(() => setNote((n) => (n + 1) % messages.length), NOTE_MS);
    return () => clearInterval(t);
  }, [collapsed, peek, inView, reduced, messages.length]);

  const reveal = () => {
    setOffer((o) => (o + 1) % data.offers.length);
    setCount(0);
    setPeek(true);
  };

  const openWindow = () => {
    setOpen(true);
    setSeen(true);
  };

  const { member } = data;

  return (
    <div
      ref={ref}
      className={`relative ${compact ? "h-[4.9rem]" : "h-[9.5rem] sm:h-[8.75rem]"} ${className}`}
      style={accentVars(data.accent)}
      onMouseEnter={() => {
        hovering.current = true;
        if (collapsed && !peek) reveal();
      }}
      onMouseLeave={() => {
        hovering.current = false;
        setPeek(false);
      }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {showCard ? (
          <motion.button
            key="card"
            type="button"
            onClick={openWindow}
            className={`team-pulse-card group absolute flex items-center gap-4 rounded-[24px] px-4 text-left sm:gap-5 sm:px-5 ${
              compact ? "inset-x-0 bottom-0 z-30 min-h-[9.5rem] py-4" : "inset-0"
            }`}
            initial={reduced ? false : { opacity: 0, scale: 0.92, y: 8, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, filter: "blur(10px)", transition: { duration: 0.28 } }}
            transition={SPRING}
          >
            <span className="relative h-14 w-14 shrink-0 sm:h-16 sm:w-16">
              <span className="team-pulse-photo relative block h-full w-full overflow-hidden rounded-full">
                <Image unoptimized src={member.photo} alt={member.name} fill sizes="64px" className="object-cover" />
              </span>
              <span className="team-pulse-online absolute bottom-0 right-0 h-3 w-3 rounded-full" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-display text-[9.5px] uppercase tracking-[0.14em] sm:text-[10.5px]">
                <span className="team-pulse-acc">
                  {member.name} · {data.role}
                </span>
                <span className="text-[#30d158]">● пишет…</span>
              </span>
              <span className={`mt-1.5 block font-display uppercase leading-[1.38] tracking-tight text-white ${compact ? "h-[5.6em] text-[12px] sm:text-[13px]" : "h-[4.15em] text-[13px] sm:text-[15px]"}`}>
                <TypedOffer text={text} count={count} />
              </span>
              <span className="mt-1.5 flex items-center gap-3">
                <span className="team-pulse-cta">
                  <u>Пообщаться</u>
                  <i aria-hidden="true">→</i>
                </span>
                <span className="ml-auto flex gap-1" aria-hidden="true">
                  {data.offers.map((_, k) => (
                    <i key={k} className={`h-1 rounded-full transition-all duration-500 ${k === offer ? "team-pulse-bar w-6" : "w-2 bg-white/30"}`} />
                  ))}
                </span>
              </span>
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="note"
            className="absolute inset-0 flex items-center"
            initial={reduced ? false : { opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, filter: "blur(8px)", transition: { duration: 0.22 } }}
            transition={SPRING}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={reveal}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && reveal()}
              className="team-pulse-note flex w-full cursor-pointer items-center gap-3 rounded-[22px] px-3.5 py-3 text-left sm:gap-3.5"
            >
              <span className={`team-pulse-avatar relative h-10 w-10 shrink-0 rounded-full ${seen ? "" : "is-pulsing"}`}>
                <span className="relative block h-full w-full overflow-hidden rounded-full">
                  <Image unoptimized src={member.photo} alt="" fill sizes="40px" className="object-cover" />
                </span>
                <span className="team-pulse-online absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full" />
              </span>
              <span className="min-w-0 flex-1 overflow-hidden">
                <span className="flex items-baseline gap-2">
                  <span className="team-pulse-acc font-display text-[11px] uppercase tracking-[0.1em]">{member.name}</span>
                  <span className="font-sans text-[11px] font-semibold text-white">сейчас</span>
                </span>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={note}
                    className="mt-1 line-clamp-2 font-display text-[12px] uppercase leading-snug tracking-tight text-white sm:text-[13px]"
                    initial={reduced ? false : { opacity: 0, y: -10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                    transition={SPRING}
                  >
                    {marks(messages[note % messages.length])}
                  </motion.span>
                </AnimatePresence>
              </span>
              {/* Явный призыв — чтобы было ясно, что сюда жмут: сразу
                  открывает окно, не дожидаясь раскрытия карточки. */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openWindow();
                }}
                className="team-pulse-cta shrink-0"
              >
                <u className={compact ? "hidden" : "hidden sm:inline"}>Пообщаться</u>
                <i aria-hidden="true">→</i>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TeamPulseWindow data={data} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
