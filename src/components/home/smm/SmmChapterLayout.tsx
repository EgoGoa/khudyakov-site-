"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Appear from "@/components/ui/Appear";
import { BEAT } from "@/lib/motion";
import { CHAPTER_INTRO } from "@/components/ui/CinematicSection";
import { PILL, ROUND } from "@/components/home/smm/SmmDeck";

// The shared skeleton for /smm's chapters — the same one SitesChapterLayout
// gives /sites, in this page's own violet accent.
//
// Every chapter is the same two columns: on the left the chapter number, its
// heading and one supporting line, ending on a primary pill and a glass
// circle-arrow; on the right whatever that chapter actually shows. The two
// columns are centred against each other rather than each against itself,
// which is what the `headless` CinematicSection makes possible — see
// SitesPitch for the full account of why the section's own header could not
// stay.
//
// Keeping this in one file rather than repeating the markup six times is what
// makes "the whole page in one style" true in the code and not just in the
// current screenshot: the heading treatment, the beat delays and the button
// language all have exactly one definition to change.

export default function SmmChapterLayout({
  number,
  title,
  sub,
  primary,
  secondary,
  columnClassName = "lg:w-[38%]",
  children,
}: {
  /** "03" — matches the chapter's own index in the deck. */
  number: string;
  /** Heading content. Pass a fragment with <br /> and <span className="kw">
   *  to control the line break and pick out the one keyword. */
  title: ReactNode;
  /** The supporting line. A ReactNode, not a string, so a chapter can pick
   *  out one phrase with <span className="smm-accent"> — see globals.css for
   *  why that accent is the icons' cyan rather than the heading's violet. */
  sub: ReactNode;
  /** The chapter's one primary action. */
  primary: { href: string; label: string };
  /** The quiet second action, rendered as the glass circle-arrow. */
  secondary: { href: string; label: string };
  /** Left column width at lg. Chapter 01 runs wider because its carousel is
   *  narrower than the other chapters' panels. */
  columnClassName?: string;
  /** The right column. */
  children: ReactNode;
}) {
  return (
    <div className="relative z-10 lg:flex lg:items-center lg:gap-10 xl:gap-14">
      <div className={`w-full shrink-0 ${columnClassName}`}>
        <Appear from="up" delay={BEAT.eyebrow}>
          <div className="flex items-center gap-3 [text-shadow:0_2px_24px_rgba(11,11,16,0.9)]">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c4a0ff]">
              {number}
            </span>
            <span className="h-px w-8 bg-[#a855f7]/40" />
          </div>
        </Appear>

        <Appear from="up" delay={BEAT.title}>
          <h2 className="chapter-neon-violet mt-3 max-w-[6.7em] font-display text-[2.5rem] uppercase leading-[0.95] tracking-tight sm:text-[3.25rem] lg:text-[3.6rem] xl:text-[4rem]">
            {title}
          </h2>
        </Appear>

        <Appear from="up" delay={BEAT.intro}>
          <p className={`mt-6 max-w-[30em] ${CHAPTER_INTRO}`}>{sub}</p>
        </Appear>

        <Appear from="up" delay={BEAT.cta}>
          <div className="mt-9 flex items-center gap-4">
            <Link href={primary.href} className={PILL}>
              {primary.label}
            </Link>
            <Link href={secondary.href} aria-label={secondary.label} className={ROUND}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </Link>
          </div>
        </Appear>
      </div>

      <div className="mt-10 lg:mt-0 lg:flex-1 lg:min-w-0">{children}</div>
    </div>
  );
}

/** The chapter's content panel — the same frosted glass as chapter 01's
 *  carousel cards, so the right-hand column reads as one material across the
 *  page. */
export const SMM_PANEL =
  "rounded-2xl border border-white/[0.12] bg-white/[0.045] shadow-[0_28px_70px_-24px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl backdrop-saturate-150";
