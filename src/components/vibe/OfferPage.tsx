"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import NanoSphere from "@/components/ui/NanoSphere";
import ConsentCheckbox from "@/components/ui/ConsentCheckbox";
import { PAGE_GRADIENT } from "@/components/home/PageSideNav";
import { buildOffer, decodeAnswers, encodeAnswers, formatBudget, type VibeAnswers } from "@/lib/vibe-quiz";
import type { PricingTier } from "@/lib/types";
import { Arrow, CONTACT_KEY, ORB_FROM, ORB_TO, TELEGRAM } from "./VibeMode";

// Страница-КП вайб-режима (Егор, 2026-09-26): отдельная страница в
// фирменном стиле сайта, которая выглядит как коммерческое предложение и
// презентация продукта под конкретного клиента — его сфера, задача,
// бюджет, решение, кейсы и тарифы с заказом в один клик. Собирается в
// браузере из ответов в адресе (?p=…), см. lib/vibe-quiz.

const EASE = [0.22, 1, 0.36, 1] as const;

type Contact = { name: string; contact: string };

function readContact(): Contact | null {
  try {
    const raw = localStorage.getItem(CONTACT_KEY);
    const data = raw ? JSON.parse(raw) : null;
    return data && typeof data.name === "string" && typeof data.contact === "string" ? data : null;
  } catch {
    return null;
  }
}

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Chapter({ n, eyebrow, title, accent, children }: { n: string; eyebrow: string; title: string; accent: string; children: ReactNode }) {
  return (
    <section className="offer-chapter mx-auto w-full max-w-[1120px] px-4 py-16 sm:px-8 sm:py-24">
      <Reveal>
        <span className="offer-eyebrow">
          {n} · {eyebrow}
        </span>
        <h2 className="offer-h2 mt-4">
          {title} <span className="offer-kw">{accent}</span>
        </h2>
      </Reveal>
      <div className="mt-10">{children}</div>
    </section>
  );
}

export default function OfferPage() {
  const params = useSearchParams();
  const p = params.get("p");
  const answers = useMemo<VibeAnswers | null>(() => (p ? decodeAnswers(p) : null), [p]);
  const [contact, setContact] = useState<Contact | null>(null);
  useEffect(() => {
    // Имя клиента живёт только в его браузере — читается после монтирования.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- внешнее хранилище, один раз
    setContact(readContact());
  }, []);

  if (!answers || !answers.direction) {
    return (
      <main className="offer flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <NanoSphere size={120} from={ORB_FROM} to={ORB_TO} glow={0.35} />
        <h1 className="offer-h2 mt-8">КП не найдено</h1>
        <p className="offer-lead mt-4 max-w-[480px]">Ссылка неполная. Пройди вайб-режим заново — это три минуты.</p>
        <Link href="/?vibe=1" className="vibe-mode__cta mt-8">
          Собрать КП
          <Arrow />
        </Link>
      </main>
    );
  }

  return <Offer answers={answers} contact={contact} onContact={setContact} />;
}

function Offer({ answers, contact, onContact }: { answers: VibeAnswers; contact: Contact | null; onContact: (c: Contact) => void }) {
  const offer = buildOffer(answers);
  const g = PAGE_GRADIENT[offer.key];
  const [orderTier, setOrderTier] = useState<PricingTier | null>(null);
  const [pulse, setPulse] = useState(0);

  const style = {
    ["--of-from" as string]: g.from,
    ["--of-to" as string]: g.to,
  };

  return (
    <main className="offer" style={style}>
      {/* ---------- Обложка ---------- */}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-28 text-center sm:px-8">
        {offer.video && (
          <video className="offer-hero-video" src={offer.video} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
        )}
        <div className="offer-hero-veil" aria-hidden="true" />
        <div className="relative z-[1] flex flex-col items-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: EASE }}>
            <NanoSphere size={120} from={ORB_FROM} to={ORB_TO} glow={0.35} pulse={pulse} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: EASE }}>
            <span className="offer-eyebrow mt-6 block">
              Персональное предложение · HUD.SERVICE{contact ? ` · для ${contact.name}` : ""}
            </span>
            <h1 className="offer-h1 mx-auto mt-5 max-w-[1000px]">
              <span className="offer-kw">{offer.product}</span>
              <br />
              {offer.company ? `для «${offer.company}»` : offer.sphere ? `для сферы «${offer.sphere}»` : "под твою задачу"}
            </h1>
            {offer.goalLine && <p className="offer-lead mx-auto mt-6 max-w-[640px]">{offer.goalLine}</p>}
            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {[offer.sphere, offer.budget ? `Бюджет: ${formatBudget(offer.budget)}` : null, `Тариф «${offer.tier.name}»`]
                .filter(Boolean)
                .map((c) => (
                  <span key={c} className="vibe-mode__pill">
                    {c}
                  </span>
                ))}
            </div>
            <div className="mt-9 flex flex-wrap justify-center gap-2.5">
              <a href="#tariffs" className="vibe-mode__cta" onClick={() => setPulse((x) => x + 1)}>
                Смотреть тарифы
                <Arrow />
              </a>
              <a href={TELEGRAM} target="_blank" rel="noopener noreferrer" className="vibe-mode__ghost vibe-mode__ghost--pill">
                Обсудить в Telegram
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- 01 Задача ---------- */}
      <Chapter n="01" eyebrow="Задача" title="Мы поняли" accent="так">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {offer.brief.map((b, i) => (
            <Reveal key={b.label} delay={i * 0.05} className="offer-card">
              <span className="offer-label">{b.label}</span>
              <p className="mt-2 text-[17px] font-semibold leading-snug">{b.value}</p>
            </Reveal>
          ))}
        </div>
      </Chapter>

      {/* ---------- 02 Решение ---------- */}
      <Chapter n="02" eyebrow="Решение" title="Что мы" accent="сделаем">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <Reveal className="offer-card offer-card--glow">
            <ol className="space-y-4">
              {offer.solution.map((s, i) => (
                <li key={s} className="flex gap-4">
                  <span className="offer-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[17px] font-medium leading-snug">{s}</span>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={0.1} className="offer-card flex flex-col justify-between">
            <div>
              <span className="offer-label">Рекомендуем</span>
              <p className="mt-2 font-display text-[26px] uppercase leading-tight">{offer.tier.name}</p>
              <p className="mt-1 text-[18px] font-semibold">{offer.tier.price}</p>
              <p className="mt-3 text-[15px]">{offer.tier.tagline}</p>
            </div>
            {offer.deadlineLine && <p className="mt-6 text-[15px] font-medium">{offer.deadlineLine}</p>}
          </Reveal>
        </div>
      </Chapter>

      {/* ---------- 03 Кейсы ---------- */}
      <Chapter n="03" eyebrow="Кейсы" title={offer.sphere ? "Работы в твоей" : "Наши"} accent={offer.sphere ? "сфере" : "работы"}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {offer.cases.map((w, i) => (
            <Reveal key={w.id} delay={i * 0.06}>
              <Link href="/works" className="offer-case group block">
                <span className="relative block aspect-video overflow-hidden rounded-[18px]">
                  <Image
                    unoptimized
                    src={`/images/works/${w.youtubeId ?? w.id}.jpg`}
                    alt={w.title}
                    fill
                    sizes="(min-width:1024px) 360px, (min-width:640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                </span>
                <span className="mt-3 block text-[16px] font-semibold leading-snug">{w.title}</span>
                <span className="mt-0.5 block text-[13px]">
                  {w.client}
                  {w.sphere ? ` · ${w.sphere}` : ""}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Chapter>

      {/* ---------- 04 Этапы ---------- */}
      <Chapter n="04" eyebrow="Процесс" title="Как будем" accent="работать">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {offer.process.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06} className="offer-card">
              <span className="offer-num">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-[17px] font-semibold leading-snug">{s.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed">{s.description}</p>
            </Reveal>
          ))}
        </div>
      </Chapter>

      {/* ---------- 05 Тарифы ---------- */}
      <div id="tariffs" />
      <Chapter n="05" eyebrow="Тарифы" title="Выбери свой" accent="план">
        <div className="grid gap-4 lg:grid-cols-3">
          {offer.tiers.map((t, i) => {
            const rec = t.name === offer.tier.name;
            return (
              <Reveal key={t.name} delay={i * 0.08} className={`offer-tier ${rec ? "is-rec" : ""}`}>
                {rec && <span className="offer-badge">Под твой бюджет</span>}
                <span className="text-[13px] font-semibold uppercase tracking-[0.12em]">{t.tagline}</span>
                <p className="mt-3 font-display text-[clamp(17px,1.3vw,20px)] uppercase leading-tight">{t.name}</p>
                <p className="mt-3 text-[20px] font-semibold">{t.price}</p>
                <p className="mt-1 text-[14px]">{t.team}</p>
                <ul className="mt-6 space-y-2.5">
                  {(t.benefits ?? t.features).map((f) => (
                    <li key={f} className="flex gap-2.5 text-[15px] font-semibold leading-snug">
                      <span className="vibe-mode__assist-dot mt-[7px]" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setOrderTier(t)}
                  className={`mt-8 w-full justify-center ${rec ? "vibe-mode__cta btn-neon-breathe" : "vibe-mode__ghost vibe-mode__ghost--pill"}`}
                >
                  Выбрать план
                </button>
              </Reveal>
            );
          })}
        </div>
      </Chapter>

      {/* ---------- 06 Почему мы ---------- */}
      <Chapter n="06" eyebrow="Почему мы" title="Почему" accent="HUD.SERVICE">
        <div className="grid gap-3 sm:grid-cols-2">
          {offer.why.map((r, i) => (
            <Reveal key={r.title} delay={i * 0.06} className="offer-card">
              <h3 className="text-[18px] font-semibold leading-snug">{r.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed">{r.description}</p>
            </Reveal>
          ))}
        </div>
      </Chapter>

      {/* ---------- Финал ---------- */}
      <section className="mx-auto flex max-w-[860px] flex-col items-center px-4 pb-28 pt-10 text-center">
        <NanoSphere size={96} from={ORB_FROM} to={ORB_TO} glow={0.35} hot />
        <h2 className="offer-h2 mt-8">
          Запускаем <span className="offer-kw">твой проект?</span>
        </h2>
        <p className="offer-lead mt-4 max-w-[560px]">Выбери план — продюсер свяжется в течение часа и уточнит детали.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          <button type="button" onClick={() => setOrderTier(offer.tier)} className="vibe-mode__cta">
            Заказать «{offer.tier.name}»
            <Arrow />
          </button>
          <a href={TELEGRAM} target="_blank" rel="noopener noreferrer" className="vibe-mode__ghost vibe-mode__ghost--pill">
            Задать вопрос
          </a>
        </div>
      </section>

      {orderTier && (
        <OrderSheet
          tier={orderTier}
          answers={answers}
          title={offer.title}
          contact={contact}
          onContact={onContact}
          onClose={() => setOrderTier(null)}
        />
      )}
    </main>
  );
}

function OrderSheet({
  tier,
  answers,
  title,
  contact,
  onContact,
  onClose,
}: {
  tier: PricingTier;
  answers: VibeAnswers;
  title: string;
  contact: Contact | null;
  onContact: (c: Contact) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(contact?.name ?? "");
  const [phone, setPhone] = useState(contact?.contact ?? "");
  const [consent, setConsent] = useState(!!contact);
  const [state, setState] = useState<"form" | "sending" | "done" | "error">("form");
  const ready = name.trim() && phone.trim() && consent && state !== "sending";

  const send = async () => {
    if (!ready) return;
    setState("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "vibe-order",
          name: name.trim(),
          phone: phone.trim(),
          fields: {
            "Выбранный план": `${tier.name} · ${tier.price}`,
            "КП": title,
            "Ссылка на КП": `${window.location.origin}/offer?p=${encodeAnswers(answers)}`,
          },
        }),
      });
      if (!res.ok) throw new Error("send_failed");
      const c = { name: name.trim(), contact: phone.trim() };
      try {
        localStorage.setItem(CONTACT_KEY, JSON.stringify(c));
      } catch {}
      onContact(c);
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="vibe-mode fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Заказ" onClick={onClose}>
      <div className="vibe-mode__window" onClick={(e) => e.stopPropagation()}>
      <div className="vibe-mode__aurora" aria-hidden="true" />
      <button type="button" aria-label="Закрыть" onClick={onClose} className="vibe-mode__icon-btn absolute right-4 top-4 z-[2]">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <div className="vibe-mode__scroll z-[1] flex w-full flex-col items-center px-6 pb-8 pt-10 text-center sm:px-10">
        <NanoSphere size={80} from={ORB_FROM} to={ORB_TO} glow={0.35} hot={state === "sending" || state === "done"} />
        {state === "done" ? (
          <>
            <h2 className="vibe-mode__title vibe-mode__title--q mt-6">Заявка принята</h2>
            <p className="vibe-mode__lead mt-3">План «{tier.name}». Продюсер свяжется в течение часа.</p>
            <button type="button" onClick={onClose} className="vibe-mode__cta mt-8">
              Вернуться к КП
            </button>
          </>
        ) : (
          <>
            <span className="vibe-mode__eyebrow mt-6">Заказ</span>
            <h2 className="vibe-mode__title vibe-mode__title--q mt-3">
              План «{tier.name}»
            </h2>
            <p className="vibe-mode__lead mt-2">{tier.price}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
              className="mt-7 flex w-full flex-col gap-2.5 text-left"
            >
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Как к тебе обращаться" autoComplete="name" className="vibe-mode__field" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telegram или телефон" autoComplete="tel" className="vibe-mode__field" />
              {!contact && (
                <div className="mt-1 px-1 [&_label]:text-[13px] [&_label]:text-white">
                  <ConsentCheckbox checked={consent} onChange={setConsent} accent="glow" />
                </div>
              )}
              {state === "error" && (
                <p className="px-1 text-[14px]">
                  Не получилось отправить.{" "}
                  <a href={TELEGRAM} target="_blank" rel="noopener noreferrer" className="underline">
                    Напиши нам в Telegram
                  </a>
                  .
                </p>
              )}
              <button type="submit" disabled={!ready} className="vibe-mode__cta mt-4 justify-center">
                {state === "sending" ? "Отправляю…" : "Заказать"}
                <Arrow />
              </button>
            </form>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
