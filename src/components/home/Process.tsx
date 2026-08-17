"use client";

import CinematicSection from "@/components/ui/CinematicSection";
import FunnelCta from "@/components/ui/FunnelCta";
import { useService } from "@/lib/service-context";
import { processByCategory } from "@/lib/service-content";

// Chapter 05. Three steps read across the frame as a numbered strip rather
// than as three stacked cards — the horizontal rule and the step numbers do
// the structural work that card borders used to, leaving the footage visible
// between the columns.

export default function Process() {
  const { active } = useService();
  const steps = processByCategory[active];

  return (
    <CinematicSection
      index={4}
      chapter="05"
      title="Как мы работаем"
      icon="route"
      side="right"
      entrance="slide-right"
      intro="Три шага от брифа до сдачи. На каждом вы видите прогресс и можете вносить правки."
    >
      {steps.length === 0 ? (
        <p className="text-sm leading-relaxed text-paper/60">
          Описание процесса по этому направлению скоро появится здесь.
        </p>
      ) : (
        <div className="relative grid gap-x-10 gap-y-8 rounded-2xl bg-ink/45 p-6 backdrop-blur-md sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="border-t border-glow/40 pt-4">
              <div className="font-display text-3xl leading-none text-glow/80">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-3 font-display text-lg uppercase leading-tight text-white [text-shadow:0_2px_16px_rgba(11,11,16,0.9)]">
                {step.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-paper/70 [text-shadow:0_2px_16px_rgba(11,11,16,0.9)]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      )}

      <FunnelCta
        item="brief"
        align="right"
        pitch="Шаг первый занимает 5 минут. Дальше — 2–3 концепции и смета за 3–5 дней, бесплатно и до подписания договора."
        className="mt-7"
      />
    </CinematicSection>
  );
}
