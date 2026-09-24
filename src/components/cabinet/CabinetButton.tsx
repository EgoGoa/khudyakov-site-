"use client";

import { useCabinet } from "./store";
import { recommendationsFor } from "./data";
import { openCabinet } from "./CabinetWindow";

// Иконка кабинета в шапке. Цифра — новые рекомендации команды: кабинет
// «сам что-то предлагает», и шапка об этом напоминает.
export default function CabinetButton() {
  const state = useCabinet();
  const count = state.registered ? recommendationsFor(state).length : 0;
  return (
    <button
      type="button"
      onClick={openCabinet}
      aria-label="Личный кабинет"
      className="relative flex h-10 w-10 shrink-0 items-center justify-center text-paper/80 transition-colors hover:text-paper sm:h-11 sm:w-11 land:pointer-events-auto"
    >
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="8.5" r="3.8" />
        <path d="M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4" />
      </svg>
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gradient-to-r from-[#ff4fd8] to-[#00d2ff] px-1 text-[10px] font-extrabold text-ink">
          {count}
        </span>
      )}
    </button>
  );
}
