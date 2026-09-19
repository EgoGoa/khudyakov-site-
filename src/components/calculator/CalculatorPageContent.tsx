"use client";

import Link from "next/link";
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

// Страница калькулятора — реюзает те же строительные блоки, что и страницы
// направлений (/content/[direction]), просто без DirectionContent/реестра:
// это утилитарная страница вне системы направлений, а не ещё одно
// направление. Взяты DirectionHero, WhyBlock, SectionStage/SectionHead и
// DirectionBackdrop напрямую — Егор попросил «похоже на страницы
// направлений», а не отдельный параллельный дизайн.
//
// Акцент — родной магента→оранжевый /content (тот же ACCENT, что у страниц
// направлений в этом разделе): калькулятор — общая утилита раздела
// «Создание контента», а не отдельное направление со своим цветом.
const ACCENT = { from: "#ff4fd8", to: "#ff6a3d" };

const STATS = [
  { value: "8 лет", label: "в видеопроизводстве" },
  { value: "450+", label: "созданных проектов" },
  { value: "350+", label: "довольных клиентов" },
  { value: "5 стран", label: "международный опыт" },
];

const REASONS = [
  {
    anchor: "01",
    title: "Продюсерский центр полного цикла",
    text: "От идеи и сценария до готового ролика — без подрядчиков на стороне.",
  },
  {
    anchor: "02",
    title: "2–3 концепции бесплатно",
    text: "Разрабатываем творческие идеи под задачу перед стартом работы.",
  },
  {
    anchor: "03",
    title: "Цены ниже, чем в Москве и СПб",
    text: "Тот же уровень качества — заметно доступнее для регионов.",
  },
];

export default function CalculatorPageContent() {
  return (
    <div className="content-warm-headings relative [overflow-x:clip]">
      <DirectionBackdrop from={ACCENT.from} to={ACCENT.to} />

      <DirectionHero
        hero={{
          parent: { href: "/content", label: "Создание контента" },
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
              HDKV.AGENCY — диджитал-агентство полного цикла: снимаем рекламу,
              имиджевые видео, контент для соцсетей и мероприятия, усиливаем
              результат AI-инструментами.{" "}
              <span className="font-medium text-orange">
                Посчитайте ориентировочный бюджет ниже
              </span>{" "}
              — точную смету пришлём после короткого брифа.
            </>
          ),
          photo: "/images/stock/businesswoman-office.webp",
          photoPosition: "70% 30%",
          teamAsk: {
            memberId: "egor",
            question: "Нужна точная смета, не вилка?",
            pitch: "Расскажите задачу — посчитаем без калькулятора, лично.",
            actionLabel: "Обсудить с Егором",
            href: "/brief",
          },
        }}
        stats={STATS}
      />

      <WhyBlock
        why={{
          media: {
            photo: "/images/stock/design-tablet.webp",
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
          items: REASONS,
        }}
      />

      <SectionStage className="relative py-24 sm:py-32">
        <BlockMedia
          media={{
            photo: "/images/stock/planner-desk.webp",
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
                  Итоговая стоимость складывается из типа ролика,
                  хронометража и{" "}
                  <span className="font-medium text-orange">выбранных опций</span>.
                </>
              ),
            }}
          />

          <Appear from="up" delay={DIRECTION_BEAT.content}>
            <div className="mt-12">
              <Calculator />
            </div>
          </Appear>
        </Container>
      </SectionStage>

      <SectionStage className="relative py-28 sm:py-36">
        <BlockMedia
          media={{
            photo: "/images/stock/woman-tablet-white.webp",
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
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-display text-[11px] uppercase tracking-[0.15em] text-white">
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
    </div>
  );
}
