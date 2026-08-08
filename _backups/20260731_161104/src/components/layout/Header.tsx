"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import { CloseIcon, MenuIcon } from "@/components/ui/Icons";

const sections = [
  { id: "works", label: "Работы" },
  { id: "why", label: "Почему мы" },
  { id: "services", label: "Услуги" },
  { id: "ai", label: "ИИ-ассистент" },
  { id: "process", label: "Процесс" },
  { id: "pricing", label: "Цены" },
  { id: "contact", label: "Контакты" },
];

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!isHome) return;
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
  }, [isHome]);

  const hrefFor = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled
          ? "border-b border-ink/10 bg-paper/85 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <Container className="flex h-20 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 py-2 pr-6 font-display text-2xl uppercase leading-none tracking-tight text-ink transition active:scale-[0.97] md:text-3xl"
        >
          <span className="h-2.5 w-2.5 shrink-0 animate-pulse-rec rounded-full bg-rec" />
          <span>
            KHUDYAKOV<span className="text-rec">.AGENCY</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={hrefFor("contact")}
            className="hidden rounded-full bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-paper transition-all duration-150 hover:bg-rec active:scale-95 active:bg-rec-light sm:inline-flex"
          >
            Обсудить проект
          </Link>

          <motion.button
            onClick={() => setMenuOpen(true)}
            aria-label="Открыть меню"
            whileTap={{ scale: 0.9 }}
            className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors duration-150 hover:bg-ink/5 active:bg-ink/10"
          >
            <MenuIcon />
          </motion.button>
        </div>
      </Container>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm"
            />

            <motion.aside
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-sm flex-col bg-paper shadow-2xl"
            >
              <div className="flex h-20 items-center justify-between px-6 lg:px-8">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
                  Меню
                </span>
                <motion.button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Закрыть меню"
                  whileTap={{ scale: 0.9 }}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors duration-150 hover:bg-ink/5 active:bg-ink/10"
                >
                  <CloseIcon />
                </motion.button>
              </div>

              <nav className="flex flex-1 flex-col justify-center gap-1 overflow-y-auto px-6 lg:px-8">
                {sections.map((s, i) => (
                  <Link
                    key={s.id}
                    href={hrefFor(s.id)}
                    onClick={() => setMenuOpen(false)}
                    className={`group flex items-baseline gap-4 rounded-lg py-3 transition-all duration-150 active:translate-x-1 ${
                      active === s.id ? "text-rec" : "text-ink hover:text-rec"
                    }`}
                  >
                    <span className="font-mono text-xs text-ink/40 group-hover:text-rec/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-3xl uppercase leading-none tracking-tight">
                      {s.label}
                    </span>
                  </Link>
                ))}
              </nav>

              <div className="px-6 pb-8 pt-4 lg:px-8">
                <Link
                  href={hrefFor("contact")}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center rounded-full bg-ink px-5 py-3.5 text-center font-mono text-sm uppercase tracking-[0.1em] text-paper transition-all duration-150 hover:bg-rec active:scale-95 active:bg-rec-light"
                >
                  Обсудить проект
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
