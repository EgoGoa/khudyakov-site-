"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Appear from "@/components/ui/Appear";
import { BEAT, EASE, STAGGER } from "@/lib/motion";
import SectionStage from "../SectionStage";
import SectionHead from "../SectionHead";
import BlockMedia from "../BlockMedia";
import type { DirectionContent } from "../types";

// FAQ: слева список вопросов, справа развёрнутый ответ на выбранный.
// На узких экранах превращается в обычный аккордеон — две колонки туда не
// помещаются, а ответ под своим же вопросом читается естественнее.
//
// Заголовок здесь прижат вправо: это последний содержательный блок перед
// финалом, и правое выравнивание работает как поворот к завершению.
export default function FaqBlock({ faq }: { faq: DirectionContent["faq"] }) {
  const [active, setActive] = useState(0);
  const answer = faq.items[active];

  return (
    <SectionStage className="relative py-24 sm:py-32">
      {faq.media ? <BlockMedia media={faq.media} /> : null}

      <Container>
        <SectionHead head={faq} titleClassName="text-[2rem] sm:text-[2.8rem]" />

        <div className="mt-14 lg:grid lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            {faq.items.map((item, i) => {
              const on = i === active;
              return (
                <Appear key={item.q} from="left" delay={BEAT.content + i * STAGGER.tight}>
                  <div>
                    <button
                      type="button"
                      onClick={() => setActive(on ? -1 : i)}
                      aria-expanded={on}
                      className="group flex w-full items-center gap-4 py-4 text-left"
                    >
                      <span
                        className={`font-mono text-[10px] tracking-[0.18em] transition-colors ${
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

                    {/* Тонкая черта под строкой — единственная линия, которая
                        на странице осталась: она разделяет пункты одного
                        списка, а не блоки, и без неё вопросы слипаются. */}
                    <span className="block h-px w-full bg-paper/10" />

                    <AnimatePresence initial={false}>
                      {on ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: EASE }}
                          className="overflow-hidden lg:hidden"
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

          <div className="hidden lg:block">
            <AnimatePresence mode="wait">
              {answer ? (
                <motion.div
                  key={answer.q}
                  initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="glass-panel sticky top-28 rounded-3xl p-9"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-orange">
                    Ответ / {String(active + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 font-display text-xl uppercase leading-tight tracking-tight text-white">
                    {answer.q}
                  </h3>
                  <p className="mt-5 text-[15px] leading-relaxed text-white">{answer.a}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </SectionStage>
  );
}
