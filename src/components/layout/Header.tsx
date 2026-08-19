"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import { CloseIcon, MenuIcon, PhoneIcon } from "@/components/ui/Icons";
import { useFullpage } from "@/lib/fullpage";

// The six cinematic chapters of a service page (see (landing)/content/page.tsx)
const sections = [
  { id: "opening", label: "Начало", short: "Начало" },
  { id: "works", label: "Работы", short: "Работы" },
  { id: "why", label: "Почему мы", short: "Почему" },
  { id: "services", label: "Что делаем", short: "Услуги" },
  { id: "process", label: "Как работаем", short: "Процесс" },
  { id: "contact", label: "Цены и заявка", short: "Заявка" },
];

// standalone pages, kept out of the scroll-spy list above
const pages = [
  { href: "/works", label: "Все работы", short: "Каталог" },
  { href: "/calculator", label: "Калькулятор", short: "Калькулятор" },
  { href: "/brief", label: "Бриф", short: "Бриф" },
];

// the section anchors above exist on every /content, /ai, /sites, /smm
// page identically — jumping there should stay on whichever one you're
// already viewing instead of bouncing to the default service
const landingSlugs = ["content", "ai", "sites", "smm"];

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isLanding = landingSlugs.includes(pathname.replace(/^\//, ""));
  const api = useFullpage();
  const fullpageActive = isHome && (api?.ready ?? false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  // On the homepage, navigation is a fullpage slide deck (see
  // src/lib/fullpage.tsx) — there is no real document scroll to watch, so
  // both "has the visitor moved past the first slide" and "which section is
  // current" come from that shared state instead of window.scrollY /
  // IntersectionObserver.
  useEffect(() => {
    if (fullpageActive) {
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
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        menuOpen
          ? "bg-transparent"
          : scrolled
          ? "border-b border-paper/10 bg-ink/70 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <Container className="relative z-10 flex h-16 items-center justify-between sm:h-20">
        <Link
          href="/"
          onClick={navigateHome}
          className="flex shrink-0 items-center gap-2 py-2 font-mono uppercase leading-none tracking-[0.08em] text-paper transition active:scale-[0.97] sm:gap-2.5"
        >
          <span className="h-2 w-2 shrink-0 animate-pulse-rec rounded-full bg-rec sm:h-2.5 sm:w-2.5" />
          <span className="whitespace-nowrap text-[clamp(0.95rem,3vw,1.25rem)] font-semibold">
            HDKV.AGENCY
          </span>
          <span className="ml-1 hidden h-6 w-px shrink-0 bg-paper/25 sm:block" aria-hidden="true" />
          <span className="hidden shrink-0 flex-col gap-0.5 font-sans text-[0.65rem] font-normal leading-none tracking-[0.12em] text-paper/60 sm:flex">
            <span className="whitespace-nowrap text-[1em]">DIGITAL</span>
            <span className="whitespace-nowrap text-[1em]">АГЕНТСТВО</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <a
            href="tel:+79925111812"
            className="hidden items-center gap-2 whitespace-nowrap text-sm font-medium text-paper/80 transition-colors hover:text-paper sm:inline-flex"
          >
            <PhoneIcon className="icon-neon-pulse text-glow" />
            +7 992 511-18-12
          </a>

          <motion.button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            whileTap={{ scale: 0.9 }}
            className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-paper/10 bg-paper/5 text-paper backdrop-blur-md transition-colors duration-150 hover:bg-paper/10 sm:h-11 sm:w-11"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </motion.button>
        </div>
      </Container>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-0 flex flex-col bg-ink"
          >
            <nav className="flex flex-1 flex-col justify-center gap-0.5 overflow-y-auto px-6 pt-16 sm:gap-1 sm:px-10 sm:pt-20">
              {sections.map((s, i) => (
                <Link
                  key={s.id}
                  href={hrefFor(s.id)}
                  onClick={(e) => {
                    navigateTo(e, s.id);
                    setMenuOpen(false);
                  }}
                  className={`group flex items-baseline gap-3 border-b border-paper/10 py-3 transition-all duration-150 active:translate-x-1 sm:gap-5 sm:py-4 ${
                    active === s.id ? "text-glow" : "text-paper hover:text-glow"
                  }`}
                >
                  <span className="w-5 shrink-0 font-mono text-[clamp(0.6rem,1.5vw,0.8rem)] text-paper/40 group-hover:text-glow/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display uppercase leading-none tracking-tight text-[clamp(1.5rem,7vw,3.25rem)] sm:hidden">
                    {s.short}
                  </span>
                  <span className="hidden font-display uppercase leading-none tracking-tight text-[clamp(1.5rem,7vw,3.25rem)] sm:inline">
                    {s.label}
                  </span>
                </Link>
              ))}

              {pages.map((p, i) => (
                <Link
                  key={p.href}
                  href={p.href}
                  onClick={() => setMenuOpen(false)}
                  className={`group flex items-baseline gap-3 border-b border-paper/10 py-3 transition-all duration-150 active:translate-x-1 sm:gap-5 sm:py-4 ${
                    pathname === p.href ? "text-glow" : "text-paper hover:text-glow"
                  }`}
                >
                  <span className="w-5 shrink-0 font-mono text-[clamp(0.6rem,1.5vw,0.8rem)] text-paper/40 group-hover:text-glow/60">
                    {String(sections.length + i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display uppercase leading-none tracking-tight text-[clamp(1.5rem,7vw,3.25rem)]">
                    {p.label}
                  </span>
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-3 px-6 pb-8 pt-4 sm:px-10">
              <a
                href="tel:+79925111812"
                className="text-center text-sm font-medium text-paper/70 transition-colors hover:text-paper"
              >
                +7 992 511-18-12
              </a>
              <Link
                href="/brief"
                onClick={() => setMenuOpen(false)}
                className="btn-neon btn-warm w-full"
              >
                Заполнить бриф
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
