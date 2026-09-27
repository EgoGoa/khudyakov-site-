"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CHAPTER_INTRO } from "@/lib/typography";
import { OPEN_BLOCK_VIBE_EVENT, setTunedBlock, type TunedCopy } from "@/lib/block-vibe";

// Блок, собранный под задачу посетителя (Vibe-блок). Встаёт вместо шапки и
// тела главы в CinematicSection: фон главы (видео, затемнение) остаётся, а
// заголовок, подпись и три карточки — уже про его сферу и ответы.
// Проявляется из размытия по очереди, как всё на сайте.

const EASE = [0.22, 1, 0.36, 1] as const;

function Accent({ text }: { text: string }) {
  const parts = text.split(/\*([^*]+)\*/);
  return <>{parts.map((p, i) => (i % 2 ? <span key={i} className="kw">{p}</span> : p))}</>;
}

export default function TunedBlock({
  copy,
  path,
  id,
  active,
  side,
}: {
  copy: TunedCopy;
  path: string;
  id: string;
  active: boolean;
  side: "left" | "right" | "center";
}) {
  const reduced = useReducedMotion();
  const rise = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 18, filter: "blur(14px)" },
          animate: active ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 18, filter: "blur(14px)" },
          transition: { duration: 0.7, delay: active ? 0.15 + i * 0.12 : 0, ease: EASE },
        };
  const align = side === "center" ? "mx-auto text-center items-center" : side === "right" ? "ml-auto text-right items-end" : "text-left items-start";

  return (
    <div className={`tuned-block flex max-w-3xl flex-col ${align}`}>
      <motion.span {...rise(0)} className="tuned-block__badge">
        <span aria-hidden="true">✦</span> Собрано под твою задачу
      </motion.span>

      <motion.h2
        {...rise(1)}
        className="chapter-neon mt-4 font-display text-[1.417rem] uppercase leading-[1.09] tracking-tight [text-shadow:0_2px_24px_rgba(11,11,16,0.9)] sm:text-[2.363rem] xl:text-[2.835rem] land:!text-[1.44rem]"
      >
        <Accent text={copy.title} />
      </motion.h2>

      <motion.p {...rise(2)} className={`${CHAPTER_INTRO} mt-3 max-w-[38em]`}>
        {copy.lead}
      </motion.p>

      <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
        {copy.cards.map((card, i) => (
          <motion.div key={card.title + i} {...rise(3 + i)} className="tuned-block__card text-left">
            {card.image && (
              // eslint-disable-next-line @next/next/no-img-element -- обложки работ уже лежат готовыми jpg в public
              <img src={card.image} alt="" loading="lazy" className="mb-3 aspect-video w-full rounded-xl object-cover" />
            )}
            <div className="font-display text-[13px] uppercase leading-tight tracking-tight text-white">{card.title}</div>
            <p className="mt-1.5 text-[13px] font-semibold leading-snug text-white">{card.text}</p>
          </motion.div>
        ))}
      </div>

      <motion.div {...rise(6)} className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent(OPEN_BLOCK_VIBE_EVENT, { detail: id }))}
          className="btn-neon !py-2.5 !text-[11px]"
        >
          Обсудить этот блок
        </button>
        <button type="button" onClick={() => setTunedBlock(path, id, null)} className="tuned-block__reset">
          Вернуть как было
        </button>
      </motion.div>
    </div>
  );
}
