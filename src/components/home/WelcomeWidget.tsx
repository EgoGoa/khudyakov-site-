"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { serviceMeta, serviceOrder, type ServiceKey } from "@/lib/service-content";
import { VoiceWave, VoiceMicButton, VIBE_BUTTON_CLASS, vibeButtonStyle, type WavePhaseEnergy } from "./WelcomeOverlay";

// The greeting → direction-picker flow itself, without the outer
// fixed/backdrop chrome — that lives in CenterModal, shared by WelcomeOverlay
// (first visit) and VibeRail's top "Vibe" row, so both open this exact same
// widget rather than two different dialogs with drifting copy.

const EASE = [0.22, 1, 0.36, 1] as const;

const LIST_VARIANTS = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};
const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};
const CHOICE_LIST_VARIANTS = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const CHOICE_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 18, scale: 0.92 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.2, 0.9, 0.3, 1.2] as const } },
};

const GREETING_PHRASE = { text: "Привет, добро пожаловать в наш Digital дом — HDKV AGENCY", charDelay: 45 };
const ASKING_PHRASE = { text: "Что тебя интересует?", charDelay: 75 };

type TypePhase = "typing" | "done";

function useTypedPhrase(phrase: { text: string; charDelay: number }, reduced: boolean, active: boolean) {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<TypePhase>("typing");

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setText(phrase.text);
      setPhase("done");
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let i = 0;
    setText("");
    setPhase("typing");

    function tick() {
      if (cancelled) return;
      i += 1;
      setText(phrase.text.slice(0, i));
      if (i < phrase.text.length) {
        timer = setTimeout(tick, phrase.charDelay);
      } else {
        setPhase("done");
      }
    }
    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phrase, reduced, active]);

  return { text, phase };
}

const VOICE_KEYWORDS: Record<ServiceKey, string[]> = {
  content: ["контент", "видео", "ролик", "съём", "съем", "монтаж"],
  ai: ["ai", "аи", "искусственн", "бот", "автоматизац", "нейросет"],
  sites: ["сайт", "лендинг", "vibe", "вайб"],
  smm: ["smm", "смм", "соцсет", "продвижен", "инстаграм", "reels", "тикток", "tiktok"],
};

function matchService(transcript: string): ServiceKey | null {
  const t = transcript.toLowerCase();
  return serviceOrder.find((key) => VOICE_KEYWORDS[key].some((kw) => t.includes(kw))) ?? null;
}

export default function WelcomeWidget({
  onClose,
  onSkip,
}: {
  /** Fired when the visitor is done with the widget: picked a service, or
   *  dismissed it outright. */
  onClose: () => void;
  /** Fired specifically by "Обычная версия" / "Перейти на сайт" — defaults to
   *  onClose when the caller has nothing extra to do on a plain skip. */
  onSkip?: () => void;
}) {
  const router = useRouter();
  const [reduced, setReduced] = useState(false);
  const [personalVibe, setPersonalVibe] = useState(false);
  const skip = onSkip ?? onClose;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  const greeting = useTypedPhrase(GREETING_PHRASE, reduced, true);
  const asking = useTypedPhrase(ASKING_PHRASE, reduced, personalVibe);
  const greetingDone = greeting.phase === "done";
  const askingDone = asking.phase === "done";
  const isTyping = personalVibe ? asking.phase === "typing" : greeting.phase === "typing";
  const waveEnergy: WavePhaseEnergy = isTyping ? "typing" : "idle";

  const handleVoiceTranscript = (transcript: string) => {
    const key = matchService(transcript);
    if (!key) return false;
    onClose();
    router.push(`/${serviceMeta[key].slug}`);
    return true;
  };

  return (
    <div className="flex h-fit w-full flex-col items-center text-center">
      <VoiceWave energy={waveEnergy} />

      <AnimatePresence mode="wait">
        {!personalVibe ? (
          <motion.p
            key="greeting"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: EASE }}
            className="mt-8 min-h-[3.6em] font-sans text-xl font-light leading-snug text-paper sm:mt-10 sm:text-2xl"
          >
            {greeting.text}
            {greeting.phase === "typing" && (
              <span
                className="ml-0.5 inline-block w-[2px] animate-pulse bg-glow align-middle"
                style={{ height: "1em" }}
                aria-hidden="true"
              />
            )}
          </motion.p>
        ) : (
          <motion.p
            key="asking"
            initial={{ opacity: 0, filter: "blur(6px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.1 }}
            className="mt-8 min-h-[3.6em] font-sans text-xl font-light leading-snug text-paper sm:mt-10 sm:text-2xl"
          >
            {asking.text}
            {asking.phase === "typing" && (
              <span
                className="ml-0.5 inline-block w-[2px] animate-pulse bg-glow align-middle"
                style={{ height: "1em" }}
                aria-hidden="true"
              />
            )}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {greetingDone && !personalVibe && (
          <motion.div
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={CHOICE_LIST_VARIANTS}
            className="mx-auto mt-8 flex w-full max-w-[280px] flex-col items-center gap-4 sm:mt-10"
          >
            <motion.div variants={CHOICE_ITEM_VARIANTS} className="w-full">
              <button
                type="button"
                onClick={() => setPersonalVibe(true)}
                className={`${VIBE_BUTTON_CLASS} w-full px-8 py-4`}
                style={vibeButtonStyle()}
              >
                VIBE САЙТ
              </button>
            </motion.div>

            <motion.div variants={CHOICE_ITEM_VARIANTS} className="w-full">
              <button
                type="button"
                onClick={skip}
                className="btn-neon mx-auto w-[70%] justify-center py-[11px] text-[10px]"
              >
                Обычная версия
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {askingDone && personalVibe && (
          <motion.div
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={LIST_VARIANTS}
            className="mx-auto mt-8 flex w-full max-w-[280px] flex-col gap-3 sm:mt-10"
          >
            {serviceOrder.map((key) => (
              <motion.div key={key} variants={ITEM_VARIANTS}>
                <Link href={`/${serviceMeta[key].slug}`} onClick={onClose} className="btn-neon w-full justify-center">
                  {serviceMeta[key].label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 flex w-full flex-col items-center gap-6 sm:mt-14">
        <AnimatePresence>
          {askingDone && personalVibe && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
            >
              <VoiceMicButton onTranscript={handleVoiceTranscript} />
            </motion.div>
          )}
        </AnimatePresence>

        {(!greetingDone || personalVibe) && (
          <button
            type="button"
            onClick={skip}
            className="whitespace-nowrap rounded-full border border-paper/20 bg-ink/40 px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] text-paper/60 backdrop-blur-md transition hover:border-glow/50 hover:text-paper"
          >
            Перейти на сайт →
          </button>
        )}
      </div>
    </div>
  );
}
