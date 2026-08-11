"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import { useService } from "@/lib/service-context";
import { pricingByCategory, serviceMeta } from "@/lib/service-content";
import type { ServiceKey } from "@/lib/service-content";

const watermark: Record<ServiceKey, [string, string]> = {
  content: ["Видеопродакшн.", "Который не пропускают"],
  ai: ["AI-решения.", "Которые окупаются"],
  sites: ["Сайты.", "Которые продают"],
  smm: ["SMM.", "Который вовлекает"],
};

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function Pricing() {
  const { active } = useService();
  const tiers = pricingByCategory[active];
  const [line1, line2] = watermark[active];

  return (
    <section id="pricing" className="py-10 text-paper sm:py-14">
      <Container>
        <Reveal>
          <Eyebrow index="06" label="Цены" />
          <h2 className="font-sans text-3xl font-light uppercase tracking-[0.01em] text-paper sm:text-4xl md:text-5xl">
            Ориентировочная стоимость
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-paper/60 sm:text-base">
            Мы разрабатываем уникальные видео, поэтому ценообразование —
            индивидуальное. Точную стоимость считаем по ТЗ. Вот несколько
            примеров с ориентировочными ценами.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/calculator"
              className="rounded-full border border-glow/40 px-6 py-3 text-sm font-medium text-paper transition hover:border-glow hover:bg-glow/10"
            >
              Посчитать свой бюджет →
            </Link>
            <Link
              href="/brief"
              className="btn-neon"
            >
              Заполнить бриф
            </Link>
          </div>
        </Reveal>
      </Container>

      <div className="c3-pricing-section">
        <div className="c3-watermark-container">
          <div className="c3-watermark-main">
            <span className="c3-watermark-line-1">{line1}</span>
            <span className="c3-watermark-line-2">{line2}</span>
          </div>
        </div>

        {tiers.length === 0 ? (
          <Container>
            <p className="max-w-lg text-sm leading-relaxed text-paper/50">
              Тарифы по этому направлению скоро появятся здесь.
            </p>
          </Container>
        ) : (
        <div className="c3-grid">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`c3-card ${tier.pro ? "c3-card-pro" : ""}`}
            >
              <span className="c3-tier-small">{tier.tagline}</span>
              <div className="c3-tier-large">{tier.name}</div>
              <div className="mt-2 text-lg font-semibold text-paper">{tier.price}</div>
              <div className="c3-team mb-8">{tier.team}</div>
              <ul className="c3-list">
                {tier.features.map((feature) => (
                  <li key={feature}>
                    <span className="c3-check text-paper">
                      <CheckIcon />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`mt-auto self-center rounded-full px-8 py-2.5 text-sm font-semibold transition ${
                  tier.pro
                    ? "bg-rec text-white hover:bg-rec-light"
                    : "bg-paper text-ink hover:bg-white"
                }`}
              >
                Выбрать план
              </a>
            </motion.div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
