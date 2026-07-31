import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";

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
    <section id="pricing" className="border-b border-ink/10 bg-ink py-24 text-paper sm:py-32">
      <Container>
        <Reveal>
          <span className="mb-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-rec">
            06 · Цены
          </span>
          <h2 className="font-display text-3xl uppercase tracking-tight text-paper sm:text-4xl md:text-5xl">
            Ориентировочная стоимость
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-paper/60 sm:text-base">
            Мы разрабатываем уникальные видео, поэтому ценообразование —
            индивидуальное. Точную стоимость считаем по ТЗ. Вот несколько
            примеров с ориентировочными ценами.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <Reveal key={tier.name} delay={index * 0.1}>
              <div
                className={`flex h-full flex-col rounded-xl border p-8 ${
                  tier.highlighted
                    ? "border-rec bg-rec text-white"
                    : "border-paper/15 bg-paper/5 text-paper"
                }`}
              >
                <span
                  className={`font-mono text-xs uppercase tracking-[0.15em] ${
                    tier.highlighted ? "text-white/70" : "text-paper/40"
                  }`}
                >
                  {tier.tagline}
                </span>
                <h3 className="mt-3 font-display text-2xl uppercase">
                  {tier.name}
                </h3>
                <div className="mt-4 text-xl font-semibold">{tier.price}</div>
                <div
                  className={`mt-1 text-sm ${
                    tier.highlighted ? "text-white/70" : "text-paper/50"
                  }`}
                >
                  {tier.team}
                </div>
                <ul
                  className={`mt-6 flex-1 space-y-3 text-sm leading-relaxed ${
                    tier.highlighted ? "text-white/85" : "text-paper/70"
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
      </Container>
    </section>
  );
}
