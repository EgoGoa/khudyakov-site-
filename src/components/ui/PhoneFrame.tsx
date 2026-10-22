// Плоская рамка iPhone 17 Pro (экран 1206×2622, титановая кромка, Dynamic
// Island ~31%×4.2% экрана, тонкие рамки, кнопки) — без глянцевых
// бликов и псевдо-3D, как вся графика сцен сайта. Общая для /sites
// («Никакой магии») и /ai («Портфолио AI-работ»): экран приходит children.
// Размер задаёт className (высота + aspect-[9/19]), по умолчанию — как на /sites.

export default function PhoneFrame({
  children,
  className = "h-[clamp(280px,44vh,440px)] max-lg:h-[min(44vh,340px)]",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative aspect-[1206/2622] ${className}`}>
      {/* Боковые кнопки. */}
      <span className="absolute -left-[calc(3*var(--s))] top-[13.5%] h-[3.2%] w-[calc(3*var(--s))] rounded-l bg-[#3b3b44]" />
      <span className="absolute -left-[calc(3*var(--s))] top-[19.5%] h-[6.5%] w-[calc(3*var(--s))] rounded-l bg-[#3b3b44]" />
      <span className="absolute -left-[calc(3*var(--s))] top-[27.5%] h-[6.5%] w-[calc(3*var(--s))] rounded-l bg-[#3b3b44]" />
      <span className="absolute -right-[calc(3*var(--s))] top-[24%] h-[10.5%] w-[calc(3*var(--s))] rounded-r bg-[#3b3b44]" />

      {/* Радиусы в процентах: 15%/6.9% даёт круглый угол при пропорциях
          1206:2622 на любом размере. Рамка экрана ~2.6% ширины. */}
      <div className="absolute inset-0 rounded-[15%/6.9%] bg-[#0a0a0d] p-[2.6%] shadow-[0_0_0_1px_#52525c,0_0_0_2.5px_#17171c,0_34px_80px_-10px_rgba(0,0,0,0.85),0_0_70px_-8px_rgba(255,120,70,0.22)]">
        <div className="relative h-full w-full overflow-hidden rounded-[12.4%/5.7%] bg-black">
          {children}
          {/* Dynamic Island: ~126×37pt на экране 402×874. */}
          <span className="absolute left-1/2 top-[1.3%] flex h-[4.2%] w-[31%] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-[4%]">
            <span className="block aspect-square h-[34%] rounded-full bg-[#0d1020] ring-1 ring-[#1b2036]" />
          </span>
          {/* Индикатор «домой». */}
          <span className="absolute bottom-[1.2%] left-1/2 h-[0.5%] min-h-[3px] w-[34%] -translate-x-1/2 rounded-full bg-white/75" />
        </div>
      </div>
    </div>
  );
}
