"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CloseIcon } from "@/components/ui/Icons";
import { accentVars, type TeamPulseChatVisual, type TeamPulseData } from "./types";
import TeamPulseScenes, { SCENE_MS, TeamPulseChatScene } from "./TeamPulseScenes";
import TeamPulseChat, { type Phase } from "./TeamPulseChat";
import { marks } from "./marks";

// Большое окно человека команды — нарочно собрано из тех же деталей, что
// окошки услуг (ToolSpotlight): стекло `.glass-panel`, неоновый контур
// `.deck-neon-pulse`, язычок `.spotlight-tab` над окном, кадр под стеклом,
// строка больших цифр снизу. Егор просил, чтобы окна не читались как
// принесённые с другой страницы: человек открывается как ещё одна «услуга».
//
// Графика слева, текст справа — вариант Б, который Егор выбрал по
// скриншотам. «Начать чат» меняет только правую половину: графика
// остаётся, чтобы было видно, о чём разговор.
const EASE = [0.32, 0.72, 0, 1] as const;

export default function TeamPulseWindow({ data, open, onClose }: { data: TeamPulseData; open: boolean; onClose: () => void }) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [chat, setChat] = useState(false);
  const [hold, setHold] = useState(false);
  // В чате слева — сцена текущего вопроса Саши с вариантами ответа (свой
  // набор, не сцены рассказа).
  type ChatView = { visual?: TeamPulseChatVisual; chosen?: number; phase: Phase; answers: string[] };
  const firstView = (): ChatView => ({ visual: data.chat[0].visual, phase: "brief", answers: [] });
  const [view, setView] = useState<ChatView>(firstView);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- портал можно строить только после гидратации
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || chat || hold || reduced) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % data.theses.length), SCENE_MS[data.theses[step].scene]);
    return () => clearTimeout(t);
  }, [open, chat, hold, reduced, step, data.theses]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Закрыли — в следующий раз окно снова открывается рассказом, а не
  // посреди брошенного чата.
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      setChat(false);
      setStep(0);
      setView({ visual: data.chat[0].visual, phase: "brief", answers: [] });
    }, 400);
    return () => clearTimeout(t);
  }, [open, data.chat]);

  if (!mounted) return null;

  const t = data.theses[step];
  const go = (d: number) => setStep((s) => (s + d + data.theses.length) % data.theses.length);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="team-pulse-window"
          className="fixed inset-0 z-[80] flex items-end justify-center px-3 pb-3 pt-[4.5rem] sm:items-center sm:px-10 sm:pb-6 sm:pt-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.1 } }}
        >
          <div className="absolute inset-0 bg-ink/75" onClick={onClose} aria-hidden="true" />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${data.member.name}: ${data.windowCta}`}
            className="relative h-[min(640px,calc(100dvh-6.5rem))] w-full max-w-[1200px] sm:h-[min(580px,calc(100dvh-9rem))]"
            style={accentVars(data.accent)}
            initial={reduced ? false : { opacity: 0, y: 28, scale: 0.98, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98, filter: "blur(10px)" }}
            transition={{ duration: 0.46, ease: EASE }}
            onMouseEnter={() => setHold(true)}
            onMouseLeave={() => setHold(false)}
          >
            <div className="spotlight-tab-wrap">
              <button type="button" className="spotlight-tab" onClick={() => setChat((c) => !c)}>
                <span className="font-display text-[12px] uppercase tracking-[0.08em] sm:text-[14px]">
                  {chat ? "Назад к рассказу" : data.windowCta}
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-[15px] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                  {chat ? "←" : "→"}
                </span>
              </button>
            </div>

            {/* Свечение живёт отдельным слоем под стеклом: у панели
                overflow-hidden, и собственную тень она бы обрезала. Пульс —
                это прозрачность слоя, а не анимация box-shadow: так дыхание
                идёт на композиторе и не перерисовывает видео под окном. */}
            <span aria-hidden="true" className="team-pulse-halo pointer-events-none absolute inset-0 rounded-[28px] sm:rounded-[32px]" />
            <div className="glass-panel deck-neon-pulse !absolute inset-0 overflow-hidden rounded-[28px] sm:rounded-[32px]">
              <span aria-hidden="true" className="pointer-events-none absolute inset-0">
                <img src={data.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 [filter:grayscale(0.2)_contrast(1.05)]" />
                <span className="absolute inset-0 bg-[linear-gradient(270deg,rgba(10,12,16,0.92)_0%,rgba(10,12,16,0.7)_55%,rgba(10,12,16,0.5)_100%)]" />
              </span>

              <button
                type="button"
                onClick={onClose}
                aria-label="Закрыть"
                className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-white ring-1 ring-white/20 transition hover:bg-white/15 sm:right-5 sm:top-5"
              >
                <CloseIcon />
              </button>

              <div className="relative flex h-full flex-col p-4 sm:p-6 lg:p-8">
                <div className="flex min-h-0 flex-1 flex-col gap-4 sm:flex-row sm:gap-6 lg:gap-8">
                  <div
                    className={`relative shrink-0 overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/10 ${
                      chat ? "hidden sm:block sm:w-[40%]" : "h-[36%] sm:h-auto sm:w-[44%]"
                    }`}
                  >
                    <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_45%,rgba(var(--tp-from-rgb),0.22),transparent_70%)]" />
                    {chat ? (
                      <TeamPulseChatScene visual={view.visual} chosen={view.chosen} phase={view.phase} answers={view.answers} who={data.member.nameGenitive} />
                    ) : (
                      <TeamPulseScenes scene={t.scene} />
                    )}
                  </div>

                  <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                    {chat ? (
                      <TeamPulseChat data={data} onProgress={setView} />
                    ) : (
                      <>
                        <div className="flex items-center gap-3 pr-12">
                          <span className="team-pulse-photo relative block h-11 w-11 shrink-0 overflow-hidden rounded-full sm:h-12 sm:w-12">
                            <Image unoptimized src={data.member.photo} alt={data.member.name} fill sizes="48px" className="object-cover" />
                          </span>
                          <span>
                            <span className="block font-display text-[14px] uppercase tracking-tight text-white">{data.member.name}</span>
                            <span className="mt-0.5 flex items-center gap-1.5 font-display text-[10px] uppercase tracking-[0.12em] text-white">
                              <span className="team-pulse-dot" /> {data.member.role} · <span className="team-pulse-warm">на связи</span>
                            </span>
                          </span>
                        </div>

                        <AnimatePresence mode="wait" initial={false}>
                          <motion.div
                            key={step}
                            className="flex min-h-0 flex-1 flex-col overflow-hidden"
                            initial={reduced ? false : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
                            transition={{ duration: 0.4, ease: EASE }}
                          >
                            <h3 className="mt-4 font-display text-[1.3rem] uppercase leading-[1.17] tracking-tight text-white sm:mt-6 sm:text-[1.75rem] lg:text-[2.2rem]">
                              {marks(t.title)}
                            </h3>
                            <p className="mt-2 font-display text-[12px] uppercase tracking-[0.04em] text-white sm:text-[14px]">{marks(t.sub)}</p>
                            <p className="mt-3 max-w-[40em] font-display text-[12px] uppercase leading-snug tracking-tight text-white sm:mt-4 sm:text-[14px] lg:text-[15px]">
                              {t.desc}
                            </p>
                            <div className="mt-auto pt-3">
                              <div className="flex items-center gap-3">
                                <span className="rounded-full px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.14em] text-white ring-1 ring-white/35">
                                  {t.chip}
                                </span>
                                <span className="font-display text-[16px] uppercase sm:text-[20px]">{marks(t.chipWord)}</span>
                              </div>
                              <p className="mt-2 hidden font-display text-[12px] uppercase leading-snug tracking-tight text-white sm:block sm:text-[13px]">
                                {t.chipText}
                              </p>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                </div>

                {!chat && (
                  <div className="mt-4 flex items-center gap-5 border-t border-white/10 pt-4 sm:gap-10">
                    <div className="flex items-center gap-1.5">
                      {data.theses.map((_, k) => (
                        <button
                          key={k}
                          type="button"
                          aria-label={`Тезис ${k + 1}`}
                          onClick={() => setStep(k)}
                          className={`h-[5px] rounded-full transition-all duration-300 ${k === step ? "team-pulse-bar w-8" : "w-2.5 bg-white/30 hover:bg-white/60"}`}
                        />
                      ))}
                    </div>
                    {data.stats.map((s, k) => (
                      <div key={s.label} className={k === 0 ? "" : "hidden md:block"}>
                        <p className="font-display text-[20px] leading-none text-white sm:text-[26px]">{marks(s.value)}</p>
                        <p className="mt-1 font-display text-[9px] uppercase tracking-[0.1em] text-white sm:text-[10px]">{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {!chat && (
              <>
                <button
                  type="button"
                  aria-label="Предыдущий тезис"
                  onClick={() => go(-1)}
                  className="team-pulse-arrow absolute -left-9 top-1/2 hidden -translate-y-1/2 sm:block"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Следующий тезис"
                  onClick={() => go(1)}
                  className="team-pulse-arrow absolute -right-9 top-1/2 hidden -translate-y-1/2 sm:block"
                >
                  ›
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
