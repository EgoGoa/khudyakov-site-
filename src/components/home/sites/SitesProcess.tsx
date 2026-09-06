"use client";

import CinematicSection from "@/components/ui/CinematicSection";
import Appear from "@/components/ui/Appear";
import { BEAT, STAGGER } from "@/lib/motion";
import SitesChapterLayout, { SITES_PANEL } from "@/components/home/sites/SitesChapterLayout";
import { SITES_PROCESS_STEPS } from "@/components/home/sites/sitesProcessSteps";

// Chapter 04 of /sites — the five steps from brief to launch.
//
// A /sites-only component rather than the shared <Process>, for the same
// reason SitesOffer exists: Process is rendered unchanged by /ai, /smm and
// /content. The steps themselves are the same SITES_PROCESS_STEPS data the
// shared component was being handed; only the composition is this page's.
//
// The steps are numbered here rather than only iconed. In the shared
// component they sit in a row where position carries the order; stacked in a
// narrow right-hand column that cue disappears, and a process is the one kind
// of list where the order is the information.

export default function SitesProcess() {
  return (
    <CinematicSection
      index={3}
      chapter="04"
      title="Как проходит работа"
      side="right"
      entrance="slide-right"
      id="process"
      spacious
      column
      headless
    >
      <SitesChapterLayout
        number="04"
        title={
          <>
            Как проходит
            <br />
            <span className="kw">работа</span>
          </>
        }
        sub="Пять шагов от брифа до запуска — на каждом понятный результат и точка согласования."
        primary={{ href: "/brief", label: "Заполнить бриф" }}
        secondary={{ href: "/calculator", label: "Рассчитать бюджет" }}
      >
        {/* Same fix as SitesOffer's list: the glass panel itself now arrives
            on the same beat as the first row instead of popping in early. */}
        <Appear from="right" delay={BEAT.content} as="div">
        <ol className={`${SITES_PANEL} divide-y divide-paper/10 px-5 py-1`}>
          {SITES_PROCESS_STEPS.map((step, i) => (
            <Appear
              key={step.title}
              as="li"
              from="right"
              delay={BEAT.content + i * STAGGER.tight}
              className="flex items-start gap-4 py-3.5"
            >
              <span
                className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border font-mono text-[10px]"
                style={{
                  borderColor: "rgba(255,106,61,0.35)",
                  color: "#ffd0bd",
                  boxShadow: "inset 0 0 10px rgba(255,106,61,0.18)",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-sm uppercase leading-tight tracking-tight text-white">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-paper/55">{step.description}</p>
              </div>
            </Appear>
          ))}
        </ol>
        </Appear>
      </SitesChapterLayout>
    </CinematicSection>
  );
}
