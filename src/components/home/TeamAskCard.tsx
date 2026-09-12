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
}) {
  const [open, setOpen] = useState(false);

  const card = compact ? (
    <div
      className={`team-ask-window group relative flex h-full flex-col justify-between gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-orange/15 via-ink/80 to-ink p-4 text-left sm:p-5 ${glow ? "consult-card-pulse" : ""} ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="relative h-12 w-12 shrink-0 sm:h-14 sm:w-14">
          <span className="team-photo-pulse relative block h-full w-full overflow-hidden rounded-full ring-1 ring-paper/25">
            <Image src={member.photo} alt={member.name} fill sizes="56px" className="object-cover" />
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
      className={`team-ask-window group relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-orange/20 via-ink/85 to-ink p-6 text-center sm:p-8 ${glow ? "consult-card-pulse" : ""} ${className}`}
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
        <span className="relative mx-auto block h-24 w-24 sm:h-28 sm:w-28">
          <span className="team-photo-pulse relative block h-full w-full overflow-hidden rounded-full ring-4 ring-paper/95">
            <Image src={member.photo} alt={member.name} fill sizes="112px" className="object-cover" />
          </span>
        </span>

        <p className="mt-3 font-display text-[13px] uppercase tracking-tight text-paper/70">
          {member.name} <span className="text-paper/40">· {member.role}</span>
        </p>

        <h3 className="mx-auto mt-3 max-w-sm font-display text-xl uppercase leading-[1.05] tracking-tight text-white sm:text-2xl">
          {question}
        </h3>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-paper/70 sm:text-[15px]">{pitch}</p>

        <span className="btn-neon btn-warm mt-5 inline-flex transition group-hover:brightness-110">
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
