import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Кейсы SMM — HDKV.AGENCY",
  description: "Кейсы ведения соцсетей HDKV.AGENCY появятся здесь по мере запуска проектов.",
};

// Placeholder cards, not an empty section — content/site-copy.md's rule for
// /sites applies here too: no portfolio at all reads worse than a section
// that's honest about being in progress. Categories are the niches HDKV
// typically works with (see content/site-copy.md's client roster), not
// invented from a reference site.
const PLACEHOLDER_CASES = [
  { category: "Бьюти" },
  { category: "E-commerce" },
  { category: "Услуги" },
  { category: "HoReCa" },
  { category: "Event" },
  { category: "Недвижимость" },
];

export default function SmmCasesPage() {
  return (
    <>
      <section className="py-16 sm:py-24">
        <Container>
          <Reveal>
            <Eyebrow label="Кейсы SMM" tone="glow" />
            <h1 className="font-display text-4xl uppercase leading-[1.02] tracking-tight text-paper sm:text-5xl md:text-6xl">
              Кейсы ведения
              <br />
              соцсетей
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-paper/60 sm:text-lg">
              Реальные проекты появятся здесь по мере запуска. Пока показываем формат, в котором будем их
              собирать — по нишам, с которыми обычно работает агентство.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="py-8 sm:py-12">
        <Container>
          <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PLACEHOLDER_CASES.map((item) => (
              <div
                key={item.category}
                className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-paper/20 bg-ink/40 p-6 text-center"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">
                  {item.category}
                </span>
                <span className="rounded-full border border-paper/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-paper/50">
                  Кейс в работе
                </span>
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-2xl text-center">
          <Reveal>
            <h2 className="font-display text-2xl uppercase leading-tight tracking-tight text-paper sm:text-3xl">
              Хотите стать первым кейсом?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-paper/60 sm:text-base">
              Разберём ваш аккаунт бесплатно — покажем, что усилить в первую очередь.
            </p>
            <Link href="/brief" className="btn-neon mt-6 inline-flex !py-3.5">
              Получить аудит
            </Link>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
