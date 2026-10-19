"use client";

import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container";
import Appear from "@/components/ui/Appear";
import { DIRECTION_BEAT, STAGGER } from "@/lib/motion";
import DirectionBackdrop from "@/components/home/direction/DirectionBackdrop";
import DirectionHero from "@/components/home/direction/DirectionHero";
import SectionStage from "@/components/home/direction/SectionStage";
import SectionHead from "@/components/home/direction/SectionHead";
import BlockMedia from "@/components/home/direction/BlockMedia";
import WhyBlock from "@/components/home/direction/blocks/WhyBlock";
import { withAccent } from "@/components/home/direction/Accent";
import { TelegramIcon } from "@/components/ui/Icons";
import { EMAIL, TELEGRAM_URL } from "@/components/home/direction/contacts";
import Calculator from "./Calculator";
import type { CalcConfig } from "./calcData";

// Страница калькулятора — реюзает те же строительные блоки, что и страницы
// направлений (/content/[direction]), просто без DirectionContent/реестра:
// это утилитарная страница вне системы направлений, а не ещё одно
// направление. Взяты DirectionHero, WhyBlock, SectionStage/SectionHead и
// DirectionBackdrop напрямую — Егор попросил «похоже на страницы
// направлений», а не отдельный параллельный дизайн.
//
export default function CalculatorPageContent({ config }: { config: CalcConfig }) {
  const ACCENT = config.accent;
  return (
    <div
      className={`${config.headingClass} relative [overflow-x:clip]`}
      style={{ "--hb-a": ACCENT.from, "--hb-b": ACCENT.to } as React.CSSProperties}
    >
      <DirectionBackdrop from={ACCENT.from} to={ACCENT.to} />

      <DirectionHero
        hero={{
          parent: config.parent,
          eyebrow: "Калькулятор стоимости",
          title: (
            <>
              Сколько стоит
              <br />
              <span className="kw">ваш проект</span>?
            </>
          ),
          lead: (
            <>
              HUD.SERVICE — диджитал-сервис полного цикла. {config.hero.lead}{" "}
              <span className="font-medium text-[color:var(--hb-a)]">{config.hero.leadAccent}</span> — точную смету пришлём
              после короткого брифа.
            </>
          ),
          photo: config.hero.photo,
          photoPosition: config.hero.photoPosition,
          teamAsk: {
            memberId: config.hero.askMember,
            question: config.hero.askQuestion,
            pitch: "Расскажите задачу — посчитаем без калькулятора, лично.",
            actionLabel: "Обсудить с Егором",
            href: `/brief/${config.id}`,
          },
        }}
        stats={config.stats}
      />

      <WhyBlock
        why={{
          media: {
            photo: config.media.why,
            gradient: ACCENT,
            intensity: "medium",
            sharp: true,
            scrim: "full",
          },
          eyebrow: "Почему считать у нас",
          align: "center",
          title: (
            <>
              Три причины <span className="kw">начать с нас</span>
            </>
          ),
          sub: (
            <>
              Расчёт ниже — ориентир. <span className="font-medium text-orange">Точная
              смета всегда бесплатна</span> и приходит после короткого брифа.
            </>
          ),
          items: config.reasons,
        }}
      />

      <SectionStage className="relative py-24 sm:py-32">
        <BlockMedia
          media={{
            photo: config.media.calc,
            gradient: ACCENT,
            intensity: "medium",
            sharp: true,
            scrim: "full",
          }}
        />

        <Container className="max-w-5xl">
          <SectionHead
            head={{
              eyebrow: "Расчёт бюджета",
              align: "left",
              title: (
                <>
                  Выберите <span className="kw">параметры</span> проекта
                </>
              ),
              sub: (
                <>
                  Итоговая стоимость складывается из {config.summary}{" "}
                  <span className="font-medium text-orange">выбранных опций</span>.
                </>
              ),
            }}
          />

          <Appear from="up" delay={DIRECTION_BEAT.content}>
            <div className="mt-12">
              <Calculator config={config} />
            </div>
          </Appear>
        </Container>
      </SectionStage>

      <SectionStage className="relative py-28 sm:py-36">
        <BlockMedia
          media={{
            photo: config.media.close,
            gradient: ACCENT,
            intensity: "loud",
            sharp: true,
            scrim: "full",
            tone: "light",
          }}
        />

        <div className="glass-strip absolute inset-x-0 inset-y-10 -z-[5]" aria-hidden="true" />

        <Container className="text-center">
          <SectionHead
            head={{
              eyebrow: "С чего начнём",
              align: "center",
              title: (
                <>
                  Точная смета <span className="kw">за 24 часа</span>
                </>
              ),
              sub: (
                <>
                  Расскажите задачу в брифе —{" "}
                  {withAccent(
                    "вернёмся со сметой, структурой и сроком, без обязательств.",
                    "без обязательств"
                  )}
                </>
              ),
            }}
            titleClassName="text-[2.4rem] sm:text-[3.4rem] lg:text-[4rem]"
          />

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Appear from="up" delay={DIRECTION_BEAT.cta}>
              <Link href={`/brief/${config.id}`} className="hb-btn">
                Обсудить проект
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
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-display text-[11px] uppercase tracking-[0.15em] text-white">
              <a href={`mailto:${EMAIL}`} className="normal-case tracking-normal transition hover:text-orange">
                {EMAIL}
              </a>
              <Link href={config.parent.href} className="transition hover:text-orange">
                Все направления →
              </Link>
            </div>
          </Appear>
        </Container>
      </SectionStage>
    </div>
  );
}
