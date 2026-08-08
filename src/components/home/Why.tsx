import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import GlassCard from "@/components/ui/GlassCard";

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

const chips = ["Съёмка полного цикла", "3D/VFX", "Motion design", "Продюсерский центр"];

export default function Why() {
  return (
    <section id="why" className="border-b border-paper/10 py-16 sm:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
          <Reveal>
            <Eyebrow index="02" label="Почему мы" />
            <h2 className="mt-2 font-display text-3xl uppercase leading-[1.02] tracking-tight text-paper sm:text-4xl md:text-5xl">
              Почему его
              <br />
              создадим мы?
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-paper/60">
              Мы работаем как продюсерский центр — от идеи до готового ролика
              в нужных форматах. На любой адекватный запрос вы услышите от
              нас «да», а около 60% заказов — это клиенты, которые
              возвращаются снова.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-paper/10 bg-paper/[0.03] px-3 py-1.5 text-xs text-paper/70"
                >
                  {chip}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <GlassCard className="p-5">
              <div className="font-mono text-xs uppercase tracking-[0.15em] text-paper/40">
                За 5 лет · 200+ клиентов
              </div>
              <div className="mt-4 space-y-3">
                {reasons.map((reason, index) => (
                  <div key={reason.title} className="liquid-glass rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-paper">
                      <span className="font-mono text-xs text-glow">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {reason.title}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-paper/60">
                      {reason.description}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
