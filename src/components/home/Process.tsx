import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import GlassCard from "@/components/ui/GlassCard";

const steps = [
  {
    title: "Бриф и концепция (3–5 дней)",
    description:
      "Обсуждаем задачу, аудиторию и бюджет — вы заполняете бриф онлайн или говорите напрямую с продюсером. Готовим 2–3 творческие концепции бесплатно, вы выбираете направление и утверждаете смету.",
  },
  {
    title: "Съёмка и производство",
    description:
      "Собираем команду и оборудование под формат, снимаем по утверждённому сценарию — на каждом этапе вы видите прогресс и можете вносить правки.",
  },
  {
    title: "Монтаж и сдача",
    description:
      "Монтируем, сводим звук, делаем цветокоррекцию и передаём готовый ролик в нужных форматах — с возможностью правок по вашим комментариям.",
  },
];

export default function Process() {
  return (
    <section id="process" className="border-b border-paper/10 py-10 sm:py-14">
      <Container>
        <Reveal>
          <Eyebrow index="05" label="Как мы работаем" />
          <h2 className="font-sans text-3xl font-light uppercase tracking-[0.01em] text-paper sm:text-4xl md:text-5xl">
            Процесс в три шага
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.1}>
              <GlassCard className="h-full p-6">
                <div className="font-display text-5xl text-glow">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-4 font-display text-xl uppercase text-paper">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-paper/60">
                  {step.description}
                </p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
