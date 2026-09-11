"use client";

import Image from "next/image";
import { useState } from "react";
import CenterModal from "@/components/ui/CenterModal";
import { MicIcon } from "@/components/ui/Icons";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useDictation } from "@/lib/use-dictation";
import type { TeamMember } from "@/lib/team";

type Screen = "form" | "sending" | "sent" | "error";

// Opened from a TeamCard's photo/"Написать" button. Deliberately smaller
// than LeadModal's brief (name/contact/one question, not a five-field
// wizard) — a visitor clicking a specific person's face wants to say what
// they need in their own words, not pick chips. Goes through the same
// /api/lead pipeline as every other form on the site, tagged with `type:
// "team"` and the person's name so the inbox shows who was actually asked
// for.
export default function TeamConsultModal({
  open,
  onClose,
  member,
}: {
  open: boolean;
  onClose: () => void;
  member: TeamMember;
}) {
  const [screen, setScreen] = useState<Screen>("form");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const { listening, supported, toggle } = useDictation((t) =>
    setMessage((prev) => (prev ? `${prev} ${t}` : t))
  );

  useBodyScrollLock(open);

  const reset = () => {
    setScreen("form");
    setName("");
    setContact("");
    setMessage("");
  };

  const close = () => {
    onClose();
    setTimeout(reset, 400);
  };

  const canSend = name.trim() && contact.trim();

  const submit = async () => {
    setScreen("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "team",
          name,
          phone: contact,
          fields: {
            "Кому адресовано": `${member.name} (${member.role})`,
            "Вопрос": message || "—",
          },
        }),
      });
      if (!res.ok) throw new Error("send_failed");
      setScreen("sent");
    } catch {
      setScreen("error");
    }
  };

  return (
    <CenterModal open={open} onClose={close} ariaLabel={`Написать ${member.name}`} compact>
      <div className="flex h-fit w-full flex-col text-center">
        {screen === "form" && (
          <>
            <span className="relative mx-auto block h-16 w-16">
              <span className="team-photo-pulse relative block h-full w-full overflow-hidden rounded-full ring-2 ring-glow/50">
                <Image src={member.photo} alt={member.name} fill sizes="64px" className="object-cover" />
              </span>
              <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-ink">
                <span className="team-online-dot h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
            </span>

            <h3 className="mt-4 font-display text-2xl uppercase tracking-tight text-paper sm:text-3xl">
              Написать {member.name}
            </h3>
            <p className="mt-2 text-sm text-paper/60">
              {member.role} · помогу с: {member.helpsWith}
            </p>

            <div className="mt-6 space-y-3 text-left">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Как к вам обращаться"
                  className="w-full rounded-lg border border-paper/15 bg-paper/[0.04] px-4 py-3 text-sm text-paper placeholder:text-paper/35 transition focus:border-glow focus:outline-none"
                />
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Телефон или Telegram"
                  className="w-full rounded-lg border border-paper/15 bg-paper/[0.04] px-4 py-3 text-sm text-paper placeholder:text-paper/35 transition focus:border-glow focus:outline-none"
                />
              </div>
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Что хотите спросить"
                  rows={3}
                  className="w-full rounded-lg border border-paper/15 bg-paper/[0.04] py-3 pl-4 pr-11 text-sm text-paper placeholder:text-paper/35 transition focus:border-glow focus:outline-none"
                />
                {supported && (
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label={listening ? "Остановить запись" : "Надиктовать"}
                    className={`absolute right-2 top-2.5 flex h-7 w-7 items-center justify-center rounded-full transition ${
                      listening ? "bg-glow/25 text-glow" : "text-paper/40 hover:bg-paper/10 hover:text-paper/80"
                    }`}
                  >
                    <MicIcon className={`h-4 w-4 ${listening ? "animate-pulse" : ""}`} />
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={!canSend}
              onClick={submit}
              className={`mx-auto mt-6 rounded-full bg-rec px-7 py-3 text-sm font-medium text-white transition ${
                canSend ? "hover:bg-rec-light active:scale-95" : "pointer-events-none opacity-40"
              }`}
            >
              Отправить →
            </button>
          </>
        )}

        {screen === "sending" && <p className="py-10 text-sm text-paper/60">Отправляем…</p>}

        {screen === "sent" && (
          <>
            <div className="mx-auto flex items-center gap-3 font-display text-xs uppercase tracking-[0.2em] text-glow">
              <span className="h-2 w-2 rounded-full bg-glow" />
              Сообщение отправлено
            </div>
            <h3 className="mt-5 font-display text-2xl uppercase tracking-tight text-paper sm:text-3xl">
              Спасибо, {name || "мы получили сообщение"}!
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-paper/60">
              {member.name} ответит в течение одного рабочего дня на указанный контакт.
            </p>
            <button
              type="button"
              onClick={close}
              className="mx-auto mt-7 rounded-full bg-rec px-7 py-3 text-sm font-medium text-white transition hover:bg-rec-light"
            >
              Закрыть
            </button>
          </>
        )}

        {screen === "error" && (
          <>
            <h3 className="font-display text-2xl uppercase tracking-tight text-paper sm:text-3xl">
              Не получилось отправить
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-paper/60">
              Напишите нам напрямую в Telegram —{" "}
              <a href="https://t.me/hdkv" target="_blank" rel="noopener noreferrer" className="text-glow hover:underline">
                @hdkv
              </a>
              .
            </p>
            <button
              type="button"
              onClick={() => setScreen("form")}
              className="mx-auto mt-7 rounded-full border border-paper/20 px-6 py-3 text-sm font-medium text-paper transition hover:border-paper/50"
            >
              ← Назад
            </button>
          </>
        )}
      </div>
    </CenterModal>
  );
}
