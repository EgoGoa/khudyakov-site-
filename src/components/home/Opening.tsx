"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useStageActive } from "@/components/ui/CinematicStage";
import ChapterIcon from "@/components/ui/ChapterIcon";
import DirectionsGrid from "@/components/home/DirectionsGrid";
import { serviceMeta, type ServiceKey } from "@/lib/service-content";

// Chapter 01. Top-anchored now, same as every other chapter's header — it
// used to open from the bottom of the frame, but with a stat row and an
// awards row both under the title that read as the page starting mid-scroll
// rather than at its own top.
//
// The stat row (5 лет / 200+ клиентов / ...) that used to sit here is gone —
// this chapter now opens straight into the direction grid (see
// DirectionsGrid), so the very first thing a visitor scrolls to is "what do
// you actually make", not a number row. DirectionsGrid reads chapter 01's
// own stage index (useStageActive(0)) for its live-video gate now, not
// chapter 04's — see that component's own comment on why the gate exists.

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Opening({ service }: { service: ServiceKey }) {
  const meta = serviceMeta[service];
  const active = useStageActive(0);
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={false}
      animate={
        reduced
          ? { opacity: active ? 1 : 0 }
          : { x: active ? 0 : -180, opacity: active ? 1 : 0 }
      }
      transition={{ duration: 0.6, ease: EASE }}
      style={{ willChange: "transform, opacity", touchAction: "pan-y" }}
      aria-hidden={!active}
      data-chapter-pane=""
      data-active={active ? "true" : "false"}
      className={`absolute inset-0 flex flex-col justify-start overflow-y-auto px-6 pb-16 pt-24 lg:px-10 lg:pt-28 ${
        active ? "" : "pointer-events-none"
      }`}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex items-center gap-3">
          <ChapterIcon name="aperture" active={active} />
          <span className="h-1.5 w-1.5 animate-pulse-rec rounded-full bg-rec" />
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper/70">
            HDKV.AGENCY
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-glow">01</span>
        </div>

        <h1 className="chapter-neon mt-5 max-w-3xl font-display uppercase leading-[0.92] tracking-tight text-[clamp(2rem,5vw,3.6rem)]">
          Основные направления
        </h1>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-paper/80 sm:text-base [text-shadow:0_2px_24px_rgba(11,11,16,0.9)]">
          {meta.description}
        </p>

        <div className="mt-8">
          <DirectionsGrid />
        </div>
      </div>
    </motion.div>
  );
}
