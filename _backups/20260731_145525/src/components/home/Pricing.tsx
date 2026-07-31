import Link from "next/link";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

const tiers = [
  {
    name: "Стартовый",
    price: "от 35 000 до 75 000 ₽",
    tagline: "Видеопродукт базового уровня",
    team: "Команда от 5 человек",
    features: [
      "Эксплейнеры и обучающие видеоуроки",
      "Несложные презентации с элементами 2D/3D-анимации",
      "Создание логотипа и анимированной заставки",
    ],
    highlighted: false,
  },
  {
    name: "Профессиональный",
    price: "от 75 000 до 255 000 ₽",
    tagline: "Креативное видео на заказ",
    team: "Команда от 10 человек",
    features: [
      "Рекламное видео для ТВ и запуска на YouTube",
      "Анимированные ролики",
      "3D-визуализация со сложной детализацией",
    ],
    highlighted: true,
  },
  {
    name: "Премиальный",
    price: "от 900 000 ₽",
    tagline: "Эксклюзивный видеоролик на заказ",
    team: "Команда от 15 человек",
    features: [
      "Самые сложные и комплексные задачи",
      "VFX и спецэффекты",
      "Съёмка и графика высшего уровня",
    ],
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section className="border-t border-black/5 bg-white py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Цены"
            title="Ориентировочная стоимость"
            description="Мы разрабатываем уникальные видео, поэтому ценообразование — индивидуальное. Точную стоимость считаем по ТЗ. Вот несколько примеров с ориентировочными ценами."
          />
        </Reveal>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <Reveal key={tier.name} delay={index * 0.1}>
              <div
                className={`flex h-full flex-col rounded-2xl border p-8 ${
                  tier.highlighted
                    ? "border-ink bg-ink text-white"
                    : "border-black/10 bg-white text-ink"
                }`}
              >
                <span
                  className={`text-xs font-medium uppercase tracking-[0.2em] ${
                    tier.highlighted ? "text-white/60" : "text-neutral-400"
                  }`}
                >
                  {tier.tagline}
                </span>
                <h3 className="mt-3 font-display text-2xl font-bold">
                  {tier.name}
                </h3>
                <div className="mt-4 text-xl font-semibold">{tier.price}</div>
                <div
                  className={`mt-1 text-sm ${
                    tier.highlighted ? "text-white/60" : "text-neutral-500"
                  }`}
                >
                  {tier.team}
                </div>
                <ul
                  className={`mt-6 flex-1 space-y-3 text-sm leading-relaxed ${
                    tier.highlighted ? "text-white/80" : "text-neutral-600"
                  }`}
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span>—</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <p className="mt-10 text-center text-sm text-neutral-500">
            Начнём с бесплатной консультации, сметы и подготовки концепций.{" "}
            <Link href="/brief" className="text-accent hover:underline">
              Отправить бриф
            </Link>
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
