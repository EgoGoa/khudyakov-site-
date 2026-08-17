"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useStageActive } from "@/components/ui/CinematicStage";
import FunnelCta from "@/components/ui/FunnelCta";
import ChapterIcon from "@/components/ui/ChapterIcon";
import { serviceMeta, type ServiceKey } from "@/lib/service-content";

// Chapter 01. It does not use the shared CinematicSection layout — the opening
// frame is bottom-anchored rather than top-anchored, and its numbers sit in
// one thin rule-separated strip instead of a card grid.
//
// The heading carries the same cyan neon as the hero's "DIGITAL AI" (the
// .chapter-neon class) so the pages read as one typographic system. An earlier
// pass set it oversized and clipped by the right edge; that fought the footage
// for the frame, so it is now sized to sit inside it. A knockout treatment
// (mix-blend-mode) was tried before that and dropped outright — this reel is
// dark, so letters "revealing" it read as dark-on-dark.

const EASE = [0.22, 1, 0.36, 1] as const;

// Each tile carries its own off-centre colour source, the way the reference
// deck lit its metric cards from within. The hues stay inside the site's own
// range — cyan `glow` and the `rec` orange — rather than becoming a rainbow:
// the point of the treatment is depth, not extra colours.
const stats = [
  { value: "5 лет", label: "в видеопроизводстве", glow: "at 22% 28%, rgba(0,210,255,0.42)" },
  { value: "200+", label: "клиентов", glow: "at 78% 30%, rgba(0,210,255,0.3)" },
  { value: "450+", label: "роликов", glow: "at 30% 76%, rgba(245,49,11,0.34)" },
  { value: "5+", label: "в штате", glow: "at 72% 70%, rgba(0,210,255,0.26)" },
  { value: "5 стран", label: "опыт работы", glow: "at 50% 24%, rgba(255,102,68,0.3)" },
];

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
      className={`absolute inset-0 flex flex-col justify-end overflow-y-auto px-6 pb-16 pt-28 lg:px-10 lg:pb-20 ${
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

        <h1 className="chapter-neon mt-5 max-w-3xl font-display uppercase leading-[0.92] tracking-tight text-[clamp(2.4rem,6vw,4.5rem)]">
          {meta.label}
        </h1>

        <p className="mt-5 max-w-md text-sm leading-relaxed text-paper/80 sm:text-base [text-shadow:0_2px_24px_rgba(11,11,16,0.9)]">
          {meta.description}
        </p>

        <dl className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass-tile overflow-hidden p-4"
            >
              {/* The colour source sits *inside* the pane, so it reads as light
                  caught in the glass rather than as a coloured background. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10"
                style={{ background: `radial-gradient(120% 110% ${stat.glow}, transparent 68%)` }}
              />
              <dt className="relative z-[2] font-display text-2xl uppercase leading-none text-white [text-shadow:0_1px_12px_rgba(11,11,16,0.8)] sm:text-3xl">
                {stat.value}
              </dt>
              <dd className="relative z-[2] mt-2 font-mono text-[10px] uppercase leading-snug tracking-[0.14em] text-paper/80">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>

        <FunnelCta
          item="calculator"
          pitch="450 роликов за 5 лет — и цены заметно ниже московских студий того же уровня. Прикиньте бюджет за минуту, без звонка менеджеру."
          className="mt-8"
        />
      </div>
    </motion.div>
  );
}
