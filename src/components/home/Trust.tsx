"use client";

import CinematicSection from "@/components/ui/CinematicSection";
import FunnelCta from "@/components/ui/FunnelCta";
import FaqAside from "@/components/home/FaqAside";
import { useService } from "@/lib/service-context";
import { whyByCategory } from "@/lib/service-content";

// Chapter 03 — the old Why + Testimonials + LogoCloud folded into one screen.
// They made the same argument three times across three scroll stops; here the
// three reasons carry it, one quote backs it up, and the client names run as a
// single rule-separated line rather than a logo grid.

const clients = [
  "KIA",
  "Федерация баскетбола",
  "Гольф-клуб",
  "Ani d. Zop",
  "COTRIL",
  "OUTDOOR",
  "GOOD GAME",
];

export default function Trust() {
  const { active } = useService();
  const why = whyByCategory[active];

  return (
    <CinematicSection
      index={2}
      chapter="03"
      title="Почему мы"
      icon="shield"
      side="right"
      // The argument continues here, so it rises rather than cutting in sideways.
      entrance="rise"
      intro="Продюсерский центр полного цикла: от идеи до готового ролика. Около 60% заказов — клиенты, которые возвращаются."
    >
      <div className="lg:flex lg:items-start lg:justify-between lg:gap-12">
        {/* The reasons opposite it push everything lg:ml-auto, which leaves
            this whole column empty above that breakpoint — an FAQ belongs
            here rather than nowhere, since it answers exactly the practical
            questions those reasons raise. Held back below lg: the chapter
            has no vertical room to spare once it's stacking. */}
        <div className="hidden shrink-0 lg:block lg:w-[300px] xl:w-[340px]">
          <FaqAside />
        </div>

        <div className="mt-8 lg:mt-0 lg:max-w-2xl">
          <div className="grid gap-x-8 gap-y-5 rounded-2xl bg-ink/45 p-5 backdrop-blur-md sm:grid-cols-3">
            {why.reasons.map((reason, i) => (
              <div key={reason.title} className="border-t border-paper/25 pt-4">
                <span className="font-mono text-[10px] tracking-[0.2em] text-glow">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-sans text-sm font-semibold leading-snug text-white [text-shadow:0_2px_16px_rgba(11,11,16,0.9)]">
                  {reason.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-paper/70 [text-shadow:0_2px_16px_rgba(11,11,16,0.9)]">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-2 border-t border-paper/15 pt-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper/45">
              Нам доверяют
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper/70 [text-shadow:0_2px_16px_rgba(11,11,16,0.9)]">
              {clients.join(" / ")}
            </span>
          </div>

          <FunnelCta
            item="consult"
            align="right"
            size="sm"
            eyebrow="Есть вопрос?"
            headline="Ответит продюсер"
            accent="а не отдел продаж"
            pitch="Около 60% заказов — клиенты, которые вернулись."
            className="mt-5"
          />
        </div>
      </div>
    </CinematicSection>
  );
}
