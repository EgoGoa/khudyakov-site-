"use client";

import CinematicSection from "@/components/ui/CinematicSection";
import FunnelCta from "@/components/ui/FunnelCta";
import { useService } from "@/lib/service-context";
import { servicesByCategory } from "@/lib/service-content";

// Chapter 04 — the services list plus the AI-assistant teaser that used to be
// a full section of its own. Set as a bare two-column index: numbers and
// titles only, with the description carried by the title itself, so ten items
// still leave most of the frame empty.

export default function Offer() {
  const { active } = useService();
  const services = servicesByCategory[active];

  return (
    <CinematicSection
      index={3}
      chapter="04"
      title="Что мы делаем"
      icon="layers"
      side="left"
      // New subject after the trust argument — it tips up into place.
      entrance="unfold"
      intro="Съёмка, монтаж, графика и AI-продакшн — под формат и площадку."
    >
      {services.length === 0 ? (
        <p className="text-sm leading-relaxed text-paper/60">
          Список услуг по этому направлению скоро появится здесь.
        </p>
      ) : (
        <ul className="grid max-w-4xl gap-x-10 gap-y-0 sm:grid-cols-2">
          {services.map((service, i) => (
            <li
              key={service.title}
              className="group flex items-baseline gap-3 border-t border-paper/20 py-3"
            >
              <span className="font-mono text-[10px] text-paper/40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-base uppercase leading-tight tracking-tight text-white transition-colors group-hover:text-glow sm:text-lg [text-shadow:0_2px_16px_rgba(11,11,16,0.9)]">
                {service.title}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div id="ai" className="mt-8 flex max-w-md items-start gap-3 border-l-2 border-glow/60 pl-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-glow">Скоро</div>
          <p className="mt-1.5 text-sm leading-relaxed text-paper/75 [text-shadow:0_2px_16px_rgba(11,11,16,0.9)]">
            AI-агент прикинет формат и бюджет прямо в чате — до брифа и без ожидания менеджера.
          </p>
        </div>
      </div>

      <FunnelCta
        item="calculator"
        pitch="Не знаете, какой формат под задачу? Калькулятор подберёт его по площадке и бюджету — и сразу покажет вилку цен."
        className="mt-7"
      />
    </CinematicSection>
  );
}
