"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import { SendIcon } from "@/components/ui/Icons";

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

const initialMessages: Message[] = [
  {
    id: "m1",
    role: "assistant",
    text: "Привет! Я ИИ-консультант KHUDYAKOV.AGENCY. Помогу быстро прикинуть формат и бюджет ролика ещё до брифа.",
  },
];

const suggestions = [
  "Сколько стоит рекламный ролик?",
  "Какие сроки на съёмку?",
  "Нужен ролик для соцсетей",
];

let messageId = 1;
function nextId() {
  messageId += 1;
  return `m${messageId}`;
}

export default function AiConsult() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "user", text: trimmed },
    ]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          text: "Эта функция скоро заработает по-настоящему. А пока оставьте заявку в разделе «Бриф» — команда ответит вам лично в течение дня.",
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <section className="border-t border-black/5 py-24 sm:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          <Reveal>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-accent">
              Скоро
            </span>
            <h2 className="font-display text-3xl font-bold uppercase tracking-tightest text-ink sm:text-4xl md:text-5xl">
              Консультация с ИИ-агентом
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-neutral-600 sm:text-lg">
              Мы разрабатываем ИИ-агента, который поможет предварительно
              оценить бюджет и формат съёмки в чате — на этой странице уже
              можно посмотреть, как это будет выглядеть.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
                    AI
                  </div>
                  <div>
                    <div className="text-sm font-medium text-ink">
                      Ассистент KHUDYAKOV.AGENCY
                    </div>
                    <div className="text-xs text-neutral-400">Демо-версия</div>
                  </div>
                </div>
              </div>

              <div className="flex h-80 flex-col gap-3 overflow-y-auto bg-neutral-50 px-5 py-5">
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        message.role === "assistant"
                          ? "self-start bg-white text-neutral-700 shadow-sm"
                          : "self-end bg-accent text-white"
                      }`}
                    >
                      {message.text}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="self-start rounded-2xl bg-white px-4 py-3 text-sm text-neutral-400 shadow-sm"
                  >
                    печатает…
                  </motion.div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 border-t border-black/5 px-5 py-3">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="rounded-full border border-black/10 px-3 py-1.5 text-xs text-neutral-500 transition hover:border-accent/50 hover:text-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-3 border-t border-black/5 px-5 py-4"
              >
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Напишите сообщение…"
                  className="flex-1 bg-transparent text-sm text-ink placeholder:text-neutral-400 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Отправить"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent-dark disabled:opacity-40"
                  disabled={!input.trim()}
                >
                  <SendIcon />
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
