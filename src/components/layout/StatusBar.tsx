"use client";

import { useEffect, useState } from "react";

export default function StatusBar() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length < 3) return prev + ".";
        return "";
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-20">
      <div className="text-xs uppercase tracking-[0.2em] text-glow/80 font-mono whitespace-nowrap">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-glow mr-2" />
        <span className="typewriter">ваш проект в работе{dots}</span>
      </div>
    </div>
  );
}
