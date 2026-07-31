import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

const tags = [
  "Варианты цен",
  "Без риска для новичков",
  "Грамотное ТЗ",
  "Открытая смета",
];

const reasons = [
  {
    title: "Качество и количество оборудования",
    description:
      "Предлагаем оптимальный баланс между качеством и стоимостью используемого оборудования.",
  },
  {
    title: "Мощные идеи",
    description:
      "Разрабатываем бесплатно 2–3 творческие концепции с реализацией под ключ.",
  },
  {
    title: "Выгода для клиента",
    description:
      "Предлагаем цены заметно ниже студий такого же уровня в Москве и Санкт-Петербурге.",
  },
];

export default function WhyUs() {
  return (
    <section className="border-t border-black/5 py-24 sm:py-32">
      <Container>
        <Reveal>
          <div className="mb-8 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-medium text-neutral-600"
              >
                {tag}
              </span>
            ))}
          </div>
          <SectionHeading eyebrow="Почему мы" title="Почему его создадим мы?" />
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {reasons.map((reason, index) => (
            <Reveal key={reason.title} delay={index * 0.1}>
              <div className="h-full rounded-2xl border border-black/10 bg-white p-8">
                <h3 className="font-display text-lg font-bold text-ink">
                  {reason.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  {reason.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
