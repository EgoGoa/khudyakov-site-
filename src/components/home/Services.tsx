import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import { services } from "@/lib/data";

export default function Services() {
  return (
    <section id="services" className="border-b border-ink/10 py-24 sm:py-32">
      <Container>
        <Reveal>
          <span className="mb-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-rec">
            03 · Наше предложение
          </span>
          <h2 className="font-display text-3xl uppercase tracking-tight text-ink sm:text-4xl md:text-5xl">
            Что мы делаем
          </h2>
        </Reveal>

        <div className="mt-12 border-t border-ink/10">
          {services.map((service, index) => (
            <Reveal key={service.title} delay={(index % 5) * 0.05}>
              <div className="group flex flex-col gap-2 border-b border-ink/10 py-6 sm:flex-row sm:items-center sm:gap-8">
                <span className="font-mono text-sm text-ink/40 sm:w-12">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-xl uppercase tracking-tight text-ink transition-colors group-hover:text-rec sm:w-80 sm:text-2xl">
                  {service.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink/60 sm:flex-1">
                  {service.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
