"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import { CloseIcon, MenuIcon } from "@/components/ui/Icons";

const links = [
  { href: "/", label: "Главная" },
  { href: "/portfolio", label: "Портфолио" },
  { href: "/brief", label: "Бриф" },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled
          ? "border-b border-black/5 bg-white/80 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <Container className="flex h-20 items-center justify-between">
        <Link
          href="/"
          className="flex items-baseline gap-1 font-display text-lg font-bold tracking-tight text-ink"
        >
          KHUDYAKOV
          <span className="text-accent">.AGENCY</span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-ink"
                  : "text-neutral-500 hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/brief"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent"
          >
            Обсудить проект
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Меню"
          className="flex h-10 w-10 items-center justify-center text-ink md:hidden"
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
            className="overflow-hidden border-t border-black/5 bg-white/95 backdrop-blur-md md:hidden"
          >
            <Container className="flex flex-col gap-1 py-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-3 text-base font-medium ${
                    pathname === link.href
                      ? "bg-black/5 text-ink"
                      : "text-neutral-500"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/brief"
                className="mt-2 rounded-full bg-ink px-5 py-3 text-center text-sm font-medium text-white"
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
