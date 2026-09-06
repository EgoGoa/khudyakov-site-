"use client";

import Container from "@/components/ui/Container";
import Appear from "@/components/ui/Appear";
import { DIRECTION_BEAT, STAGGER } from "@/lib/motion";
import SectionStage from "../SectionStage";
import SectionHead from "../SectionHead";
import BlockMedia from "../BlockMedia";
import { withAccent } from "../Accent";
import type { DirectionContent } from "../types";

// «Почему мы». Заголовок по центру, причины расходятся от него в две
// колонки — единственный центрированный блок с содержанием на странице.
//
// Якорь у каждой причины — не иконка, а короткая надпись-цифра, набранная
// крупно тем же дисплейным шрифтом. Иконки пришлось бы рисовать или тащить
// набор со стороны, а число из самой причины («2–3», «1→N») говорит по делу
// и стоит на своём месте без дополнительной графики.
//
// Причины прилетают попеременно слева и справа — расхождение от центра,
// а не общий подъём.
export default function WhyBlock({ why }: { why: NonNullable<DirectionContent["why"]> }) {
  return (
    <SectionStage className="relative py-24 sm:py-32">
      {why.media ? <BlockMedia media={why.media} /> : null}

      <Container>
        <SectionHead head={why} />

        <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {why.items.map((item, i) => (
            <Appear
              key={item.title}
              from={i % 2 === 0 ? "left" : "right"}
              delay={DIRECTION_BEAT.content + Math.floor(i / 2) * STAGGER.normal}
            >
              <div className="flex gap-6">
                <span className="w-20 shrink-0 pt-1 text-right font-display text-2xl uppercase leading-none text-orange sm:text-3xl">
                  {item.anchor}
                </span>
                <div className="border-l border-paper/15 pl-6">
                  <h3 className="font-display text-lg uppercase leading-tight tracking-tight text-white sm:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-3.5 text-[15px] leading-relaxed text-white">
                    {withAccent(item.text, item.accent)}
                  </p>
                </div>
              </div>
            </Appear>
          ))}
        </div>
      </Container>
    </SectionStage>
  );
}
