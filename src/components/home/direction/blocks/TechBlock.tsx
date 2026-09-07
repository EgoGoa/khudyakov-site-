"use client";

import Container from "@/components/ui/Container";
import Appear from "@/components/ui/Appear";
import { DIRECTION_BEAT, STAGGER } from "@/lib/motion";
import SectionStage from "../SectionStage";
import SectionHead from "../SectionHead";
import BlockMedia from "../BlockMedia";
import { withAccent } from "../Accent";
import type { DirectionContent } from "../types";

// «Под капотом» — блок, которого нет на страницах /content.
//
// Причина простая: там продукт видно. Ролик можно поставить в блок кейсов, и
// он сам себя объясняет. AI-инструмент показать нечем — это невидимая
// работа, и без технического разбора страница читается как обещание. Егор
// просил «именно технически показать, о чём эти инструменты», поэтому здесь
// стоит спецификация, а не ещё один блок преимуществ.
//
// При этом Егор отдельно попросил держать этот блок ПОВЕРХНОСТНЫМ:
// «пока поверхностно, без конкретики механики, просто имиджево и
// структурно». Поэтому строки короткие и говорят, ЧТО есть, а не КАК
// устроено: никаких названий систем, версий моделей и схем интеграции.
// Конкретика уходит в разговор с клиентом, а не на страницу.
//
// Раскладка — двухколоночный список «ярлык / фраза». Она сознательно не
// повторяет ни карточки блока «кому подходит», ни расходящиеся от центра
// причины блока «почему мы»: три одинаковых сетки подряд превратили бы
// середину страницы в ленту.
export default function TechBlock({ tech }: { tech: NonNullable<DirectionContent["tech"]> }) {
  return (
    <SectionStage className="relative py-24 sm:py-32">
      {tech.media ? <BlockMedia media={tech.media} /> : null}

      <Container>
        <SectionHead head={tech} />

        <div className="mt-14 border-t border-paper/15">
          {tech.items.map((item, i) => (
            <Appear
              key={item.label}
              from="up"
              delay={DIRECTION_BEAT.content + i * STAGGER.tight}
            >
              <div className="grid gap-2 border-b border-paper/15 py-5 sm:grid-cols-[minmax(0,9rem)_1fr] sm:gap-8 sm:py-6">
                <span className="font-display text-sm uppercase leading-none tracking-tight text-orange sm:pt-1 sm:text-base">
                  {item.label}
                </span>
                <p className="text-[15px] leading-relaxed text-white">
                  {withAccent(item.text, item.accent)}
                </p>
              </div>
            </Appear>
          ))}
        </div>
      </Container>
    </SectionStage>
  );
}
