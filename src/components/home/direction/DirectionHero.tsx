"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import { EASE } from "@/lib/motion";
import { HERO_LEAD } from "@/lib/typography";
import Typewriter from "./Typewriter";
import { TelegramIcon } from "@/components/ui/Icons";
import { TELEGRAM_URL } from "./contacts";
import TeamAskCard from "@/components/home/TeamAskCard";
import { TEAM } from "@/lib/team";
import ServiceDeepDive from "./ServiceDeepDive";
import HeroDeepInline from "./HeroDeepInline";
import TeamPulse from "@/components/home/team-pulse/TeamPulse";
import { findPulse } from "@/components/home/team-pulse/registry";
import { directionDeep } from "@/components/home/ai/spotlightDirections";
import { spotlightFor } from "@/components/home/ai/spotlightData";
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
  slug,
}: {
  hero: DirectionContent["hero"];
  /** Slug направления: если для него есть расширенное окно услуги, под
   *  карточкой команды встаёт кнопка, которая его открывает. */
  slug?: string;
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
  const pathname = usePathname() ?? "";
  // У подстраниц /sites и /smm графика заведена с приставкой раздела
  // («site-landing», «smm-reels»), у /content и /ai — по самому slug. Без
  // приставки шапка /sites и /smm не находила сцены и показывала старую
  // карточку вместо «графика + окошко Егора» (Егор, 2026-09-29).
  const section = pathname.split("/")[1];
  const spotKey = slug && (section === "sites" ? `site-${slug}` : section === "smm" ? `smm-${slug}` : slug);
  return (
    // Без overflow-hidden на самой секции: кадр героя должен вылезать вниз и
    // растворяться в фоне следующего блока. С обрезкой по краю секции между
    // героем и полосой цифр оставалась широкая чёрная полоса — Егор показал
    // её скриншотом и просил вывести такие стыки везде.
    <section className="dir-hero relative flex min-h-[88svh] items-end pb-16 pt-32 sm:pb-24">
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
        {/* Ролик работы, а если своей работы под формат нет — стоковый
            кадр. Стоковый кадр слегка размывается (4px) — обратная просьба
            Егора: раньше он просил убрать размытость («чтобы фоновые
            картинки считывались лучше»), теперь наоборот, но лёгкая дымка,
            а не туман — 15px и 8px в первых пробах он отклонил как
            «сильно размыто». Ролики работ
            по-прежнему идут резкими — это наш продукт, его нужно узнать,
            размывать его не просили. `scale` чуть больше 1, чтобы размытие
            не съедало прозрачный край кадра у границы контейнера.
            Читаемость заголовка держат те же два грейда ниже. */}
        {hero.photo ? (
          <img
            src={hero.photo}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            style={{ objectPosition: hero.photoPosition ?? "center", filter: "blur(4px)", transform: "scale(1.03)" }}
          />
        ) : (
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
            style={hero.videoBlur ? { filter: `blur(${hero.videoBlur}px)`, transform: "scale(1.03)" } : undefined}
          />
        )}
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
          {/* Ссылка «← Раздел» и строка-метка над заголовком убраны: путь
              и возврат теперь в общих хлебных крошках под шапкой
              (Breadcrumbs.tsx), Егор назвал их лишними. */}
          <h1 className="chapter-neon-warm break-words font-display text-[1.51rem] uppercase leading-[1.09] tracking-tight sm:text-[2.59rem] lg:text-[3.17rem]">
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

          {/* «Получить смету» и Telegram раньше стояли отдельной строкой
              кнопок под лидом. Егор попросил свести оба действия в одно
              окошко с Егором — «присоединиться» и Telegram теперь одна
              карточка, а не карточка плюс дублирующие её кнопки рядом. */}
          {(hero.deepInline ?? true) && spotKey && (directionDeep(spotKey) ?? spotlightFor(spotKey)) && hero.teamAsk ? (
            // Сцены «почему это работает» развёрнуты прямо здесь (слева), а
            // рядом — окошко Егора с кнопкой «Заказать» (просьба Егора для
            // «Презентационных фильмов»).
            <div className="mt-8 grid max-w-[880px] items-stretch gap-4 sm:grid-cols-[1.3fr_1fr]">
              {/* Окошко с графикой на 30% шире окошка человека, чтобы сцена
                  помещалась свободно; окошко человека прежней ширины (Егор). */}
              <HeroDeepInline slug={spotKey!} />
              {(() => {
                const seg = pathname.split("/")[1];
                const page = seg === "ai" || seg === "sites" || seg === "smm" ? seg : "content";
                const pulse = findPulse(hero.teamAsk.memberId, page);
                return pulse ? (
                  <TeamPulse data={pulse} compact fill ctaLabel="Заказать" source={`/${page}/${slug} · шапка`} />
                ) : null;
              })()}
            </div>
          ) : hero.teamAsk ? (
            <div className="mt-10 max-w-sm">
              <TeamAskCard
                compact
                member={TEAM[hero.teamAsk.memberId]}
                question={hero.teamAsk.question}
                pitch={hero.teamAsk.pitch}
                actionLabel={hero.teamAsk.actionLabel}
                href={hero.teamAsk.href}
                secondaryHref={TELEGRAM_URL}
                secondaryIcon={<TelegramIcon />}
              />
            </div>
          ) : (
            // Запасной вариант для гипотетической страницы без teamAsk —
            // герой не должен остаться без единого следующего шага.
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/brief" className="btn-neon btn-warm btn-3d !py-3.5">
                Получить смету
              </Link>
              <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="btn-neon btn-3d !py-3.5">
                <TelegramIcon />
                Telegram
              </a>
            </div>
          )}
          {hero.deepInline === false && slug && directionDeep(slug) ? (
            <div className="mt-5">
              <ServiceDeepDive slug={slug} />
            </div>
          ) : null}
          {/* Телефон убран из этой строки: он уже стоит в шапке на каждой
              странице сайта, и здесь дублировал её. Егор — «убери номера
              из подобных мест, в шапке есть и достаточно». */}

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
