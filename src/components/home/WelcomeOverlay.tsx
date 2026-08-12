"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MicIcon } from "@/components/ui/Icons";
import { serviceMeta, serviceOrder, type ServiceKey } from "@/lib/service-content";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

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

const PHRASES: { text: string; charDelay: number }[] = [
  { text: "Привет, добро пожаловать в наш Digital дом — HDKV AGENCY", charDelay: 45 },
  { text: "Что тебя интересует?", charDelay: 75 },
];

const HOLD_MS = 2500;
const FADE_MS = 450;

type Phase = "typing" | "holding" | "leaving" | "done";

// Types PHRASES one at a time. Once a non-final phrase finishes typing it
// holds on screen for HOLD_MS, then dissolves (phase "leaving") before the
// next phrase starts — no abrupt text swap. Reduced-motion visitors get the
// final phrase instantly.
function useTypedPhrases(phrases: typeof PHRASES, reduced: boolean) {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    if (reduced) {
      setText(phrases[phrases.length - 1].text);
      setPhase("done");
      return;
    }

    let cancelled = false;
    let charTimer: ReturnType<typeof setTimeout>;
    let holdTimer: ReturnType<typeof setTimeout>;
    let fadeTimer: ReturnType<typeof setTimeout>;

    function typePhrase(index: number) {
      if (cancelled) return;
      const { text: phrase, charDelay } = phrases[index];
      let i = 0;
      setText("");
      setPhase("typing");

      function tick() {
        if (cancelled) return;
        i += 1;
        setText(phrase.slice(0, i));
        if (i < phrase.length) {
          charTimer = setTimeout(tick, charDelay);
        } else if (index < phrases.length - 1) {
          holdTimer = setTimeout(() => {
            if (cancelled) return;
            setPhase("leaving");
            fadeTimer = setTimeout(() => typePhrase(index + 1), FADE_MS);
          }, HOLD_MS);
        } else {
          setPhase("done");
        }
      }
      tick();
    }

    typePhrase(0);
    return () => {
      cancelled = true;
      clearTimeout(charTimer);
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
    };
  }, [phrases, reduced]);

  return { text, phase };
}

// ---------- enveloped voice wave (Siri-style: 3 lines, tall in the middle) ----------

// Width includes real taper room on each side (not just an opacity mask) —
// the envelope itself reaches ~0 well before the true edge, so the lines
// visibly stretch and thin out sideways instead of filling the box.
const WAVE_W = 512;
const WAVE_H = 240;
const WAVE_BASELINE = WAVE_H / 2;
// Extra room around the content so glow/blur has space to breathe before the
// SVG viewport clips it — without this, blurred lines hit the viewBox
// boundary and cut off hard instead of fading out. Generous on purpose.
const WAVE_BLEED_X = 110;
const WAVE_BLEED_Y = 46;
const WAVE_VIEW_W = WAVE_W + WAVE_BLEED_X * 2;
const WAVE_VIEW_H = WAVE_H + WAVE_BLEED_Y * 2;
const WAVE_VIEWBOX = `${-WAVE_BLEED_X} ${-WAVE_BLEED_Y} ${WAVE_VIEW_W} ${WAVE_VIEW_H}`;

// A bell curve peaking at the middle of the width and touching ~0 at both
// edges — this is what makes the wave genuinely tall in the center and
// short at the sides (not just faded there), like a real voice packet
// instead of a uniform ribbon.
function envelope(x: number, width: number, sharpness: number) {
  return Math.pow(Math.sin((Math.PI * Math.max(0, Math.min(width, x))) / width), sharpness);
}

// Builds one line as a true sine modulated by the envelope, sampled densely
// and joined with smooth cubic segments — a real continuous curve, not a
// chain of independent bezier humps (which kink at every baseline crossing
// since neighbouring segments don't share a tangent).
function buildEnvelopedWave(period: number, peakAmplitude: number, sharpness: number, phase: number, steps = 90) {
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * WAVE_W;
    const y = WAVE_BASELINE - peakAmplitude * envelope(x, WAVE_W, sharpness) * Math.sin((2 * Math.PI * x) / period + phase);
    points.push([x, y]);
  }
  let d = `M${points[0][0].toFixed(2)},${points[0][1].toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const cx = (x0 + x1) / 2;
    d += ` Q${x0.toFixed(2)},${y0.toFixed(2)} ${cx.toFixed(2)},${((y0 + y1) / 2).toFixed(2)}`;
    if (i === points.length - 2) d += ` L${x1.toFixed(2)},${y1.toFixed(2)}`;
  }
  return d;
}

// Four lines, matching the reference: back-to-front they go soft/deep blue →
// blue → cyan → bright white core. Each has its own period (spatial
// frequency, so they cross instead of stacking), amplitude (a different
// height), and its own shimmer/float timing (a different rhythm/range) —
// nothing here is shared between lines, which is what keeps it from reading
// as one shape pulsing in place.
const WAVE_LINES = [
  {
    d: buildEnvelopedWave(158, 42, 1.4, 0.2),
    color: "rgba(0,120,255,0.34)",
    width: 4.4,
    blur: 8,
    glow: false,
    shimmer: 6.4,
    shimmerDelay: 0,
    floatRange: -11,
    floatDuration: 8.2,
    floatDelay: 0,
    pulseIdle: { range: 1.1, duration: 5.6 },
    pulseTyping: { range: 1.6, duration: 0.19 },
    pulseDelay: 0,
  },
  {
    d: buildEnvelopedWave(101, 33, 2.1, Math.PI * 0.7),
    color: "rgba(0,150,255,0.5)",
    width: 3.6,
    blur: 5,
    glow: false,
    shimmer: 4.1,
    shimmerDelay: 0.35,
    floatRange: -7,
    floatDuration: 5.3,
    floatDelay: 0.6,
    pulseIdle: { range: 1.16, duration: 3.3 },
    pulseTyping: { range: 1.85, duration: 0.11 },
    pulseDelay: 0.9,
  },
  {
    d: buildEnvelopedWave(176, 26, 1.8, Math.PI * 1.4),
    color: "rgba(0,205,255,0.64)",
    width: 3,
    blur: 3,
    glow: false,
    shimmer: 5.2,
    shimmerDelay: 0.65,
    floatRange: 9,
    floatDuration: 6.8,
    floatDelay: 1.1,
    pulseIdle: { range: 1.12, duration: 4.4 },
    pulseTyping: { range: 1.95, duration: 0.15 },
    pulseDelay: 1.5,
  },
  {
    d: buildEnvelopedWave(122, 20, 2.5, 0.5),
    color: "rgba(235,244,255,0.9)",
    width: 2.4,
    blur: 1.4,
    glow: true,
    shimmer: 2.6,
    shimmerDelay: 0.95,
    floatRange: -5,
    floatDuration: 3.6,
    floatDelay: 1.4,
    pulseIdle: { range: 1.2, duration: 2.5 },
    pulseTyping: { range: 1.7, duration: 0.08 },
    pulseDelay: 0.45,
  },
];

// Fades the lines out well inside the bled viewBox — real (already
// unclipped) blur underneath, not a hard edge — so the packet tapers to
// nothing instead of visibly cutting off. Many stops, not a straight ramp,
// so the fade itself eases in/out rather than fading at a constant rate;
// the opaque plateau is under a quarter of the width, so the fade reaches
// well over a third of the way in from each side.
const WAVE_MASK =
  "linear-gradient(to right, transparent 0%, transparent 6%, rgba(0,0,0,0.06) 16%, rgba(0,0,0,0.2) 26%, rgba(0,0,0,0.55) 36%, black 46%, black 54%, rgba(0,0,0,0.55) 64%, rgba(0,0,0,0.2) 74%, rgba(0,0,0,0.06) 84%, transparent 94%, transparent 100%)";

// Energy tiers, not just on/off: only "typing" is actual waves. The moment
// text isn't being typed — the pause between phrases, or resting after
// everything's done — every line's amplitude collapses toward the shared
// baseline, so the four strands visually converge into one calm, almost
// flat horizontal line instead of four small waves.
export type WavePhaseEnergy = "typing" | "holding" | "idle";
const WAVE_ENERGY: Record<WavePhaseEnergy, number> = { typing: 1, holding: 0.09, idle: 0.09 };

// The graphic renders much bigger than the space it reserves in the layout:
// the wrap keeps a fixed, modest height (nothing below it moves), while the
// inner stage — sized to the viewBox's own aspect ratio, so nothing gets
// letterboxed or mismatched at the edges — overflows it visibly top/bottom.
const WAVE_SLOT_H = 100;

export function VoiceWave({ energy }: { energy: WavePhaseEnergy }) {
  const value = WAVE_ENERGY[energy];
  return (
    <div
      className="voice-wave-wrap relative mx-auto flex w-full max-w-[640px] items-center justify-center"
      style={{ height: WAVE_SLOT_H }}
      aria-hidden="true"
    >
      <div className="relative w-full" style={{ aspectRatio: `${WAVE_VIEW_W} / ${WAVE_VIEW_H}` }}>
        {/* ambient glow behind the packet, like light spilling off a real waveform */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 40% 48% at 50% 50%, rgba(0,180,255,0.28), transparent 72%)",
            filter: "blur(22px)",
            opacity: Math.min(value + 0.15, 1),
            transition: `opacity 0.5s ${EASE_CSS}`,
          }}
        />
        {/* entrance-only grow animation lives on this wrapper — framer-motion
            manages `transform` via inline style, which would otherwise fight
            the CSS `--energy` scaleY rule on the svg itself (inline style
            always wins over a stylesheet rule, silently breaking it) */}
        <motion.div
          initial={{ scaleX: 0.05, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.75, ease: EASE, delay: 0.1 }}
          className="absolute inset-0"
          style={{ transformOrigin: "50% 50%" }}
        >
        <svg
          viewBox={WAVE_VIEWBOX}
          preserveAspectRatio="xMidYMid meet"
          className="voice-wave-svg h-full w-full overflow-visible"
          style={
            {
              WebkitMaskImage: WAVE_MASK,
              maskImage: WAVE_MASK,
              transformOrigin: `${WAVE_W / 2}px ${WAVE_BASELINE}px`,
              "--energy": value,
            } as CSSProperties
          }
        >
        {WAVE_LINES.map((line, li) => {
          const pulse = energy === "typing" ? line.pulseTyping : line.pulseIdle;
          return (
            <g
              key={li}
              style={
                {
                  animation: `voice-wave-line-pulse ${pulse.duration}s ease-in-out ${line.pulseDelay}s infinite alternate`,
                  transformOrigin: `${WAVE_W / 2}px ${WAVE_BASELINE}px`,
                  "--pulse-range": pulse.range,
                } as CSSProperties
              }
            >
              <path
                d={line.d}
                stroke={line.color}
                strokeWidth={line.width}
                fill="none"
                style={
                  {
                    animation: `voice-wave-shimmer ${line.shimmer}s ease-in-out ${line.shimmerDelay}s infinite, voice-wave-float ${line.floatDuration}s ease-in-out ${line.floatDelay}s infinite alternate`,
                    filter: line.glow
                      ? "drop-shadow(0 0 3px rgba(255,255,255,0.85)) drop-shadow(0 0 12px rgba(0,210,255,0.75)) drop-shadow(0 0 26px rgba(0,150,255,0.4))"
                      : line.blur
                      ? `blur(${line.blur}px)`
                      : undefined,
                    "--shimmer-min": 0.6,
                    "--float-range": `${line.floatRange}px`,
                  } as CSSProperties
                }
              />
            </g>
          );
        })}
        </svg>
        </motion.div>
      </div>
    </div>
  );
}

// ---------- voice-driven direction picker (Web Speech API) ----------

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

function VoiceAgentButton({ onMatched }: { onMatched: (key: ServiceKey) => void }) {
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
      const matched = matchService(transcript);
      if (matched) {
        onMatched(matched);
      } else {
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

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  useBodyScrollLock(visible);

  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible]);

  const { text, phase } = useTypedPhrases(PHRASES, reduced);
  const isTyping = phase === "typing";
  const waveEnergy: WavePhaseEnergy = phase === "typing" ? "typing" : phase === "holding" ? "holding" : "idle";
  const done = phase === "done";
  const close = () => setVisible(false);

  const goToSite = () => {
    close();
    // wait for the overlay's own exit + the body scroll-lock release before
    // scrolling, otherwise the browser has nowhere to scroll to yet
    setTimeout(() => {
      document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  const handleVoiceMatch = (key: ServiceKey) => {
    close();
    router.push(`/${serviceMeta[key].slug}`);
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
          <div className="flex h-fit w-full max-w-xl flex-col items-center text-center">
            <div className="mb-2 flex items-center gap-2" aria-hidden="true">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rec" />
              <span className="font-display text-xs uppercase leading-none tracking-tight text-paper/60">
                HDKV<span className="text-rec">.AGENCY</span>
              </span>
            </div>

            <VoiceWave energy={waveEnergy} />

            <p
              className="mt-2 min-h-[3.6em] font-sans text-xl font-light leading-snug text-paper sm:text-2xl"
              style={{
                opacity: phase === "leaving" ? 0 : 1,
                filter: phase === "leaving" ? "blur(6px)" : "blur(0px)",
                transition: `opacity ${FADE_MS}ms ${EASE_CSS}, filter ${FADE_MS}ms ${EASE_CSS}`,
              }}
            >
              {text}
              {isTyping && (
                <span
                  className="ml-0.5 inline-block w-[2px] animate-pulse bg-glow align-middle"
                  style={{ height: "1em" }}
                  aria-hidden="true"
                />
              )}
            </p>

            <AnimatePresence>
              {done && (
                <motion.div
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={LIST_VARIANTS}
                  className="mx-auto mt-10 flex w-full max-w-[280px] flex-col gap-3"
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
          </div>

          <div className="absolute inset-x-0 bottom-28 flex justify-center">
            <AnimatePresence>
              {done && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
                >
                  <VoiceAgentButton onMatched={handleVoiceMatch} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute inset-x-0 bottom-8 flex justify-center">
            <button
              type="button"
              onClick={goToSite}
              className="whitespace-nowrap rounded-full border border-paper/20 bg-ink/40 px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] text-paper/60 backdrop-blur-md transition hover:border-glow/50 hover:text-paper"
            >
              Перейти на сайт →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
