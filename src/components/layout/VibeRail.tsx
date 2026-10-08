"use client";

import { CHAPTER_EVENT, currentChapterId } from "@/lib/page-hop";
import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";
import { BOOT, useBootStage } from "@/lib/boot-sequence";
import { useCleanPathname } from "@/lib/use-clean-pathname";
import { AnimatePresence, motion } from "framer-motion";
import { WIN_DIM } from "@/lib/motion";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useHeaderMenu } from "@/lib/header-menu";
import { useCinematicGoTo } from "@/lib/cinematic-nav";
import WelcomeWidget from "@/components/home/WelcomeWidget";
import CenterModal from "@/components/ui/CenterModal";
import NanoSphere from "@/components/ui/NanoSphere";
import SphereDust from "@/components/ui/SphereDust";
import { OPEN_VIBE_EVENT } from "@/lib/voice/store";
import { canOfferInstall, openInstall, useInstallMode } from "@/lib/pwa";
import VibeMode from "@/components/vibe/VibeMode";
import BlockVibe from "@/components/vibe/BlockVibe";
import { OPEN_BLOCK_VIBE_EVENT } from "@/lib/block-vibe";
import { useRouter } from "next/navigation";
import { PAGE_GRADIENT } from "@/components/home/PageSideNav";
import { homeOf } from "@/components/layout/PageBar";
import { serviceOrder } from "@/lib/service-content";
import SectionIcon from "@/components/ui/SectionIcon";
import { CROSS_PAGE_ITEMS, PAGE_BLOCKS, type RailItem } from "@/components/layout/page-sections";

// Standalone routes where the whole page *is* one rail item — no in-page
// anchor to scroll-spy, the URL alone decides it.
const PAGE_ACTIVE_ID: Record<string, string> = {
  "/works": "catalog",
  "/calculator": "calculator",
  "/brief": "brief",
};

// Tracks whichever of `anchorIds` is currently on screen, re-running its
// IntersectionObserver whenever the id list changes (i.e. on every route
// change between /content, /ai, /sites, /smm, each with its own block set).
// The cinematic deck on /content and the plain-scroll layout on /ai, /sites,
// /smm both end up with one real DOM element per id at the right scroll
// position — CinematicStage's own runway divs for the former, each
// section's own `id=` for the latter — so the exact same technique
// (same rootMargin) covers both without knowing which one it's on.
function useActiveRailId(anchorIds: string[]): string {
  const pathname = useCleanPathname();
  const [activeId, setActiveId] = useState("");
  const anchorKey = anchorIds.join(",");

  useEffect(() => {
    const pageMatch = PAGE_ACTIVE_ID[pathname];
    if (pageMatch) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fixed id for pages with no scroll-spy anchors, not derivable during this render
      setActiveId(pageMatch);
      return;
    }
    // Текущая глава — от самой колоды (lib/page-hop), а не по слежке за
    // видимостью блоков: при перелёте через несколько глав слежка
    // подсвечивала все промежуточные, и бар «прыгал» не по порядку (Егор,
    // 2026-09-28). Пока колода не на экране (посетитель на общем герое или
    // блоке с рукой), не подсвечено ничего.
    const deckOnScreen = () => {
      const wrap = document.querySelector<HTMLElement>("[data-stage-wrap]");
      if (!wrap) return false;
      const r = wrap.getBoundingClientRect();
      return r.top <= window.innerHeight * 0.5 && r.bottom >= window.innerHeight * 0.5;
    };
    const sync = () => {
      const id = currentChapterId();
      setActiveId(id && anchorIds.includes(id) && deckOnScreen() ? id : "");
    };
    sync();
    window.addEventListener(CHAPTER_EVENT, sync);
    window.addEventListener("scroll", sync, { passive: true });
    return () => {
      window.removeEventListener(CHAPTER_EVENT, sync);
      window.removeEventListener("scroll", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- anchorKey is anchorIds' stable identity
  }, [pathname, anchorKey]);

  return activeId;
}

// The site-wide "vibe" rail — replaces the old bottom-right "VIBE САЙТ"
// floating button (see FloatingCta, now removed from layout.tsx). Same
// gradient pill, same WelcomeWidget flow, just relocated to the top slot of
// this rail instead of floating alone.
//
// Below it, one row per top-level section of the site (the same set Header's
// desktop nav and burger menu already link to). Clicking a row of this
// page's own blocks glides to that block and opens BlockVibe next to the
// rail — five quick steps that rebuild that one block for the visitor's task
// (see lib/block-vibe). The shared rows (works, calculator, brief) just
// navigate.
//
// Desktop (>=1024px, matching every other lg: breakpoint in the codebase):
// a slim icon-only rail sits on screen at all times; hovering it (or
// focusing a row via keyboard) widens it into a matte, label-bearing panel
// with a soft neon pulse — the same motion idea as a macOS Dock or Arc's
// collapsed sidebar. The whole thing floats on top of the page,
// deliberately: it does not reserve any layout space, the same as the old
// floating CTA button it replaces.
//
// Mobile (<1024px): the rail's hover affordance has no touch equivalent, so
// it collapses to a single round button in the same bottom-right corner the
// old floating CTA used, opening a full-screen matte sheet with the same
// rows instead of expanding in place.

// The rail's labels: plain white, set light and thin.
//
// They used to carry the site-wide magenta→cyan `.kw` gradient, which is the
// right mark for a heading keyword but wrong at 13px in a dense nine-row
// column — the two-colour fill plus its own drop-shadow made every row read
// as a highlight, so nothing in the rail stood out from anything else. Egor
// asked for white and thinner instead, with the colour work moved to where
// it carries meaning: the hover state and the active section's icon.
//
// font-sans (Manrope), not font-display (Unbounded): Unbounded's lightest cut
// in this project is 500, so "thinner" isn't reachable in that face at all —
// Manrope goes to 300, which is what actually makes the row read as a quiet
// label rather than a small heading. Tracking is opened up a little to keep
// the uppercase setting legible at that weight.
// Pure white — and this time actually *rendered* white.
//
// The label was already `color: #fff` at `opacity: 1` while still looking
// washed-out grey on screen, because nothing about the colour was the
// problem. Three things were dimming the paint itself, and all three are
// dealt with here:
//
//   1. `subpixel-antialiased` overrides the `antialiased` that layout.tsx
//      sets on <body>. `-webkit-font-smoothing: antialiased` makes macOS
//      render type visibly thinner; at 12px a light weight's stems come out
//      under a pixel wide, so they can only ever be *partially* covered —
//      and a half-covered white pixel on near-black is, literally, grey. No
//      colour value can fix that; the glyph has to be given real coverage.
//   2. Weight 300 → 500. Same reason: below ~400 there is not enough stem
//      at this size for the screen to paint solid. Manrope 500 still reads
//      far lighter than the display face this replaced, so the rail keeps
//      the thin, quiet look Egor asked for while gaining a stroke the
//      display can actually fill in.
//   3. The dark legibility shadow is gone at rest. It sat directly under
//      the glyph and darkened exactly the antialiased edge pixels that were
//      already only half-covered — a grey fringe around every letter. The
//      rail's own backdrop (a near-opaque rgba(5,5,9,0.86) once expanded)
//      is what separates the text from the footage now, which is what a
//      backdrop is for; the label no longer needs to carry its own.
const RAIL_LABEL_CLASS =
  "shrink-0 whitespace-nowrap font-sans text-[12px] font-medium uppercase leading-none tracking-[0.08em] text-white subpixel-antialiased transition-[opacity,text-shadow] duration-200";

// Hover: the word lights along its own outline. Tight radii (1/3/7px) rather
// than a wide bloom — Egor asked for the glow to trace the lettering itself
// ("по окантовке"), and anything past ~8px stops reading as an edge and
// starts reading as a halo behind the text. Scoped by `group-hover` to the
// row's own button, so only the row actually under the cursor lights up
// while every other label stays plain white.
const RAIL_LABEL_HOVER =
  "group-hover:[text-shadow:0_0_1px_rgba(255,255,255,1),0_0_3px_rgba(255,255,255,0.95),0_0_7px_rgba(255,255,255,0.7)]";

// Пункт «Приложение»: не страница и не блок, а окно установки (lib/pwa).
const INSTALL_ITEM = {
  id: "__install",
  label: "Приложение",
  glyph: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="shrink-0">
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.8" />
      <path d="M12 8v6m0 0-2.4-2.4M12 14l2.4-2.4M10.5 18.5h3" />
    </svg>
  ),
} as const;

// This page's own blocks (own ids, own hrefs) followed by the fixed
// cross-page rows. A page not in PAGE_BLOCKS (e.g. /works itself) just gets
// the cross-page rows, matching the previous single-list behaviour.
function useRailItems(): { pageItems: RailItem[]; crossPageItems: RailItem[]; anchorIds: string[] } {
  const pathname = useCleanPathname();
  const blocks = PAGE_BLOCKS[pathname] ?? [];
  const pageItems = blocks.map((block) => ({ ...block, href: `${pathname}#${block.id}` }));
  return { pageItems, crossPageItems: CROSS_PAGE_ITEMS, anchorIds: blocks.map((b) => b.id) };
}


export default function VibeRail() {
  const { pageItems, crossPageItems, anchorIds } = useRailItems();
  const activeRailId = useActiveRailId(anchorIds);
  const [pickerOpen, setPickerOpen] = useState(false);
  // Сфера открывает вайб-режим (анкета → персональное предложение), а
  // прежний выбор направлений остался ссылкой внутри этого окна.
  // Ссылка с `?vibe=1` (реклама, рассылка, соцсети) открывает окно сразу.
  const [vibeOpen, setVibeOpen] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("vibe")
  );

  // Голосовой ассистент: «подбери мне предложение» открывает вайб-режим.
  useEffect(() => {
    const open = () => setVibeOpen(true);
    window.addEventListener(OPEN_VIBE_EVENT, open);
    return () => window.removeEventListener(OPEN_VIBE_EVENT, open);
  }, []);
  const [sheetOpen, setSheetOpen] = useState(false);
  // Кружок веера, у которого показана подпись: первый тап по кружку её
  // открывает, второй — ведёт на страницу.
  const [armedId, setArmedId] = useState<string | null>(null);
  useEffect(() => {
    if (!sheetOpen) setArmedId(null);
  }, [sheetOpen]);
  // Сфера и её частицы — этап `sphere` очереди загрузки (lib/boot-sequence):
  // собираются после первого экрана и блоков, меню под ней — следом.
  const sphereOn = useBootStage(BOOT.sphere);
  const crownRef = useRef<HTMLButtonElement>(null);
  const fanOrbRef = useRef<HTMLButtonElement>(null);
  // Vibe-блок (Егор, 2026-09-27): клик по разделу страницы едет к блоку и
  // открывает рядом с баром окошко «персонализировать этот блок».
  const [blockItem, setBlockItem] = useState<RailItem | null>(null);
  const cinematicGoTo = useCinematicGoTo();
  const router = useRouter();
  const installMode = useInstallMode();
  const showInstall = canOfferInstall(installMode);
  // Header's desktop burger dropdown lives in roughly the same top-right
  // corner of the screen — stepping the rail out of the way while it's open
  // is simpler and more robust than trying to keep two floating panels from
  // ever overlapping by careful positioning alone.
  const { menuOpen: headerMenuOpen } = useHeaderMenu();
  // Цвет нано-сферы и света активной кнопки — градиент услуги этой страницы.
  const railPath = useCleanPathname();
  const accent = PAGE_GRADIENT[serviceOrder[Math.max(homeOf(railPath), 0)]];

  useBodyScrollLock(pickerOpen || sheetOpen);

  // Общие страницы (работы, калькулятор, бриф) — просто переход. Блок
  // страницы — переезд к нему тем же мостом, что у навигации шапки (иначе
  // колода глав читает прыжок якоря как инерцию и промахивается на главу),
  // и окошко персонализации рядом с баром.
  const openItem = (item: RailItem) => {
    setSheetOpen(false);
    if (!pageItems.some((p) => p.id === item.id)) {
      setBlockItem(null);
      router.push(item.href);
      return;
    }
    if (!cinematicGoTo(item.id)) document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
    setBlockItem(item);
  };

  // «Обсудить этот блок» в собранном блоке.
  useEffect(() => {
    const open = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const item = pageItems.find((p) => p.id === id);
      if (item) setBlockItem(item);
    };
    window.addEventListener(OPEN_BLOCK_VIBE_EVENT, open);
    return () => window.removeEventListener(OPEN_BLOCK_VIBE_EVENT, open);
  }, [pageItems]);

  // Окошко принадлежит странице: при переходе на другую оно закрывается.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- сброс при смене страницы
    setBlockItem(null);
  }, [railPath]);

  return (
    <>
      {/* Desktop rail. The icon column is on screen at all times — hovering
          it (or focusing a row via keyboard) is the only thing that widens
          it into the labelled panel; losing hover collapses it back to
          icons. No border/ring by design, only backdrop-blur over a very
          translucent fill, and a soft neon pulse kicks in only while
          expanded — the panel is meant to read as live, technical surface,
          not a static menu. */}
      {/* Rewritten from a single element animating `width` to a fixed-size
          shell (always 226px — the expanded size) with a separate
          decorative backdrop underneath that reveals via `clipPath`.
          `width` is a layout property: the browser has to reflow every
          frame it changes, and that reflow was running alongside `scale`
          (a transform, GPU-composited, on the *same* element) on a
          *different* duration (0.3s vs width's 0.45s) — two different
          rendering pipelines, arriving at different times, is what read as
          "кривая, дёргается". A fixed-size shell means content never
          reflows at all (rows stay `w-full` of a constant 226px, icons stay
          pinned to its right edge via flex-row-reverse exactly as before —
          the visible "narrow pill" state is just the backdrop showing less
          of that same fixed layout), and the backdrop's own clipPath is
          numeric-interpolated by Motion the same way boxShadow already is
          elsewhere in this file, on one shared duration with scale/opacity
          so the whole rail arrives together instead of in stages. */}
      {/* Вариант C (Егор, 2026-09-26): парящие стеклянные кнопки вместо
          раскрывающейся панели. Наверху — нано-сфера (открывает вайб-окно),
          ниже — разделы страницы и общие страницы, каждая кнопка своим
          матовым стеклом, как шапка. Раздел на экране — крупнее и в кольце
          света цвета страницы; подпись всплывает при наведении. */}
      <nav
        aria-label="Vibe"
        className={`fixed right-2 top-1/2 z-[65] hidden -translate-y-1/2 flex-col items-center gap-1.5 transition-opacity duration-300 lg:flex ${
          headerMenuOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        style={{ "--g-from": accent.from, "--g-to": accent.to } as CSSProperties}
      >
        <button
          type="button"
          onClick={() => setVibeOpen(true)}
          aria-label="Vibe-режим"
          aria-haspopup="dialog"
          className="boot-sphere vibe-bubble vibe-bubble--crown vibe-live mb-1"
          ref={crownRef}
        >
          {/* Сфера собирается той же анимацией, что в вайб-окне (Егор,
              2026-09-27): при загрузке, после стартового окна и на каждой
              новой странице — старая растворяется, новая собирается в цвете
              новой страницы. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={railPath} className="block" exit={{ opacity: 0, scale: 0.7, filter: "blur(4px)" }} transition={{ duration: 0.32, ease: [0.4, 0, 0.6, 1] }}>
              {sphereOn && <NanoSphere size={36} from={accent.from} to={accent.to} soft cloud sleepy intro="implode" hot={vibeOpen || pickerOpen || !!blockItem} />}
            </motion.span>
          </AnimatePresence>
          {/* Частицы от сферы — та же механика, что в стартовом окошке и
              вайб-окне, но реже, медленнее, мельче, тусклее и держатся
              ближе к сфере (Егор, 2026-09-27). */}
          {sphereOn && <SphereDust orbRef={crownRef} sleepy bleed={42} density={0.1} speed={0.35} brightness={0.6} scale={0.8} />}
          <span className="vibe-tip font-display">Vibe</span>
        </button>
        {[...pageItems, ...crossPageItems].map((item, i) => (
          <Fragment key={item.id}>
            {i === pageItems.length && pageItems.length > 0 && <span aria-hidden="true" className="boot-rail my-0.5 h-px w-4 bg-paper/20" style={{ "--boot-i": i } as CSSProperties} />}
            <button
              type="button"
              onClick={() => openItem(item)}
              aria-label={item.label}
              aria-current={item.id === activeRailId ? "true" : undefined}
              // Меню опускается из-под сферы по одной кнопке — этап `rail`
              // очереди загрузки (globals.css, .boot-rail).
              className={`boot-rail vibe-bubble ${item.id === activeRailId ? "is-active" : ""}`}
              style={{ "--boot-i": i } as CSSProperties}
            >
              <SectionIcon name={item.icon} />
              <span className="vibe-tip font-display">
                {item.label}
                {i < pageItems.length && <span className="vibe-tip__cta"> · ✦ Персонализировать</span>}
              </span>
            </button>
          </Fragment>
        ))}
        {showInstall && (
          <button
            type="button"
            onClick={openInstall}
            aria-label={INSTALL_ITEM.label}
            className="boot-rail vibe-bubble"
            style={{ "--boot-i": pageItems.length + crossPageItems.length } as CSSProperties}
          >
            {INSTALL_ITEM.glyph}
            <span className="vibe-tip font-display">{INSTALL_ITEM.label}</span>
          </button>
        )}
      </nav>

      {/* Телефон (Егор, 2026-09-27): сфера в правом нижнем углу. Тап — над
          ней одна за другой вылетают круглые кнопки разделов, самая верхняя —
          Vibe-режим (открывает вайб-окно по центру). Повторный тап по сфере
          или тап мимо — кнопки складываются обратно в сферу. Кружки в
          полтора раза мельче десктопных, но зона нажатия у каждого 40px.
          Подписи скрыты: тап по кружку показывает его подпись, второй тап
          по нему — переход (Егор, 2026-09-27). */}
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            key="vibe-fan-dim"
            aria-hidden="true"
            className="vibe-fan-dim lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSheetOpen(false)}
          />
        )}
      </AnimatePresence>
      <div
        className="vibe-fan lg:hidden"
        style={{ "--g-from": accent.from, "--g-to": accent.to } as CSSProperties}
      >
        <button
          type="button"
          onClick={() => setSheetOpen((o) => !o)}
          aria-haspopup="true"
          aria-expanded={sheetOpen}
          aria-label={sheetOpen ? "Свернуть меню" : "Vibe меню"}
          className="boot-sphere vibe-fan__orb vibe-live"
          ref={fanOrbRef}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={railPath} className="block" exit={{ opacity: 0, scale: 0.7, filter: "blur(4px)" }} transition={{ duration: 0.32, ease: [0.4, 0, 0.6, 1] }}>
              {sphereOn && <NanoSphere size={48} from={accent.from} to={accent.to} sleepy hot={sheetOpen || vibeOpen || pickerOpen || !!blockItem} cloud intro="implode" />}
            </motion.span>
          </AnimatePresence>
          {sphereOn && <SphereDust orbRef={fanOrbRef} sleepy bleed={78} density={0.12} speed={0.5} scale={1} />}
        </button>
        <AnimatePresence>
          {sheetOpen && (
            <motion.nav
              key="vibe-fan-list"
              aria-label="Vibe меню"
              className="vibe-fan__list"
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: { transition: { staggerChildren: 0.035 } },
                closed: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
              }}
            >
              {[
                { id: "__vibe", label: "Vibe-режим", glyph: null, vibe: true } as const,
                ...pageItems.map((item) => ({ ...item, vibe: false as const })),
                ...crossPageItems.map((item) => ({ ...item, vibe: false as const })),
                ...(showInstall ? [{ ...INSTALL_ITEM, vibe: false as const }] : []),
              ].map((item, i, all) => (
                <motion.button
                  key={item.id}
                  type="button"
                  variants={{
                    closed: { opacity: 0, y: 26 + i * 4, scale: 0.4 },
                    open: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 520, damping: 30 } },
                  }}
                  onClick={() => {
                    if (armedId !== item.id) {
                      setArmedId(item.id);
                      return;
                    }
                    setSheetOpen(false);
                    if (item.vibe) setVibeOpen(true);
                    else if (item.id === INSTALL_ITEM.id) openInstall();
                    else openItem(item as RailItem);
                  }}
                  aria-label={item.label}
                  aria-current={!item.vibe && item.id === activeRailId ? "true" : undefined}
                  className={`vibe-fan__btn${item.vibe ? " vibe-fan__btn--vibe" : ""}${
                    !item.vibe && item.id === activeRailId ? " is-active" : ""
                  }${armedId === item.id ? " is-armed" : ""}`}
                >
                  <span className="vibe-fan__label font-display">{item.label}</span>
                  <span className="vibe-fan__dot">{item.vibe ? <span className="vibe-fan__spark">✦</span> : "icon" in item ? <SectionIcon name={item.icon} /> : item.glyph}</span>
                </motion.button>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      {/* Окошко «персонализировать этот блок» рядом с баром */}
      <AnimatePresence>
        {blockItem && (
          <motion.div
            key="block-vibe-dim"
            aria-hidden="true"
            className="block-vibe-dim"
            initial={WIN_DIM.initial}
            animate={WIN_DIM.animate}
            exit={WIN_DIM.exit}
            // Клик по сайту за окошком закрывает его, как у всех окон.
            onClick={() => setBlockItem(null)}
          />
        )}
        {blockItem && (
          <BlockVibe
            key={blockItem.id}
            path={railPath}
            blockId={blockItem.id}
            label={blockItem.label}
            onClose={() => setBlockItem(null)}
            onShowBlock={() => cinematicGoTo(blockItem.id)}
          />
        )}
      </AnimatePresence>

      <VibeMode open={vibeOpen} onClose={() => setVibeOpen(false)} onPickDirection={() => setPickerOpen(true)} />

      {/* Top "Vibe" row — the greeting / direction-picker widget, relocated
          verbatim from the old floating button. */}
      <CenterModal open={pickerOpen} onClose={() => setPickerOpen(false)} ariaLabel="Выбор направления" bare>
        <WelcomeWidget onClose={() => setPickerOpen(false)} skipGreeting />
      </CenterModal>
    </>
  );
}
