"use client";

import Link from "next/link";
import { queueFirstChapter, scrollToDeckStart } from "@/lib/page-hop";
import { useRouter } from "next/navigation";
import { sureNavigate } from "@/lib/sure-nav";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useCleanPathname } from "@/lib/use-clean-pathname";
import { serviceMeta, serviceOrder, type ServiceKey } from "@/lib/service-content";
import { PAGE_GRADIENT } from "@/components/home/PageSideNav";

// Бар страниц в шапке (Егор, 2026-10-09): все четыре направления видны
// сразу, коротким словом в ряд. Выбранное отмечено линией в градиенте его
// страницы и светом, стекающим от неё вниз; при переходе меняются только
// линия и свет — линия переезжает под новое название. Раньше здесь была
// колода-карусель с паузой перед переходом, и страница менялась заметно
// позже, чем бар.
//
// Переход моментальный: по клику линия сразу едет к новому названию, адрес
// меняется в тот же миг (без паузы), страницы заранее подгружены.
//
// На телефоне ряд стоит второй строкой под логотипом и меню, на планшете
// тоже, на компьютере и у телефона боком — по центру строки шапки.

export const SHORT: Record<ServiceKey, string> = {
  content: "Контент",
  ai: "AI",
  sites: "Сайты",
  smm: "SMM",
};

// Свет под выбранным: чёткая линия в градиенте страницы прямо под буквами,
// от неё свет идёт только вниз — под центром сильнее, к краям слабее. Форму
// задают градиентные маски, без blur.
const LINE_MASK = "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)";
const GLOW_MASK_Y = "linear-gradient(to bottom, rgba(0,0,0,0.75), rgba(0,0,0,0.4) 35%, rgba(0,0,0,0.12) 70%, transparent)";
const GLOW_MASK_X =
  "linear-gradient(90deg, transparent, rgba(0,0,0,0.2) 10%, rgba(0,0,0,0.55) 24%, rgba(0,0,0,0.85) 38%, #000 50%, rgba(0,0,0,0.85) 62%, rgba(0,0,0,0.55) 76%, rgba(0,0,0,0.2) 90%, transparent)";
const GLOW_MASK = `${GLOW_MASK_Y}, ${GLOW_MASK_X}`;

// Какой услуге принадлежит адрес. Подстраницы — своей услуге (кейсы и
// тарифы SMM → SMM, направления контента и портфолио → контент, брифы — по
// своему направлению); общие страницы — никакой (-1).
const HOME_PREFIXES: [string, ServiceKey][] = [
  ["/content", "content"],
  ["/works", "content"],
  ["/brief/hotel-video", "content"],
  ["/ai", "ai"],
  ["/brief/ai", "ai"],
  ["/sites", "sites"],
  ["/brief/sites", "sites"],
  ["/smm", "smm"],
  ["/brief/smm", "smm"],
];
export function homeOf(path: string) {
  const hit = HOME_PREFIXES.find(([p]) => path === p || path.startsWith(`${p}/`));
  return hit ? serviceOrder.indexOf(hit[1]) : -1;
}

const hrefOf = (k: ServiceKey) => `/${serviceMeta[k].slug}`;

export default function PageBar({ hidden = false }: { hidden?: boolean }) {
  const pathname = useCleanPathname();
  const router = useRouter();
  const home = homeOf(pathname);
  const onTop = home >= 0 && pathname === hrefOf(serviceOrder[home]);

  // Куда только что нажали: линия едет туда сразу, не дожидаясь, пока
  // сменится адрес. Действует только на той странице, откуда нажали.
  const [pending, setPending] = useState<{ from: string; to: number } | null>(null);
  const current = pending && pending.from === pathname ? pending.to : home;

  // Положение линии — по живому размеру выбранного названия.
  const rowRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [line, setLine] = useState<{ left: number; width: number } | null>(null);
  // Первая расстановка — без анимации, иначе линия выезжала бы от левого края.
  const [animate, setAnimate] = useState(false);
  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const measure = () => {
      const el = current >= 0 ? itemRefs.current[current] : null;
      setLine(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    return () => ro.disconnect();
  }, [current]);
  useEffect(() => {
    if (!line || animate) return;
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, [line, animate]);

  useEffect(() => {
    serviceOrder.forEach((k) => router.prefetch(hrefOf(k)));
  }, [router]);

  if (pathname.startsWith("/admin")) return null;

  const g = PAGE_GRADIENT[serviceOrder[Math.max(current, 0)]];
  const pageGrad = `linear-gradient(90deg, ${g.from}, ${g.to})`;

  return (
    // z-20: контейнер шапки (логотип, иконки) растянут на всю ширину и стоит
    // выше (z-10) — без этого он перехватывал бы мышь и палец.
    <nav
      aria-label="Страницы услуг"
      className={`pointer-events-auto relative z-20 flex h-10 w-full items-start justify-center transition-opacity duration-300 sm:h-14 sm:items-center lg:absolute lg:left-1/2 lg:top-[var(--sat)] lg:h-[70px] lg:w-auto lg:-translate-x-1/2 land:absolute land:left-1/2 land:top-0 land:h-10 land:w-auto land:-translate-x-1/2 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div ref={rowRef} className="relative flex items-center gap-1 sm:gap-3 lg:gap-4 land:gap-2">
        {serviceOrder.map((k, i) => {
          const href = hrefOf(k);
          const isCurrent = i === current;
          return (
            <Link
              key={k}
              href={href}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              prefetch
              aria-current={i === home && onTop ? "page" : undefined}
              aria-label={serviceMeta[k].label}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                // Название текущей страницы — к её первому блоку.
                if (i === home && onTop) {
                  scrollToDeckStart();
                  return;
                }
                setPending({ from: pathname, to: i });
                // Со страницы-колоды переход идёт без прокрутки: общий герой
                // одинаковый, и первая глава новой страницы встаёт ровно туда
                // же (см. queueFirstChapter). С общих страниц — с верха.
                const fromDeck = !!document.querySelector("[data-stage-wrap]");
                queueFirstChapter();
                sureNavigate(router, href, { scroll: !fromDeck });
              }}
              className={`group/pb relative flex h-8 items-center px-2.5 font-display text-[12px] uppercase leading-none tracking-tight text-white transition-opacity duration-200 sm:h-10 sm:px-3 sm:text-[13px] land:h-8 land:text-[12px] ${
                isCurrent ? "opacity-100" : "opacity-90 hover:opacity-100"
              }`}
            >
              {SHORT[k]}
              {/* Подсказка о цвете страницы при наведении: тонкая линия
                  в её градиенте. */}
              {!isCurrent && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-2 bottom-0.5 h-px opacity-0 transition-opacity duration-200 [@media(hover:hover)]:group-hover/pb:opacity-70"
                  style={{
                    background: `linear-gradient(90deg, ${PAGE_GRADIENT[k].from}, ${PAGE_GRADIENT[k].to})`,
                    WebkitMaskImage: LINE_MASK,
                    maskImage: LINE_MASK,
                  }}
                />
              )}
            </Link>
          );
        })}

        {/* Одна общая линия со светом — переезжает под выбранное название. */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-[-14px] left-0 h-[18px] ${
            animate ? "transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]" : ""
          } motion-reduce:transition-none ${line ? "opacity-100" : "opacity-0"}`}
          style={{
            width: line?.width ?? 0,
            transform: `translateX(${line?.left ?? 0}px)`,
          }}
        >
          <span
            className="absolute inset-0 opacity-70"
            style={{
              background: pageGrad,
              WebkitMaskImage: GLOW_MASK,
              maskImage: GLOW_MASK,
              WebkitMaskComposite: "source-in",
              maskComposite: "intersect",
            }}
          />
          <span
            className="absolute inset-x-0 top-0 h-[1.5px]"
            style={{ background: pageGrad, WebkitMaskImage: LINE_MASK, maskImage: LINE_MASK }}
          />
        </span>
      </div>
    </nav>
  );
}
