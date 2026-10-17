"use client";

import { useEffect, useRef } from "react";
import { DEADLINE_ID } from "../../configs/helpers";
import { todayISO } from "../../lib/logic";
import type { Answer, Step } from "../../types";

type Props = {
  step: Step;
  answer: Answer | undefined;
  onChange: (patch: Partial<Answer>) => void;
  /** Авто-переход (single/budget/deadline) — вызывается через 300 мс после выбора. */
  onAdvance: () => void;
};

const AUTO_MS = 300;

export default function ChoiceStep({ step, answer, onChange, onAdvance }: Props) {
  const multi = step.type === "multi";
  const options = step.options ?? [];
  const ids = answer?.ids ?? [];
  const customOn = Boolean(answer?.customOn);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceRef = useRef(onAdvance);
  const customInput = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const schedule = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => advanceRef.current(), AUTO_MS);
  };

  const pick = (id: string) => {
    if (multi) {
      const has = ids.includes(id);
      if (!has && step.max && ids.length + (customOn ? 1 : 0) >= step.max) return;
      onChange({ ids: has ? ids.filter((x) => x !== id) : [...ids, id] });
      return;
    }
    onChange({ ids: [id], customOn: false });
    if (step.type === "deadline" && id === DEADLINE_ID) return;
    schedule();
  };

  const toggleCustom = () => {
    if (timer.current) clearTimeout(timer.current);
    if (multi) {
      if (!customOn && step.max && ids.length >= step.max) return;
      onChange({ customOn: !customOn });
    } else {
      onChange({ ids: [], customOn: true });
    }
    setTimeout(() => customInput.current?.focus(), 0);
  };

  // Цифры 1–9 выбирают вариант, пока фокус не в поле ввода.
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    advanceRef.current = onAdvance;
  });
  const onKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!/^[1-9]$/.test(e.key)) return;
    const o = options[Number(e.key) - 1];
    if (o) {
      e.preventDefault();
      pick(o.id);
    }
  };
  useEffect(() => {
    keyRef.current = onKey;
  });
  useEffect(() => {
    const h = (e: KeyboardEvent) => keyRef.current(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const count = ids.length + (customOn && answer?.custom?.trim() ? 1 : 0);
  const budget = step.type === "budget";
  const role = multi ? "checkbox" : "radio";
  const showDate = step.type === "deadline" && ids.includes(DEADLINE_ID);

  return (
    <div>
      <div
        role={multi ? "group" : "radiogroup"}
        aria-labelledby="hb-title"
        className={`grid gap-3 ${budget ? "sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}
      >
        {options.map((o, i) => {
          const on = ids.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              role={role}
              aria-checked={on}
              data-on={on}
              onClick={() => pick(o.id)}
              className={`hb-card ${budget ? "hb-card-budget" : ""}`}
            >
              {o.icon && <span aria-hidden className="text-xl">{o.icon}</span>}
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-[15px] font-semibold leading-snug text-white">{o.label}</span>
                {o.hint && <span className="mt-0.5 block text-xs text-white/70">{o.hint}</span>}
              </span>
              <span className="hb-mark" aria-hidden>{multi && on ? "✓" : i < 9 ? i + 1 : ""}</span>
            </button>
          );
        })}

        {step.allowCustom && (
          <div data-on={customOn} className="hb-card hb-card-custom sm:col-span-2">
            {customOn ? (
              <div className="flex w-full items-center gap-3">
                <input
                  ref={customInput}
                  value={answer?.custom ?? ""}
                  onChange={(e) => onChange({ custom: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !multi && answer?.custom?.trim()) {
                      e.preventDefault();
                      advanceRef.current();
                    }
                  }}
                  maxLength={200}
                  placeholder="Напишите свой вариант"
                  aria-label="Свой вариант"
                  className="hb-input !py-2"
                />
                <button type="button" onClick={toggleCustom} aria-label="Убрать свой вариант" className="hb-x">×</button>
              </div>
            ) : (
              <button type="button" onClick={toggleCustom} className="flex w-full items-center gap-2 text-left text-[15px] font-semibold text-white">
                <span aria-hidden>＋</span> Свой вариант
              </button>
            )}
          </div>
        )}
      </div>

      {multi && (
        <p className="mt-4 text-sm font-semibold text-white" aria-live="polite">
          Выбрано: {count}
          {step.min ? ` · минимум ${step.min}` : ""}
          {step.max ? ` · максимум ${step.max}` : ""}
        </p>
      )}

      {showDate && (
        <div className="mt-4">
          <label htmlFor="hb-date" className="mb-2 block text-sm font-semibold text-white">Дата</label>
          <input
            id="hb-date"
            type="date"
            min={todayISO()}
            value={answer?.date ?? ""}
            onChange={(e) => onChange({ date: e.target.value })}
            className="hb-input max-w-[240px]"
          />
        </div>
      )}
    </div>
  );
}
