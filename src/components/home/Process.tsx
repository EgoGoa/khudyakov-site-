import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";

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
    <section id="process" className="border-b border-ink/10 py-24 sm:py-32">
      <Container>
        <Reveal>
          <span className="mb-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-rec">
            05 · Как мы работаем
          </span>
          <h2 className="font-display text-3xl uppercase tracking-tight text-ink sm:text-4xl md:text-5xl">
            Процесс в три шага
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.1}>
              <div className="h-full rounded-xl border border-ink/10 bg-white p-8">
                <div className="font-display text-5xl text-rec">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-4 font-display text-xl uppercase text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/60">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
