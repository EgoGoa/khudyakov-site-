"use client";

// Только телефон: прозрачная колонка у правого края для скролла пальцем.
// Фона и подложки нет — сайт остаётся во всю ширину, сверху видны лишь
// стрелки. touch-pan-y пропускает вертикальный скролл, а тапы и свайпы по
// блокам под колонкой не проходят.
const CHEVRONS = [0, 1, 2];

export default function MobileScrollRail() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-auto fixed inset-y-0 right-0 z-20 w-[26px] touch-pan-y select-none sm:hidden"
    >
      <div className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2">
        {CHEVRONS.map((i) => (
          <Chevron key={i} index={i} direction="up" />
        ))}
      </div>
      <div className="absolute left-1/2 top-[70%] -translate-x-1/2 -translate-y-1/2">
        {CHEVRONS.map((i) => (
          <Chevron key={i} index={i} direction="down" />
        ))}
      </div>
    </div>
  );
}

function Chevron({ index, direction }: { index: number; direction: "up" | "down" }) {
  // Верхняя тройка гаснет снизу вверх, нижняя — сверху вниз: волна идёт
  // туда, куда уедет страница.
  const step = direction === "up" ? CHEVRONS.length - 1 - index : index;
  return (
    <svg
      viewBox="0 0 24 24"
      className="scroll-rail-chev -my-1 block h-3.5 w-3.5 text-glow"
      style={{ animationDelay: `${step * 0.22}s` }}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "up" ? <path d="M6 15l6-6 6 6" /> : <path d="M6 9l6 6 6-6" />}
    </svg>
  );
}
