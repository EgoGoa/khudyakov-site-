"use client";

import Link from "next/link";
import CabinetWindow, { openCabinet } from "@/components/cabinet/CabinetWindow";
import LiveBrandWord from "@/components/layout/LiveBrandWord";
import SoundStation, { openSoundStation } from "@/components/layout/SoundStation";
import PageBar from "@/components/layout/PageBar";
import { useCleanPathname } from "@/lib/use-clean-pathname";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import { CloseIcon, MenuIcon, PhoneIcon, TelegramIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { PAGE_GRADIENT } from "@/components/home/PageSideNav";
import { homeOf } from "@/components/layout/PageBar";
import { serviceOrder } from "@/lib/service-content";
import { useFullpage } from "@/lib/fullpage";
import { useHeaderMenu } from "@/lib/header-menu";
import { useCinematicGoTo } from "@/lib/cinematic-nav";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { openWelcome } from "@/lib/welcome-gate";
import { CROSS_PAGE_ITEMS, PAGE_BLOCKS } from "@/components/layout/page-sections";
import SectionIcon from "@/components/ui/SectionIcon";
import { SearchGlyph } from "@/components/layout/SiteSearch";
import { openSearch } from "@/lib/site-search";

// on /content, /ai, /sites, /smm the section anchors are that page's own —
// jumping there should stay on whichever one you're already viewing
// instead of bouncing to the default service
const landingSlugs = ["content", "ai", "sites", "smm"];

/** Логотип: точка + HUD.SERVICE. Слоган «DIGITAL AI CREATIVE» Егор пока
 *  убрал — сначала стоял справа за чертой, потом под логотипом, и в итоге
 *  решено оставить только основной текст. */
function BrandLockup() {
  return (
    <span className="flex items-center gap-2 sm:gap-2.5">
      <span className="h-2 w-2 shrink-0 animate-pulse-rec rounded-full brand-dot sm:h-2.5 sm:w-2.5" />
      <span className="whitespace-nowrap font-display text-[clamp(1.1rem,3.2vw,1.4rem)] land:!text-[0.9rem] uppercase tracking-tight">
        {/* На телефоне — только «HUD» (Егор, 2026-10-09): рядом в той же
            строке стоят четыре раздела. */}
        HUD<span className="hidden sm:inline land:!inline"><LiveBrandWord>.SERVICE</LiveBrandWord></span>
      </span>
    </span>
  );
}

export default function Header() {
  const pathname = useCleanPathname();
  const isHome = pathname === "/";
  const isLanding = landingSlugs.includes(pathname.replace(/^\//, ""));
  const api = useFullpage();
  const cinematicGoTo = useCinematicGoTo();
  const fullpageActive = isHome && (api?.ready ?? false);
  const [scrolled, setScrolled] = useState(false);
  const { menuOpen, setMenuOpen } = useHeaderMenu();
  // Цвет света у активного пункта меню — градиент услуги этой страницы.
  const accent = PAGE_GRADIENT[serviceOrder[Math.max(homeOf(pathname), 0)]];
  const [active, setActive] = useState<string>("");
  // Разделы этой страницы направления; вне их — разделы /content (ссылки
  // ведут туда, см. hrefFor).
  const sections = PAGE_BLOCKS[pathname] ?? PAGE_BLOCKS["/content"];
  // Высота шапки — шторка меню встаёт ровно под её нижний край. Меряется
  // живьём: на телефоне бар страниц делает шапку выше, у телефона боком ниже.
  const headerRef = useRef<HTMLElement>(null);
  const [headerH, setHeaderH] = useState(70);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeaderH(el.getBoundingClientRect().height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // On the homepage, navigation is a fullpage slide deck (see
  // src/lib/fullpage.tsx) — there is no real document scroll to watch, so
  // both "has the visitor moved past the first slide" and "which section is
  // current" come from that shared state instead of window.scrollY /
  // IntersectionObserver.
  useEffect(() => {
    if (fullpageActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors the fullpage deck's own state (see comment above), not derivable during this render
      setScrolled((api?.activeIndex ?? 0) > 0);
      setActive(api?.activeId ?? "");
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [fullpageActive, api?.activeIndex, api?.activeId]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useBodyScrollLock(menuOpen);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Non-fullpage routes (or before the slide deck has registered) fall back
  // to plain in-page anchors / IntersectionObserver-free scroll-spy.
  useEffect(() => {
    if (!isLanding || fullpageActive) return;
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isLanding, fullpageActive, sections]);

  const hrefFor = (id: string) => (isLanding ? `#${id}` : `/content#${id}`);

  const navigateTo = (e: React.MouseEvent, id: string) => {
    if (fullpageActive) {
      e.preventDefault();
      api!.goTo(id);
      return;
    }
    // On /content, id is one of CinematicStage's own pinned chapters — a
    // plain `#id` anchor's native scroll-jump gets misread by the deck's own
    // scroll listener as trackpad-momentum overshoot and clamped to one
    // chapter away from the click (see cinematic-nav.tsx). Jumping directly
    // through the deck itself avoids that; on /ai, /sites, /smm (plain
    // scroll, no deck registered) this is a no-op and the anchor's normal
    // browser behaviour below still applies.
    if (cinematicGoTo(id)) {
      e.preventDefault();
    }
  };

  const navigateHome = (e: React.MouseEvent) => {
    // Логотип ведёт к верху сайта и открывает стартовое окно (Егор, 2026-10-04).
    openWelcome();
    if (fullpageActive) {
      e.preventDefault();
      api!.goToIndex(0);
      return;
    }
    // Already on one of the four landing pages: href="/" would still
    // navigate (redirecting straight back to /content), remounting the
    // whole page — video, deck state, everything — just to land back where
    // "top of this page" would have done. An instant scroll reset gets to
    // the same place without any of that, and without the animated
    // scroll-through-the-page a route change produces.
    if (isLanding) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  return (
    <>
      {/* ЗАКРЕПЛЕНО: по этой полосе Safari на iOS 26 красит зону под своей
          адресной строкой (globals.css, «зоны под панелями Safari»). */}
      <div className="safari-top-tint" aria-hidden="true" />
      {/* Затемнение страницы под шапкой и шторкой; сама шапка поверх него
          не тускнеет. Тап — закрыть меню. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.button
            key="scrim"
            type="button"
            aria-label="Закрыть меню"
            onClick={() => setMenuOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 cursor-default bg-ink/40"
          />
        )}
      </AnimatePresence>
    <header
      ref={headerRef}
      data-site-header
      // Под вырезом телефона (режим приложения) стекло шапки продолжается:
      // полоса времени и острова — её размытое продолжение, без элементов.
      style={{ paddingTop: "var(--sat)" }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 land:pointer-events-none land:!border-transparent land:!bg-transparent land:!backdrop-blur-none land:before:pointer-events-none land:before:absolute land:before:inset-x-0 land:before:top-0 land:before:h-16 land:before:content-[''] land:before:bg-[linear-gradient(to_bottom,rgba(11,11,16,0.78),rgba(11,11,16,0.6)_30%,rgba(11,11,16,0.28)_65%,rgba(11,11,16,0))] ${
        "header-glass"
      }`}
    >
      <span className="header-top-mask" aria-hidden="true" />
      <Container className="relative z-10 flex h-14 items-center justify-between sm:h-[70px] land:h-10">
        <Link
          href="/"
          onClick={navigateHome}
          className="flex shrink-0 items-center gap-2 py-2 land:pointer-events-auto land:py-0 land:opacity-80 font-display uppercase leading-none tracking-[0.08em] text-paper transition active:scale-[0.97] sm:gap-2.5"
        >
          <BrandLockup />
        </Link>

        {/* Телефон боком (Егор, 2026-10-04): кнопки шапки встают вертикальной
            колонкой у правого края — меню сверху, ниже плеер и кабинет, —
            чтобы дотягиваться большим пальцем. Колонка лежит поверх страницы
            и не отнимает у неё ширину. */}
        <div className="header-tools flex shrink-0 items-center gap-3 sm:gap-4">
          <a
            href="tel:+79925111812"
            aria-label="Позвонить: +7 992 511-18-12"
            title="+7 992 511-18-12"
            // Только значок, без номера (просьба Егора): номер остаётся в
            // aria-label и всплывает подсказкой при наведении.
            className="hidden items-center text-paper/80 transition-colors hover:text-paper sm:inline-flex land:!hidden"
          >
            <PhoneIcon className="icon-neon-pulse text-glow" />
          </a>

          {/* Личный кабинет: иконка с цифрой новых рекомендаций команды;
              само окно кабинета смонтировано здесь же, чтобы открываться
              с любой страницы. */}
          {/* Станция HDKV: звук сайта и музыка по настроению (lib/sound). */}
          {/* Плеер и кабинет живут в меню (плитки сверху шторки) на всех
              экранах (Егор, 2026-10-10). */}
          <div className="hidden items-center gap-3 sm:flex sm:gap-4 land:!flex land:flex-col land:gap-0.5">
            {/* Поиск по сайту (⌘/Ctrl+K). На телефоне стоя лупа живёт в
                острове внизу экрана, здесь — компьютер и телефон боком. */}
            <button
              type="button"
              onClick={openSearch}
              aria-label="Поиск по сайту"
              title="Поиск · Ctrl+K"
              className="hidden h-9 w-9 items-center justify-center text-paper/75 transition-colors hover:text-paper lg:inline-flex land:!inline-flex land:pointer-events-auto land:h-8 land:w-8 land:text-paper/55"
            >
              <SearchGlyph className="h-[19px] w-[19px]" />
            </button>
            {/* Плеер и кабинет — только в меню (Егор, 2026-10-10); здесь
                смонтированы скрыто ради окна плеера (оно порталом в body). */}
            <span className="hidden">
              <SoundStation />
            </span>
          </div>
          <CabinetWindow />

          <div className="relative land:ml-auto land:pointer-events-auto">
            <motion.button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
              whileTap={{ scale: 0.9 }}
              // No disc behind the glyph any more (Egor's call): the circle —
              // border, translucent fill and its own backdrop-blur — was more
              // chrome than a three-line icon needs, and it read as a heavier
              // control than the wordmark opposite it. The button keeps the
              // same 40/44px box so the tap target is unchanged; only the
              // decoration is gone, with hover moving from a filling disc to
              // the glyph itself brightening.
              className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center text-paper/80 transition-colors duration-150 hover:text-paper sm:h-11 sm:w-11 land:text-paper/55"
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </motion.button>

          </div>
        </div>
      </Container>

      {/* Бар страниц — на всех страницах (просьба Егора). На телефоне — в
          строке логотипа между «HUD» и меню, на планшете — второй строкой,
          на десктопе и у телефона боком — по центру шапки. Логотип и иконки
          на это время уходят по углам: подпись у логотипа и телефон
          показываются только там, где им хватает места рядом с баром. */}
      <PageBar />

    </header>
      {/* Меню — шторка из-под шапки (вариант A, выбор Егора 2026-09-26).
          Шапка при этом не меняется: шторка выезжает снизу из-под неё тем же
          (живёт рядом с шапкой, а не внутри: у шапки свой backdrop-filter, и
          вложенное стекло размывало бы только её саму, а не страницу)
          матовым стеклом (.header-glass) и раскрывается сверху вниз
          (clip-path), а не падает отдельной панелью. На компьютере — три
          колонки: разделы страницы, страницы, связь; на телефоне — одна.
          Шрифт и свет у активного пункта — как в баре страниц. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            key="drawer"
            aria-label="Меню"
            initial={{ clipPath: "inset(0 0 100% 0 round 0 0 28px 28px)", opacity: 0.6 }}
            animate={{ clipPath: "inset(0 0 0% 0 round 0 0 28px 28px)", opacity: 1 }}
            exit={{ clipPath: "inset(0 0 100% 0 round 0 0 28px 28px)", opacity: 0.6 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="header-glass fixed inset-x-0 z-[49] overflow-y-auto rounded-b-[28px]"
            style={{ top: headerH, maxHeight: `calc(100dvh - ${headerH}px - 1rem)`, "--g-from": accent.from, "--g-to": accent.to } as React.CSSProperties}
          >
            <Container className="grid gap-8 py-7 sm:py-8 lg:grid-cols-[1.25fr_1fr_1fr] lg:gap-14">
              <div className="-mb-3 grid max-w-md grid-cols-2 gap-2.5 lg:col-span-3">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openSoundStation();
                  }}
                  className="menu-tile font-display"
                >
                  <SectionIcon name="music" size={18} />
                  Музыка
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openCabinet();
                  }}
                  className="menu-tile font-display"
                >
                  <SectionIcon name="cabinet" size={18} />
                  Кабинет
                </button>
              </div>
              <div>
                <p className="menu-kicker font-display">На этой странице</p>
                <div className="grid sm:grid-cols-2 sm:gap-x-8">
                  {sections.map((s, i) => (
                    <Link
                      key={s.id}
                      href={hrefFor(s.id)}
                      onClick={(e) => {
                        navigateTo(e, s.id);
                        setMenuOpen(false);
                      }}
                      className={`menu-item ${active === s.id ? "is-active" : ""}`}
                      style={{ "--i": i } as React.CSSProperties}
                    >
                      <SectionIcon name={s.icon} size={20} />
                      <span className="menu-label font-display">{s.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="menu-kicker font-display">Страницы</p>
                {CROSS_PAGE_ITEMS.map((p, i) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    onClick={() => setMenuOpen(false)}
                    className={`menu-item ${pathname === p.href ? "is-active" : ""}`}
                    style={{ "--i": sections.length + i } as React.CSSProperties}
                  >
                    <SectionIcon name={p.icon} size={20} />
                    <span className="menu-label font-display">{p.label}</span>
                  </Link>
                ))}
              </div>
              <div>
                <p className="menu-kicker font-display">Связаться</p>
                <p className="text-sm leading-relaxed text-paper">
                  Расскажите задачу — ответим в течение 15 минут и предложим 2–3 решения.
                </p>
                <div className="mt-5 flex items-center gap-2.5">
                  <Link href="/brief" onClick={() => setMenuOpen(false)} className="menu-cta font-display">
                    Обсудить проект →
                  </Link>
                  <a href="https://t.me/hdkv" target="_blank" rel="noopener noreferrer" aria-label="Написать в Telegram" className="menu-round">
                    <TelegramIcon className="h-[18px] w-[18px]" />
                  </a>
                  <a href="https://wa.me/79925111812" target="_blank" rel="noopener noreferrer" aria-label="Написать в WhatsApp" className="menu-round">
                    <WhatsAppIcon className="h-[18px] w-[18px]" />
                  </a>
                </div>
              </div>
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
