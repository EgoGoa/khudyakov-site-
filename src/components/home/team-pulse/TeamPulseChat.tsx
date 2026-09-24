"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { SendIcon, TelegramIcon, WhatsAppIcon } from "@/components/ui/Icons";
import ConsentCheckbox from "@/components/ui/ConsentCheckbox";
import { TELEGRAM_URL } from "@/components/home/direction/contacts";
import type { TeamPulseChatVisual, TeamPulseData } from "./types";

// Бриф по сценарию, а не живой ИИ — решение Егора: на hdkv-ai.ru (reg.ru,
// статическая сборка) серверной части нет, /api/ask там вырезается, и
// ИИ-чат просто не заработал бы. Сценарий отвечает мгновенно, поэтому
// «отвечу за 2 секунды» — правда. Свободный текст принимается на любом
// шаге как ответ. Контакт спрашивается последним, как часть сервиса
// («куда прислать концепции?»), а не анкетой в начале.
//
// Заявка уходит тем же `fetch("/api/lead"` — именно в такой записи: скрипт
// статической сборки ищет эту строку и подменяет её на lead.php.
const WHATSAPP_URL = "https://wa.me/79925111812";
const TYPING_MS = 650;
const CHOSEN_MS = 1100;

type Msg = { from: "bot" | "me"; text: string };
export type Phase = "brief" | "choice" | "callTime" | "contact" | "sending" | "done" | "error";

/** Ответы чата, которые подхватит полный бриф, если человек уйдёт туда. */
export const PREFILL_KEY = "team-pulse-prefill";

export default function TeamPulseChat({
  data,
  onProgress,
}: {
  data: TeamPulseData;
  /** Что сейчас показывать слева: сцена текущего вопроса, выбранный
   *  вариант, фаза брифа и собранные ответы. */
  onProgress?: (p: { visual?: TeamPulseChatVisual; chosen?: number; phase: Phase; answers: string[] }) => void;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(true);
  const [phase, setPhase] = useState<Phase>("brief");
  const [draft, setDraft] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const feed = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLInputElement>(null);

  const say = (text: string, then?: () => void) => {
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { from: "bot", text }]);
      setTyping(false);
      then?.();
    }, TYPING_MS);
  };

  // Первый вопрос — один раз при открытии чата. «Печатает…» уже стоит в
  // начальном состоянии, поэтому здесь только отложенная реплика.
  useEffect(() => {
    const t = setTimeout(() => {
      setMsgs([{ from: "bot", text: data.chat[0].ask }]);
      setTyping(false);
    }, TYPING_MS);
    return () => clearTimeout(t);
  }, [data.chat]);

  useEffect(() => {
    feed.current?.scrollTo({ top: feed.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, phase]);

  const current = phase === "brief" ? data.chat[step] : undefined;

  const answer = (text: string) => {
    const value = text.trim();
    if (!value || typing || !current) return;
    setMsgs((m) => [...m, { from: "me", text: value }]);
    const nextAnswers = { ...answers, [current.key]: answers[current.key] ? `${answers[current.key]}; ${value}` : value };
    setAnswers(nextAnswers);
    const list = Object.values(nextAnswers);
    // Выбор сначала подсвечивается на текущей сцене, и только потом слева
    // приходит сцена следующего вопроса — вместе с репликой Саши.
    onProgress?.({ visual: current.visual, chosen: current.options.indexOf(value), phase: "brief", answers: list });
    const after = step + 1;
    setTimeout(() => {
      onProgress?.(after < data.chat.length ? { visual: data.chat[after].visual, phase: "brief", answers: list } : { phase: "contact", answers: list });
    }, CHOSEN_MS);
    setDraft("");
    const next = step + 1;
    if (next < data.chat.length) {
      setStep(next);
      say(data.chat[next].ask);
    } else {
      say(data.nextAsk, () => setPhase("choice"));
    }
  };

  // Финал брифа — два пути, как просил Егор: «хочу детальнее» уводит в
  // полный бриф (ответы чата едут с собой через sessionStorage), «готов
  // заказать» — время звонка, потом имя и телефон, и заявка со всем
  // собранным уходит команде.
  const toFullBrief = () => {
    try {
      sessionStorage.setItem(PREFILL_KEY, JSON.stringify({ who: data.member.name, source: data.source, answers }));
    } catch {
      /* приватный режим — полный бриф просто откроется пустым */
    }
  };
  const readyToOrder = () => {
    setMsgs((m) => [...m, { from: "me", text: "Готов заказать" }]);
    say(data.callAsk, () => setPhase("callTime"));
  };
  const pickCallTime = (t: string) => {
    setMsgs((m) => [...m, { from: "me", text: t }]);
    setAnswers((a) => ({ ...a, "Когда перезвонить": t }));
    say(data.contactAsk, () => setPhase("contact"));
  };

  const send = async () => {
    setPhase("sending");
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
            "Откуда": data.source,
            "Намерение": "Готов заказать",
            ...answers,
          },
        }),
      });
      if (!res.ok) throw new Error("send_failed");
      setPhase("done");
      onProgress?.({ phase: "done", answers: Object.values(answers) });
      say(data.doneText);
    } catch {
      setPhase("error");
      say("Что-то не отправилось 😔 Напиши мне в Telegram — там отвечу сразу.");
    }
  };

  const canSend = name.trim() && phone.trim() && consent;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-black/25 ring-1 ring-white/10">
      <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3 pr-16">
        <span className="team-pulse-photo relative block h-10 w-10 shrink-0 overflow-hidden rounded-full">
          <Image unoptimized src={data.member.photo} alt={data.member.name} fill sizes="40px" className="object-cover" />
        </span>
        <span className="min-w-0">
          <span className="block font-display text-[13px] uppercase text-white">{data.member.name}</span>
          <span className="flex items-center gap-1.5 font-display text-[9.5px] uppercase tracking-[0.1em] text-[#30d158]">
            <span className="team-pulse-dot" /> {typing ? "печатает…" : "на связи · отвечаю сразу"}
          </span>
        </span>
        <span className="ml-auto hidden gap-1.5 sm:flex">
          <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="team-pulse-messenger">
            <TelegramIcon className="h-3.5 w-3.5" /> Telegram
          </a>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="team-pulse-messenger">
            <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
          </a>
        </span>
      </div>

      <div ref={feed} className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-4">
        <AnimatePresence initial={false}>
          {msgs.map((m, k) => (
            <motion.div
              key={k}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`max-w-[82%] px-3.5 py-2.5 text-[14px] font-semibold leading-snug text-white sm:text-[15px] ${
                m.from === "me" ? "team-pulse-me self-end rounded-2xl rounded-br-md" : "self-start rounded-2xl rounded-bl-md bg-white/[0.09]"
              }`}
            >
              {m.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {typing && (
          <div className="flex gap-1 self-start rounded-2xl rounded-bl-md bg-white/[0.09] px-3.5 py-3" aria-label="печатает">
            {[0, 1, 2].map((d) => (
              <i key={d} className="team-pulse-typing h-1.5 w-1.5 rounded-full bg-white" style={{ animationDelay: `${d * 0.15}s` }} />
            ))}
          </div>
        )}

        {current && !typing && (
          <div className="flex flex-wrap gap-1.5">
            {current.options.map((o) => (
              <button key={o} type="button" onClick={() => answer(o)} className="team-pulse-option">
                {o}
              </button>
            ))}
          </div>
        )}

        {phase === "choice" && !typing && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={data.briefHref} onClick={toFullBrief} className="team-pulse-option !py-2.5 text-center">
              Хочу детальнее — полный бриф
            </Link>
            <button type="button" onClick={readyToOrder} className="team-pulse-send !px-5 !py-2.5">
              Готов заказать
            </button>
          </div>
        )}

        {phase === "callTime" && !typing && (
          <div className="flex flex-wrap gap-1.5">
            {data.callOptions.map((o) => (
              <button key={o} type="button" onClick={() => pickCallTime(o)} className="team-pulse-option">
                {o}
              </button>
            ))}
          </div>
        )}

        {(phase === "contact" || phase === "sending") && !typing && (
          <div className="mt-1 flex flex-col gap-2 rounded-2xl bg-white/[0.05] p-3 ring-1 ring-white/10">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Как тебя зовут" autoComplete="name" className="team-pulse-input" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Телефон или @telegram" autoComplete="tel" className="team-pulse-input" />
            <ConsentCheckbox checked={consent} onChange={setConsent} accent="glow" />
            <button type="button" disabled={!canSend || phase === "sending"} onClick={send} className="team-pulse-send">
              {phase === "sending" ? "Отправляю…" : `Отправить ${data.member.nameDative}`}
            </button>
          </div>
        )}

        {(phase === "done" || phase === "error") && !typing && (
          <div className="flex flex-wrap gap-1.5">
            <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="team-pulse-messenger !py-2 !text-[12.5px]">
              <TelegramIcon className="h-4 w-4" /> Продолжить в Telegram
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="team-pulse-messenger !py-2 !text-[12.5px]">
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        )}
      </div>

      {phase === "brief" && (
        <form
          className="mx-3 mb-3 flex items-center gap-2 rounded-2xl bg-white/[0.07] px-3 py-2"
          onSubmit={(e) => {
            e.preventDefault();
            answer(draft);
          }}
        >
          {current?.attach && (
            <>
              <button type="button" aria-label="Прикрепить референс" onClick={() => file.current?.click()} className="text-[17px] text-white">
                📎
              </button>
              {/* Сам файл по заявке не уходит — письмо собирается из
                  текста. В бриф попадает имя файла, а сам референс Саша
                  попросит в мессенджере. */}
              <input
                ref={file}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) answer(`📎 ${f.name}`);
                  e.target.value = "";
                }}
              />
            </>
          )}
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Напиши или выбери вариант…"
            className="min-w-0 flex-1 bg-transparent py-1.5 text-[14px] font-semibold text-white outline-none placeholder:text-white/70"
          />
          <button
            type="submit"
            aria-label="Отправить"
            disabled={!draft.trim() || typing}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full team-pulse-send-round disabled:opacity-40"
          >
            <SendIcon />
          </button>
        </form>
      )}
    </div>
  );
}
