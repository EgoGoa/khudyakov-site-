"use client";

import Image from "next/image";
import { useState } from "react";
import type { TeamMember } from "@/lib/team";
import TeamConsultModal from "@/components/home/TeamConsultModal";

// The "write to a real person" card — Egor's reference was a two-column chat
// widget (dark panel, text + button on the left, a photo greeting on the
// right); this is that idea rebuilt in the site's own language instead of a
// flat generic SaaS card: the site's signature pink→orange glass-panel
// border becomes the ring pulsing out from the photo, and the greeting sits
// inside the same glass rather than a plain white box.
//
// Compact by design (not the roomy card in the reference): this lives inside
// chapters that are already tuned to fit one screen (see Close.tsx's own
// comments on that budget), so the card reads as "a person is here" in one
// glance rather than as its own full section. The whole row is one button
// (not photo + separate "Написать" pill) — an earlier pass with both a name
// line and a button text lost the name to `truncate` in this card's own
// width; one click target with an arrow says the same thing in less room.
export default function TeamCard({ member }: { member: TeamMember }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="team-card glass-panel group flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition hover:glass-panel-on sm:px-4"
      >
        <span className="relative h-12 w-12 shrink-0 sm:h-14 sm:w-14">
          <span className="team-photo-pulse relative block h-full w-full overflow-hidden rounded-full ring-2 ring-paper/20 transition group-hover:ring-glow">
            <Image src={member.photo} alt={member.name} fill sizes="56px" className="object-cover" />
          </span>
          <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ink">
            <span className="team-online-dot h-2 w-2 rounded-full bg-emerald-400" />
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-[13px] font-semibold tracking-tight text-paper sm:text-sm">
            {member.name}
          </span>
          <span className="block truncate text-[11px] leading-tight text-paper/55 sm:text-[12px]">
            {member.role}
          </span>
        </span>

        <span
          aria-hidden="true"
          className="shrink-0 text-lg text-glow/70 transition group-hover:translate-x-0.5 group-hover:text-glow"
        >
          →
        </span>
      </button>

      <TeamConsultModal open={open} onClose={() => setOpen(false)} member={member} />
    </>
  );
}
