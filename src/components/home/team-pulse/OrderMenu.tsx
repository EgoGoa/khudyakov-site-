"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ConsentCheckbox from "@/components/ui/ConsentCheckbox";
import type { TeamPulseData } from "./types";

// Выбор «как заказать» — по кнопке «Пообщаться» / «Заказать» у любого
// человека команды (Егор, 2026-09-28):
//   · «Заполнить бриф»   — переход на бриф;
//   · «Созвон на 15 минут» — имя + телефон → заявка приходит Егору, он
//     перезванивает;
//   · «Креатив-сессия»   — когда удобно + имя + телефон → видеосозвон с
//     командой;
//   · «Подробнее»        — большое окно человека (рассказ и чат).
// Заявка уходит тем же `fetch("/api/lead"` — в такой записи статическая
// сборка подменяет адрес на lead.php (см. TeamPulseChat).
export type OrderPick = "story";
type View = "menu" | "call" | "session" | "sending" | "done" | "error";

const DAYS = ["Сегодня", "Завтра", "На этой неделе", "На следующей"];
const TIMES = ["Утро", "День", "Вечер"];

export default function OrderMenu({
  open,
  onClose,
  onPick,
  data,
  showStory = true,
  className = "absolute inset-x-0 bottom-0 z-50",
}: {
  open: boolean;
  onClose: () => void;
  onPick?: (pick: OrderPick) => void;
  data: TeamPulseData;
  /** «Подробнее» не показывается внутри большого окна — оно уже открыто. */
  showStory?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [view, setView] = useState<View>("menu");
  const [kind, setKind] = useState<"call" | "session">("call");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- каждое открытие начинается с выбора
    if (open) setView("menu");
  }, [open]);

  const send = async () => {
    setView("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "team",
          name,
          phone,
          fields: {
            "Кому адресовано": `${data.member.name} (${data.member.role})`,
            Откуда: data.source,
            Намерение: kind === "call" ? "Созвон на 15 минут — перезвонить" : "Креатив-сессия: видеосозвон с командой",
            ...(kind === "session" ? { "Когда удобно": [day, time].filter(Boolean).join(", ") || "не указано" } : {}),
          },
        }),
      });
      if (!res.ok) throw new Error("send_failed");
      setView("done");
    } catch {
      setView("error");
    }
  };

  const canSend = name.trim() && phone.trim() && consent && (kind === "call" || (day && time));
  const item =
    "flex w-full items-center justify-between gap-3 rounded-2xl bg-white/[0.06] px-4 py-3 text-left font-display text-[13px] uppercase tracking-tight text-white ring-1 ring-white/15 transition hover:bg-white/[0.12] hover:ring-white/35";
  const chip = (on: boolean) =>
    `rounded-full px-3 py-1.5 font-display text-[11px] uppercase tracking-tight ring-1 transition ${
      on ? "bg-white/15 text-white ring-white/60" : "text-white/70 ring-white/15 hover:text-white hover:ring-white/35"
    }`;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="order"
          initial={reduced ? false : { opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, transition: { duration: 0.15 } }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          className={`glass-panel flex min-w-[280px] flex-col gap-2 rounded-[24px] p-4 text-left shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] sm:p-5 ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-1 flex items-center justify-between gap-3">
            <span className="font-display text-[11px] uppercase tracking-[0.14em] text-white">
              {view === "menu"
                ? `Как удобнее — ${data.member.name}`
                : kind === "call"
                  ? "Созвон на 15 минут"
                  : "Креатив-сессия с командой"}
            </span>
            <button
              type="button"
              onClick={view === "call" || view === "session" ? () => setView("menu") : onClose}
              aria-label={view === "call" || view === "session" ? "Назад" : "Закрыть"}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20"
            >
              {view === "call" || view === "session" ? "←" : "×"}
            </button>
          </div>

          {view === "menu" && (
            <>
              <Link href={data.briefHref} className={item}>
                Заполнить бриф <span className="team-pulse-warm">→</span>
              </Link>
              <button type="button" className={item} onClick={() => { setKind("call"); setView("call"); }}>
                Созвон на 15 минут <span className="team-pulse-warm">→</span>
              </button>
              <button type="button" className={item} onClick={() => { setKind("session"); setView("session"); }}>
                Креатив-сессия <span className="team-pulse-warm">→</span>
              </button>
              {showStory && onPick ? (
                <button type="button" className={item} onClick={() => onPick("story")}>
                  Подробнее <span className="team-pulse-warm">→</span>
                </button>
              ) : null}
            </>
          )}

          {(view === "call" || view === "session" || view === "sending") && (
            <>
              <p className="font-display text-[12px] leading-snug tracking-tight text-white/65">
                {kind === "call"
                  ? `Оставьте имя и номер — ${data.member.name} перезвонит и за 15 минут разберёт задачу.`
                  : "Видеосозвон с командой: придумаем идею и формат вместе. Выберите, когда удобно."}
              </p>
              {kind === "session" && (
                <>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS.map((d) => (
                      <button key={d} type="button" className={chip(day === d)} onClick={() => setDay(d)}>
                        {d}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {TIMES.map((t) => (
                      <button key={t} type="button" className={chip(time === t)} onClick={() => setTime(t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Как вас зовут" autoComplete="name" className="team-pulse-input" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Телефон" autoComplete="tel" inputMode="tel" className="team-pulse-input" />
              <ConsentCheckbox checked={consent} onChange={setConsent} accent="glow" />
              <button type="button" disabled={!canSend || view === "sending"} onClick={send} className="team-pulse-send">
                {view === "sending" ? "Отправляю…" : "Отправить"}
              </button>
            </>
          )}

          {view === "done" && (
            <p className="font-display text-[13px] uppercase leading-snug tracking-tight text-white">
              {kind === "call"
                ? `Готово! ${data.member.name} перезвонит вам в ближайшее время.`
                : "Готово! Мы свяжемся и подтвердим время креатив-сессии."}
            </p>
          )}
          {view === "error" && (
            <p className="font-display text-[13px] uppercase leading-snug tracking-tight text-white">
              Не отправилось. Позвоните нам: <a href="tel:+79925111812" className="team-pulse-warm">+7 992 511-18-12</a>
            </p>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
