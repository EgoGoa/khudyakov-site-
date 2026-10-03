"use client";

// Вертикальный ролик «каталог сайтов» внутри iPhone (глава 02 /sites, просьба
// Егора 2026-10-03). Ролик свой, лежит в public/video — с нашего домена, без
// внешних хостингов (аудитория открывает сайт без VPN).
//
// Слияние с сайтом: за телефоном лежит тот же кадр (постер), сильно размытый
// и растворённый маской в фон главы, а снизу телефон уходит в тень — ни
// жёсткого края, ни подложки-карточки. Свечение статичное и без анимации:
// это постер, а не второй декодируемый <video>.
//
// Рамка плоская (титановая кромка, остров, кнопки) — без глянцевых бликов и
// псевдо-3D, как вся графика сцен сайта.

const SRC = "/video/sites-showcase-phone.mp4";
const POSTER = "/video/sites-showcase-phone.jpg";

export default function SitesPhoneShowcase({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex shrink-0 justify-center ${className}`} aria-hidden="true">
      {/* Размытое продолжение кадра по бокам телефона. */}
      <div
        className="pointer-events-none absolute -inset-y-6 left-1/2 w-[22rem] -translate-x-1/2 scale-110 bg-cover bg-center opacity-60 blur-[44px] saturate-[1.35]"
        style={{
          backgroundImage: `url(${POSTER})`,
          WebkitMaskImage: "radial-gradient(closest-side, #000 35%, transparent 100%)",
          maskImage: "radial-gradient(closest-side, #000 35%, transparent 100%)",
        }}
      />

      {/* Телефон стоит ровно (Егор, 2026-10-03: наклон не понравился). */}
      <div className="relative h-[clamp(280px,44vh,440px)] aspect-[9/19] max-lg:h-[min(44vh,340px)]">
        {/* Боковые кнопки. */}
        <span className="absolute -left-[3px] top-[17%] h-[5%] w-[3px] rounded-l bg-[#3b3b44]" />
        <span className="absolute -left-[3px] top-[26%] h-[9%] w-[3px] rounded-l bg-[#3b3b44]" />
        <span className="absolute -left-[3px] top-[37%] h-[9%] w-[3px] rounded-l bg-[#3b3b44]" />
        <span className="absolute -right-[3px] top-[30%] h-[14%] w-[3px] rounded-r bg-[#3b3b44]" />

        <div className="absolute inset-0 rounded-[2.3rem] bg-[#0a0a0d] p-[3px] shadow-[0_0_0_1px_#4a4a54,0_0_0_2px_#16161b,0_34px_80px_-10px_rgba(0,0,0,0.85),0_0_70px_-8px_rgba(255,120,70,0.22)]">
          <div className="relative h-full w-full overflow-hidden rounded-[2.05rem] bg-black">
            <video
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              src={SRC}
              poster={POSTER}
              autoPlay
              // Играет всегда и по кругу (Егор, 2026-10-03): force-play
              // вводит ролик под общий сторож MediaGovernor — тот не выгружает
              // его на слабых устройствах и не ждёт очереди, а только ставит на
              // паузу вне сцены и в фоновой вкладке (так что нагрузки нет).
              // Не boot-preload: при preload="none" iOS не стартует автозапуск.
              data-force-play=""
              muted
              loop
              playsInline
              preload="auto"
              tabIndex={-1}
            />
            {/* Динамический остров. */}
            <span className="absolute left-1/2 top-[1.5%] h-[2.6%] w-[19%] -translate-x-1/2 rounded-full bg-black" />
            {/* Полоска-индикатор. */}
            <span className="absolute bottom-[1.4%] left-1/2 h-[3px] w-[32%] -translate-x-1/2 rounded-full bg-white/70" />
          </div>
        </div>
      </div>
    </div>
  );
}
