"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { serviceMeta, serviceOrder } from "@/lib/service-content";
import { wrapOffset } from "@/components/ui/deckFan";

// Переход между четырьмя страницами услуг (просьба Егора): содержимое новой
// страницы въезжает вбок — в ту же сторону, куда пролистнули колоду в шапке
// (листнули вправо — страница приходит справа). Шоурил сверху общий и не
// двигается. Только вход: в App Router старая страница снимается сразу, а
// удерживать её ради ухода — хрупкий хак.
//
// На слабых и средних устройствах (html[data-lite] / [data-mid]) — просто
// короткое проявление без сдвига.
const indexOf = (path: string) => serviceOrder.findIndex((k) => `/${serviceMeta[k].slug}` === path);

export default function PageSlide({ pathname, children }: { pathname: string; children: ReactNode }) {
  // Направление считается при смене адреса прямо во время рендера — это
  // «состояние, производное от пропсов» (так рекомендует React), без эффекта
  // и лишнего кадра.
  const [slide, setSlide] = useState({ path: pathname, dir: 0 });
  if (slide.path !== pathname) {
    const a = indexOf(slide.path);
    const b = indexOf(pathname);
    setSlide({ path: pathname, dir: a >= 0 && b >= 0 ? Math.sign(wrapOffset(b - a, serviceOrder.length)) : 0 });
  }
  const dir = slide.path === pathname ? slide.dir : 0;

  const lite =
    typeof document !== "undefined" &&
    (document.documentElement.hasAttribute("data-lite") || document.documentElement.hasAttribute("data-mid"));
  const shift = lite ? 0 : dir * 72;

  return (
    // overflow-x: clip, а не hidden — не создаёт контейнер прокрутки, и
    // sticky-блоки внутри страниц продолжают работать.
    <div className="overflow-x-clip">
      <motion.div
        key={pathname}
        initial={dir === 0 ? false : { x: shift, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: lite ? 0.3 : 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
