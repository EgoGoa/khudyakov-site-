"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WIN_SIDE } from "@/lib/motion";
import NanoSphere from "@/components/ui/NanoSphere";
import { DustyOrb } from "@/components/ui/SphereDust";
import ConsentCheckbox from "@/components/ui/ConsentCheckbox";
import { playUi } from "@/lib/sound";
import { useSiteFreeze } from "@/lib/use-site-freeze";
import { TEAM } from "@/lib/team";
import { OPEN_VIBE_EVENT } from "@/lib/voice/store";
import { CONTACT_KEY, ORB_FROM, ORB_TO, TELEGRAM } from "@/components/vibe/VibeMode";
import {
  answerText,
  blockKind,
  blockQuestions,
  estimateBlock,
  blockExamples,
  lastSphere,
  serviceOf,
  setTunedBlock,
  tuneBlock,
  useTunedBlock,
  useTunedProgress,
  type BlockAnswers,
} from "@/lib/block-vibe";

// Окошко Vibe-блока у вайб-бара (Егор, 2026-09-27, вариант A): страница уже
// доехала до блока, окошко встаёт рядом с баром и блок остаётся виден.
// Пять шагов: сфера → два вопроса этого блока → примеры (наши работы и свои
// скрины) → контакт. Потом блок на странице перестраивается, а бриф уходит
// продюсеру тем же /api/lead, что и большой вайб-режим.

const EASE = [0.65, 0, 0.35, 1] as const;
const MAX_FILES = 3;

type Shot = { name: string; data: string };

function Accent({ text }: { text: string }) {
  const parts = text.split(/\*([^*]+)\*/);
  return <>{parts.map((p, i) => (i % 2 ? <span key={i} className="vibe-mode__iris">{p}</span> : p))}</>;
}

/** Скрин ужимается в браузере до 1600px JPEG — письмо остаётся лёгким. */
function compress(file: File): Promise<Shot> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1600 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve({ name: file.name.replace(/\.[^.]+$/, "") + ".jpg", data: c.toDataURL("image/jpeg", 0.82) });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("bad_image"));
    };
    img.src = url;
  });
}

export default function BlockVibe({
  path,
  blockId,
  label,
  onClose,
  onShowBlock,
}: {
  path: string;
  blockId: string;
  label: string;
  onClose: () => void;
  /** Вернуть страницу к блоку — показать его собранным. */
  onShowBlock: () => void;
}) {
  const kind = blockKind(path, blockId);
  const service = serviceOf(path);
  const questions = useMemo(() => (kind ? blockQuestions(kind, service) : []), [kind, service]);
  const tuned = useTunedBlock(path, blockId);
  const progress = useTunedProgress(path);

  const [answers, setAnswers] = useState<BlockAnswers>(() => {
    if (tuned) return tuned;
    const init: BlockAnswers = {};
    const s = lastSphere();
    if (s) init.sphere = s;
    return init;
  });
  // Уже собранный блок открывается сразу на финале — оттуда его можно
  // обсудить, пересобрать или вернуть.
  const [step, setStep] = useState(() => (tuned ? 6 : 0));
  const [shots, setShots] = useState<Shot[]>([]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [sent, setSent] = useState<"ok" | "fail" | null>(null);
  const [pulse, setPulse] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Пока окошко открыто, сайт за ним замирает (Егор, 2026-09-27: «сайт за
  // окошками вайб-режима подвисает») — живёт только само окошко.
  useSiteFreeze();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CONTACT_KEY) ?? "null") as { name?: string; contact?: string } | null;
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- контакт из прошлой анкеты есть только в браузере
        setName(saved.name ?? "");
        setContact(saved.contact ?? "");
      }
    } catch {}
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!kind) return null;

  const TOTAL = questions.length + 2; // + примеры + контакт
  const go = (n: number) => {
    playUi("click");
    setPulse((p) => p + 1);
    setStep(n);
  };

  const q = step < questions.length ? questions[step] : null;
  const current = q ? answers[q.id] : undefined;
  const pick = (value: string) => {
    if (!q) return;
    if (q.multi) {
      const max = q.multi;
      setAnswers((prev) => {
        const cur = prev[q.id];
        const list = Array.isArray(cur) ? cur : [];
        const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value].slice(-max);
        return { ...prev, [q.id]: next };
      });
      setPulse((p) => p + 1);
      return;
    }
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    setPulse((p) => p + 1);
    window.setTimeout(() => go(step + 1), 320);
  };
  const answered = q ? (Array.isArray(current) ? current.length > 0 : Boolean(current)) : true;

  const examples = blockExamples(service, answers);
  const pickedWorks = Array.isArray(answers.works) ? answers.works : [];
  const toggleWork = (id: string) => {
    setAnswers((prev) => {
      const list = Array.isArray(prev.works) ? prev.works : [];
      return { ...prev, works: list.includes(id) ? list.filter((w) => w !== id) : [...list, id].slice(-3) };
    });
    setPulse((p) => p + 1);
  };
  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    const room = MAX_FILES - shots.length;
    const list = await Promise.allSettled(Array.from(files).slice(0, room).map(compress));
    const ok = list.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    setShots((s) => [...s, ...ok].slice(0, MAX_FILES));
  };

  const canSend = name.trim().length > 0 && contact.trim().length > 2 && consent;
  const submit = async () => {
    go(questions.length + 2); // «собираю блок»
    const fields: Record<string, string> = {
      Страница: `${window.location.origin}${path}`,
      Блок: label,
    };
    for (const x of questions) fields[x.title.replace(/\*/g, "")] = answerText(x, answers[x.id]) || "—";
    const titles = pickedWorks.map((id) => examples.find((w) => w.id === id)?.title ?? id);
    fields["Нравятся работы"] = titles.join(", ") || "—";
    fields["Скрины"] = shots.length ? `${shots.length} во вложении` : "—";
    let ok = false;
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "block-vibe",
          name: name.trim(),
          phone: contact.trim(),
          fields,
          files: shots,
        }),
      });
      ok = res.ok;
      try {
        localStorage.setItem(CONTACT_KEY, JSON.stringify({ name: name.trim(), contact: contact.trim() }));
      } catch {}
    } catch {}
    // Блок собирается в любом случае — это его ответы, а не наша почта.
    window.setTimeout(() => {
      setTunedBlock(path, blockId, answers);
      onShowBlock();
      setSent(ok ? "ok" : "fail");
      playUi("open");
      setPulse((p) => p + 1);
      setStep(questions.length + 3);
    }, 1400);
  };

  const DONE = questions.length + 3;
  const shown = Math.min(step, TOTAL - 1);
  // Живое превью: заголовок блока пересобирается на каждый ответ — клиент
  // видит, как блок становится его, ещё до конца анкеты.
  const preview = answers.sphere ? tuneBlock(kind, service, answers) : null;
  const briefRows = questions
    .map((x) => ({ k: x.title.replace(/\*/g, "").replace(/\?$/, ""), v: answerText(x, answers[x.id]) }))
    .filter((r) => r.v);
  const extras = pickedWorks.length + shots.length;
  const estimate = answers.sphere ? estimateBlock(service, answers) : null;
  const producer = TEAM.egor;

  return (
    <motion.div
      role="dialog"
      aria-label={`Персонализировать блок «${label}»`}
      // Без filter на самом окошке: любой filter (даже blur(0)) выключает
      // его backdrop-filter, и стекло становится прозрачным.
      // Общая анимация окон сайта, боковой вариант (WIN_SIDE, lib/motion).
      initial={WIN_SIDE.initial}
      animate={WIN_SIDE.animate}
      exit={WIN_SIDE.exit}
      className="block-vibe"
    >
      <div aria-hidden="true" className="block-vibe__aurora" />

      {/* Шапка без крестика (Егор: крестик вниз, к «Дальше») — место
          отдано крупной сфере и названию блока. */}
      <header className="relative flex items-center gap-4 pl-1">
        <DustyOrb><NanoSphere size={50} from={ORB_FROM} to={ORB_TO} hot pulse={pulse} glow={0.35} /></DustyOrb>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.16em]">
            <span className="vibe-mode__wordmark-vibe">Vibe</span>-блок
          </div>
          <div className="mt-0.5 truncate text-[15px] uppercase leading-tight">{label}</div>
        </div>
      </header>

      {step < DONE - 1 && (
        <div className="relative mt-4">
          <div className="flex items-baseline justify-between text-[10px] uppercase tracking-[0.12em]">
            <span>Шаг {shown + 1} из {TOTAL}</span>
            <span className="vibe-mode__iris">{["Сфера", "Задача", "Детали", "Примеры", "Контакт"][shown]}</span>
          </div>
          <div className="mt-2 flex gap-1" aria-hidden="true">
            {Array.from({ length: TOTAL }, (_, i) => (
              <span key={i} className={`block-vibe__seg ${i <= shown ? "is-on" : ""}`} />
            ))}
          </div>
        </div>
      )}

      <div className="relative mt-4 min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-0.5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {q && (
              <>
                <h3 className="block-vibe__title">
                  <Accent text={q.title} />
                </h3>
                <p className="block-vibe__hint">{q.multi ? `Можно выбрать до ${q.multi}` : "Один вариант — дальше перейдём сами"}</p>
                <div className={`mt-4 ${q.options.length > 6 ? "flex flex-wrap gap-1.5" : "grid gap-1.5"}`}>
                  {q.options.map((o, i) => {
                    const on = Array.isArray(current) ? current.includes(o.value) : current === o.value;
                    return q.options.length > 6 ? (
                      <button key={o.value} type="button" onClick={() => pick(o.value)} className={`vibe-mode__chip ${on ? "is-on" : ""}`}>
                        {o.label}
                      </button>
                    ) : (
                      <button key={o.value} type="button" onClick={() => pick(o.value)} className={`vibe-mode__option block-vibe__option ${on ? "is-on" : ""}`}>
                        <span className="vibe-mode__key">{q.multi ? (on ? "✓" : "+") : i + 1}</span>
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {step === questions.length && (
              <>
                <h3 className="block-vibe__title">
                  Покажи, что <Accent text="*нравится*" />
                </h3>
                <p className="block-vibe__hint">Отметь до 3 вариантов или прикрепи свои скрины</p>
                <div className="mt-4 grid grid-cols-3 gap-1.5">
                  {examples.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => toggleWork(w.id)}
                      aria-pressed={pickedWorks.includes(w.id)}
                      title={w.title}
                      className={`block-vibe__work ${pickedWorks.includes(w.id) ? "is-on" : ""}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- готовые обложки из public */}
                      <img src={w.image} alt="" loading="lazy" />
                      <span className="block-vibe__work-name">{w.title}</span>
                      {pickedWorks.includes(w.id) && <span className="block-vibe__tick">✓</span>}
                    </button>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {shots.map((s, i) => (
                    <span key={i} className="block-vibe__shot">
                      {/* eslint-disable-next-line @next/next/no-img-element -- превью файла из браузера */}
                      <img src={s.data} alt={s.name} />
                      <button type="button" aria-label="Убрать скрин" onClick={() => setShots(shots.filter((_, j) => j !== i))}>
                        ×
                      </button>
                    </span>
                  ))}
                  {shots.length < MAX_FILES && (
                    <button type="button" onClick={() => fileRef.current?.click()} className="block-vibe__drop">
                      <span className="text-[18px] leading-none">+</span>
                      <span>Свой скрин</span>
                    </button>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => {
                      void addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>
              </>
            )}

            {step === questions.length + 1 && (
              <>
                <h3 className="block-vibe__title">
                  Куда прислать <Accent text="*разбор*?" />
                </h3>
                <p className="block-vibe__hint">Блок соберётся сразу, продюсер напишет в течение часа</p>
                <div className="mt-4 flex flex-col gap-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Как к тебе обращаться" autoComplete="name" className="vibe-mode__field block-vibe__field" />
                  <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Telegram или телефон" autoComplete="tel" className="vibe-mode__field block-vibe__field" />
                  <div className="mt-1 [&_label]:text-[11px] [&_label]:text-white">
                    <ConsentCheckbox checked={consent} onChange={setConsent} accent="glow" />
                  </div>
                </div>
              </>
            )}

            {step === questions.length + 2 && (
              <div className="flex flex-col items-center pt-12 text-center">
                <DustyOrb><NanoSphere size={84} from={ORB_FROM} to={ORB_TO} hot pulse={pulse} glow={0.35} /></DustyOrb>
                <h3 className="block-vibe__title mt-6">
                  Собираю <Accent text="*блок*" />…
                </h3>
                <p className="block-vibe__hint">Учитываю сферу, ответы и примеры</p>
              </div>
            )}

            {step === DONE && (
              <div>
                <h3 className="block-vibe__title">
                  Блок собран <Accent text="*под тебя*" />
                </h3>
                <p className="block-vibe__hint">
                  {sent === "fail"
                    ? "Бриф не ушёл — напиши в Telegram, продюсер ответит сразу."
                    : sent === "ok"
                    ? "Продюсер получил бриф — напишет в течение часа."
                    : "Он уже на странице. Обсудим детали?"}
                </p>
                {/* Что учли — бриф, который получил продюсер. */}
                {briefRows.length > 0 && (
                  <ul className="block-vibe__brief mt-4">
                    {briefRows.map((r) => (
                      <li key={r.k}>
                        <span>✓</span>
                        <span className="min-w-0">
                          <b>{r.k}</b> {r.v}
                        </span>
                      </li>
                    ))}
                    {extras > 0 && (
                      <li>
                        <span>✓</span>
                        <span>
                          <b>Примеры</b> {extras} шт.
                        </span>
                      </li>
                    )}
                  </ul>
                )}
                {estimate && (
                  <div className="block-vibe__est block-vibe__est--big mt-3">
                    <span>{estimate.price}</span>
                    <span aria-hidden="true">·</span>
                    <span>{estimate.days}</span>
                  </div>
                )}
                {/* Живой продюсер — у задачи есть человек, а не почтовый ящик. */}
                <div className="block-vibe__producer mt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- фото команды из public */}
                  <img src={producer.photo} alt={producer.name} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] uppercase">{producer.name}</div>
                    <div className="text-[11px]">{producer.role}</div>
                  </div>
                  <span className="block-vibe__online">онлайн · ~15 мин</span>
                </div>
                {/* Прогресс по странице: собранные блоки ведут к большому
                    вайб-режиму — вся страница под задачу. */}
                <div className="block-vibe__progress mt-3">
                  <div className="flex items-baseline justify-between text-[11px] uppercase">
                    <span>
                      Собрано {progress.done} из {progress.total} блоков
                    </span>
                  </div>
                  <div className="mt-2 flex gap-1" aria-hidden="true">
                    {Array.from({ length: progress.total }, (_, i) => (
                      <span key={i} className={`block-vibe__seg ${i < progress.done ? "is-on" : ""}`} />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      window.dispatchEvent(new Event(OPEN_VIBE_EVENT));
                    }}
                    className="block-vibe__next mt-2.5 !h-10 w-full !flex-none"
                  >
                    Собрать всю страницу
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Живое превью блока — пока идут вопросы. */}
      {preview && step <= questions.length + 1 && (
        <div className="block-vibe__preview relative mt-3">
          <div className="text-[9px] uppercase tracking-[0.14em]">Твой блок сейчас</div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={preview.title}
              initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
              transition={{ duration: 0.35 }}
              className="mt-1 truncate text-[13px] uppercase"
            >
              <Accent text={preview.title} />
            </motion.div>
          </AnimatePresence>
          {estimate && (
            <div className="block-vibe__est mt-2">
              <motion.span key={estimate.price} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                {estimate.price}
              </motion.span>
              <span aria-hidden="true">·</span>
              <motion.span key={estimate.days} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                {estimate.days}
              </motion.span>
            </div>
          )}
        </div>
      )}

      <footer className="relative mt-3 flex items-center gap-2">
        {step <= questions.length + 1 && (
          <>
            {step > 0 && (
            <button
              type="button"
              onClick={() => go(step - 1)}
              aria-label="Назад"
              className="block-vibe__icon"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
            </button>
            )}
            <button type="button" onClick={onClose} aria-label="Закрыть" className="block-vibe__icon">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            {step === questions.length + 1 ? (
              <button type="button" disabled={!canSend} onClick={submit} className="vibe-mode__cta block-vibe__cta">
                ✦ Собрать блок
              </button>
            ) : (
              <button type="button" disabled={!answered} onClick={() => go(step + 1)} className="block-vibe__next">
                {step === questions.length && extras === 0 ? "Пропустить" : "Дальше"}
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            )}
          </>
        )}
        {step === DONE && (
          <div className="flex w-full flex-col gap-2">
            <div className="flex gap-2">
              <button type="button" onClick={onClose} aria-label="Закрыть" className="block-vibe__icon">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
              <a href={TELEGRAM} target="_blank" rel="noopener noreferrer" className="vibe-mode__cta block-vibe__cta">
                Написать продюсеру
              </a>
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => {
                  setSent(null);
                  go(0);
                }}
                className="block-vibe__link"
              >
                Пересобрать
              </button>
              <button
                type="button"
                onClick={() => {
                  setTunedBlock(path, blockId, null);
                  onClose();
                }}
                className="block-vibe__link"
              >
                Вернуть как было
              </button>
            </div>
          </div>
        )}
      </footer>
    </motion.div>
  );
}
