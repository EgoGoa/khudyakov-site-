"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { TeamMember } from "@/lib/team";
import TeamConsultModal from "@/components/home/TeamConsultModal";

// The "ask a real person" window — Egor's reference: a panel with a real,
// specific question (not "есть вопрос?"), a photo big enough to actually
// see the face, and one button — reading as a single unit rather than a
// button with a decoration beside it.
//
// Two sizes, not one: the full stacked window (default) needs real vertical
// room, and dropping it into Trust.tsx's own grid — a row whose height is
// pinned to match PromoCard's own height (`lg:h-full`, see that file's
// comments) — pushed the whole chapter past the one-screen budget every
// other chapter on the site keeps to. `compact` is the same card's content
// in the site's existing small horizontal shape (~70px), for slots that
// share height with something else instead of owning their own.
export default function TeamAskCard({
  member,
  question,
  pitch,
  actionLabel,
  /** Real navigation (e.g. "/brief") for asks that are just the existing
   *  form under a friendlier button — the card still shows the person, but
   *  clicking goes straight there instead of opening the chat modal. Omit
   *  to open TeamConsultModal instead (for asks that need an actual answer
   *  before a brief makes sense). */
  href,
  compact = false,
  className = "",
  /** Full-variant only: a photo behind the card's own gradient, dimmed
   *  enough that the question/pitch stay readable on top of it. Optional —
   *  omitting it keeps the plain gradient-only look every other caller
   *  still uses. */
  backgroundImage,
  /** Off only for Process.tsx's /content pair (Вадим/Егор) — sitting right
   *  under the six now-animated process-step-card glows, their own
   *  always-on pulse competed with that new sequential light instead of
   *  reading as a separate, calmer element. Every other caller keeps the
   *  pulse. */
  glow = true,
  /** Второе, независимое действие рядом с основной кнопкой — сейчас только
   *  для DirectionHero: там Telegram раньше стоял отдельной кнопкой снаружи
   *  окошка, и Егор попросил свести оба действия («присоединиться» + мессенджер)
   *  в одно окно. Задаются вместе — без одного из двух не рендерится. */
  secondaryHref,
  secondaryIcon,
  /** Full-variant only: a tighter photo/heading/padding scale for slots
   *  that don't have ConsultCard's full two-row-span height to work with
   *  (e.g. AiGuarantees' Egor card, pinned to half a fixed-height column).
   *  Default sizes stay untouched everywhere else. */
  dense = false,
}: {
  member: TeamMember;
  question: ReactNode;
  pitch: ReactNode;
  actionLabel: string;
  href?: string;
  compact?: boolean;
  className?: string;
  backgroundImage?: string;
  glow?: boolean;
  secondaryHref?: string;
  secondaryIcon?: ReactNode;
  dense?: boolean;
}) {
  const [open, setOpen] = useState(false);

  // Второе действие ломает обычное предположение раскладки — там всей
  // карточкой можно кликнуть (Link/button снаружи). С двумя независимыми
  // действиями оборачивать нечего: каждое само по себе Link/button, а
  // карточка — просто контейнер.
  if (compact && secondaryHref && secondaryIcon) {
    const primaryClass =
      "btn-neon btn-warm mt-1 inline-flex w-fit !px-3.5 !py-1.5 !text-[9px] transition group-hover:brightness-110";
    return (
      <>
        <div
          className={`team-ask-window group relative flex h-full flex-col justify-between gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-orange/15 via-ink/80 to-ink p-4 text-left sm:p-5 ${glow ? "consult-card-pulse" : ""} ${className}`}
        >
          <div className="flex items-start gap-3">
            <span className="relative h-12 w-12 shrink-0 sm:h-14 sm:w-14">
              <span className="team-photo-pulse relative block h-full w-full overflow-hidden rounded-full ring-1 ring-paper/25">
                <Image unoptimized src={member.photo} alt={member.name} fill sizes="56px" className="object-cover" />
              </span>
            </span>
            <div className="min-w-0">
              <span className="block font-display text-[9px] uppercase tracking-[0.16em] text-orange">
                {member.name} · {member.role}
              </span>
              <span className="mt-1 block font-display text-sm uppercase leading-tight tracking-tight text-white">
                {question}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {href ? (
              <Link href={href} className={primaryClass}>
                {actionLabel} →
              </Link>
            ) : (
              <button type="button" onClick={() => setOpen(true)} className={primaryClass}>
                {actionLabel} →
              </button>
            )}
            <a
              href={secondaryHref}
              target="_blank"
              rel="noreferrer"
              className="btn-neon mt-1 inline-flex !px-3 !py-1.5 transition hover:brightness-110"
            >
              {secondaryIcon}
            </a>
          </div>
        </div>
        {!href && <TeamConsultModal open={open} onClose={() => setOpen(false)} member={member} />}
      </>
    );
  }

  const card = compact ? (
    <div
      className={`team-ask-window group relative flex h-full flex-col justify-between gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-orange/15 via-ink/80 to-ink p-4 text-left sm:p-5 ${glow ? "consult-card-pulse" : ""} ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="relative h-12 w-12 shrink-0 sm:h-14 sm:w-14">
          <span className="team-photo-pulse relative block h-full w-full overflow-hidden rounded-full ring-1 ring-paper/25">
            <Image unoptimized src={member.photo} alt={member.name} fill sizes="56px" className="object-cover" />
          </span>
        </span>
        <div className="min-w-0">
          <span className="block font-display text-[9px] uppercase tracking-[0.16em] text-orange">
            {member.name} · {member.role}
          </span>
          <span className="mt-1 block font-display text-sm uppercase leading-tight tracking-tight text-white">
            {question}
          </span>
        </div>
      </div>
      <span className="btn-neon btn-warm mt-1 inline-flex w-fit !px-3.5 !py-1.5 !text-[9px] transition group-hover:brightness-110">
        {actionLabel} →
      </span>
    </div>
  ) : (
    <div
      className={`team-ask-window group relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-orange/20 via-ink/85 to-ink text-center ${dense ? "p-5" : "p-6 sm:p-8"} ${glow ? "consult-card-pulse" : ""} ${className}`}
    >
      {backgroundImage && (
        <>
          <Image
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            fill
            sizes="480px"
            className="pointer-events-none absolute inset-0 object-cover"
          />
          {/* Exposure-style darkening so the question/pitch text on top stays
              readable against whatever the photo is doing underneath. */}
          <span
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/70 to-ink/90"
            aria-hidden="true"
          />
        </>
      )}
      {/* Everything below needs to be in its own positioned stacking layer —
          without `relative`, plain in-flow text paints *behind* the
          absolutely-positioned background image/tint above regardless of
          DOM order (that's how CSS stacking works: positioned elements with
          z-index:auto always sit above non-positioned in-flow content). */}
      <div className="relative z-10">
        <span className={`relative mx-auto block ${dense ? "h-14 w-14" : "h-24 w-24 sm:h-28 sm:w-28"}`}>
          <span className="team-photo-pulse relative block h-full w-full overflow-hidden rounded-full ring-4 ring-paper/95">
            <Image unoptimized src={member.photo} alt={member.name} fill sizes="112px" className="object-cover" />
          </span>
        </span>

        <p className={`font-display uppercase tracking-tight text-paper/70 ${dense ? "mt-2 text-[11px]" : "mt-3 text-[13px]"}`}>
          {member.name} <span className="text-paper/40">· {member.role}</span>
        </p>

        <h3
          className={`mx-auto font-display uppercase leading-[1.15] tracking-tight text-white ${
            dense ? "mt-1.5 max-w-[22em] text-sm" : "mt-3 max-w-sm text-xl sm:text-[1.35rem]"
          }`}
        >
          {question}
        </h3>
        <p
          className={`mx-auto max-w-sm leading-relaxed text-paper/70 ${
            dense ? "mt-2 max-w-[24em] text-xs" : "mt-3 text-sm sm:text-[15px]"
          }`}
        >
          {pitch}
        </p>

        <span
          className={`btn-neon btn-warm inline-flex transition group-hover:brightness-110 ${
            dense ? "mt-3 !px-4 !py-2 !text-[10px]" : "mt-5"
          }`}
        >
          {actionLabel} →
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {card}
      </Link>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="block h-full w-full">
        {card}
      </button>
      <TeamConsultModal open={open} onClose={() => setOpen(false)} member={member} />
    </>
  );
}
