import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import GlassCard from "@/components/ui/GlassCard";

const steps = [
  {
    title: "Бриф и концепция",
    description:
      "Обсуждаем задачу, аудиторию и бюджет, готовим 2–3 творческие концепции бесплатно.",
  },
  {
    title: "Съёмка и производство",
    description:
      "Собираем команду и оборудование под формат, снимаем по утверждённому сценарию.",
  },
  {
    title: "Монтаж и сдача",
    description:
      "Монтируем, сводим звук, делаем цветокоррекцию и передаём готовый ролик в нужных форматах.",
  },
];

export default function Process() {
  return (
    <section id="process" className="border-b border-paper/10 py-16 sm:py-24">
      <Container>
        <Reveal>
          <Eyebrow index="05" label="Как мы работаем" />
          <h2 className="font-display text-3xl uppercase tracking-tight text-paper sm:text-4xl md:text-5xl">
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
