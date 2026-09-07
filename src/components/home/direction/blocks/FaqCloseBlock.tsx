"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Appear from "@/components/ui/Appear";
import { DIRECTION_BEAT, EASE, STAGGER } from "@/lib/motion";
import { TelegramIcon } from "@/components/ui/Icons";
import SectionStage from "../SectionStage";
import SectionHead from "../SectionHead";
import BlockMedia from "../BlockMedia";
import { useDirectionTask } from "../TaskContext";
import { TELEGRAM_URL } from "../contacts";
import { EYEBROW } from "@/lib/typography";
import type { CompactToolContent } from "../types";

// FAQ и финальный призыв на одном экране — единственное настоящее слияние
// двух самостоятельных смыслов в компактном шаблоне (см. CompactToolContent
// в types.ts). Остальная экономия глав — либо перенос (цифры в герой),
// либо честное сокращение состава (один шаг персонализации вместо трёх), а
// здесь именно слияние: слева вопросы, справа следующий шаг, один и тот же
// экран.
//
// Аккордеон слева — тот же приём, что у FaqBlock, но без десктопной
// панели-ответа справа: то место здесь занято карточкой финала, а не вторым
// столбцом с ответами. Поэтому ответ разворачивается прямо под вопросом на
// любой ширине, а не только на мобильном, как в полном FaqBlock.
export default function FaqCloseBlock({
  faq,
  close,
}: {
  faq: CompactToolContent["faq"];
  close: CompactToolContent["close"];
}) {
  const [active, setActive] = useState<number | null>(null);
  const { active: task } = useDirectionTask();

  return (
    <SectionStage className="relative py-24 sm:py-32">
      {faq.media ? <BlockMedia media={faq.media} /> : null}

      <Container>
        <SectionHead head={faq} titleClassName="text-[2rem] sm:text-[2.8rem]" />

        <div className="mt-14 lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            {faq.items.map((item, i) => {
              const on = i === active;
              return (
                <Appear key={item.q} from="left" delay={DIRECTION_BEAT.content + i * STAGGER.tight}>
                  <div>
                    <button
                      type="button"
                      onClick={() => setActive(on ? null : i)}
                      aria-expanded={on}
                      className="group flex w-full items-center gap-4 py-4 text-left"
                    >
                      <span
                        className={`font-display text-[10px] tracking-[0.18em] transition-colors ${
                          on ? "text-orange" : "text-white"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`flex-1 text-sm leading-snug transition-colors sm:text-base ${
                          on ? "text-orange" : "text-white group-hover:text-orange"
                        }`}
                      >
                        {item.q}
                      </span>
                      <span
                        className={`shrink-0 text-base leading-none transition-transform ${
                          on ? "rotate-45 text-orange" : "text-white"
                        }`}
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </button>

                    <span className="block h-px w-full bg-paper/10" />

                    <AnimatePresence initial={false}>
                      {on ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <p className="py-5 pl-8 pr-6 text-[15px] leading-relaxed text-white">
                            {item.a}
                          </p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </Appear>
              );
            })}
          </div>

          {/* Финал — тот же состав действий, что у полного CloseBlock
              (бриф, Telegram), без отдельной строки контактов: почта и
              «Все направления» там жили ради тех, кому не подошла форма, а
              здесь тот же запасной путь уже даёт кнопка Telegram рядом. */}
          <Appear from="right" delay={DIRECTION_BEAT.content} className="mt-14 lg:mt-0">
            <div className="glass-panel rounded-3xl p-8 sm:p-10">
              <span className={`${EYEBROW} text-orange`}>{close.eyebrow}</span>
              <h3 className="mt-4 font-display text-2xl uppercase leading-[0.98] tracking-tight text-white sm:text-3xl">
                {close.title}
              </h3>
              <p className="mt-5 text-[15px] leading-relaxed text-white">{close.sub}</p>

              <AnimatePresence mode="wait">
                {task ? (
                  <motion.p
                    key={task.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="mt-4 text-[13px] leading-relaxed text-white/70"
                  >
                    Ваша задача: <span className="font-medium text-orange">{task.label}</span> — {task.promise}.
                  </motion.p>
                ) : null}
              </AnimatePresence>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/brief" className="btn-neon btn-warm btn-3d !py-3.5">
                  Заполнить бриф
                </Link>
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-neon btn-3d !py-3.5"
                >
                  <TelegramIcon />
                  Telegram
                </a>
              </div>
            </div>
          </Appear>
        </div>
      </Container>
    </SectionStage>
  );
}
