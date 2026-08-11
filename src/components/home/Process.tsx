"use client";

import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import GlassCard from "@/components/ui/GlassCard";
import { useService } from "@/lib/service-context";
import { processByCategory } from "@/lib/service-content";

export default function Process() {
  const { active } = useService();
  const steps = processByCategory[active];

  return (
    <section id="process" className="py-10 sm:py-14">
      <Container>
        <Reveal>
          <Eyebrow index="05" label="Как мы работаем" />
          <h2 className="font-sans text-3xl font-light uppercase tracking-[0.01em] text-paper sm:text-4xl md:text-5xl">
            Процесс в три шага
          </h2>
        </Reveal>

        {steps.length === 0 ? (
          <Reveal delay={0.05}>
            <p className="mt-8 max-w-lg text-sm leading-relaxed text-paper/50">
              Описание процесса по этому направлению скоро появится здесь.
            </p>
          </Reveal>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.1}>
                <GlassCard className="h-full p-6">
                  <div className="font-display text-5xl text-glow">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-4 font-display text-xl uppercase text-paper">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-paper/60">
                    {step.description}
                  </p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
