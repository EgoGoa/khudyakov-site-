"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

export default function FloatingCta() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const href = "/brief";
  // pointless to float a link to the page you are already on
  const onBrief = pathname === "/brief";

  return (
    <AnimatePresence>
      {visible && !onBrief && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 right-6 z-30"
        >
          <Link
            href={href}
            className="flex items-center gap-2 rounded-full bg-rec px-5 py-3 font-mono text-xs uppercase tracking-[0.1em] text-white shadow-lg transition hover:bg-rec-light"
          >
            <span className="h-1.5 w-1.5 animate-pulse-rec rounded-full bg-white" />
            Обсудить проект
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
