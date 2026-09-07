"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import { EASE } from "@/lib/motion";
import { HERO_LEAD, EYEBROW } from "@/lib/typography";
import Typewriter from "./Typewriter";
import { TelegramIcon } from "@/components/ui/Icons";
import { TELEGRAM_URL } from "./contacts";
import type { DirectionContent } from "./types";

// Первый экран страницы направления.
//
// У референса здесь стоит форма заявки (задача + телефон); у нас в проекте
// нет ни одного API-роута и почтового бэкенда — заявка ушла бы в никуда,
// поэтому вместо формы стоят реальные каналы: бриф, телеграм и телефон.
// Механика та же: один экран, один явный следующий шаг.
export default function DirectionHero({
  hero,
  stats,
}: {
  hero: DirectionContent["hero"];
  /** Полоса цифр прямо в герое, вместо отдельной главы StatsBand ниже.
   *
   *  Существует ради компактных страниц AI-инструментов: Егор попросил
   *  сжать их до 5–7 глав вместо двенадцати блоков полного шаблона, и
   *  первый шаг — убрать главу, которая и так была тонкой полосой без
   *  собственного заголовка. Необязательный проп: страницы направлений
   *  /content его не передают и держат цифры отдельной главой, как раньше
   *  — ничего в их вёрстке не меняется. */
  stats?: DirectionContent["stats"];
}) {
  return (
    // Без overflow-hidden на самой секции: кадр героя должен вылезать вниз и
    // растворяться в фоне следующего блока. С обрезкой по краю секции между
    // героем и полосой цифр оставалась широкая чёрная полоса — Егор показал
    // её скриншотом и просил вывести такие стыки везде.
    <section className="relative flex min-h-[88svh] items-end pb-16 pt-32 sm:pb-24">
      <div
        className="absolute inset-x-0 -top-px -z-10 overflow-hidden"
        style={{
          // Тот же вылет и та же альфа-маска, что у BlockMedia: низ кадра
          // становится прозрачным, и под ним проступает фон следующего
          // блока. Дальше два кадра лежат друг на друге и переливаются.
          bottom: "-14vh",
          maskImage: "linear-gradient(to bottom, #000 0%, #000 82%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 82%, transparent 100%)",
        }}
      >
        <video
          src={hero.video}
          poster={hero.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
        {/* Два слоя вместо одного ровного грейда.
            Вертикальный уводит низ кадра в непрозрачный ink, чтобы видео
            бесшовно перетекало в градиентный фон страницы, а не обрывалось
            линией. Горизонтальный — подложка слева, под копией.

            Раздельно, а не одним затемнением, потому что отрывки берутся из
            настоящих работ и бывают очень светлыми: кадр литейного цеха с
            расплавом съедал белый текст целиком. Ровное затемнение до
            читаемости убило бы картинку, ради которой отрывок и поставлен, —
            поэтому темнеет только та треть, где стоит текст, а правая
            половина кадра остаётся яркой. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(11,11,16,0.55), rgba(11,11,16,0.3) 38%, rgba(11,11,16,0.72))",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(11,11,16,0.92) 0%, rgba(11,11,16,0.75) 34%, rgba(11,11,16,0.15) 68%, rgba(11,11,16,0) 100%)",
          }}
        />
      </div>

      <Container>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.05, ease: EASE }}
          className="max-w-4xl [text-shadow:0_2px_28px_rgba(11,11,16,0.95)]"
        >
          <Link
            href={hero.parent?.href ?? "/content"}
            className={`${EYEBROW} inline-flex items-center gap-2 text-white transition-colors hover:text-glow`}
          >
            <span aria-hidden="true">←</span>
            {hero.parent?.label ?? "Создание контента"}
          </Link>

          <span className={`${EYEBROW} mt-6 flex items-center gap-2 text-rec`}>
            <span className="h-1.5 w-1.5 rounded-full bg-rec" />
            {hero.eyebrow}
          </span>

          <h1 className="chapter-neon-warm mt-5 break-words font-display text-[2.1rem] uppercase leading-[0.95] tracking-tight sm:text-[3.6rem] lg:text-[4.4rem]">
            {/* Если направление отдало `typed`, заголовок печатается. Ровно
                одна такая точка на страницу — либо здесь, либо в блоке
                процесса, никогда в обоих. */}
            {hero.typed ? (
              <span className="relative inline-block">
                <Typewriter text={hero.typed} />
              </span>
            ) : (
              hero.title
            )}
          </h1>

          {/* Лид набран общесайтовым HERO_LEAD, а не собственным кеглем:
              Егор просил, чтобы подзаголовки на страницах направлений
              читались так же, как на /content, /ai, /sites и /smm. */}
          <p className={`mt-7 max-w-3xl ${HERO_LEAD}`}>{hero.lead}</p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/brief" className="btn-neon btn-warm btn-3d !py-3.5">
              Получить смету
            </Link>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-neon btn-3d !py-3.5"
            >
              <TelegramIcon />
              Telegram
            </a>
            {/* Телефон убран из этой строки: он уже стоит в шапке на каждой
                странице сайта, и здесь дублировал её. Егор — «убери номера
                из подобных мест, в шапке есть и достаточно». */}
          </div>

          {stats ? (
            // То же начертание, что у StatsBand, только вжатое в строку без
            // собственного отступа сверху/снизу и без фонового кадра — герой
            // уже несёт видео за собой, второй фон здесь был бы лишним.
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 sm:gap-x-8">
              {stats.map((stat) => (
                <div key={stat.label} className="relative pl-3 sm:pl-4">
                  <span className="absolute left-0 top-1 h-[calc(100%-0.4rem)] w-px bg-gradient-to-b from-orange via-orange/40 to-transparent" />
                  <div className="break-words font-display text-xl uppercase leading-none text-white sm:text-2xl">
                    {stat.value}
                  </div>
                  <div className="mt-1.5 break-words font-display text-[9px] uppercase leading-relaxed tracking-[0.08em] text-white/70">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </motion.div>
      </Container>
    </section>
  );
}
