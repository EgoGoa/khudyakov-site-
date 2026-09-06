"use client";

import Link from "next/link";
import Container from "@/components/ui/Container";
import Appear from "@/components/ui/Appear";
import { BEAT, STAGGER } from "@/lib/motion";
import SectionStage from "../SectionStage";
import SectionHead from "../SectionHead";
import BlockMedia from "../BlockMedia";
import { withAccent } from "../Accent";
import type { DirectionContent } from "../types";

// «Под чью задачу» — асимметричная раскладка: заголовок держится слева и
// стоит на месте, пока роли проходят справа лестницей.
//
// Лестница (каждая следующая карточка ниже предыдущей) — а не ровный ряд:
// ряд из трёх одинаковых карточек читается как таблица, где роли
// равнозначны и не связаны. Смещение задаёт порядок чтения сверху вниз,
// и он совпадает с порядком, в котором карточки прилетают.
export default function AudienceBlock({
  audience,
}: {
  audience: DirectionContent["audience"];
}) {
  return (
    <SectionStage className="relative py-24 sm:py-32">
      {audience.media ? <BlockMedia media={audience.media} /> : null}

      <Container>
        <div className="lg:grid lg:grid-cols-[38%_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHead head={audience} titleClassName="text-[2rem] sm:text-[2.6rem] lg:text-[3rem]" />
          </div>

          <div className="mt-14 space-y-5 lg:mt-0">
            {audience.items.map((item, i) => (
              <Appear
                key={item.number}
                from="right"
                delay={BEAT.content + i * STAGGER.normal}
              >
                <div
                  className="glass-panel group rounded-2xl p-7 transition sm:p-8"
                  style={{ marginLeft: `${i * 7}%` }}
                >
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-2xl leading-none text-orange">
                      {item.number}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white">
                      {item.role}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-xl uppercase leading-tight tracking-tight text-white sm:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-4 max-w-[38em] text-[15px] leading-relaxed text-white">
                    {withAccent(item.text, item.accent)}
                  </p>

                  <Link
                    href={item.href}
                    className="mt-7 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-white transition group-hover:text-orange"
                  >
                    {item.linkLabel}
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </Appear>
            ))}
          </div>
        </div>
      </Container>
    </SectionStage>
  );
}
