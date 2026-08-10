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
    <section className="py-10">
      <Container>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-y-6">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.06}>
              <div className="h-full border-l border-glow/30 pl-4">
                <div className="font-display text-3xl uppercase text-paper sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 font-mono text-xs uppercase tracking-[0.1em] text-paper/50 [hyphens:auto] [overflow-wrap:break-word]">
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
