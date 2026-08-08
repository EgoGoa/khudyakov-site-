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
          className="flex items-center gap-2 font-display text-lg uppercase tracking-tight text-ink"
        >
          <span className="h-2 w-2 animate-pulse-rec rounded-full bg-rec" />
          KHUDYAKOV<span className="text-rec">.AGENCY</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {sections.map((s) => (
            <Link
              key={s.id}
              href={hrefFor(s.id)}
              className={`font-mono text-xs uppercase tracking-[0.15em] transition-colors ${
                active === s.id
                  ? "text-rec"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            href={hrefFor("contact")}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-rec"
          >
            Обсудить проект
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Меню"
          className="flex h-10 w-10 items-center justify-center text-ink lg:hidden"
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </Container>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-ink/10 bg-paper/95 backdrop-blur-md lg:hidden"
          >
            <Container className="flex flex-col gap-1 py-6">
              {sections.map((s) => (
                <Link
                  key={s.id}
                  href={hrefFor(s.id)}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-3 py-3 font-mono text-sm uppercase tracking-[0.1em] ${
                    active === s.id ? "bg-ink/5 text-rec" : "text-ink/60"
                  }`}
                >
                  {s.label}
                </Link>
              ))}
              <Link
                href={hrefFor("contact")}
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-full bg-ink px-5 py-3 text-center text-sm font-medium text-paper"
              >
                Обсудить проект
              </Link>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
