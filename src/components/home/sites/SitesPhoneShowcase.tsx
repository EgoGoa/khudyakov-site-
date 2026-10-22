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

import PhoneFrame from "@/components/ui/PhoneFrame";

const SRC = "/video/sites-showcase-phone.mp4";
const POSTER = "/video/sites-showcase-phone.jpg";

export default function SitesPhoneShowcase({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex shrink-0 justify-center ${className}`} aria-hidden="true">
      {/* Размытое продолжение кадра по бокам телефона. Только с lg: на
          телефоне blur + mask на одном слое в мобильном Safari рисуется
          грязным прямоугольником за рамкой (Егор, 2026-10-03) — там хватает
          тёплого свечения самой рамки. (Tailwind 3: вариантов max-* нет,
          поэтому hidden + lg:block.) */}
      <div
        className="pointer-events-none absolute hidden lg:block -inset-y-6 left-1/2 w-[22rem] -translate-x-1/2 scale-110 bg-cover bg-center opacity-60 blur-[44px] saturate-[1.35]"
        style={{
          backgroundImage: `url(${POSTER})`,
          WebkitMaskImage: "radial-gradient(closest-side, #000 35%, transparent 100%)",
          maskImage: "radial-gradient(closest-side, #000 35%, transparent 100%)",
        }}
      />

      {/* Телефон стоит ровно (Егор, 2026-10-03: наклон не понравился). */}
      <PhoneFrame>
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
      </PhoneFrame>
    </div>
  );
}
