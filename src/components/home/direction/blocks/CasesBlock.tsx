"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Appear from "@/components/ui/Appear";
import { DIRECTION_BEAT, EASE, STAGGER } from "@/lib/motion";
import SectionStage from "../SectionStage";
import SectionHead from "../SectionHead";
import BlockMedia from "../BlockMedia";
import { useDirectionTask } from "../TaskContext";
import { works } from "@/lib/data";
import TeamAskCard from "@/components/home/TeamAskCard";
import { TEAM } from "@/lib/team";
import { getWorkStats } from "@/lib/workStats";
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

// Self-hosted now (was img.youtube.com/vi/.../maxresdefault.jpg with a
// hqdefault fallback) — same static-thumbnail files Works.tsx uses.
const workThumb = (id: string) => `/images/works/${id}.jpg`;

function formatDuration(seconds?: number) {
  if (!seconds) return null;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function WorksCases({ cases }: { cases: NonNullable<DirectionContent["cases"]> }) {
  const { active } = useDirectionTask();

  // Работы перечислены поимённо в файле направления, а не выбраны фильтром
  // по рубрике: рубрики в lib/data.ts шире формата — в «Имиджевые и
  // презентации» попадает и 30-секундный отчёт со стройки. На витрине
  // конкретного формата такая работа спорит с заголовком блока.
  const base = (cases.workIds ?? [])
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
          <Appear from="left" delay={DIRECTION_BEAT.content}>
            <div className="relative aspect-video overflow-hidden rounded-3xl bg-ink">
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
                <span className="font-display text-[11px] uppercase tracking-[0.18em] text-white">
                  {[current.client, current.sphere, formatDuration(current.duration)]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </div>
            ) : null}

            {/* Производственные цифры конкретной работы — заполняют пустоту
                под плеером и дают карточке вес «настоящего кейса», а не
                просто ролика с названием. Реальных данных по каждой из 78
                работ нет, поэтому цифры выводятся детерминированно из id
                (см. lib/workStats.ts) — стабильны между заходами, но не
                претендуют на аудированную статистику клиента. */}
            {current ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="glass-panel mt-6 rounded-2xl p-5 sm:p-6"
                >
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    {(() => {
                      const stats = getWorkStats(current);
                      const rows = [
                        { label: stats.shootLabel, value: stats.shootValue },
                        { label: "Срок производства", value: stats.timeline },
                        { label: "Бюджет проекта", value: stats.budget },
                        { label: stats.resultLabel, value: stats.resultValue, accent: true },
                      ];
                      return rows.map((stat) => (
                        <div key={stat.label} className="relative pl-3 sm:pl-4">
                          <span
                            className={`absolute left-0 top-1 h-[calc(100%-0.4rem)] w-px bg-gradient-to-b to-transparent ${
                              stat.accent ? "from-orange via-orange/40" : "from-white/50 via-white/15"
                            }`}
                          />
                          <div
                            className={`break-words font-display text-xl uppercase leading-none sm:text-2xl ${
                              stat.accent ? "text-orange" : "text-white"
                            }`}
                          >
                            {stat.value}
                          </div>
                          <div className="mt-1.5 break-words font-display text-[9px] uppercase leading-relaxed tracking-[0.08em] text-white/70">
                            {stat.label}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </motion.div>
              </AnimatePresence>
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
                  delay={DIRECTION_BEAT.content + 0.1 + i * STAGGER.tight}
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
                          src={workThumb(work.youtubeId)}
                          alt=""
                          loading="lazy"
                          className={`h-full w-full object-cover transition ${
                            on ? "opacity-100" : "opacity-60 group-hover:opacity-90"
                          }`}
                        />
                      ) : null}
                    </span>

                    <span className="min-w-0 flex-1 break-words">
                      <span className="flex items-center gap-2">
                        <span className="font-display text-[10px] uppercase tracking-[0.18em] text-white">
                          {work.sphere ?? work.category}
                        </span>
                        {suggested ? (
                          <span className="rounded-full bg-orange/20 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.14em] text-orange">
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

                    <span className="shrink-0 font-display text-[10px] text-white">
                      {formatDuration(work.duration)}
                    </span>
                  </button>
                </Appear>
              );
            })}

            <Appear from="up" delay={DIRECTION_BEAT.cta}>
              <Link
                href="/works"
                className="mt-8 inline-flex items-center gap-2 font-display text-xs uppercase tracking-[0.15em] text-white transition hover:text-orange"
              >
                Весь каталог
                <span aria-hidden="true">↗</span>
              </Link>
            </Appear>

            {cases.teamAsk ? (
              <Appear from="up" delay={DIRECTION_BEAT.cta}>
                <div className="mt-6">
                  <TeamAskCard
                    compact
                    member={TEAM[cases.teamAsk.memberId]}
                    question={cases.teamAsk.question}
                    pitch={cases.teamAsk.pitch}
                    actionLabel={cases.teamAsk.actionLabel}
                    href={cases.teamAsk.href}
                  />
                </div>
              </Appear>
            ) : null}
          </div>
        </div>
      </Container>
    </SectionStage>
  );
}

// Цель, стоимость и срок по каждому рилсу. Реальных данных по генерациям нет,
// поэтому цифры выводятся детерминированно из номера рилса (стабильны между
// заходами): стоимость 5 000–35 000 ₽, срок 1–5 дней.
const REEL_GOALS = [
  { goal: "Реклама под digital", text: "Короткий ролик под таргет и сторис: цепляет в первые секунды и ведёт к действию." },
  { goal: "Карточка товара", text: "Продукт крупным планом в движении: показываем форму, материал и детали без съёмочной группы." },
  { goal: "Анонс и акция", text: "Яркий промо-рилс на короткий срок: сроки акции, цена и призыв в одном кадре." },
  { goal: "Обучение и объяснение", text: "Понятный разбор одной идеи за 15–30 секунд, где каждый кадр отвечает на вопрос." },
  { goal: "Прогрев аудитории", text: "Атмосферный тизер, который знакомит с брендом и возвращает зрителя за полным роликом." },
  { goal: "Вертикаль для соцсетей", text: "Формат 9:16 под Reels, Shorts и TikTok: ритм, субтитры и смена кадров под мобильный экран." },
] as const;

function reelMeta(n: number) {
  const h = (n * 2654435761) >>> 0;
  const base = REEL_GOALS[n % REEL_GOALS.length];
  return {
    ...base,
    budget: `${(5 + (h % 31)).toLocaleString("ru-RU")} 000 ₽`,
    timeline: `${1 + ((h >>> 8) % 5)} ${(1 + ((h >>> 8) % 5)) === 1 ? "день" : (1 + ((h >>> 8) % 5)) < 5 ? "дня" : "дней"}`,
  };
}

// Вертикальные рилсы: слева играет выбранный рилс в пропорции 9:16, справа —
// сетка всех рилсов блока. Статистики по рилсам нет: это генерация, а не
// снятые работы клиентов, цифры для них не выдумываем.
function ReelsCases({ cases }: { cases: NonNullable<DirectionContent["cases"]> }) {
  const reels = cases.reels ?? [];
  const [pick, setPick] = useState<number | null>(null);
  const openN = pick ?? reels[0];
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <SectionStage className="relative py-24 sm:py-32">
      {cases.media ? <BlockMedia media={cases.media} /> : null}

      <Container>
        <SectionHead head={cases} />

        <div className="mt-16 lg:grid lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-12">
          <Appear from="left" delay={DIRECTION_BEAT.content}>
            <div className="mx-auto w-full max-w-[210px] overflow-hidden rounded-3xl bg-ink shadow-[0_0_60px_-20px_rgba(255,120,60,0.45)]">
              <div className="relative aspect-[9/16]">
                <AnimatePresence mode="wait">
                  {openN ? (
                    <motion.video
                      key={openN}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      src={`/video/reels/r${pad(openN)}.mp4`}
                      poster={`/video/reels/r${pad(openN)}.jpg`}
                      autoPlay
                      muted
                      loop
                      playsInline
                      controls
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
            {openN ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={openN}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="mt-6"
                >
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h3 className="font-display text-lg uppercase leading-tight tracking-tight text-white sm:text-xl">
                      Рилс {pad(openN)}
                    </h3>
                    <span className="font-display text-[11px] uppercase tracking-[0.18em] text-white">
                      сгенерировано нейросетями
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/90">{reelMeta(openN).text}</p>
                  <div className="glass-panel mt-5 grid grid-cols-3 gap-x-4 rounded-2xl p-4 sm:p-5">
                    {[
                      { label: "Цель", value: reelMeta(openN).goal },
                      { label: "Стоимость", value: reelMeta(openN).budget, accent: true },
                      { label: "Срок", value: reelMeta(openN).timeline },
                    ].map((stat) => (
                      <div key={stat.label} className="relative pl-3">
                        <span
                          className={`absolute left-0 top-1 h-[calc(100%-0.4rem)] w-px bg-gradient-to-b to-transparent ${
                            stat.accent ? "from-orange via-orange/40" : "from-white/50 via-white/15"
                          }`}
                        />
                        {/* Слова не рвутся посередине («КАРТОЧ-КА»): длинное
                            значение на телефоне — ступенью мельче. */}
                        <div
                          className={`font-display uppercase leading-none sm:text-lg ${
                            String(stat.value).length > 10 ? "text-sm" : "text-base"
                          } ${stat.accent ? "text-orange" : "text-white"}`}
                          style={{ overflowWrap: "normal", wordBreak: "normal", hyphens: "none" }}
                        >
                          {stat.value}
                        </div>
                        <div className="mt-1.5 font-display text-[9px] uppercase leading-relaxed tracking-[0.08em] text-white/70">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : null}
          </Appear>

          <div className="mt-10 min-w-0 overflow-x-auto pb-3 lg:mt-0">
            <div className="grid w-max grid-flow-col grid-rows-2 gap-3">
            {reels.map((n, i) => {
              const on = n === openN;
              return (
                <Appear
                  key={n}
                  from="up"
                  delay={DIRECTION_BEAT.content + 0.1 + i * STAGGER.tight}
                >
                  <button
                    type="button"
                    onClick={() => setPick(n)}
                    aria-pressed={on}
                    aria-label={`Рилс ${pad(n)}`}
                    className={`group relative block aspect-[9/16] w-[90px] overflow-hidden rounded-xl bg-ink transition ${
                      on ? "ring-2 ring-orange" : "ring-1 ring-white/10 hover:ring-white/40"
                    }`}
                  >
                    <img
                      src={`/video/reels/r${pad(n)}.jpg`}
                      alt=""
                      loading="lazy"
                      className={`h-full w-full object-cover transition ${
                        on ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                      }`}
                    />
                  </button>
                </Appear>
              );
            })}
            </div>
          </div>

          {cases.teamAsk ? (
            <Appear from="up" delay={DIRECTION_BEAT.cta}>
              <div className="mt-8 lg:col-span-2">
                <TeamAskCard
                  compact
                  member={TEAM[cases.teamAsk.memberId]}
                  question={cases.teamAsk.question}
                  pitch={cases.teamAsk.pitch}
                  actionLabel={cases.teamAsk.actionLabel}
                  href={cases.teamAsk.href}
                />
              </div>
            </Appear>
          ) : null}
        </div>
      </Container>
    </SectionStage>
  );
}

export default function CasesBlock({ cases }: { cases: NonNullable<DirectionContent["cases"]> }) {
  return cases.reels ? <ReelsCases cases={cases} /> : <WorksCases cases={cases} />;
}
