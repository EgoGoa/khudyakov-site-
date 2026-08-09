"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useFullpage } from "@/lib/fullpage";

export default function FloatingCta() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const api = useFullpage();
  const fullpageActive = isHome && (api?.ready ?? false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (fullpageActive) return;
    const onScroll = () => setScrolled(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [fullpageActive]);

  const visible = fullpageActive ? (api?.activeIndex ?? 0) > 0 : scrolled;

  const href = "/#ai";
  const onAi = pathname === "/" && pathname.includes("ai");

  return (
    <AnimatePresence>
      {visible && !onAi && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 right-6 z-30"
        >
          <Link
            href={href}
            className="btn-neon"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            AI ассистент
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
