"use client";

import { useEffect } from "react";
import { rushBoot } from "@/lib/boot-sequence";
import { skipIntros } from "@/lib/skip-intro";

// Клик по странице, пока она ещё собирается (очередь lib/boot-sequence:
// первый экран, сфера, меню вайб-бара, волна), — всё встаёт сразу, а сферы
// быстро и плавно доигрывают сборку (Егор, 2026-10-03: «чтобы человек не
// ждал»). После того как всё собралось, слушатель снимается.
export default function SkipIntro() {
  useEffect(() => {
    const html = document.documentElement;
    const onDown = () => {
      if (html.hasAttribute("data-welcome-open") && document.querySelector(".welcome-shell:not(.is-leaving)")) return;
      rushBoot();
      skipIntros();
      document.removeEventListener("pointerdown", onDown);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);
  return null;
}
