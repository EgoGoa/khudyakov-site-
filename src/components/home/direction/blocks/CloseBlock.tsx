"use client";

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
import { EMAIL, PHONE, PHONE_HREF, TELEGRAM_URL } from "../contacts";
import type { DirectionContent } from "../types";

// Финал: один следующий шаг, по центру, крупно, поверх кадра-перебивки.
//
// Контакты идут строкой под кнопками, а не карточкой сбоку: карточка
// уравнивала «напишите нам» с «вот наш телефон», хотя действие тут одно.
// Телефон и почта — запасные пути для тех, кому форма не подходит, и им
// достаточно строки.
export default function CloseBlock({ close }: { close: DirectionContent["close"] }) {
  const { active } = useDirectionTask();

  return (
    <SectionStage className="relative py-28 sm:py-36">
      {close.media ? <BlockMedia media={close.media} /> : null}

      {/* Финальный блок идёт на самой яркой экспозиции кадра (loud), и
          крупный заголовок по центру тонул в картинке. Здесь не
          карточка, а тихая полоса: рамка вокруг финального призыва
          выглядела бы как всплывающее окно. */}
      <div className="glass-strip absolute inset-x-0 inset-y-10 -z-[5]" aria-hidden="true" />

      <Container className="text-center">
        <SectionHead head={close} titleClassName="text-[2.4rem] sm:text-[3.4rem] lg:text-[4rem]" />

        <AnimatePresence mode="wait">
          {active ? (
            <motion.p
              key={active.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="mx-auto mt-6 max-w-[34em] text-[15px] leading-relaxed text-white"
            >
              Ваша задача: <span className="font-medium text-orange">{active.label}</span> —{" "}
              {active.promise}.
            </motion.p>
          ) : null}
        </AnimatePresence>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <Appear from="up" delay={DIRECTION_BEAT.cta}>
            <Link href="/brief" className="btn-neon btn-warm btn-3d !py-4 !px-8">
              Заполнить бриф
            </Link>
          </Appear>
          <Appear from="up" delay={DIRECTION_BEAT.cta + STAGGER.normal}>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-neon btn-3d !py-4 !px-8"
            >
              <TelegramIcon />
              Telegram
            </a>
          </Appear>
        </div>

        <Appear from="up" delay={DIRECTION_BEAT.cta + STAGGER.normal * 2}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.15em] text-white">
            <a href={PHONE_HREF} className="transition hover:text-orange">
              {PHONE}
            </a>
            <a href={`mailto:${EMAIL}`} className="normal-case tracking-normal transition hover:text-orange">
              {EMAIL}
            </a>
            <Link href="/content" className="transition hover:text-orange">
              Все направления →
            </Link>
          </div>
        </Appear>
      </Container>
    </SectionStage>
  );
}
