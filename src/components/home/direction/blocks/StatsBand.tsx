"use client";

import Container from "@/components/ui/Container";
import Appear from "@/components/ui/Appear";
import { BEAT, STAGGER } from "@/lib/motion";
import SectionStage from "../SectionStage";
import BlockMedia from "../BlockMedia";
import type { BlockMediaSpec, DirectionStat } from "../types";

// Полоса цифр под первым экраном.
//
// Без заголовка и без карточек: четыре числа стоят прямо на фоне страницы,
// разделённые только воздухом и тонкой вертикальной чертой в акценте.
// Это первый блок после героя, и он должен читаться за полсекунды — любая
// рамка вокруг цифры замедляет чтение, ничего не добавляя.
//
// Цифры прилетают по очереди слева направо: глаз всё равно читает их в этом
// порядке, и последовательный вход просто совпадает с чтением.
export default function StatsBand({
  stats,
  media,
}: {
  stats: DirectionStat[];
  media?: BlockMediaSpec;
}) {
  return (
    <SectionStage className="relative py-16 sm:py-20">
      {media ? <BlockMedia media={media} /> : null}

      {/* Тихая стеклянная полоса на всю ширину, а не карточка вокруг
          каждой цифры: цифры должны читаться одной строкой. Она же
          отделяет их от кадра — без неё белое на светлом кадре пропадало. */}
      <div className="glass-strip absolute inset-x-0 inset-y-4 -z-[5]" aria-hidden="true" />

      <Container>
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Appear key={stat.label} from="up" delay={BEAT.eyebrow + i * STAGGER.normal}>
              <div className="relative pl-5">
                <span className="absolute left-0 top-1 h-[calc(100%-0.5rem)] w-px bg-gradient-to-b from-orange via-orange/40 to-transparent" />
                <div className="font-display text-[2.2rem] uppercase leading-none text-white sm:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-white">
                  {stat.label}
                </div>
              </div>
            </Appear>
          ))}
        </div>
      </Container>
    </SectionStage>
  );
}
