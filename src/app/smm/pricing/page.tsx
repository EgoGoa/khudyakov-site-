import type { Metadata } from "next";
import Link from "next/link";
import PriceText from "@/components/home/PriceText";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import { pricingByCategory } from "@/lib/service-content";
import { EYEBROW } from "@/lib/typography";

export const metadata: Metadata = {
  title: "Цены на SMM — HUD.SERVICE",
  description: "Три пакета ведения соцсетей — от разового аудита до полного цикла с блогерами и таргетом.",
};

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

// Названия тарифов — каждое своим градиентом, как цены: оранжевый, розовый, голубой.
const TIER_NAME_GRADIENTS = [
  "linear-gradient(90deg,#ff7a1a,#ffb347)",
  "linear-gradient(90deg,#ff3d8b,#ff7ad9)",
  "linear-gradient(90deg,#3b82f6,#00d2ff)",
];

export default function SmmPricingPage() {
  const tiers = pricingByCategory.smm;

  return (
    <>
      {/* Фон — ночной ролик на полную длину (32,6 с) с плавным затуханием
          в последние 1,5 с, зациклен. Имя файла с -v2, чтобы браузер не
          отдавал старую копию из кэша. */}
      <video
        src="/video/smm-reel-loop-v2.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover opacity-40"
      />
      <div className="relative z-10">
      <section className="py-16 sm:py-24">
        <Container>
          <Reveal>
            <Eyebrow label="Цены на SMM" tone="glow" />
            <h1 className="font-display text-[2.025rem] uppercase leading-[1.17] tracking-tight text-paper sm:text-[2.7rem] md:text-[3.375rem]">
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
                  className={`tier-glow-${i} flex h-full flex-col rounded-3xl border p-6 backdrop-blur-md ${
                    tier.pro ? "border-glow/50 bg-glow/[0.06]" : "border-paper/15 bg-ink/45"
                  }`}
                >
                  <div
                    className="font-display text-2xl uppercase leading-tight tracking-tight"
                    style={{
                      backgroundImage: TIER_NAME_GRADIENTS[i % TIER_NAME_GRADIENTS.length],
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {tier.name}
                  </div>
                  <span className={`${EYEBROW} -mt-1 text-paper/50`}>
                    {tier.tagline}
                  </span>
                  <div className="mt-2 tier-price-pill relative font-display font-black leading-none">
                    <PriceText text={tier.price} />
                  </div>
                  <div className="mb-6 mt-1 text-xs text-paper/50">{tier.team}</div>

                  <ul className="flex-1 space-y-2.5">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-[0.7rem] leading-snug text-paper/70">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-glow/20 text-glow">
                          <CheckIcon />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/brief"
                    className={`mt-6 w-full rounded-[14px] px-6 py-2 text-center text-[0.7rem] font-semibold transition ${
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
            <h2 className="font-display text-[1.35rem] uppercase leading-tight tracking-tight text-paper sm:text-[1.688rem]">
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
      </div>
    </>
  );
}
