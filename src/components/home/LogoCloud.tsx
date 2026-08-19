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

// A strip, not a grid: names run in one rule-bounded row and wrap only when
// the viewport forces it, the way a real logo bar reads rather than a card
// grid pretending to be one. Text stands in for the marks themselves —
// swap in image logos here later without touching the layout.
export default function LogoCloud() {
  return (
    <section id="logocloud" className="py-10 sm:py-12">
      <Container>
        <p className="text-center font-mono text-xs uppercase tracking-[0.25em] text-paper/40">
          Нам доверяют
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 border-y border-paper/10 py-7 sm:gap-x-14">
          {clients.map((name, index) => (
            <Reveal key={name} delay={index * 0.05}>
              <span className="font-display text-lg uppercase tracking-tight text-paper/50 transition hover:text-paper sm:text-xl">
                {name}
              </span>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
