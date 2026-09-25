"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useCleanPathname } from "@/lib/use-clean-pathname";
import { serviceMeta, serviceOrder, type ServiceKey } from "@/lib/service-content";
import { PAGE_GRADIENT } from "@/components/home/PageSideNav";
import { blurAt, fanSlots, modIndex, poseAt, useDeckDrag, useDeckSpring, wrapOffset, zFor } from "@/components/ui/deckFan";

// Бар страниц в шапке: четыре страницы услуг маленькой колодой на механике
// deckFan (как карусели /ai, /sites, /smm). После правок Егора 2026-09-26 от
// карточек остались только названия: без стекла, рамок и фона. Выбранная
// страница крупно по центру со светом в её градиенте под буквами, соседи —
// одним коротким словом по бокам, крайние скрыты.
//
// Сверху к механике колод добавлен горизонтальный свайп трекпадом и стрелки
// клавиатуры.
//
// Активную страницу задаёт адрес. Бар сам ведёт на выбранную страницу после
// короткой паузы (чтобы быстрый бросок через две страницы не открывал
// промежуточную), а переход не из бара — боковые стрелки, «назад» в
// браузере — подтягивает колоду к адресу.

// Названия — строго, как логотип «HUD.SERVICE»: первое слово белое, второе
// в градиенте своей страницы. Без свечения (просьба Егора).
const LABEL: Record<ServiceKey, [string, string]> = {
  content: ["Создание", "контента"],
  ai: ["AI", "решения"],
  sites: ["Vibe", "сайты"],
  smm: ["SMM", "продвижение"],
};

// У соседей одно короткое слово в градиенте страницы: полное название
// наезжало на выбранное («…здание контента»).
const SHORT: Record<ServiceKey, string> = {
  content: "Контент",
  ai: "AI",
  sites: "Сайты",
  smm: "SMM",
};

// Позы в духе колоды /sites (SitesDeck) под карточку 180×34: выбранная по
// центру, соседи по бокам чуть мельче и размытее, названия сдвинуты наружу
// (shift), чтобы не наезжать на выбранное. Макетные пиксели, рельса 480.
const FAN: Record<number, { x: number; scale: number; opacity: number; label: number; shift: number }> = {
  [-3]: { x: -172, scale: 0.5, opacity: 0, label: 0, shift: -60 },
  [-2]: { x: -160, scale: 0.6, opacity: 0, label: 0, shift: -56 },
  [-1]: { x: -100, scale: 0.8, opacity: 1, label: 0.9, shift: -62 },
  [0]: { x: 0, scale: 1.05, opacity: 1, label: 1, shift: 0 },
  [1]: { x: 100, scale: 0.8, opacity: 1, label: 0.9, shift: 62 },
  [2]: { x: 160, scale: 0.6, opacity: 0, label: 0, shift: 56 },
  [3]: { x: 172, scale: 0.5, opacity: 0, label: 0, shift: 60 },
}

// Видны только передняя и две соседние: крайние (|2|) убраны (просьба
// Егора). Уходящая при листании карточка гаснет к внешнему краю.
const edgeFade = (offset: number): CSSProperties => {
  const t = Math.max(0, Math.min(1, Math.abs(offset) - 2));
  if (t === 0) return {};
  const mask = `linear-gradient(${offset > 0 ? "to right" : "to left"}, #000 ${70 - 10 * t}%, rgba(0,0,0,${1 - 0.6 * t}) 100%)`;
  return { WebkitMaskImage: mask, maskImage: mask };
};

// Размытие глубины на названиях соседей.
const BLUR_BOOST = 0.4;

// Сколько макетных пикселей рука проходит на одну карточку.
const SPACING = 100;

// Свет под выбранным: линия 2px, под ней затухание вниз; по горизонтали ярче
// всего в центре.
const UNDERGLOW_MASK =
  "linear-gradient(to bottom, #000 0 2px, rgba(0,0,0,0.75) 2px, transparent 100%), linear-gradient(90deg, transparent, rgba(0,0,0,0.35) 20%, #000 50%, rgba(0,0,0,0.35) 80%, transparent)";

const COUNT = serviceOrder.length;
// Пауза перед переходом на выбранную страницу.
const NAV_DELAY_MS = 280;


export default function PageBar({ hidden = false }: { hidden?: boolean }) {
  const pathname = useCleanPathname();
  const router = useRouter();
  const current = serviceOrder.findIndex((k) => `/${serviceMeta[k].slug}` === pathname);

  // `active` считается без свёртки по модулю — см. fanSlots.
  const [active, setActive] = useState(Math.max(current, 0));
  const step = useCallback((delta: number) => setActive((prev) => prev + delta), []);
  const goTo = useCallback(
    (target: number) => setActive((prev) => prev + wrapOffset(target - modIndex(prev, COUNT), COUNT)),
    [],
  );

  const { drag, dragging, bind } = useDeckDrag({ count: COUNT, spacing: SPACING, onSettle: step });
  const { lag, moving } = useDeckSpring(active, drag, dragging);
  const live = dragging || moving;

  // Страницу, на которую бар сам только что повёл, не надо «догонять»: пока
  // адрес меняется, рука могла уже шагнуть дальше.
  const pushed = useRef<number | null>(null);

  useEffect(() => {
    if (current < 0) return;
    if (pushed.current === current) {
      pushed.current = null;
      return;
    }
    goTo(current);
  }, [current, goTo]);

  const chosen = modIndex(active, COUNT);
  useEffect(() => {
    if (current < 0 || chosen === current || dragging) return;
    const t = window.setTimeout(() => {
      pushed.current = chosen;
      router.push(`/${serviceMeta[serviceOrder[chosen]].slug}`);
    }, NAV_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [chosen, current, dragging, router]);

  useEffect(() => {
    serviceOrder.forEach((k) => router.prefetch(`/${serviceMeta[k].slug}`));
  }, [router]);

  // Горизонтальный свайп двумя пальцами по трекпаду (или колесо с Shift).
  // Вертикальная прокрутка над баром остаётся странице.
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rail = wrapRef.current;
    if (!rail) return;
    let acc = 0;
    let lockUntil = 0;
    const onWheel = (e: WheelEvent) => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!dx) return;
      e.preventDefault();
      e.stopPropagation();
      const now = performance.now();
      // Хвост инерции трекпада после шага не должен листать дальше.
      if (now < lockUntil) return;
      acc += dx;
      if (Math.abs(acc) > 30) {
        step(acc > 0 ? 1 : -1);
        acc = 0;
        lockUntil = now + 450;
      }
    };
    rail.addEventListener("wheel", onWheel, { passive: false });
    return () => rail.removeEventListener("wheel", onWheel);
  }, [step]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    e.stopPropagation();
    step(e.key === "ArrowRight" ? 1 : -1);
  };

  if (current < 0) return null;

  return (
    <nav
      aria-label="Страницы услуг"
      className={`pointer-events-auto relative flex h-14 w-full items-center justify-center transition-opacity duration-300 lg:absolute lg:left-1/2 lg:top-0 lg:h-20 lg:w-[480px] lg:-translate-x-1/2 land:absolute land:left-1/2 land:top-0 land:h-10 land:w-[480px] land:-translate-x-1/2 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div ref={wrapRef} className="w-[480px] shrink-0 scale-[0.78] sm:scale-100 land:!scale-[0.8]">
        <div
          {...bind}
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="deck-rail relative h-12 select-none outline-none [-webkit-user-drag:none] focus-visible:rounded-2xl focus-visible:ring-1 focus-visible:ring-paper/30"
          style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "pan-y" }}
        >
          {fanSlots(COUNT, active, drag + lag, 3).map(({ i, key, offset, settled }) => {
            const pageKey = serviceOrder[i];
            const g = PAGE_GRADIENT[pageKey];
            const pose = poseAt(FAN, offset);
            const opacity = pose.opacity * pose.fade;
            const blurPx = blurAt(offset) * BLUR_BOOST;
            // Название видно на каждой карточке, тусклее с глубиной, и
            // сдвинуто к открытому краю карточки — из-за соседа видно слово,
            // а не обрубок. Под стеклом передней оно мягко размыто.
            const captionOpacity = pose.label;
            const isFront = settled === 0;
            // Полное название — у центра, короткое — к бокам; перетекают.
            const d = Math.abs(offset);
            const fullO = Math.max(0, Math.min(1, 1 - d * 1.6));
            const shortO = Math.max(0, Math.min(1, (d - 0.35) * 1.6));
            const textGrad: CSSProperties = {
              backgroundImage: `linear-gradient(90deg, ${g.from}, ${g.to})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
            };
            const fade = live ? "" : "transition-opacity duration-[760ms] ease-[cubic-bezier(0.45,0.05,0.2,1)]";

            return (
              <div
                key={key}
                // Без стекла, рамок и фона (просьба Егора): от карточки
                // остались только название и свет под выбранным.
                className={`group/card deck-pose absolute left-1/2 top-1/2 h-[34px] w-[180px] ease-[cubic-bezier(0.45,0.05,0.2,1)] motion-reduce:transition-none ${
                  live ? "transition-[filter] duration-[420ms]" : "transition-[transform,opacity,filter] duration-[760ms]"
                }`}
                style={{
                  zIndex: zFor(offset),
                  ...edgeFade(offset),
                  opacity,
                  pointerEvents: opacity < 0.05 ? "none" : undefined,
                  transform: `translate(-50%, -50%) translateX(${pose.x}px) scale(${pose.scale})`,
                }}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  aria-current={isFront ? "page" : undefined}
                  aria-label={serviceMeta[pageKey].label}
                  onClick={() => (isFront ? window.scrollTo({ top: 0, behavior: "instant" }) : goTo(i))}
                  className={`absolute inset-0 ${isFront ? "" : "cursor-pointer"}`}
                >
                  <span
                    className={`flex h-full items-center justify-center ${fade} ${
                      live ? "" : "[transition-property:opacity,filter]"
                    }`}
                    style={{
                      opacity: captionOpacity,
                      transform: `translateX(${pose.shift}px)`,
                      filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
                    }}
                  >
                    {/* Полное и короткое название лежат друг на друге и
                        перетекают по расстоянию до центра, а размер везде
                        один — крупнее или мельче их делает масштаб карточки.
                        Так при листании нет рывка ни в тексте, ни в размере. */}
                    <span className="grid place-items-center font-display text-[15px] uppercase leading-none tracking-tight text-white [&>*]:[grid-area:1/1]">
                      <span className={`relative whitespace-nowrap ${fade}`} style={{ opacity: fullO }}>
                        {/* Выбранная страница «нажата» (просьба Егора): сразу
                            под буквами ровная светлая линия в градиенте
                            страницы, и от неё свет мягко стекает вниз.
                            Насыщеннее всего по центру, к краям гаснет. */}
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -inset-x-3 top-[calc(100%+3px)] h-[14px]"
                          style={{
                            background: `linear-gradient(90deg, ${g.from}, ${g.to})`,
                            // Ярче и насыщеннее самих цветов страницы.
                            filter: "saturate(2) brightness(1.25)",
                            WebkitMaskImage: UNDERGLOW_MASK,
                            maskImage: UNDERGLOW_MASK,
                            WebkitMaskComposite: "source-in",
                            maskComposite: "intersect",
                          }}
                        />
                        {LABEL[pageKey][0]}{" "}
                        <span style={textGrad}>{LABEL[pageKey][1]}</span>
                      </span>
                      <span className={`relative whitespace-nowrap ${fade}`} style={{ opacity: shortO }}>
                        {/* Соседи подчёркнуты просто волосяной линией в цвете
                            своей страницы, растворяющейся к краям (просьба
                            Егора). */}
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -inset-x-3 top-[calc(100%+3px)] h-px opacity-85"
                          style={{
                            background: `linear-gradient(90deg, ${g.from}, ${g.to})`,
                            WebkitMaskImage: "linear-gradient(90deg, transparent, #000 50%, transparent)",
                            maskImage: "linear-gradient(90deg, transparent, #000 50%, transparent)",
                          }}
                        />
                        <span style={textGrad}>{SHORT[pageKey]}</span>
                      </span>
                    </span>
                  </span>
                </button>

                {/* Подсказка при наведении на боковую карточку (просьба
                    Егора): полное название страницы маленькой таблеткой под
                    ней. Только там, где есть наведение мышью; при листании
                    прячется. */}
                {!isFront && !live && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-full z-30 mt-1 -translate-x-1/2 translate-y-[-3px] whitespace-nowrap rounded-full bg-[#0b0b10]/80 px-3 py-1.5 font-display text-[12px] uppercase leading-none tracking-tight text-white opacity-0 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-[opacity,transform] duration-200 ease-out [@media(hover:hover)]:group-hover/card:translate-y-0 [@media(hover:hover)]:group-hover/card:opacity-100"
                  >
                    {LABEL[pageKey][0]}{" "}
                    <span
                      style={{
                        backgroundImage: `linear-gradient(90deg, ${g.from}, ${g.to})`,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {LABEL[pageKey][1]}
                    </span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
