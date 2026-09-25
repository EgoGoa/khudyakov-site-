"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { playUi, sound } from "@/lib/sound";

// Звуки интерфейса по всему сайту одним делегированием: не нужно трогать
// каждую кнопку. Наведение мышью на ссылку или кнопку — едва слышный тик,
// клик — мягкий «тюк», смена страницы — шорох воздуха. Элементы, у которых
// свой звук (плеер в шапке), помечены data-sound="off".

const TARGET = 'a[href], button, [role="button"], [role="switch"], summary, [data-sound]';

export default function SoundSystem() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    sound(); // заводит движок и ждёт первого жеста, чтобы разрешить звук
    let hovered: Element | null = null;

    const pick = (e: Event) => {
      const el = (e.target as Element | null)?.closest?.(TARGET) ?? null;
      if (!el || el.closest('[data-sound="off"]')) return null;
      if (el instanceof HTMLButtonElement && el.disabled) return null;
      return el;
    };
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = pick(e);
      if (el === hovered) return;
      hovered = el;
      if (el) playUi("hover");
    };
    const onClick = (e: MouseEvent) => {
      if (pick(e)) playUi("click");
    };
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("click", onClick, { capture: true, passive: true });
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    playUi("chapter");
  }, [pathname]);

  return null;
}
