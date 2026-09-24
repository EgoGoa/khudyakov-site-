"use client";

import Cabinet from "./Cabinet";
import { useCabinet } from "./store";

// Рамка страницы /cabinet: маленькое окно для входа и анкеты, большое —
// для самого кабинета (как в окне поверх сайта).
export default function CabinetFrame() {
  const state = useCabinet();
  const gate = !state.registered || !state.onboarded;
  return (
    <div className={gate ? "relative mx-auto flex min-h-[calc(100dvh-8rem)] max-w-[440px] items-center" : "relative mx-auto h-[min(820px,calc(100dvh-7rem))] max-w-[1320px]"}>
      <Cabinet />
    </div>
  );
}
