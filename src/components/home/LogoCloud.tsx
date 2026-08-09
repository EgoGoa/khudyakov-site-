import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";

const clients = [
  "KIA",
  "Федерация баскетбола",
  "Гольф-клуб",
  "Ani d. Zop",
  "COTRIL",
  "OUTDOOR",
  "GOOD GAME",
];

export default function LogoCloud() {
  return (
    <section className="border-b border-paper/10 py-8 sm:py-10">
      <Container>
        <p className="text-center font-mono text-xs uppercase tracking-[0.25em] text-paper/40">
          Нам доверяют
        </p>
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-7">
          {clients.map((name, index) => (
            <Reveal key={name} delay={index * 0.05}>
              <div className="flex h-12 items-center justify-center text-center text-sm font-semibold tracking-tight text-paper/45 transition hover:text-paper">
                {name}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
