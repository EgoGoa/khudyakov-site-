"use client";

import { useEffect } from "react";

// Плавающие кнопки на телефоне (стрелка «назад», «наверх», сфера меню,
// стрелки соседних страниц, волна ассистента) прячутся, пока страница
// листается, и возвращаются, когда посетитель остановился (Егор,
// 2026-10-08): иначе заголовки и текст окон проезжали прямо под ними.
// Здесь только флаг на <html>; что прятать и как — в globals.css
// (html[data-scrolling]).
const QUIET_MS = 450;

export default function ScrollQuiet() {
  useEffect(() => {
    const html = document.documentElement;
    let timer = 0;
    const onScroll = () => {
      if (!html.hasAttribute("data-scrolling")) html.setAttribute("data-scrolling", "");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => html.removeAttribute("data-scrolling"), QUIET_MS);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
      html.removeAttribute("data-scrolling");
    };
  }, []);
  return null;
}
