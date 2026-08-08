import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import GlassCard from "@/components/ui/GlassCard";

const testimonials = [
  {
    quote: "Я кайфую от вашего сервиса!",
    description:
      "На любой адекватный запрос вы услышите от нас «да». Около 60% заказов — это клиенты, которые возвращаются снова.",
    tag: "Рекламный ролик",
  },
  {
    quote: "Я поражён качеством исполнения!",
    description:
      "Режиссура кино-уровня, визуальная упаковка по последнему слову дизайна, фотореалистичный рендеринг и VFX-эффекты.",
    tag: "3D/VFX-проект",
  },
  {
    quote: "Я удивлён скоростью работы!",
    description:
      "Решаем сложные задачи в сжатые сроки — работаем по принципу продюсерского центра.",
    tag: "Съёмка мероприятия",
  },
];

export default function Testimonials() {
  return (
    <section className="border-b border-paper/10 py-16 sm:py-24">
      <Container>
        <Reveal>
          <Eyebrow label="Отзывы" />
          <h2 className="font-display text-3xl uppercase tracking-tight text-paper sm:text-4xl md:text-5xl">
            Что говорят клиенты
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal key={item.quote} delay={index * 0.08}>
              <GlassCard className="h-full p-6">
                <p className="font-display text-lg uppercase leading-snug text-paper">
                  «{item.quote}»
                </p>
                <p className="mt-3 text-sm leading-relaxed text-paper/60">
                  {item.description}
                </p>
                <div className="mt-6 border-t border-paper/10 pt-4 font-mono text-xs uppercase tracking-[0.15em] text-glow">
                  {item.tag}
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
