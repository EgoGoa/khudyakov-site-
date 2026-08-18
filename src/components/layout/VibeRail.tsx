"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { vibeButtonStyle } from "@/components/home/WelcomeOverlay";
import WelcomeWidget from "@/components/home/WelcomeWidget";
import CenterModal from "@/components/ui/CenterModal";

// The site-wide "vibe" rail — replaces the old bottom-right "VIBE САЙТ"
// floating button (see FloatingCta, now removed from layout.tsx). Same
// gradient pill, same WelcomeWidget flow, just relocated to the top slot of
// this rail instead of floating alone.
//
// Below it, one row per top-level section of the site (the same set Header's
// desktop nav and burger menu already link to). Clicking a row does not
// navigate directly — it opens a small "Vibe режим" window offering four ways
// to engage with that block: an AI agent, a live creative session, personal
// tailoring, or just the section as it exists today ("Обычная страница",
// the only one of the four that's wired to a real destination right now).
// The other three are an honest, clearly-labelled preview of where this is
// headed, not a dead button — each names itself "скоро" and explains the
// idea in a line instead of pretending to work.
//
// Desktop (>=1024px, matching every other lg: breakpoint in the codebase):
// a slim icon-only rail sits on screen at all times; hovering it (or
// focusing a row via keyboard) widens it into a matte, label-bearing panel
// with a soft neon pulse — the same motion idea as a macOS Dock or Arc's
// collapsed sidebar. The whole thing floats on top of the page,
// deliberately: it does not reserve any layout space, the same as the old
// floating CTA button it replaces.
//
// Mobile (<1024px): the rail's hover affordance has no touch equivalent, so
// it collapses to a single round button in the same bottom-right corner the
// old floating CTA used, opening a full-screen matte sheet with the same
// rows instead of expanding in place.

const EASE = [0.22, 1, 0.36, 1] as const;
const VIBE_RAIL_WIDTH = 48; // px — collapsed, icon-only width

type RailItem = {
  id: string;
  label: string;
  /** Shown inside the Vibe-mode window under the section's name. */
  description: string;
  /** Where "Обычная страница" actually goes. */
  href: string;
  glyph: ReactNode;
};

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      {children}
    </svg>
  );
}

const ITEMS: RailItem[] = [
  {
    id: "works",
    label: "Работы",
    description: "78 проектов портфолио: реклама, шоурилы, 3D и моушн.",
    href: "/content#works",
    glyph: (
      <Glyph>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M3 9h18M3 15h18M8 5v14M16 5v14" />
      </Glyph>
    ),
  },
  {
    id: "services",
    label: "Что делаем",
    description: "Продакшн, AI, сайты и SMM — весь стек услуг агентства.",
    href: "/content#services",
    glyph: (
      <Glyph>
        <path d="M12 3l8.5 4.5L12 12 3.5 7.5 12 3z" />
        <path d="M3.5 12L12 16.5 20.5 12" />
        <path d="M3.5 16.5L12 21l8.5-4.5" />
      </Glyph>
    ),
  },
  {
    id: "contact",
    label: "Цены и заявка",
    description: "Сроки, бюджет и как быстрее всего оставить заявку.",
    href: "/content#contact",
    glyph: (
      <Glyph>
        <path d="M12 2.5l2.3 6.2 6.2 2.3-6.2 2.3L12 19.5l-2.3-6.2L3.5 11l6.2-2.3L12 2.5z" />
      </Glyph>
    ),
  },
  {
    id: "catalog",
    label: "Все работы",
    description: "Полный каталог — 78 работ с фильтрами по формату и сфере.",
    href: "/works",
    glyph: (
      <Glyph>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.3" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.3" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.3" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.3" />
      </Glyph>
    ),
  },
  {
    id: "calculator",
    label: "Калькулятор",
    description: "Прикидка бюджета по формату, хронометражу и срокам.",
    href: "/calculator",
    glyph: (
      <Glyph>
        <rect x="4.5" y="3" width="15" height="18" rx="2" />
        <path d="M8 7.5h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h3.5" />
      </Glyph>
    ),
  },
  {
    id: "brief",
    label: "Бриф",
    description: "Формализуйте задачу — с этого агентство начинает работу.",
    href: "/brief",
    glyph: (
      <Glyph>
        <path d="M5 3.5h9l5 5V20a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 20V5a1.5 1.5 0 0 1 1-1.5z" />
        <path d="M14 3.5V9h5M8.5 13.5h7M8.5 17h4.5" />
      </Glyph>
    ),
  },
];

type ModeKey = "agent" | "session" | "personalize";

const MODES: { key: ModeKey; label: string; pitch: string; glyph: ReactNode }[] = [
  {
    key: "agent",
    label: "AI-агент",
    pitch: "Агент разбирает задачу и сам собирает КП по этому блоку — без брифа и созвона.",
    glyph: (
      <Glyph>
        <rect x="5" y="7" width="14" height="12" rx="3" />
        <path d="M9 7V4.5h6V7M9 13h.01M15 13h.01" />
        <path d="M3.5 12h1.5M19 12h1.5" />
      </Glyph>
    ),
  },
  {
    key: "session",
    label: "Креатив-сессия",
    pitch: "Живой разбор идеи с командой в реальном времени, по этому конкретному блоку.",
    glyph: (
      <Glyph>
        <path d="M4 6.5h13a2 2 0 0 1 2 2V14a2 2 0 0 1-2 2H10l-4 3.5V16H6a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2z" />
      </Glyph>
    ),
  },
  {
    key: "personalize",
    label: "Персонализировать",
    pitch: "Настраиваете вид и содержание блока под свой бренд — сами, без правок агентства.",
    glyph: (
      <Glyph>
        <path d="M4 7h9M4 12h5M4 17h9" />
        <circle cx="17" cy="7" r="2.2" />
        <circle cx="12" cy="17" r="2.2" />
      </Glyph>
    ),
  },
];

function VibeModeWindow({ item, onClose }: { item: RailItem; onClose: () => void }) {
  const [revealed, setRevealed] = useState<ModeKey | null>(null);

  return (
    <div>
      <span className="inline-flex items-center gap-2 rounded-full border border-orange/35 bg-orange/10 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-orange">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
        Vibe режим
      </span>

      <h2 className="mt-4 font-display text-2xl uppercase leading-[1.05] tracking-tight text-paper sm:text-3xl">
        {item.label}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-paper/60 sm:text-base">
        {item.description}
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {MODES.map((mode) => (
          <div
            key={mode.key}
            className="relative overflow-hidden rounded-2xl bg-paper/[0.05] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper/10 text-paper/80">
                {mode.glyph}
              </span>
              <span className="rounded-full bg-paper/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-paper/45">
                Скоро
              </span>
            </div>
            <div className="mt-3 font-sans text-sm font-semibold text-paper">{mode.label}</div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={revealed === mode.key ? "note" : "teaser"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="mt-1.5 text-xs leading-relaxed text-paper/50"
              >
                {revealed === mode.key
                  ? "Записали интерес — эта функция в разработке, включим одной из первых."
                  : mode.pitch}
              </motion.p>
            </AnimatePresence>
            <button
              type="button"
              onClick={() => setRevealed(mode.key)}
              className="btn-neon mt-3 w-full justify-center !py-2 !text-[10px]"
            >
              Хочу так
            </button>
          </div>
        ))}

        <Link
          href={item.href}
          onClick={onClose}
          className="group relative overflow-hidden rounded-2xl p-4"
          style={{ background: "linear-gradient(155deg, rgba(255,106,61,0.32), rgba(245,49,11,0.18))" }}
        >
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange/20 text-orange">
              <Glyph>
                <path d="M7 17 17 7M9 7h8v8" />
              </Glyph>
            </span>
            <span className="rounded-full bg-orange/25 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-orange">
              Готово сейчас
            </span>
          </div>
          <div className="mt-3 font-sans text-sm font-semibold text-white">Обычная страница</div>
          <p className="mt-1.5 text-xs leading-relaxed text-paper/70">
            Смотреть блок как он есть на сайте — без персонализации.
          </p>
          <span className="btn-neon btn-warm mt-3 flex w-full justify-center !py-2 !text-[10px]">
            Перейти
          </span>
        </Link>
      </div>
    </div>
  );
}

function RailRow({
  glyph,
  label,
  expanded,
  onClick,
}: {
  glyph: ReactNode;
  label: string;
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={expanded ? undefined : label}
      aria-label={label}
      // flex-row-reverse + justify-start (reversed, so visually flush right)
      // is what keeps the icon pinned to a constant distance from the page's
      // right edge no matter how wide the row grows — the label just grows
      // in to its left. Anchoring the icon to the row's *left* instead was
      // what made it visibly drift sideways as the panel widened.
      className="group flex w-full flex-row-reverse items-center justify-start gap-2 rounded-xl py-2 pl-2.5 pr-3 text-right text-paper/70 transition-colors hover:bg-paper/[0.08] hover:text-paper"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center [&_svg]:h-[18px] [&_svg]:w-[18px]">{glyph}</span>
      <span
        // Opacity only — no width/max-width transition of its own. The
        // label used to animate its own max-width *at the same time* as the
        // rail's outer width, and the two animations (different easing,
        // different duration) fell out of step: the box clipped the text at
        // whatever width it happened to be mid-transition, which read as
        // the label flickering and getting cut in half. The rail's own
        // overflow-hidden already does 100% of the reveal/hide work as it
        // widens, so the label only needs to fade in once there's visibly
        // room for it — never clip itself again.
        className={`shrink-0 whitespace-nowrap font-mono text-[8px] uppercase leading-none tracking-[0.03em] [text-shadow:0_1px_6px_rgba(0,0,0,0.9)] transition-opacity ${
          expanded ? "opacity-100 duration-200 delay-200" : "opacity-0 duration-100"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

export default function VibeRail() {
  const [expanded, setExpanded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<RailItem | null>(null);

  useBodyScrollLock(pickerOpen || sheetOpen || !!activeItem);

  const openItem = (item: RailItem) => {
    setSheetOpen(false);
    setExpanded(false);
    setActiveItem(item);
  };

  return (
    <>
      {/* Desktop rail. The icon column is on screen at all times — hovering
          it (or focusing a row via keyboard) is the only thing that widens
          it into the labelled panel; losing hover collapses it back to
          icons. No border/ring by design, only backdrop-blur over a very
          translucent fill, and a soft neon pulse kicks in only while
          expanded — the panel is meant to read as live, technical surface,
          not a static menu. */}
      {/* No separate fixed-width wrapper here on purpose: an inner box
          wider than a fixed-width parent can't be pushed flush against the
          parent's right edge with margin-left:auto — the browser collapses
          that auto margin to 0 once the box no longer fits, and the panel
          shot off the right side of the screen instead of growing left.
          `right-0` with no width set on *this* element is what actually
          keeps its right edge pinned while its left edge moves as width
          animates. */}
      <motion.div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onFocus={() => setExpanded(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setExpanded(false);
        }}
        animate={{
          width: expanded ? 226 : VIBE_RAIL_WIDTH,
          borderRadius: expanded ? 26 : 999,
          // A touch darker once labels appear, but staying translucent —
          // going fully opaque here made the panel read as a flat solid
          // card instead of glass. Legibility over busy backgrounds now
          // comes from the label's own text-shadow instead (see RailRow),
          // the same trick the rest of the site uses over video/photo.
          background: expanded ? "rgba(9,9,14,0.4)" : "rgba(11,11,16,0.16)",
          // Same pink→cyan family as the "VIBE САЙТ" pill and the CenterModal
          // window it lights up (see GLASS_BTN.vibe in WelcomeOverlay.tsx),
          // just pushed brighter here — the rail is the thing you're meant
          // to notice first. A dim, steady version at rest so it never reads
          // as fully off, pulsing wider and more saturated on expand.
          boxShadow: expanded
            ? [
                "0 0 22px rgba(236,72,153,0.35), 0 0 34px rgba(56,189,248,0.3)",
                "0 0 46px rgba(236,72,153,0.7), 0 0 70px rgba(56,189,248,0.6)",
                "0 0 22px rgba(236,72,153,0.35), 0 0 34px rgba(56,189,248,0.3)",
              ]
            : "0 0 16px rgba(236,72,153,0.25), 0 0 24px rgba(56,189,248,0.2)",
        }}
        transition={{
          width: { duration: 0.45, ease: EASE },
          borderRadius: { duration: 0.45, ease: EASE },
          background: { duration: 0.3 },
          boxShadow: expanded
            ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.4 },
        }}
        style={{
          // Deliberately no border/ring — just a translucent fill over a
          // strong blur, so the rail reads as glass the page shows through
          // rather than a bordered panel sitting on top of it.
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
        }}
        className="fixed right-0 top-1/2 z-[65] hidden -translate-y-1/2 overflow-hidden py-2.5 lg:block"
      >
        <nav className="flex flex-col gap-0.5">
          <RailRow
            glyph={
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                style={{ background: vibeButtonStyle().background as string }}
              >
                V
              </span>
            }
            label="Vibe"
            expanded={expanded}
            onClick={() => {
              setExpanded(false);
              setPickerOpen(true);
              }}
            />
            <div className="mx-3 my-1.5 h-px bg-paper/10" />
            {ITEMS.map((item) => (
              <RailRow
                key={item.id}
                glyph={item.glyph}
                label={item.label}
                expanded={expanded}
                onClick={() => openItem(item)}
              />
            ))}
        </nav>
      </motion.div>

      {/* Mobile entry point — the old floating "VIBE САЙТ" button's slot and
          role, same static round style as the desktop rail's trigger rather
          than the old button's constant animated glow. */}
      <div className="fixed bottom-6 right-6 z-[65] lg:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          aria-label="Vibe меню"
          className="flex h-12 w-12 items-center justify-center rounded-full font-display text-sm font-bold uppercase text-white transition-transform duration-200 active:scale-95"
          style={{
            background: vibeButtonStyle().background as string,
            border: vibeButtonStyle().border as string,
            boxShadow: "0 8px 28px -8px rgba(168,85,247,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          V
        </button>
      </div>

      {/* Mobile sheet — same rows, full-screen matte list instead of a hover-expanding rail */}
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            key="vibe-sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label="Vibe меню"
            className="fixed inset-0 z-[65] bg-ink/60 lg:hidden"
            onClick={() => setSheetOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.45, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "rgba(11,11,16,0.55)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
              }}
              className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-[1.75rem] px-5 pb-8 pt-5"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-paper/20" />

              <button
                type="button"
                onClick={() => {
                  setSheetOpen(false);
                  setPickerOpen(true);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-3"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold uppercase text-white"
                  style={vibeButtonStyle()}
                >
                  V
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-paper">
                  Vibe — выбор направления
                </span>
              </button>

              <div className="my-2 h-px bg-paper/10" />

              <nav className="flex flex-col gap-0.5">
                {ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openItem(item)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left text-paper/80"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center">{item.glyph}</span>
                    <span className="font-sans text-sm">{item.label}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vibe-mode window for one block */}
      <CenterModal open={!!activeItem} onClose={() => setActiveItem(null)} ariaLabel="Vibe режим">
        {activeItem && <VibeModeWindow item={activeItem} onClose={() => setActiveItem(null)} />}
      </CenterModal>

      {/* Top "Vibe" row — the greeting / direction-picker widget, relocated
          verbatim from the old floating button. */}
      <CenterModal open={pickerOpen} onClose={() => setPickerOpen(false)} ariaLabel="Выбор направления">
        <WelcomeWidget onClose={() => setPickerOpen(false)} />
      </CenterModal>
    </>
  );
}
