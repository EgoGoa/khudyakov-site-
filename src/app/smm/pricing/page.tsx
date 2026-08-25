import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import { pricingByCategory } from "@/lib/service-content";

export const metadata: Metadata = {
  title: "Цены на SMM — HDKV.AGENCY",
  description: "Три пакета ведения соцсетей — от разового аудита до полного цикла с блогерами и таргетом.",
};

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function SmmPricingPage() {
  const tiers = pricingByCategory.smm;

  return (
    <>
      <section className="py-16 sm:py-24">
        <Container>
          <Reveal>
            <Eyebrow label="Цены на SMM" tone="glow" />
            <h1 className="font-display text-4xl uppercase leading-[1.02] tracking-tight text-paper sm:text-5xl md:text-6xl">
              Сколько стоит
              <br />
              ведение соцсетей
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-paper/60 sm:text-lg">
              Три пакета — от ведения без съёмки до полного цикла с блогерами и таргетом. Точную смету считаем
              по брифу: зависит от количества площадок и объёма съёмки.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="py-8 sm:py-12">
        <Container>
          <div className="grid gap-5 sm:grid-cols-3">
            {tiers.map((tier, i) => (
              <Reveal key={tier.name} delay={i * 0.08}>
                <div
                  className={`flex h-full flex-col rounded-3xl border p-6 backdrop-blur-md ${
                    tier.pro ? "border-glow/50 bg-glow/[0.06]" : "border-paper/15 bg-ink/45"
                  }`}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/50">
                    {tier.tagline}
                  </span>
                  <div className="mt-2 font-display text-2xl uppercase tracking-tight text-paper">
                    {tier.name}
                  </div>
                  <div className="mt-2 text-base font-semibold text-paper">{tier.price}</div>
                  <div className="mb-6 mt-1 text-xs text-paper/50">{tier.team}</div>

                  <ul className="flex-1 space-y-2.5">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm leading-snug text-paper/70">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-glow/20 text-glow">
                          <CheckIcon />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/brief"
                    className={`mt-6 w-full rounded-full px-8 py-2.5 text-center text-sm font-semibold transition ${
                      tier.pro ? "bg-glow text-ink hover:opacity-90" : "bg-paper text-ink hover:bg-white"
                    }`}
                  >
                    Выбрать пакет
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2} className="mt-6 text-xs leading-relaxed text-paper/40">
            Суммы — стартовая вилка по рынку, уточняются перед публикацией. Точная стоимость — по брифу.
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-2xl text-center">
          <Reveal>
            <h2 className="font-display text-2xl uppercase leading-tight tracking-tight text-paper sm:text-3xl">
              Не уверены, какой пакет нужен?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-paper/60 sm:text-base">
              Разберём аккаунт бесплатно и предложим формат, который подходит именно вам.
            </p>
            <Link
              href="/brief"
              className="btn-neon mt-6 inline-flex !py-3.5"
            >
              Получить аудит
            </Link>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
