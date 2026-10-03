"use client";

import { useRef, type CSSProperties } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Magnetic from "@/components/ui/Magnetic";
import MagneticChars from "@/components/ui/MagneticChars";
import HeroPromoStack from "@/components/home/HeroPromoStack";
import HeroWordmark from "@/components/home/HeroWordmark";
import HeroHeadline from "@/components/home/HeroHeadline";
import HeroReel from "@/components/home/HeroReel";
import { PhoneIcon, TelegramIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { HERO_LEAD } from "@/lib/typography";
import { BOOT, useBootStage } from "@/lib/boot-sequence";


// Same numbers as Stats.tsx, but a plain inline row here — no border, no
// grid — just filling the space under the CTAs.
const heroStats = [
  { value: "8 лет", label: "на рынке" },
  { value: "350+", label: "клиентов" },
  { value: "450+", label: "проектов" },
  { value: "5 стран", label: "опыта" },
];

export default function Hero() {
  const titleWrapRef = useRef<HTMLDivElement>(null);

  // Шоурил — на самом сайте (раньше YouTube) и в HTML с первой секунды, см.
  // HeroReel: лёгкая нарезка играет сразу при любой связи, на широком
  // экране потом подменяется полной. Видео — первое в очереди загрузки
  // (lib/boot-sequence): заголовок, кнопки и цифры ждут, пока оно не будет
  // готово играть (не дольше 2,5 с). До этого место держит кадр из ролика.
  // Каскад первого экрана: заголовок → подзаголовок → кнопки → цифры, шаг
  // 0,2 с, стартует этапом `content` очереди.
  const go = useBootStage(BOOT.content);
  const shown = go ? { opacity: 1, y: 0 } : undefined;

  // Track the cursor as CSS custom properties (not React state) so the
  // glow can follow the mouse every frame without triggering re-renders.
  const handleTitleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = titleWrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
  };

  return (
    <section id="top" className="relative flex min-h-screen flex-col overflow-hidden pb-0 pt-16 text-paper sm:pt-20 land:pt-6">
      {/* showreel behind the headline, full width across the top of the
          site — playing on a loop, softly blurred at rest so the type stays
          readable and snapping sharp on hover */}
      <div className="group absolute inset-0 -z-10 overflow-hidden">
        {/* Same still the iframe itself would show at rest — covers the spot
            immediately so there's no blank/black flash while the embed is
            deferred. */}
        {/* The still no longer fades out once the video is up — it simply
            stays underneath it for the whole page, permanently.
            Fading it left the reel as the only thing painting this area, and
            a <video> does not always paint: pause it (background tab), let
            the browser reclaim its decode buffer under memory pressure, or
            hit a stall mid-stream, and the element keeps its box while
            drawing nothing — the black flash Egor kept catching, now with
            no still left behind it to cover the gap. An mp4 has no alpha, so
            the playing video hides the still completely anyway; keeping it
            costs a layer that was already decoded and turns every one of
            those failures into "the reel's own frame, held" instead of
            black. */}
        <picture>
          {/* Телефон: кадр уже затемнён и размыт, как и ролик над ним. */}
          <source media="(max-width: 899.98px)" srcSet="/images/showreel-frame-phone.jpg" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/showreel-frame.jpg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 aspect-video w-[280%] max-w-none scale-[1.5] -translate-x-1/2 -translate-y-1/2 hero-media object-cover blur-[8px] saturate-[1.15] brightness-[0.8] sm:w-[200%] md:w-[147%] lg:w-[127%]"
          />
        </picture>
        <HeroReel className="pointer-events-none absolute left-1/2 top-1/2 aspect-video w-[280%] max-w-none scale-[1.5] -translate-x-1/2 -translate-y-1/2 hero-media object-cover blur-[8px] saturate-[1.15] brightness-[0.8] transition-[filter] duration-500 ease-out group-hover:blur-0 group-hover:brightness-100 sm:w-[200%] md:w-[147%] lg:w-[127%]" />
        <div
          className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-60"
          style={{
            background:
              "linear-gradient(to bottom, rgba(11,11,16,0.55) 0%, rgba(11,11,16,0.35) 28%, rgba(11,11,16,0.88) 72%, #0B0B10 100%)",
          }}
        />
      </div>

      <Container className="flex flex-1 flex-col justify-center">
        {/* Слева — бренд-столбик «Digital / AI / Creative», справа за
            градиентной чертой — меняющийся заголовок услуг, строка
            «Команда…» и кнопки (вариант B + A, выбор Егора 2026-09-28).
            Слова столбика раз в несколько секунд перетекают в тонкий
            контур и обратно. На телефоне столбик стоит над заголовком. */}
        <div className="hero-split">
        <HeroWordmark shown={shown} />
        <div className="hero-split-main">
        <div
          ref={titleWrapRef}
          onMouseMove={handleTitleMouseMove}
          className="hero-title-wrap relative mt-6"
        >
          <div className="hero-title-glow" aria-hidden="true" />
          {/* "Монолит" (headline mockup option 03), carried over as literal
              CSS — perspective on the outer wrap, the fixed tilt as a plain
              static transform on the middle div, exactly the two mockup
              rules (.h3-wrap / .h3). That tilt has to sit on a div of its
              own rather than directly on motion.h1: framer writes its own
              opacity/y animation as an inline `transform` on whatever
              element carries `animate`, and an inline style always beats a
              CSS class — a `.hero-monolith` class placed on motion.h1
              itself would get its rotateX/scale silently overwritten the
              instant framer's animation ran. */}
          <div className="hero-monolith-wrap">
            {/* The 3D tilt (rotateX(18deg) scale(1.02)) was tuned for the
                fixed two-word "DIGITAL AI" wordmark this slot used to hold.
                Now that it shows a real, changing service name, that same
                perspective skew reads as the letters being warped/deformed
                — Egor's "деформация" complaint, confirmed by comparing
                computed styles against ServicePicker's flat "СОЗДАНИЕ
                КОНТЕНТА" (identical font-weight/gradient/glow already;
                the only structural difference was this transform).
                Flattened here, keeping .hero-monolith's font-size/
                line-height/letter-spacing metrics untouched. */}
            <div className="hero-monolith" style={{ transform: "none" }}>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={shown}
                transition={{ duration: 0.7, delay: 0 }}
                // No text-*/leading-*/tracking-* here on purpose: size,
                // line-height and letter-spacing come from .hero-monolith
                // so they stay exactly the mockup's values.
                className="relative max-w-4xl font-display font-extrabold uppercase"
                // Reserved for the tallest a cycling title can get (title
                // wrapping to 2 lines + the slogan line below it) — without
                // this, a short service name left the H1 shorter than a
                // long one and everything below (CTAs, stats, the lead
                // paragraph) jumped every 4.2s as HeroHeadline cycled.
                // em-based so it scales with .hero-monolith's own
                // responsive font-size.
                // Заголовок прижат к низу своего места (flex-end): слоган
                // стоит на одной и той же строке при любом названии, длинное
                // название растёт вверх, а строка «Команда…» под ним не
                // двигается (Егор, 2026-09-28).
                style={{ minHeight: "3.2em", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}
              >
                <HeroHeadline />
              </motion.h1>
            </div>
          </div>
        </div>

        {/* Back above the CTAs, its original spot, and left-aligned like it
            always was — the centred/full-width pass was a detour. No
            Container wrapper here: this already sits inside the outer one
            (line 92) the same way the H1 above it does, and a nested
            Container was doubling the left padding, pushing this out of
            alignment with the headline's own left edge. */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={shown}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={`mt-3 max-w-[70%] text-left ${HERO_LEAD}`}
        >
          <span className="kw">Команда</span>, AI-технологии мы подключили как инструмент — чтобы делать <span className="kw">глубже и эффективнее</span>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={shown}
          transition={{ duration: 0.7, delay: 0.4 }}
          // Телефон: три круглые кнопки с иконками в один ряд, без текста
          // (Егор, 2026-10-03) — освобождает место под крупную надпись. Текст
          // остаётся для скринридеров (sr-only), с sm он снова виден. (Варианты max-* в этом проекте не
          // генерируются — из-за raw-экрана land, поэтому «телефон сначала».)
          className="mt-6 flex items-center gap-3 sm:mt-8 sm:flex-wrap"
        >
          <a
            href="tel:+79925111812"
            className="btn-neon grid h-12 w-12 place-items-center !p-0 !text-[9px] sm:flex sm:h-auto sm:w-auto sm:!px-4 sm:!py-2"
            style={{ "--btn-neon-delay": "0s" } as CSSProperties}
          >
            <PhoneIcon className="h-5 w-5 animate-pulse sm:h-4 sm:w-4" />
            <span className="sr-only sm:not-sr-only">Заказать звонок</span>
          </a>
          <a
            href="https://t.me/hdkv"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-neon grid h-12 w-12 place-items-center !p-0 !text-[9px] sm:flex sm:h-auto sm:w-auto sm:!px-4 sm:!py-2"
            style={{ "--btn-neon-delay": "1.2s" } as CSSProperties}
          >
            <TelegramIcon className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="sr-only sm:not-sr-only">Написать в Telegram</span>
          </a>
          <a
            href="https://wa.me/79925111812"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-neon grid h-12 w-12 place-items-center !p-0 !text-[9px] sm:flex sm:h-auto sm:w-auto sm:!px-4 sm:!py-2"
            style={{ "--btn-neon-delay": "2.4s" } as CSSProperties}
          >
            <WhatsAppIcon className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="sr-only sm:not-sr-only">Написать в WhatsApp</span>
          </a>
        </motion.div>
        </div>
        </div>
      </Container>

      {/* Акции месяца — лента-карусель по центру внизу шапки (Егор,
          2026-10-03, референс: плеер с обложками). */}
      <Container className="shrink-0">
        <HeroPromoStack className="mt-6" />
      </Container>

      {/* Anchored to the hero's own bottom, above the menu strip — Container
          above is flex-1/justify-center, so it absorbs the extra vertical
          space on tall viewports and this row naturally lands right where
          the CTAs used to leave empty air. justify-between stretches it
          across the full width instead of clustering left like the CTAs. */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={shown}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="relative mt-10 shrink-0"
      >
        {/* pb-24 — место под волну голосового
            ассистента (VoiceAssistant), которая стоит там по центру снизу. */}
        <Container className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4 pb-24">
          {heroStats.map((stat) => (
            <div key={stat.label}>
              <span className="font-display text-2xl uppercase text-paper sm:text-3xl">
                {stat.value}
              </span>
              <span className="ml-2 font-display text-xs uppercase tracking-[0.1em] text-paper/50">
                {stat.label}
              </span>
            </div>
          ))}
        </Container>
      </motion.div>

    </section>
  );
}
