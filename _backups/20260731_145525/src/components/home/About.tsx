import Reveal from "@/components/ui/Reveal";
import Container from "@/components/ui/Container";

const stats = [
  { value: "5 лет", label: "в области видеопроизводства" },
  { value: "200+", label: "довольных клиентов" },
  { value: "450+", label: "созданных видеороликов" },
  { value: "5+", label: "штатных сотрудников" },
  { value: "5 стран", label: "международный опыт работы" },
];

export default function About() {
  return (
    <section className="border-t border-black/5 py-24 sm:py-32">
      <Container>
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <span className="mb-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-accent">
              О студии
            </span>
            <h2 className="font-display text-3xl font-bold uppercase tracking-tightest text-ink sm:text-4xl">
              Если вы дошли до этого блока — наши работы вас задели
            </h2>
            <p className="mt-6 text-base leading-relaxed text-neutral-600 sm:text-lg">
              Мы — агентство видеопроизводства KHUDYAKOV.AGENCY. В этом и
              заключается наш подход: пробиться через информационный шум,
              зацепить внимание и держать зрителя до самого конца. Наша
              главная цель — повысить узнаваемость и запоминаемость вашего
              бренда.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-2">
            {stats.map((stat, index) => (
              <Reveal key={stat.label} delay={index * 0.08}>
                <div className="border-l border-black/10 pl-6">
                  <div className="font-display text-3xl font-bold text-ink sm:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-neutral-500">
                    {stat.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
