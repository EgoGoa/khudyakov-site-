import Reveal from "@/components/ui/Reveal";
import Container from "@/components/ui/Container";

const stats = [
  { value: "5 лет", label: "в области видеопроизводства" },
  { value: "200+", label: "довольных клиентов" },
  { value: "450+", label: "созданных видеороликов" },
  { value: "5+", label: "штатных сотрудников" },
  { value: "5 стран", label: "международный опыт работы" },
];

export default function Stats() {
  return (
    <section className="border-b border-ink/10 bg-paper py-14">
      <Container>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.06}>
              <div className="border-l border-ink/15 pl-5">
                <div className="font-display text-3xl uppercase text-ink sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 font-mono text-xs uppercase tracking-[0.1em] text-ink/50">
                  {stat.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
