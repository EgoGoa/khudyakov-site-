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
            aria-label="AI ассистент"
            className="btn-neon !h-12 !w-12 !p-0 sm:!h-auto sm:!w-auto sm:!px-[22px] sm:!py-[10px]"
          >
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-current" />
            <span className="hidden sm:inline">AI ассистент</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
