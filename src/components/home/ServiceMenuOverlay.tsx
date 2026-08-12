"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { UserIcon } from "@/components/ui/Icons";
import { VoiceWave, VoiceMicButton } from "@/components/home/WelcomeOverlay";
import { serviceMeta, type ServiceKey } from "@/lib/service-content";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

const EASE = [0.22, 1, 0.36, 1] as const;
const TELEGRAM_URL = "https://t.me/+79925111812";
const PHRASE = "С чего начнём?";
const CHAR_DELAY_MS = 95;

// Types PHRASE once, driving both the visible text and (via the caller) the
// wave's energy — same pattern as the welcome overlay's greeting, just a
// single phrase with no hold/dissolve since there's nothing after it.
function useTypeOnce(text: string, reduced: boolean) {
  const [rendered, setRendered] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reduced) {
      setRendered(text);
      setDone(true);
      return;
    }
    let cancelled = false;
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    setRendered("");
    setDone(false);

    function tick() {
      if (cancelled) return;
      i += 1;
      setRendered(text.slice(0, i));
      if (i < text.length) {
        timer = setTimeout(tick, CHAR_DELAY_MS);
      } else {
        setDone(true);
      }
    }
    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, reduced]);

  return { rendered, done };
}

const LIST_VARIANTS = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};
const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

type MenuItem =
  | { key: string; label: string; type: "anchor"; targetId: string }
  | { key: string; label: string; type: "link"; href: string }
  | { key: string; label: string; type: "creative" };

const MENU_ITEMS: MenuItem[] = [
  { key: "cases", label: "Кейсы", type: "anchor", targetId: "works" },
  { key: "pricing", label: "Стоимость", type: "link", href: "/calculator" },
  { key: "brief", label: "Бриф", type: "link", href: "/brief" },
  { key: "creative", label: "Креатив-сессия", type: "creative" },
  { key: "ai", label: "AI поддержка", type: "anchor", targetId: "ai" },
];

const VOICE_MENU_KEYWORDS: Record<string, string[]> = {
  cases: ["кейс", "работ", "портфолио", "пример"],
  pricing: ["стоимост", "цена", "цены", "бюджет", "сколько стоит", "прайс"],
  brief: ["бриф", "заявк", "анкет"],
  creative: ["креатив", "продюсер", "сесси", "идея"],
  ai: ["ai", "аи", "поддержк", "консультац", "помощь"],
};

function matchMenuItem(transcript: string): MenuItem | null {
  const t = transcript.toLowerCase();
  const found = MENU_ITEMS.find((item) => VOICE_MENU_KEYWORDS[item.key]?.some((kw) => t.includes(kw)));
  return found ?? null;
}

export default function ServiceMenuOverlay({ service }: { service: ServiceKey }) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [creativeOpen, setCreativeOpen] = useState(false);
  const [reduced, setReduced] = useState(false);
  const close = () => setVisible(false);

  useBodyScrollLock(visible);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible]);

  const { rendered, done: typed } = useTypeOnce(PHRASE, reduced);

  const scrollToSection = (id: string) => {
    close();
    // wait for the overlay's own exit + the body scroll-lock release before
    // scrolling, otherwise the browser has nowhere to scroll to yet
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  const goToSite = () => scrollToSection("top");

  const handleVoiceTranscript = (transcript: string) => {
    const item = matchMenuItem(transcript);
    if (!item) return false;
    if (item.type === "anchor") {
      scrollToSection(item.targetId);
    } else if (item.type === "link") {
      close();
      router.push(item.href);
    } else {
      setCreativeOpen(true);
    }
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
          aria-label={`Меню — ${serviceMeta[service].label}`}
          className="fixed inset-0 z-[95] flex justify-center overflow-y-auto bg-ink/90 px-6 pb-24 pt-[9vh] backdrop-blur-2xl sm:pt-[11vh]"
        >
          <div className="flex h-fit w-full max-w-xl flex-col items-center text-center">
            <div className="mb-2 flex items-center gap-2" aria-hidden="true">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rec" />
              <span className="font-display text-xs uppercase leading-none tracking-tight text-paper/60">
                {serviceMeta[service].label}
              </span>
            </div>

            <VoiceWave energy={typed ? "idle" : "typing"} />

            <p className="mt-2 min-h-[1.8em] font-sans text-xl font-light leading-snug text-paper sm:text-2xl">
              {rendered}
              {!typed && (
                <span
                  className="ml-0.5 inline-block w-[2px] animate-pulse bg-glow align-middle"
                  style={{ height: "1em" }}
                  aria-hidden="true"
                />
              )}
            </p>

            <AnimatePresence>
              {typed && (
                <motion.div
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={LIST_VARIANTS}
                  className="mx-auto mt-10 flex w-full max-w-[280px] flex-col gap-3"
                >
                  {MENU_ITEMS.map((item) => (
                    <motion.div key={item.key} variants={ITEM_VARIANTS}>
                      {item.type === "anchor" && (
                        <button
                          type="button"
                          onClick={() => scrollToSection(item.targetId)}
                          className="btn-neon w-full justify-center"
                        >
                          {item.label}
                        </button>
                      )}
                      {item.type === "link" && (
                        <Link href={item.href} onClick={close} className="btn-neon w-full justify-center">
                          {item.label}
                        </Link>
                      )}
                      {item.type === "creative" && (
                        <button
                          type="button"
                          onClick={() => setCreativeOpen((v) => !v)}
                          aria-expanded={creativeOpen}
                          className="btn-neon w-full justify-center"
                        >
                          {item.label}
                        </button>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {creativeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: 12, height: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="mx-auto mt-5 w-full max-w-[280px] overflow-hidden"
                >
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-glow/30 bg-ink/60 p-5 backdrop-blur-md">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-glow/40 bg-ink text-glow">
                      <UserIcon />
                    </span>
                    <p className="text-sm leading-relaxed text-paper/80">
                      Обсудим идею лично с креативным продюсером. Сейчас это открывает чат в Telegram — скоро
                      будет прямо на сайте.
                    </p>
                    <a
                      href={TELEGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-neon w-full justify-center"
                    >
                      Открыть чат в Telegram
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute inset-x-0 bottom-28 flex justify-center">
            <AnimatePresence>
              {typed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
                >
                  <VoiceMicButton onTranscript={handleVoiceTranscript} />
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
