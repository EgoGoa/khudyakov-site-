"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MicIcon } from "@/components/ui/Icons";
import { serviceMeta, serviceOrder, type ServiceKey } from "@/lib/service-content";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useWelcomeGate } from "@/lib/welcome-gate";

// shared easing across every motion in this overlay, so entrances/exits read
// as one authored sequence instead of mismatched curves
const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";

// direction buttons reveal one at a time, top to bottom, instead of as one block
const LIST_VARIANTS = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};
const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

// the two choice buttons pop in one at a time with a touch of scale, not
// just a fade — reads as more deliberate/premium than a flat entrance
const CHOICE_LIST_VARIANTS = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const CHOICE_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 18, scale: 0.92 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.2, 0.9, 0.3, 1.2] as const } },
};

// Personal Vibe: vivid pink → purple → blue gradient pill (matches the
// reference "Sign Up" button), glossy not flat — a radial white highlight
// cap up top over the diagonal color gradient, a thin bright rim (much
// thinner than the old glass-blue version), and a soft dark inset along
// the bottom for depth. The outer glow halo picks up both ends of the
// gradient (pink + blue) and breathes gently at rest, brighter on hover.
// The secondary choice (Обычная версия) instead reuses the site's own
// `.btn-neon` style, not a custom glass treatment.
const GLASS_BTN = {
  vibe: {
    fill: "radial-gradient(130% 90% at 35% -15%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 45%), linear-gradient(100deg, #ec4899 0%, #a855f7 50%, #38bdf8 100%)",
    border: "1px solid rgba(255,255,255,0.4)",
    text: "#ffffff",
    glowMin:
      "inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -14px 20px -10px rgba(30,10,45,0.35), 0 0 20px rgba(236,72,153,0.35), 0 0 30px rgba(56,189,248,0.3)",
    glowMax:
      "inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -14px 22px -8px rgba(30,10,45,0.3), 0 0 32px rgba(236,72,153,0.55), 0 0 48px rgba(56,189,248,0.5)",
  },
} as const;

// Two separate single-phrase instances, not one auto-advancing sequence:
// the greeting always types on mount; the "what are you after" phrase only
// starts once the visitor picks Personal Vibe (see `active` below) — the
// classic-site choice needs to interrupt before that second phrase ever
// begins.
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

// ---------- voice waveform (reacts to speech; deliberately cheap to render) ----------
// Replaces the rotating gradient ring, which animated continuously and so
// said nothing about whether the assistant was actually speaking. This is a
// speech trace instead: a symmetric bar waveform mirrored around a centre
// axis, whose three states each mean something.
//   • at rest      — every bar collapses onto the axis as a still dot row.
//                    Nothing animates; silence looks like silence.
//   • while typing — each bar breathes on its own duration and a negative
//                    delay, so they never fall into lockstep, under a
//                    centre-weighted envelope that concentrates the energy
//                    mid-row the way a real voice trace does.
//   • on hover     — one ripple travels left to right and settles back to
//                    the dot row: a touch reflex, not a state change.
// Only `scaleY` and `opacity` animate, so the whole row stays on the
// compositor no matter how many bars it has.
export type WavePhaseEnergy = "typing" | "holding" | "idle";
const BAR_COUNT = 27;
const WAVE_W = 196;
const WAVE_H = 44;
const WAVE_SLOT_H = 64;

// Deterministic value hash — NOT Math.random(), which would generate one
// profile on the server and a different one in the browser and so break
// hydration. Same index always yields the same bar.
const barHash = (i: number) => Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;

const WAVE_EDGE = [0, 210, 255] as const; // brand cyan, at the quiet edges
const WAVE_CORE = [255, 102, 68] as const; // brand orange, at the loud centre

const WAVE_BARS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const t = i / (BAR_COUNT - 1); // 0..1 across the row
  const envelope = Math.sin(t * Math.PI); // 0 at both edges, 1 dead centre
  const warmth = envelope ** 1.6;
  return {
    // how far this bar throws while speaking, and where it sits at rest
    peak: 0.2 + envelope ** 1.35 * (0.55 + barHash(i) * 0.45),
    rest: 0.05 + envelope * 0.05,
    duration: `${(0.46 + barHash(i + 91) * 0.5).toFixed(3)}s`,
    delay: `${(-barHash(i + 7) * 0.9).toFixed(3)}s`,
    color: `rgb(${WAVE_EDGE.map((c, k) => Math.round(c + (WAVE_CORE[k] - c) * warmth)).join(",")})`,
  };
});

export function VoiceWave({ energy }: { energy: WavePhaseEnergy }) {
  const active = energy === "typing";
  return (
    <div
      className="relative mx-auto mb-6 flex w-full items-center justify-center sm:mb-8"
      style={{ height: WAVE_SLOT_H }}
    >
      {/* entrance-only reveal lives on this wrapper — framer-motion drives
          `transform`/`opacity` through inline style, which would otherwise
          silently override the bars' own CSS scaleY keyframes */}
      <motion.div
        initial={{ scaleX: 0.55, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
      >
        <div
          className={`voice-wave${active ? " is-active" : ""}`}
          style={{ width: WAVE_W, height: WAVE_H }}
          aria-hidden="true"
        >
          <span className="voice-wave-glow" />
          <span className="voice-wave-axis" />
          <span className="voice-wave-bars">
            {WAVE_BARS.map((bar, i) => (
              <span
                key={i}
                className="voice-wave-bar"
                style={
                  {
                    background: bar.color,
                    "--peak": bar.peak.toFixed(3),
                    "--rest": bar.rest.toFixed(3),
                    "--dur": bar.duration,
                    "--delay": bar.delay,
                    "--i": i,
                  } as CSSProperties
                }
              />
            ))}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// ---------- voice mic button (Web Speech API) — generic, caller decides what a transcript means ----------

interface MinimalSpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: { [i: number]: { [i: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => MinimalSpeechRecognition;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
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

type MicState = "idle" | "listening" | "nomatch" | "error" | "unsupported";

const MIC_HALO_GRADIENT =
  "conic-gradient(from 0deg, rgba(0,210,255,0.8), rgba(255,102,68,0.6) 35%, rgba(0,210,255,0.18) 55%, rgba(255,102,68,0.65) 80%, rgba(0,210,255,0.8))";

// `onTranscript` decides what the spoken text means and does the actual
// action (navigate, scroll, open a panel...); it returns whether it found a
// match so this button can show "didn't catch that" when it didn't.
export function VoiceMicButton({ onTranscript }: { onTranscript: (transcript: string) => boolean }) {
  const [state, setState] = useState<MicState>("idle");
  const recognitionRef = useRef<MinimalSpeechRecognition | null>(null);

  useEffect(() => {
    if (!getSpeechRecognitionCtor()) setState("unsupported");
    return () => recognitionRef.current?.stop();
  }, []);

  const startListening = () => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setState("unsupported");
      return;
    }
    const recognition = new Ctor();
    recognition.lang = "ru-RU";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      const matched = onTranscript(transcript);
      if (!matched) {
        setState("nomatch");
        setTimeout(() => setState("idle"), 2500);
      }
    };
    recognition.onerror = () => {
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    };
    recognition.onend = () => {
      setState((s) => (s === "listening" ? "idle" : s));
    };

    recognitionRef.current = recognition;
    setState("listening");
    recognition.start();
  };

  const handleClick = () => {
    if (state === "unsupported") return;
    if (state === "listening") {
      recognitionRef.current?.stop();
      return;
    }
    startListening();
  };

  return (
    <div className={`mic-halo-wrap flex flex-col items-center gap-2 ${state === "listening" ? "is-active" : ""}`}>
      <button
        type="button"
        onClick={handleClick}
        aria-label="Спросить голосом"
        disabled={state === "unsupported"}
        className="relative flex h-16 w-16 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-40"
      >
        {state === "listening" && (
          <>
            <span
              className="absolute inset-0 rounded-full"
              style={{
                animation: "mic-ripple 1.6s ease-out infinite",
                background: "radial-gradient(circle, rgba(0,210,255,0.4), transparent 70%)",
              }}
            />
            <span
              className="absolute inset-0 rounded-full"
              style={{
                animation: "mic-ripple 1.6s ease-out 0.55s infinite",
                background: "radial-gradient(circle, rgba(255,102,68,0.3), transparent 70%)",
              }}
            />
          </>
        )}

        <span
          className="mic-halo absolute -inset-3 rounded-full"
          style={{ background: MIC_HALO_GRADIENT, filter: "blur(9px)" }}
        />

        <span
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-ink/85 text-paper backdrop-blur-md"
          style={{
            boxShadow: state === "listening" ? "0 0 26px rgba(0,210,255,0.75)" : "0 0 14px rgba(0,210,255,0.3)",
            transition: `box-shadow 0.4s ${EASE_CSS}`,
          }}
        >
          <MicIcon />
        </span>
      </button>
    </div>
  );
}

export default function WelcomeOverlay() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [personalVibe, setPersonalVibe] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  useBodyScrollLock(visible);

  const { setWelcomeOpen, setSkippedToSite } = useWelcomeGate();
  useEffect(() => {
    setWelcomeOpen(visible);
    return () => setWelcomeOpen(false);
  }, [visible, setWelcomeOpen]);

  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible]);

  const greeting = useTypedPhrase(GREETING_PHRASE, reduced, true);
  const asking = useTypedPhrase(ASKING_PHRASE, reduced, personalVibe);
  const greetingDone = greeting.phase === "done";
  const askingDone = asking.phase === "done";
  const isTyping = personalVibe ? asking.phase === "typing" : greeting.phase === "typing";
  const waveEnergy: WavePhaseEnergy = isTyping ? "typing" : "idle";
  const close = () => setVisible(false);

  const goToSite = () => {
    setSkippedToSite(true);
    close();
    // wait for the overlay's own exit + the body scroll-lock release before
    // scrolling, otherwise the browser has nowhere to scroll to yet
    setTimeout(() => {
      document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  const handleVoiceTranscript = (transcript: string) => {
    const key = matchService(transcript);
    if (!key) return false;
    close();
    router.push(`/${serviceMeta[key].slug}`);
    return true;
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          role="dialog"
          aria-modal="true"
          aria-label="Приветствие HDKV AGENCY"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ink/90 px-6 py-24 backdrop-blur-2xl"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center bg-transparent pt-6 sm:pt-8">
            <div className="flex items-center gap-2" aria-hidden="true">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rec" />
              <span className="font-display text-xs uppercase leading-none tracking-tight text-paper/60">
                HDKV<span className="text-rec">.AGENCY</span>
              </span>
            </div>
          </div>

          <div className="flex h-fit w-full max-w-xl flex-col items-center text-center">
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
                  {/* entrance pop lives on this wrapper, not the button itself —
                      framer-motion's inline transform would otherwise fight the
                      glass-choice-btn's own glow/hover CSS */}
                  <motion.div variants={CHOICE_ITEM_VARIANTS} className="w-full">
                    <button
                      type="button"
                      onClick={() => setPersonalVibe(true)}
                      className="glass-choice-btn w-full rounded-full px-8 py-4 text-sm font-bold uppercase tracking-[0.14em]"
                      style={
                        {
                          background: GLASS_BTN.vibe.fill,
                          border: GLASS_BTN.vibe.border,
                          color: GLASS_BTN.vibe.text,
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                          textShadow: "0 1px 4px rgba(0,0,0,0.3)",
                          "--glow-min": GLASS_BTN.vibe.glowMin,
                          "--glow-max": GLASS_BTN.vibe.glowMax,
                        } as CSSProperties
                      }
                    >
                      VIBE САЙТ
                    </button>
                  </motion.div>

                  <motion.div variants={CHOICE_ITEM_VARIANTS} className="w-full">
                    <button
                      type="button"
                      onClick={goToSite}
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
                      <Link
                        href={`/${serviceMeta[key].slug}`}
                        onClick={close}
                        className="btn-neon w-full justify-center"
                      >
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

              {/* the always-available quiet exit — hidden only during the
                  Personal Vibe / Обычная версия choice itself, so it doesn't
                  sit right under its own more prominent duplicate */}
              {(!greetingDone || personalVibe) && (
                <button
                  type="button"
                  onClick={goToSite}
                  className="whitespace-nowrap rounded-full border border-paper/20 bg-ink/40 px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] text-paper/60 backdrop-blur-md transition hover:border-glow/50 hover:text-paper"
                >
                  Перейти на сайт →
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
