"use client";

import Link from "next/link";
import { useCleanPathname } from "@/lib/use-clean-pathname";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import { CloseIcon, MenuIcon, PhoneIcon } from "@/components/ui/Icons";
import { useFullpage } from "@/lib/fullpage";
import { useHeaderMenu } from "@/lib/header-menu";
import { useCinematicGoTo } from "@/lib/cinematic-nav";

// Same 20-unit, 1.75-stroke line-icon language as VibeRail's own row glyphs
// (see PageBlock/CROSS_PAGE_ITEMS there) — reused here rather than shared
// via an import so the two floating panels stay decoupled, but a visitor
// should still recognise "Работы" as the same icon in both places.
function NavGlyph({ children }: { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
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

// The six cinematic chapters of a service page (see (landing)/content/page.tsx)
const sections = [
  {
    id: "opening",
    label: "Начало",
    short: "Начало",
    glyph: <path d="M5 4.5 19 12 5 19.5z" />,
  },
  {
    id: "works",
    label: "Работы",
    short: "Работы",
    glyph: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M3 9h18M3 15h18M8 5v14M16 5v14" />
      </>
    ),
  },
  {
    id: "why",
    label: "Почему мы",
    short: "Почему",
    glyph: <path d="M12 3 4 6.5V12c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6.5L12 3z" />,
  },
  {
    id: "services",
    label: "Что делаем",
    short: "Услуги",
    glyph: (
      <>
        <path d="M12 3l8.5 4.5L12 12 3.5 7.5 12 3z" />
        <path d="M3.5 12L12 16.5 20.5 12" />
        <path d="M3.5 16.5L12 21l8.5-4.5" />
      </>
    ),
  },
  {
    id: "process",
    label: "Как работаем",
    short: "Процесс",
    glyph: (
      <>
        <path d="M4 6h11a3.5 3.5 0 0 1 0 7H7" />
        <path d="M9.5 10 6 13l3.5 3M14 18h6" />
      </>
    ),
  },
  {
    id: "contact",
    label: "Цены и заявка",
    short: "Заявка",
    glyph: <path d="M12 2.5l2.3 6.2 6.2 2.3-6.2 2.3L12 19.5l-2.3-6.2L3.5 11l6.2-2.3L12 2.5z" />,
  },
];

// standalone pages, kept out of the scroll-spy list above
const pages = [
  {
    href: "/works",
    label: "Все работы",
    short: "Каталог",
    glyph: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.3" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.3" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.3" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.3" />
      </>
    ),
  },
  {
    href: "/calculator",
    label: "Калькулятор",
    short: "Калькулятор",
    glyph: (
      <>
        <rect x="4.5" y="3" width="15" height="18" rx="2" />
        <path d="M8 7.5h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h3.5" />
      </>
    ),
  },
  {
    href: "/brief",
    label: "Бриф",
    short: "Бриф",
    glyph: (
      <>
        <path d="M5 3.5h9l5 5V20a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 20V5a1.5 1.5 0 0 1 1-1.5z" />
        <path d="M14 3.5V9h5M8.5 13.5h7M8.5 17h4.5" />
      </>
    ),
  },
];

// the section anchors above exist on every /content, /ai, /sites, /smm
// page identically — jumping there should stay on whichever one you're
// already viewing instead of bouncing to the default service
const landingSlugs = ["content", "ai", "sites", "smm"];

export default function Header() {
  const pathname = useCleanPathname();
  const isHome = pathname === "/";
  const isLanding = landingSlugs.includes(pathname.replace(/^\//, ""));
  const api = useFullpage();
  const cinematicGoTo = useCinematicGoTo();
  const fullpageActive = isHome && (api?.ready ?? false);
  const [scrolled, setScrolled] = useState(false);
  const { menuOpen, setMenuOpen } = useHeaderMenu();
  const [active, setActive] = useState<string>("");

  // On the homepage, navigation is a fullpage slide deck (see
  // src/lib/fullpage.tsx) — there is no real document scroll to watch, so
  // both "has the visitor moved past the first slide" and "which section is
  // current" come from that shared state instead of window.scrollY /
  // IntersectionObserver.
  useEffect(() => {
    if (fullpageActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors the fullpage deck's own state (see comment above), not derivable during this render
      setScrolled((api?.activeIndex ?? 0) > 0);
      setActive(api?.activeId ?? "");
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [fullpageActive, api?.activeIndex, api?.activeId]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Non-fullpage routes (or before the slide deck has registered) fall back
  // to plain in-page anchors / IntersectionObserver-free scroll-spy.
  useEffect(() => {
    if (!isLanding || fullpageActive) return;
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isLanding, fullpageActive]);

  const hrefFor = (id: string) => (isLanding ? `#${id}` : `/content#${id}`);

  const navigateTo = (e: React.MouseEvent, id: string) => {
    if (fullpageActive) {
      e.preventDefault();
      api!.goTo(id);
      return;
    }
    // On /content, id is one of CinematicStage's own pinned chapters — a
    // plain `#id` anchor's native scroll-jump gets misread by the deck's own
    // scroll listener as trackpad-momentum overshoot and clamped to one
    // chapter away from the click (see cinematic-nav.tsx). Jumping directly
    // through the deck itself avoids that; on /ai, /sites, /smm (plain
    // scroll, no deck registered) this is a no-op and the anchor's normal
    // browser behaviour below still applies.
    if (cinematicGoTo(id)) {
      e.preventDefault();
    }
  };

  const navigateHome = (e: React.MouseEvent) => {
    if (fullpageActive) {
      e.preventDefault();
      api!.goToIndex(0);
      return;
    }
    // Already on one of the four landing pages: href="/" would still
    // navigate (redirecting straight back to /content), remounting the
    // whole page — video, deck state, everything — just to land back where
    // "top of this page" would have done. An instant scroll reset gets to
    // the same place without any of that, and without the animated
    // scroll-through-the-page a route change produces.
    if (isLanding) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 land:pointer-events-none land:!border-transparent land:!bg-transparent land:!backdrop-blur-none land:before:pointer-events-none land:before:absolute land:before:inset-x-0 land:before:top-0 land:before:h-16 land:before:content-[''] land:before:bg-[linear-gradient(to_bottom,rgba(11,11,16,0.78),rgba(11,11,16,0.6)_30%,rgba(11,11,16,0.28)_65%,rgba(11,11,16,0))] ${
        menuOpen
          ? "bg-transparent"
          : scrolled
          ? "border-b border-paper/10 bg-ink/70 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <Container className="relative z-10 flex h-16 items-center justify-between sm:h-20 land:h-10">
        <Link
          href="/"
          onClick={navigateHome}
          className="flex shrink-0 items-center gap-2 py-2 land:pointer-events-auto land:py-0 land:opacity-80 font-display uppercase leading-none tracking-[0.08em] text-paper transition active:scale-[0.97] sm:gap-2.5"
        >
          <span className="h-2 w-2 shrink-0 animate-pulse-rec rounded-full brand-dot sm:h-2.5 sm:w-2.5" />
          <span className="whitespace-nowrap font-display text-[clamp(1.1rem,3.2vw,1.4rem)] land:!text-[0.9rem] uppercase tracking-tight">
            HUD<span className="brand-word">.SERVICE</span>
          </span>
          <span className="ml-1 hidden h-6 w-px shrink-0 bg-paper/25 sm:block land:!hidden" aria-hidden="true" />
          {/* The tagline now carries /sites' chapter-heading treatment: the
              display face, the near-white under a warm orange bloom
              (.chapter-neon-warm), and the keyword in the same
              magenta-to-cyan gradient (.kw). It used to be the light sans at
              60% paper with only "AI" picked out, which read as a caption
              beside the logo rather than as the line the logo is making.
              .kw rather than .header-ai-mark — same gradient, but .kw also
              clears text-shadow, which the parent's new bloom needs: a shadow
              under a transparent-filled glyph is not hidden by it, and would
              have painted an orange slab in the shape of the word. */}
          {/* font-sans/300, not the display face: Egor asked for this line to
              read thinner and cleaner beside the logo. Unbounded (font-display)
              has no cut below 500 in this project, so "thinner" is simply not
              reachable in it — its wide, blocky geometry is also what made the
              line read as heavy next to the wordmark. Manrope Light gives the
              plain, thin setting asked for at this size.
              "AI" is pinned back to `font-display font-normal` so it stays
              exactly as it was — it would otherwise inherit the new face and
              weight from this parent along with the rest of the line. */}
          {/* One line now — "АГЕНТСТВО" was dropped at Egor's request, so the
              two-line stack (flex-col + gap) that used to hold it went with
              it: a column of one is just a line, and its `gap` would only
              have offset the text from nothing. As a single line it centres
              against the wordmark on its own, from the parent Link's own
              `items-center`, instead of being a block whose two rows
              straddled the logo's centre. */}
          <span className="chapter-neon-warm hidden land:!hidden shrink-0 whitespace-nowrap text-center font-sans text-[0.65rem] font-light uppercase leading-none tracking-[0.12em] sm:block">
            DIGITAL <span className="kw font-display font-normal">AI</span> CREATIVE
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <a
            href="tel:+79925111812"
            className="hidden items-center gap-2 whitespace-nowrap text-sm font-medium text-paper/80 transition-colors hover:text-paper sm:inline-flex land:!hidden"
          >
            <PhoneIcon className="icon-neon-pulse text-glow" />
            +7 992 511-18-12
          </a>

          <div className="relative land:ml-auto land:pointer-events-auto">
            <motion.button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
              whileTap={{ scale: 0.9 }}
              // No disc behind the glyph any more (Egor's call): the circle —
              // border, translucent fill and its own backdrop-blur — was more
              // chrome than a three-line icon needs, and it read as a heavier
              // control than the wordmark opposite it. The button keeps the
              // same 40/44px box so the tap target is unchanged; only the
              // decoration is gone, with hover moving from a filling disc to
              // the glyph itself brightening.
              className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center text-paper/80 transition-colors duration-150 hover:text-paper sm:h-11 sm:w-11 land:text-paper/55"
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </motion.button>

            {/* Desktop: a compact glass popover instead of the full-screen
                takeover below — anchored right under the burger button, the
                same corner it sits in. VibeRail (fixed right, vertically
                centred) fades out for as long as this is open instead of the
                two floating panels risking an overlap (see useHeaderMenu). */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  key="desktop-panel"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-full z-10 mt-3 hidden w-72 origin-top-right overflow-hidden rounded-2xl bg-ink/80 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.85)] backdrop-blur-2xl lg:block"
                >
                  <nav className="flex flex-col p-1.5">
                    {sections.map((s) => (
                      <Link
                        key={s.id}
                        href={hrefFor(s.id)}
                        onClick={(e) => {
                          navigateTo(e, s.id);
                          setMenuOpen(false);
                        }}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                          active === s.id ? "bg-glow/10 text-glow" : "text-paper/85 hover:bg-paper/5 hover:text-paper"
                        }`}
                      >
                        <NavGlyph>{s.glyph}</NavGlyph>
                        {s.label}
                      </Link>
                    ))}
                    <div className="my-1.5 border-t border-paper/10" />
                    {pages.map((p) => (
                      <Link
                        key={p.href}
                        href={p.href}
                        onClick={() => setMenuOpen(false)}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                          pathname === p.href ? "bg-glow/10 text-glow" : "text-paper/85 hover:bg-paper/5 hover:text-paper"
                        }`}
                      >
                        <NavGlyph>{p.glyph}</NavGlyph>
                        {p.label}
                      </Link>
                    ))}
                  </nav>

                  <div className="flex items-center justify-between gap-3 border-t border-paper/10 px-3.5 py-3">
                    <a
                      href="tel:+79925111812"
                      className="flex items-center gap-1.5 text-xs font-medium text-paper/70 transition-colors hover:text-paper"
                    >
                      <PhoneIcon className="h-3.5 w-3.5" />
                      +7 992 511-18-12
                    </a>
                    <Link
                      href="/brief"
                      onClick={() => setMenuOpen(false)}
                      className="btn-neon btn-warm !px-4 !py-2 !text-[11px]"
                    >
                      Бриф
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Container>

      {/* Mobile/tablet: a compact glass panel on the right — about 84% of a
          portrait phone (capped at 320px) and a third of a landscape one —
          instead of a full-screen takeover. A scrim behind it closes the menu
          on tap. */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              key="scrim"
              type="button"
              aria-label="Закрыть меню"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-auto fixed inset-0 z-0 cursor-default bg-ink/45 lg:hidden"
            />
            <motion.div
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto fixed inset-y-0 right-0 z-0 flex w-[min(84vw,320px)] flex-col rounded-l-3xl bg-ink/85 shadow-[-24px_0_60px_-20px_rgba(0,0,0,0.85)] backdrop-blur-2xl lg:hidden land:w-[max(33vw,300px)] land:pr-[env(safe-area-inset-right)]"
            >
              <nav className="flex flex-1 flex-col justify-center gap-0 overflow-y-auto px-5 pt-16 land:pt-12">
                {sections.map((s, i) => (
                  <Link
                    key={s.id}
                    href={hrefFor(s.id)}
                    onClick={(e) => {
                      navigateTo(e, s.id);
                      setMenuOpen(false);
                    }}
                    className={`group flex items-baseline gap-3 border-b border-paper/10 py-2.5 transition-all duration-150 active:translate-x-1 land:py-1.5 ${
                      active === s.id ? "text-glow" : "text-paper hover:text-glow"
                    }`}
                  >
                    <span className="w-5 shrink-0 font-display text-[0.6rem] text-paper/40 group-hover:text-glow/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-[1.05rem] uppercase leading-none tracking-tight">
                      {s.label}
                    </span>
                  </Link>
                ))}

                {pages.map((p, i) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    onClick={() => setMenuOpen(false)}
                    className={`group flex items-baseline gap-3 border-b border-paper/10 py-2.5 transition-all duration-150 active:translate-x-1 land:py-1.5 ${
                      pathname === p.href ? "text-glow" : "text-paper hover:text-glow"
                    }`}
                  >
                    <span className="w-5 shrink-0 font-display text-[0.6rem] text-paper/40 group-hover:text-glow/60">
                      {String(sections.length + i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-[1.05rem] uppercase leading-none tracking-tight">
                      {p.label}
                    </span>
                  </Link>
                ))}
              </nav>

              <div className="flex flex-col gap-2.5 px-5 pb-6 pt-3 land:pb-3">
                <a
                  href="tel:+79925111812"
                  className="text-center text-xs font-medium text-paper/70 transition-colors hover:text-paper"
                >
                  +7 992 511-18-12
                </a>
                <Link
                  href="/brief"
                  onClick={() => setMenuOpen(false)}
                  className="btn-neon btn-warm w-full !py-2.5 !text-[11px]"
                >
                  Заполнить бриф
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
