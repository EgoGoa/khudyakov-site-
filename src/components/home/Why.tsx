import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";

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

const testimonials = [
  {
    quote: "Я кайфую от вашего сервиса!",
    description:
      "На любой адекватный запрос вы услышите от нас «да». Около 60% заказов — это клиенты, которые возвращаются снова.",
  },
  {
    quote: "Я поражен качеством исполнения!",
    description:
      "Режиссура кино-уровня, визуальная упаковка по последнему слову дизайна, фотореалистичный рендеринг и VFX-эффекты.",
  },
  {
    quote: "Я удивлен скоростью работы!",
    description:
      "Решаем сложные задачи в сжатые сроки — работаем по принципу продюсерского центра.",
  },
];

export default function Why() {
  return (
    <section id="why" className="border-b border-ink/10 bg-ink py-24 text-paper sm:py-32">
      <Container>
        <Reveal>
          <span className="mb-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-rec">
            02 · Почему мы
          </span>
          <h2 className="font-display text-3xl uppercase tracking-tight text-paper sm:text-4xl md:text-5xl">
            Почему его создадим мы?
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {reasons.map((reason, index) => (
            <Reveal key={reason.title} delay={index * 0.08}>
              <div className="h-full rounded-xl border border-paper/10 bg-paper/5 p-7">
                <h3 className="font-display text-lg uppercase text-paper">
                  {reason.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-paper/60">
                  {reason.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal key={item.quote} delay={index * 0.08}>
              <div className="h-full rounded-xl border border-rec/20 bg-rec/5 p-7">
                <div className="mb-3 font-mono text-xs uppercase tracking-[0.1em] text-rec">
                  Отзыв
                </div>
                <p className="font-display text-lg uppercase text-paper">
                  «{item.quote}»
                </p>
                <p className="mt-3 text-sm leading-relaxed text-paper/60">
                  {item.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
