"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useStageActive } from "@/components/ui/CinematicStage";
import ChapterIcon from "@/components/ui/ChapterIcon";
import { serviceMeta, type ServiceKey } from "@/lib/service-content";

// Chapter 01. Top-anchored now, same as every other chapter's header — it
// used to open from the bottom of the frame, but with a stat row and an
// awards row both under the title that read as the page starting mid-scroll
// rather than at its own top.

const EASE = [0.22, 1, 0.36, 1] as const;

const stats = [
  { value: "5 лет", label: "в видеопроизводстве" },
  { value: "200+", label: "клиентов" },
  { value: "450+", label: "роликов" },
  { value: "5+", label: "в штате" },
  { value: "5 стран", label: "опыт работы" },
];

// One cell in the row carries the FunnelCta's own warm gradient instead of a
// plain border — same shape and size as its neighbours, set apart by colour
// and density rather than by being a different kind of thing. "60%" is the
// repeat-client figure already used in the "why us" chapter, not a new claim.
const HIGHLIGHT_STAT = { value: "60%", label: "клиентов возвращаются" };

// Category only, no premium name and no year — the real award list replaces
// this once it's decided which entries are worth naming. Each still gets its
// own glyph inside the same wreath frame, so six placeholders read as six
// different achievements rather than one icon repeated six times.
const AWARDS = [
  { category: "Лучший рекламный ролик", icon: <path d="M9 7.5v9l8-4.5-8-4.5z" /> },
  { category: "Клиентские коммуникации", icon: <path d="M6 8.5h12v6H10l-3 2.5v-2.5H6v-6z" /> },
  {
    category: "PR-видео",
    icon: <path d="M6 11v2l9 3V8l-9 3zM6 11H4.5a1.2 1.2 0 0 0 0 2H6M8.5 14.3 9.5 18h1.5l-.8-3.3" />,
  },
  { category: "Анимационный проект", icon: <path d="M12 6.5 13.4 10.6 17.5 12 13.4 13.4 12 17.5 10.6 13.4 6.5 12 10.6 10.6 12 6.5z" /> },
  {
    category: "Digital-кампания",
    icon: <><circle cx="12" cy="12" r="4.4" /><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" /></>,
  },
  {
    category: "Нейропродакшн",
    icon: <><rect x="9" y="9" width="6" height="6" rx="1" /><path d="M12 6.5V9M12 15v2.5M6.5 12H9M15 12h2.5" /></>,
  },
];

function WreathBadge({ children }: { children: React.ReactNode }) {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M8 4C5.5 6 4.5 9.5 5.5 13c.8 2.6 2.7 4.7 5 5.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M16 4c2.5 2 3.5 5.5 2.5 9-.8 2.6-2.7 4.7-5 5.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      {[0, 1, 2, 3].map((i) => (
        <path key={`l${i}`} d={`M${7 - i * 0.3} ${6.5 + i * 2.6} L${4.6 - i * 0.5} ${5.8 + i * 2.7}`} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <path key={`r${i}`} d={`M${17 + i * 0.3} ${6.5 + i * 2.6} L${19.4 + i * 0.5} ${5.8 + i * 2.7}`} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      ))}
      <path d="M9.5 18.5 8.5 22l3.5-1.6 3.5 1.6-1-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {children}
      </g>
    </svg>
  );
}

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

        <h1 className="chapter-neon mt-5 max-w-3xl font-display uppercase leading-[0.92] tracking-tight text-[clamp(2.2rem,5.5vw,4rem)]">
          {meta.label}
        </h1>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-paper/80 sm:text-base [text-shadow:0_2px_24px_rgba(11,11,16,0.9)]">
          {meta.description}
        </p>

        <dl className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-paper/15 bg-ink/40 p-4">
              <dt className="font-display text-2xl uppercase leading-none text-white sm:text-3xl">
                {stat.value}
              </dt>
              <dd className="mt-2 font-mono text-[10px] uppercase leading-snug tracking-[0.14em] text-paper/70">
                {stat.label}
              </dd>
            </div>
          ))}
          <div
            className="relative overflow-hidden rounded-2xl border border-orange/40 p-4"
            style={{ background: "linear-gradient(155deg, rgba(255,106,61,0.35), rgba(245,49,11,0.18))" }}
          >
            <dt className="font-display text-2xl uppercase leading-none text-white sm:text-3xl">
              {HIGHLIGHT_STAT.value}
            </dt>
            <dd className="mt-2 font-mono text-[10px] uppercase leading-snug tracking-[0.14em] text-paper/90">
              {HIGHLIGHT_STAT.label}
            </dd>
          </div>
        </dl>

        <div className="mt-9">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper/45">
            Наши награды
          </span>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {AWARDS.map((award) => (
              <div key={award.category} className="flex flex-col items-center text-center">
                <span className="text-orange/70">
                  <WreathBadge>{award.icon}</WreathBadge>
                </span>
                <span className="mt-1.5 text-[10px] leading-tight text-paper/55">{award.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
