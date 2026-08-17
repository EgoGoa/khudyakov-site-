"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import { CloseIcon, MenuIcon } from "@/components/ui/Icons";
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

// the desktop bar only has room for a curated subset — the burger menu
// still lists every section, and the CTA already covers the brief
const desktopSections = ["works", "services", "contact"];

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
          className="flex min-w-0 items-center gap-2.5 py-2 font-display uppercase leading-none tracking-tight text-paper transition active:scale-[0.97] sm:gap-3"
        >
          <span className="h-2 w-2 shrink-0 animate-pulse-rec rounded-full bg-rec sm:h-2.5 sm:w-2.5" />
          <span className="truncate text-[clamp(1.1rem,4vw,1.75rem)]">
            HDKV<span className="text-rec">.AGENCY</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {sections
            .filter((s) => desktopSections.includes(s.id))
            .map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
              >
                <Link
                  href={hrefFor(s.id)}
                  onClick={(e) => navigateTo(e, s.id)}
                  className={`text-sm font-medium transition-colors ${
                    active === s.id ? "text-glow" : "text-paper/70 hover:text-paper"
                  }`}
                >
                  {s.label}
                </Link>
              </motion.div>
            ))}
          {pages.map((p, i) => (
            <motion.div
              key={p.href}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.05 }}
            >
              <Link
                href={p.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === p.href ? "text-glow" : "text-paper/70 hover:text-paper"
                }`}
              >
                {p.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/brief"
            className="hidden btn-neon sm:inline-flex"
          >
            Заполнить бриф
          </Link>

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

            <div className="px-6 pb-8 pt-4 sm:px-10">
              <Link
                href="/brief"
                onClick={() => setMenuOpen(false)}
                className="btn-neon w-full"
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
