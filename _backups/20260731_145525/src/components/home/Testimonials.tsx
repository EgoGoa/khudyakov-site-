import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

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

export default function Testimonials() {
  return (
    <section className="border-t border-black/5 py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Отзывы" title="За что нас ценят" />
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal key={item.quote} delay={index * 0.1}>
              <div className="h-full rounded-2xl border border-black/10 bg-white p-8">
                <div className="mb-4 text-accent">★★★★★</div>
                <p className="font-display text-lg font-bold text-ink">
                  «{item.quote}»
                </p>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
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
