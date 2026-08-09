"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

// File names in the design handoff don't match their actual contents (e.g.
// "service-video.jpg" is a browser-window render, not a camera clapperboard)
// — mapped here by what each image actually shows, not by its filename.
const categories = [
  {
    label: "Создание контента",
    image: "/images/service-smm.jpg", // clapperboard render
    description: "Съёмка и монтаж роликов под ваш формат и площадку.",
  },
  {
    label: "AI-решения",
    image: "/images/service-ai.jpg", // eye/chip render
    description: "Внедряем ИИ-инструменты в продакшн и коммуникацию с клиентами.",
  },
  {
    label: "Сайты",
    image: "/images/service-video.jpg", // browser-window render
    description: "Разработка сайтов и лендингов под задачи бренда.",
  },
  {
    label: "SMM",
    image: "/images/service-sites.jpg", // hearts/likes render
    description: "Контент и продвижение в социальных сетях на регулярной основе.",
  },
];

export default function ServicePicker() {
  const [index, setIndex] = useState(0);
  const count = categories.length;
  const active = categories[index];

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  return (
    <section
      id="service-picker"
      className="relative flex min-h-[520px] items-center overflow-hidden border-b border-paper/10"
    >
      <div className="absolute inset-0 -z-10">
        {categories.map((cat, i) => (
          <img
            key={cat.label}
            src={cat.image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[800ms] ease-out"
            style={{
              opacity: i === index ? 1 : 0,
              transform: i === index ? "scale(1)" : "scale(1.06)",
            }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(11,11,16,0.65), rgba(11,11,16,0.55) 40%, rgba(11,11,16,0.85))",
          }}
        />
      </div>

      <Container className="flex flex-col items-center py-10 text-center">
        <Eyebrow label="Что вас интересует?" tone="glow" />

        <div className="mt-6 flex w-full items-center justify-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Предыдущее"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-paper/25 bg-ink/40 text-lg text-paper backdrop-blur-md transition hover:border-glow hover:text-glow"
          >
            ‹
          </button>

          <h3 className="min-w-[220px] font-sans text-[clamp(1.8rem,4.5vw,2.8rem)] font-light uppercase tracking-[0.02em] text-paper sm:min-w-[260px]">
            {active.label}
          </h3>

          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Следующее"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-paper/25 bg-ink/40 text-lg text-paper backdrop-blur-md transition hover:border-glow hover:text-glow"
          >
            ›
          </button>
        </div>

        <p className="mt-3.5 max-w-[440px] text-sm leading-relaxed text-paper/75">
          {active.description}
        </p>

        <div className="mt-5 flex gap-2">
          {categories.map((cat, i) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={cat.label}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === index ? "bg-glow" : "bg-paper/25 hover:bg-paper/50"
              }`}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
