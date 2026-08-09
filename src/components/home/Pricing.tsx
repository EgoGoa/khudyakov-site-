"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";

const tiers = [
  {
    name: "Стартовый",
    price: "от 35 000 до 75 000 ₽",
    tagline: "Видеопродукт базового уровня",
    team: "Команда от 5 человек",
    features: [
      "Эксплейнеры и обучающие видеоуроки",
      "Несложные презентации с элементами 2D/3D-анимации",
      "Создание логотипа и анимированной заставки",
    ],
    pro: false,
  },
  {
    name: "Профессиональный",
    price: "от 75 000 до 255 000 ₽",
    tagline: "Креативное видео на заказ",
    team: "Команда от 10 человек",
    features: [
      "Рекламное видео для ТВ и запуска на YouTube",
      "Анимированные ролики",
      "3D-визуализация со сложной детализацией",
    ],
    pro: true,
  },
  {
    name: "Премиальный",
    price: "от 900 000 ₽",
    tagline: "Эксклюзивный видеоролик на заказ",
    team: "Команда от 15 человек",
    features: [
      "Самые сложные и комплексные задачи",
      "VFX и спецэффекты",
      "Съёмка и графика высшего уровня",
    ],
    pro: false,
  },
];

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="border-b border-paper/10 py-10 text-paper sm:py-14">
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
            <span className="c3-watermark-line-1">Видеопродакшн.</span>
            <span className="c3-watermark-line-2">Который не пропускают</span>
          </div>
        </div>

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
      </div>
    </section>
  );
}
