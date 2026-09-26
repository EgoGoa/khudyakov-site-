"use client";

import Link from "next/link";
import CabinetButton from "@/components/cabinet/CabinetButton";
import CabinetWindow from "@/components/cabinet/CabinetWindow";
import LiveBrandWord from "@/components/layout/LiveBrandWord";
import SoundStation from "@/components/layout/SoundStation";
import PageBar from "@/components/layout/PageBar";
import { useCleanPathname } from "@/lib/use-clean-pathname";
import { useEffect, useRef, useState, type ReactNode } from "react";
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

// Same 20-unit, 1.75-stroke line-icon language as VibeRail's own row glyphs
// (see PageBlock/CROSS_PAGE_ITEMS there) — reused here rather than shared
// via an import so the two floating panels stay decoupled, but a visitor
// should still recognise "Работы" as the same icon in both places.
function NavGlyph({ children }: { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      {children}
    </svg>
  );
}

// The six cinematic chapters of a service page (see (landing)/content/page.tsx)
const sections = [
  {
    id: "opening",
    label: "Начало",
    short: "Начало",
    glyph: <path d="M5 4.5 19 12 5 19.5z" />,
  },
  {
    id: "works",
    label: "Работы",
    short: "Работы",
    glyph: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M3 9h18M3 15h18M8 5v14M16 5v14" />
      </>
    ),
  },
  {
    id: "why",
    label: "Почему мы",
    short: "Почему",
    glyph: <path d="M12 3 4 6.5V12c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6.5L12 3z" />,
  },
  {
    id: "services",
    label: "Что делаем",
    short: "Услуги",
    glyph: (
      <>
        <path d="M12 3l8.5 4.5L12 12 3.5 7.5 12 3z" />
        <path d="M3.5 12L12 16.5 20.5 12" />
        <path d="M3.5 16.5L12 21l8.5-4.5" />
      </>
    ),
  },
  {
    id: "process",
    label: "Как работаем",
    short: "Процесс",
    glyph: (
      <>
        <path d="M4 6h11a3.5 3.5 0 0 1 0 7H7" />
        <path d="M9.5 10 6 13l3.5 3M14 18h6" />
      </>
    ),
  },
  {
    id: "contact",
    label: "Цены и заявка",
    short: "Заявка",
    glyph: <path d="M12 2.5l2.3 6.2 6.2 2.3-6.2 2.3L12 19.5l-2.3-6.2L3.5 11l6.2-2.3L12 2.5z" />,
  },
];

// standalone pages, kept out of the scroll-spy list above
const pages = [
  {
    href: "/works",
    label: "Все работы",
    short: "Каталог",
    glyph: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.3" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.3" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.3" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.3" />
      </>
    ),
  },
  {
    href: "/calculator",
    label: "Калькулятор",
    short: "Калькулятор",
    glyph: (
      <>
        <rect x="4.5" y="3" width="15" height="18" rx="2" />
        <path d="M8 7.5h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h3.5" />
      </>
    ),
  },
  {
    href: "/brief",
    label: "Бриф",
    short: "Бриф",
    glyph: (
      <>
        <path d="M5 3.5h9l5 5V20a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 20V5a1.5 1.5 0 0 1 1-1.5z" />
        <path d="M14 3.5V9h5M8.5 13.5h7M8.5 17h4.5" />
      </>
    ),
  },
];

// the section anchors above exist on every /content, /ai, /sites, /smm
// page identically — jumping there should stay on whichever one you're
// already viewing instead of bouncing to the default service
const landingSlugs = ["content", "ai", "sites", "smm"];

/** Логотип: точка + HUD.SERVICE. Слоган «DIGITAL AI CREATIVE» Егор пока
 *  убрал — сначала стоял справа за чертой, потом под логотипом, и в итоге
 *  решено оставить только основной текст. */
function BrandLockup() {
  return (
    <span className="flex items-center gap-2 sm:gap-2.5">
      <span className="h-2 w-2 shrink-0 animate-pulse-rec rounded-full brand-dot sm:h-2.5 sm:w-2.5" />
      <span className="whitespace-nowrap font-display text-[clamp(1.1rem,3.2vw,1.4rem)] land:!text-[0.9rem] uppercase tracking-tight">
        HUD<LiveBrandWord>.SERVICE</LiveBrandWord>
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
  }, [isLanding, fullpageActive]);

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
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 land:pointer-events-none land:!border-transparent land:!bg-transparent land:!backdrop-blur-none land:before:pointer-events-none land:before:absolute land:before:inset-x-0 land:before:top-0 land:before:h-16 land:before:content-[''] land:before:bg-[linear-gradient(to_bottom,rgba(11,11,16,0.78),rgba(11,11,16,0.6)_30%,rgba(11,11,16,0.28)_65%,rgba(11,11,16,0))] ${
        "header-glass"
      }`}
    >
      <Container className="relative z-10 flex h-14 items-center justify-between sm:h-[70px] land:h-10">
        <Link
          href="/"
          onClick={navigateHome}
          className="flex shrink-0 items-center gap-2 py-2 land:pointer-events-auto land:py-0 land:opacity-80 font-display uppercase leading-none tracking-[0.08em] text-paper transition active:scale-[0.97] sm:gap-2.5"
        >
          <BrandLockup />
        </Link>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
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
          <SoundStation />

          <CabinetButton />
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

      {/* Бар страниц — на всех страницах (просьба Егора). На телефоне и
          планшете — второй строкой под логотипом,
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
              <div>
                <p className="menu-kicker font-display">На этой странице</p>
                <div className="grid sm:grid-cols-2 sm:gap-x-8">
                  {sections.map((s) => (
                    <Link
                      key={s.id}
                      href={hrefFor(s.id)}
                      onClick={(e) => {
                        navigateTo(e, s.id);
                        setMenuOpen(false);
                      }}
                      className={`menu-item ${active === s.id ? "is-active" : ""}`}
                    >
                      <NavGlyph>{s.glyph}</NavGlyph>
                      <span className="menu-label font-display">{s.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="menu-kicker font-display">Страницы</p>
                {pages.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    onClick={() => setMenuOpen(false)}
                    className={`menu-item ${pathname === p.href ? "is-active" : ""}`}
                  >
                    <NavGlyph>{p.glyph}</NavGlyph>
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
                    Пообщаться →
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
