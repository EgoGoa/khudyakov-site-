"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Appear from "@/components/ui/Appear";
import { BEAT, EASE, STAGGER } from "@/lib/motion";
import SectionStage from "../SectionStage";
import SectionHead from "../SectionHead";
import BlockMedia from "../BlockMedia";
import { useDirectionTask } from "../TaskContext";
import { works } from "@/lib/data";
import type { DirectionContent } from "../types";
import type { Work } from "@/lib/types";

// Портфолио: одна крупная работа в фокусе и список остальных рядом.
//
// Раньше это был вертикальный список из шести раскрывающихся строк — из-за
// чего блок занимал два экрана, а видно было одно видео. Здесь пространство
// работает иначе: слева всегда играет выбранная работа во всю ширину
// колонки, справа — компактный список, по которому выбирают. Один экран,
// одно видео, шесть доступных.
//
// Реакция на сквозной выбор задачи: работы, относящиеся к выбранной
// ситуации, поднимаются наверх и помечаются. Не фильтрация — именно
// перестановка: скрывать половину портфолио за чипом было бы обманом
// ожиданий, человек пришёл смотреть работы.

const maxThumb = (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
const fallbackThumb = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

function swapToFallback(img: HTMLImageElement, id: string) {
  if (img.dataset.fallback) return;
  img.dataset.fallback = "1";
  img.src = fallbackThumb(id);
}

function formatDuration(seconds?: number) {
  if (!seconds) return null;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function CasesBlock({ cases }: { cases: DirectionContent["cases"] }) {
  const { active } = useDirectionTask();

  // Работы перечислены поимённо в файле направления, а не выбраны фильтром
  // по рубрике: рубрики в lib/data.ts шире формата — в «Имиджевые и
  // презентации» попадает и 30-секундный отчёт со стройки. На витрине
  // конкретного формата такая работа спорит с заголовком блока.
  const base = cases.workIds
    .map((id) => works.find((w) => w.id === id))
    .filter((w): w is Work => Boolean(w?.youtubeId));

  const picked = new Set(active?.caseIds ?? []);
  const items = active
    ? [...base.filter((w) => picked.has(w.id)), ...base.filter((w) => !picked.has(w.id))]
    : base;

  // Какая работа играет — выводится из выбранной задачи, а не хранится
  // отдельным состоянием, которое потом синхронизируют эффектом. Ручной
  // выбор запоминается вместе с задачей, при которой он был сделан: сменил
  // задачу — подборка перестроилась, и играет первая подходящая работа, а
  // не та, что осталась от прошлого выбора.
  const [pick, setPick] = useState<{ taskId: string | null; id: string } | null>(null);
  const taskId = active?.id ?? null;
  const openId =
    pick && pick.taskId === taskId
      ? pick.id
      : active?.caseIds[0] ?? items[0]?.id ?? null;
  const choose = (id: string) => setPick({ taskId, id });

  const current = items.find((w) => w.id === openId) ?? items[0];

  return (
    <SectionStage className="relative py-24 sm:py-32">
      {cases.media ? <BlockMedia media={cases.media} /> : null}

      <Container>
        <SectionHead head={cases} />

        <div className="mt-16 lg:grid lg:grid-cols-[1.45fr_1fr] lg:gap-12">
          <Appear from="left" delay={BEAT.content}>
            <div className="relative aspect-video overflow-hidden rounded-3xl bg-ink ring-1 ring-paper/10">
              <AnimatePresence mode="wait">
                {current?.youtubeId ? (
                  <motion.iframe
                    key={current.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    src={`https://www.youtube-nocookie.com/embed/${current.youtubeId}?rel=0&modestbranding=1&playsinline=1`}
                    title={current.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                ) : null}
              </AnimatePresence>
            </div>

            {current ? (
              <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <h3 className="font-display text-lg uppercase leading-tight tracking-tight text-white sm:text-xl">
                  {current.title}
                </h3>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white">
                  {[current.client, current.sphere, formatDuration(current.duration)]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </div>
            ) : null}
          </Appear>

          <div className="mt-10 lg:mt-0">
            {items.map((work, i) => {
              const on = work.id === openId;
              const suggested = picked.has(work.id);
              return (
                <Appear
                  key={work.id}
                  from="right"
                  delay={BEAT.content + 0.1 + i * STAGGER.tight}
                >
                  <button
                    type="button"
                    onClick={() => choose(work.id)}
                    aria-pressed={on}
                    className={`group flex w-full items-center gap-4 rounded-2xl p-3 text-left transition ${
                      on ? "bg-orange/12 ring-1 ring-orange/40" : "hover:bg-paper/[0.06]"
                    }`}
                  >
                    <span className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-ink">
                      {work.youtubeId ? (
                        <img
                          src={maxThumb(work.youtubeId)}
                          onError={(e) => swapToFallback(e.currentTarget, work.youtubeId!)}
                          onLoad={(e) => {
                            if (e.currentTarget.naturalWidth <= 120)
                              swapToFallback(e.currentTarget, work.youtubeId!);
                          }}
                          alt=""
                          loading="lazy"
                          className={`h-full w-full object-cover transition ${
                            on ? "opacity-100" : "opacity-60 group-hover:opacity-90"
                          }`}
                        />
                      ) : null}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white">
                          {work.sphere ?? work.category}
                        </span>
                        {suggested ? (
                          <span className="rounded-full bg-orange/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-orange">
                            под вашу задачу
                          </span>
                        ) : null}
                      </span>
                      <span
                        className={`mt-1 block truncate text-sm leading-snug transition ${
                          on ? "text-orange" : "text-white"
                        }`}
                      >
                        {work.title}
                      </span>
                    </span>

                    <span className="shrink-0 font-mono text-[10px] text-white">
                      {formatDuration(work.duration)}
                    </span>
                  </button>
                </Appear>
              );
            })}

            <Appear from="up" delay={BEAT.cta}>
              <Link
                href="/works"
                className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-white transition hover:text-orange"
              >
                Весь каталог — 78 работ
                <span aria-hidden="true">↗</span>
              </Link>
            </Appear>
          </div>
        </div>
      </Container>
    </SectionStage>
  );
}
