"use client";

import Appear from "@/components/ui/Appear";
import { BEAT } from "@/lib/motion";
import { CHAPTER_INTRO } from "@/lib/typography";
import Typewriter from "./Typewriter";
import { MEDIA_TEXT } from "./BlockMedia";
import type { DirectionSectionHead } from "./types";

// Шапка блока: надзаголовок, заголовок, подзаголовок.
//
// Порядок появления — общесайтовый: сначала надзаголовок («где я»), через
// BEAT.title заголовок («что это»), через BEAT.intro поясняющая строка. Ни
// один блок не выезжает целиком: это ровно та хореография, что на /content,
// /ai, /sites и /smm, просто триггером служит попадание в экран.
//
// `align` меняет не только выравнивание текста, но и то, с какой стороны
// прилетают элементы: заголовок справа влетает справа. Иначе движение
// спорит с композицией.

const ALIGN_CLASS: Record<string, string> = {
  left: "text-left",
  center: "mx-auto max-w-4xl text-center",
  right: "ml-auto max-w-3xl text-right",
  sticky: "text-left",
};

export default function SectionHead({
  head,
  typed,
  titleClassName = "",
}: {
  head: DirectionSectionHead;
  /** Строка, которая печатается вместо обычного появления заголовка. */
  typed?: string;
  titleClassName?: string;
}) {
  const align = head.align ?? "left";
  const from = align === "right" ? "right" : align === "center" ? "up" : "left";

  return (
    // Тень носит вся шапка, а не только блоки с кадром: над ровным фоном
    // она невидима, а над видео держит контраст без притушивания картинки.
    <div className={`${ALIGN_CLASS[align]} ${MEDIA_TEXT}`}>
      <Appear from={from} delay={BEAT.eyebrow}>
        <span
          className={`flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-rec ${
            align === "center" ? "justify-center" : align === "right" ? "justify-end" : ""
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-rec" />
          {head.eyebrow}
        </span>
      </Appear>

      <Appear from={from} delay={BEAT.title}>
        <h2
          className={`chapter-neon-warm mt-4 font-display uppercase leading-[0.98] tracking-tight ${
            titleClassName || "text-[2.2rem] sm:text-[3rem] lg:text-[3.4rem]"
          }`}
        >
          {typed ? (
            <span className="relative inline-block">
              <Typewriter text={typed} />
            </span>
          ) : (
            head.title
          )}
        </h2>
      </Appear>

      {head.sub ? (
        <Appear from="up" delay={BEAT.intro}>
          <p
            className={`mt-6 max-w-[30em] ${CHAPTER_INTRO} ${
              align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : ""
            }`}
          >
            {head.sub}
          </p>
        </Appear>
      ) : null}
    </div>
  );
}
