"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { briefBackground, briefHome, getBriefConfig, getBriefIdForRoute } from "../registry";
import { useBriefState } from "../hooks/useBriefState";
import { canProceed } from "../lib/logic";
import { submitBrief } from "../lib/submit";
import type { AnyBriefId } from "../types";
import BriefSummary from "./BriefSummary";
import BriefSuccess from "./BriefSuccess";
import ChoiceStep from "./steps/ChoiceStep";
import ContactStep from "./steps/ContactStep";
import LinksStep from "./steps/LinksStep";
import TextStep from "./steps/TextStep";

// Оболочка брифа. Бриф выбирается явно: либо `briefId`, либо `route`
// (через serviceBriefMap). Нет привязки — в dev красная плашка и ошибка в
// консоли, в prod общий запасной бриф.
function questionsLabel(n: number) {
  const m10 = n % 10;
  const m100 = n % 100;
  const word = m10 === 1 && m100 !== 11 ? "короткий вопрос" : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? "коротких вопроса" : "коротких вопросов";
  return `${n} ${word}`;
}

export default function Brief({ briefId, route }: { briefId?: AnyBriefId; route?: string }) {
  let id: AnyBriefId | null = briefId ?? (route ? getBriefIdForRoute(route) : null);
  let unmapped = false;
  if (!id) {
    unmapped = true;
    id = "general";
    if (process.env.NODE_ENV !== "production") {
      console.error(`[brief] для маршрута «${route ?? "?"}» нет записи в serviceBriefMap (src/features/brief/registry.ts)`);
    }
  }
  return (
    <>
      {unmapped && process.env.NODE_ENV !== "production" && (
        <div role="alert" className="fixed inset-x-0 top-0 z-[999] bg-red-600 px-4 py-2 text-center text-sm font-bold text-white">
          Нет брифа для маршрута «{route ?? "?"}» — добавьте запись в serviceBriefMap
        </div>
      )}
      <BriefInner briefId={id} />
    </>
  );
}

function BriefInner({ briefId }: { briefId: AnyBriefId }) {
  const config = getBriefConfig(briefId);
  const reduce = useReducedMotion();
  const s = useBriefState(config);
  const [send, setSend] = useState<"idle" | "sending" | "error">("idle");
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Свежие next/state для обработчиков клавиш и отложенных переходов.
  const nextRef = useRef(s.next);
  const stateRef = useRef(s);
  useEffect(() => {
    nextRef.current = s.next;
    stateRef.current = s;
  });

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, [s.stage, s.step?.id]);

  // Enter — дальше, Backspace / ← вне полей ввода — назад.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const cur = stateRef.current;
      if (cur.stage !== "steps" || !cur.step) return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      const inField = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || Boolean(t?.isContentEditable);
      if (e.key === "Enter" && !e.shiftKey && tag !== "TEXTAREA" && tag !== "BUTTON" && tag !== "A") {
        if (canProceed(cur.step, cur.answers[cur.step.id])) {
          e.preventDefault();
          nextRef.current();
        }
      } else if ((e.key === "Backspace" || e.key === "ArrowLeft") && !inField) {
        e.preventDefault();
        cur.back();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const total = s.visible.length;
  const progress =
    s.stage === "review" || s.stage === "success" ? 1 : s.stage === "steps" ? (s.index + 1) / (total + 1) : 0;

  const submit = async () => {
    setSend("sending");
    try {
      await submitBrief(config, s.answers);
      setSend("idle");
      s.finish();
    } catch {
      setSend("error");
    }
  };

  const anim = reduce
    ? { initial: false as const, animate: { opacity: 1 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, x: 24 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
      };

  const step = s.step;
  const optional = step?.required === false;

  return (
    <section data-brief-id={config.id} className="hb-root">
      <div aria-hidden className="hb-bg" style={{ backgroundImage: `url(${briefBackground[config.id]})` }} />
      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-6 pt-36 sm:px-6 sm:pt-40">
        <div className="mb-6">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-display text-xs uppercase tracking-[0.15em] text-white">{config.title}</span>
            {s.stage === "steps" && step && (
              <span className="shrink-0 text-sm font-semibold text-white" aria-live="polite">
                Шаг {s.index + 1} из {total}
              </span>
            )}
          </div>
          <div className="hb-bar mt-3" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
            <span style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

          <motion.div key={s.stage === "steps" ? step?.id : s.stage} {...anim}>
            {s.stage === "intro" && (
              <div>
                {s.saved && (
                  <div className="mb-8 rounded-2xl border border-white/20 bg-white/[0.05] p-4">
                    <p className="text-[15px] font-semibold text-white">
                      У вас есть незаконченный бриф — продолжить с шага{" "}
                      {Math.max(1, s.saved && config.steps.findIndex((x) => x.id === s.saved!.stepId) + 1)}?
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <button type="button" onClick={s.resume} className="hb-btn">Продолжить</button>
                      <button type="button" onClick={s.restart} className="hb-btn hb-btn-ghost">Начать заново</button>
                    </div>
                  </div>
                )}
                <h1 ref={titleRef} tabIndex={-1} className="font-display text-[1.9rem] uppercase leading-[1.1] text-white outline-none sm:text-5xl">
                  {config.title.split(":")[0]}: <span className="hb-grad-text">{config.title.split(":")[1]?.trim() ?? ""}</span>
                </h1>
                <p className="mt-5 max-w-xl text-base font-semibold text-white">{config.intro}</p>
                <p className="mt-3 text-sm font-semibold text-white">
                  ≈ 3–4 минуты, {questionsLabel(config.steps.filter((x) => !x.showIf).length)}
                </p>
                <button type="button" onClick={s.start} className="hb-btn mt-8">Начать</button>
              </div>
            )}

            {s.stage === "steps" && step && (
              <div>
                <h2 id="hb-title" ref={titleRef} tabIndex={-1} className="font-display text-[1.45rem] uppercase leading-tight text-white outline-none sm:text-4xl">
                  {step.title}
                </h2>
                {step.subtitle && <p className="mt-2 text-sm font-semibold text-white/80">{step.subtitle}</p>}
                <div className="mt-6">
                  {(step.type === "single" || step.type === "multi" || step.type === "budget" || step.type === "deadline") && (
                    <ChoiceStep
                      step={step}
                      answer={s.answers[step.id]}
                      onChange={(p) => s.setAnswer(step.id, p)}
                      onAdvance={() => nextRef.current()}
                    />
                  )}
                  {(step.type === "text" || step.type === "textarea") && (
                    <TextStep step={step} answer={s.answers[step.id]} onChange={(p) => s.setAnswer(step.id, p)} onAdvance={() => canProceed(step, stateRef.current.answers[step.id]) && nextRef.current()} />
                  )}
                  {step.type === "links" && <LinksStep answer={s.answers[step.id]} onChange={(p) => s.setAnswer(step.id, p)} />}
                  {step.type === "contact" && <ContactStep answer={s.answers[step.id]} onChange={(p) => s.setAnswer(step.id, p)} />}
                </div>
              </div>
            )}

            {s.stage === "review" && (
              <div>
                <h2 ref={titleRef} tabIndex={-1} className="font-display text-[1.45rem] uppercase leading-tight text-white outline-none sm:text-4xl">
                  Проверьте <span className="hb-grad-text">ответы</span>
                </h2>
                <div className="mt-6">
                  <BriefSummary steps={s.visible} answers={s.answers} onEdit={s.edit} />
                </div>
                {send === "error" && (
                  <p role="alert" className="mt-4 text-sm font-semibold text-white">
                    Не получилось отправить. Ответы сохранены — попробуйте ещё раз.
                  </p>
                )}
              </div>
            )}

            {s.stage === "success" && <BriefSuccess home={briefHome[config.id]} />}
          </motion.div>
      </div>

      {(s.stage === "steps" || s.stage === "review") && (
        <div className="hb-nav">
          <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={s.stage === "review" ? () => s.edit(s.visible[s.visible.length - 1].id) : s.back}
              className="hb-btn hb-btn-ghost"
            >
              Назад
            </button>
            <div className="flex-1" />
            {s.stage === "steps" && optional && !s.fromReview && (
              <button type="button" onClick={s.next} className="text-sm font-semibold text-white underline underline-offset-4">
                Пропустить
              </button>
            )}
            {s.stage === "steps" ? (
              <button type="button" onClick={s.next} disabled={!s.canNext} className="hb-btn">
                {s.fromReview ? "К проверке" : "Дальше"}
              </button>
            ) : (
              <button type="button" onClick={submit} disabled={send === "sending"} className="hb-btn">
                {send === "sending" ? "Отправляем…" : send === "error" ? "Повторить" : "Отправить бриф"}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
