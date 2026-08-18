"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { MicIcon } from "@/components/ui/Icons";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useWelcomeGate } from "@/lib/welcome-gate";
import CenterModal from "@/components/ui/CenterModal";
import WelcomeWidget from "./WelcomeWidget";

// shared easing across every motion in this overlay, so entrances/exits read
// as one authored sequence instead of mismatched curves
const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";

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
    border: "none",
    text: "#ffffff",
    glowMin:
      "inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -14px 20px -10px rgba(30,10,45,0.35), 0 0 20px rgba(236,72,153,0.35), 0 0 30px rgba(56,189,248,0.3)",
    glowMax:
      "inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -14px 22px -8px rgba(30,10,45,0.3), 0 0 32px rgba(236,72,153,0.55), 0 0 48px rgba(56,189,248,0.5)",
  },
} as const;

// shared by every "VIBE САЙТ" pill across the site (welcome widget, floating
// CTA) — one definition so the gradient/glow can't drift between copies
export const VIBE_BUTTON_CLASS = "glass-choice-btn rounded-full text-sm font-bold uppercase tracking-[0.14em]";
export function vibeButtonStyle(): CSSProperties {
  return {
    background: GLASS_BTN.vibe.fill,
    border: GLASS_BTN.vibe.border,
    color: GLASS_BTN.vibe.text,
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    textShadow: "0 1px 4px rgba(0,0,0,0.3)",
    "--glow-min": GLASS_BTN.vibe.glowMin,
    "--glow-max": GLASS_BTN.vibe.glowMax,
  } as CSSProperties;
}

// ---------- voice waveform (reacts to speech; deliberately cheap to render) ----------
// A speech trace: a symmetric bar waveform mirrored around a centre axis,
// whose three states each mean something.
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
  const [visible, setVisible] = useState(true);

  useBodyScrollLock(visible);

  const { setWelcomeOpen, setSkippedToSite } = useWelcomeGate();
  useEffect(() => {
    setWelcomeOpen(visible);
    return () => setWelcomeOpen(false);
  }, [visible, setWelcomeOpen]);

  // Picking an actual service (a Link inside the widget) just closes and
  // lets the navigation land wherever that page starts — close is what
  // WelcomeWidget's onClose does for that case. A plain dismiss (Escape, the
  // × button, clicking the backdrop) is a different intent: the visitor
  // isn't choosing anything, they're leaving the flow, so it goes straight
  // to the site — same destination as the explicit "Обычная версия" /
  // "Перейти на сайт" choice, not an intermediate guide screen.
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

  return (
    <CenterModal open={visible} onClose={goToSite} ariaLabel="Приветствие HDKV AGENCY">
      <WelcomeWidget onClose={close} onSkip={goToSite} />
    </CenterModal>
  );
}
