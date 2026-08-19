import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import Calculator from "@/components/calculator/Calculator";

export const metadata: Metadata = {
  title: "Калькулятор стоимости — HDKV.AGENCY",
  description:
    "Посчитайте ориентировочный бюджет проекта онлайн: тип ролика, хронометраж и дополнительные опции. HDKV.AGENCY — 8 лет на рынке, 450+ проектов, 350+ клиентов.",
};

const stats = [
  { value: "8 лет", label: "в видеопроизводстве" },
  { value: "450+", label: "созданных проектов" },
  { value: "350+", label: "довольных клиентов" },
  { value: "5 стран", label: "международный опыт" },
];

const reasons = [
  {
    title: "Продюсерский центр полного цикла",
    description: "От идеи и сценария до готового ролика — без подрядчиков на стороне.",
  },
  {
    title: "2–3 концепции бесплатно",
    description: "Разрабатываем творческие идеи под задачу перед стартом работы.",
  },
  {
    title: "Цены ниже, чем в Москве и СПб",
    description: "Тот же уровень качества — заметно доступнее для регионов.",
  },
];

export default function CalculatorPage() {
  return (
    <>
      <section className="py-16 sm:py-24">
        <Container>
          <Reveal>
            <Eyebrow label="Калькулятор стоимости" />
            <h1 className="font-display text-4xl uppercase leading-[1.02] tracking-tight text-paper sm:text-5xl md:text-6xl">
              Сколько стоит
              <br />
              ваш проект?
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-paper/60 sm:text-lg">
              HDKV.AGENCY — диджитал-агентство полного цикла: снимаем рекламу, имиджевые видео, контент для соцсетей и мероприятия, усиливаем результат AI-инструментами. Посчитайте ориентировочный бюджет ниже — точную смету пришлём после короткого брифа.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="border-l border-glow/30 pl-4">
                <div className="font-display text-2xl uppercase text-paper sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 font-mono text-xs uppercase tracking-[0.1em] text-paper/50">
                  {stat.label}
                </div>
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <Reveal className="grid gap-4 sm:grid-cols-3">
            {reasons.map((reason, index) => (
              <div key={reason.title} className="liquid-glass rounded-xl p-5">
                <span className="font-mono text-xs text-glow">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-sm font-semibold text-paper">{reason.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-paper/55">
                  {reason.description}
                </p>
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container className="max-w-5xl">
          <Reveal>
            <Eyebrow label="Расчёт бюджета" tone="glow" />
            <h2 className="font-display text-3xl uppercase tracking-tight text-paper sm:text-4xl md:text-5xl">
              Выберите параметры проекта
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-paper/60 sm:text-base">
              Итоговая стоимость складывается из типа ролика, хронометража и
              выбранных опций.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <Calculator />
          </Reveal>
        </Container>
      </section>
    </>
  );
}
