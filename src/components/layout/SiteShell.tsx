import type { Metadata, Viewport } from "next";
import { Unbounded, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import YandexMetrika from "@/components/layout/YandexMetrika";
import Header from "@/components/layout/Header";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageBarSpacer from "@/components/layout/PageBarSpacer";
import BottomIsland from "@/components/layout/BottomIsland";
import SiteSearch from "@/components/layout/SiteSearch";
import SoundSystem from "@/components/layout/SoundSystem";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import VibeRail from "@/components/layout/VibeRail";
import GlobalLead from "@/components/layout/GlobalLead";
import SkipIntro from "@/components/layout/SkipIntro";
import VoiceAssistant from "@/components/layout/VoiceAssistant";
import InstallApp from "@/components/layout/InstallApp";
import { BIP_SNIPPET } from "@/lib/pwa";
import ScrollTopButton from "@/components/ui/ScrollTopButton";
import BackgroundFX from "@/components/layout/BackgroundFX";
import MediaGovernor from "@/components/layout/MediaGovernor";
import HeadingFit from "@/components/layout/HeadingFit";
import ScrollQuiet from "@/components/layout/ScrollQuiet";
import PerfGovernor from "@/components/layout/PerfGovernor";
import MotionTier from "@/components/layout/MotionTier";
import { LITE_DETECT_SNIPPET } from "@/lib/lite";
import { SITE_URL, BRAND } from "@/lib/site";
import { BRIEF_EMAIL } from "@/lib/brief";
import OffscreenAnimationPause from "@/components/layout/OffscreenAnimationPause";
import FluidSmoke from "@/components/layout/FluidSmoke";
import CalmMode from "@/components/layout/CalmMode";
import { FullpageProvider } from "@/lib/fullpage";
import { HeaderMenuProvider } from "@/lib/header-menu";
import { CinematicNavProvider } from "@/lib/cinematic-nav";
import { NextIntlClientProvider } from "next-intl";
import { createTranslator } from "next-intl";
import type { Locale } from "@/i18n/routing";

// Manrope/Unbounded replaced Montserrat/Oswald site-wide — the earlier pair
// read as generic template type. Both have native Cyrillic (no
// latin-only-with-a-fallback compromise like the old Bebas Neue swap).
const montserrat = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
  // block, а не swap (Егор, 2026-10-20): пока файл шрифта едет, текст
  // невидим, а не набран чужим системным шрифтом, который потом «прыгает»
  // в наш. Файлы свои (same-origin) и предзагружаются, ждать недолго.
  display: "block",
  weight: ["400", "500", "600", "700", "800"],
});

const bebas = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-bebas",
  display: "block",
  weight: ["500", "600", "700", "800", "900"],
});

// Моноширинного шрифта больше нет: после запрета тонкого моно (JetBrains
// Mono мелким капсом) его не использовал ни один элемент, а файлы всё равно
// предзагружались на каждой странице. `font-mono` / --font-azeret-mono
// откатываются на системный ui-monospace.

// viewport-fit=cover lets the page run under the notch in landscape so it can
// use the full width of the phone; the safe-area insets are re-applied where
// content needs them (see the `land:` paddings).
export const siteViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Цвет полосы браузера сверху — как у сайта: над шапкой не видно ничего
  // постороннего.
  themeColor: "#0b0b10",
};

export async function siteMetadata(locale: Locale): Promise<Metadata> {
  const t = await translator(locale, "meta");
  const TITLE = t("title");
  const DESCRIPTION = t("description");
  return {
  // Absolute base for every relative URL below (opengraph-image.tsx included)
  // — without it a shared link resolves those against the visitor's own
  // origin instead of the site's, so Telegram/WhatsApp preview cards showed
  // nothing at all.
  metadataBase: new URL(SITE_URL),
  // Установка как приложения: выбранную иконку окно установки подменяет в
  // этой ссылке (lib/pwa → applyIcon).
  manifest: "/pwa/manifest-hud.webmanifest",
  appleWebApp: { capable: true, title: "HUD", statusBarStyle: "black-translucent" },
  title: TITLE,
  description: DESCRIPTION,
  // "./" — адрес текущей страницы на главном домене: каждая страница сама
  // объявляет себя оригиналом, и копия на vercel.app не спорит с hdkv-ai.ru.
  alternates: { canonical: "./" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "./",
    siteName: BRAND,
    locale: locale === "en" ? "en_US" : "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};
}

// Карточка компании для Яндекса и Google (schema.org): название, контакты и
// что работаем по всей России онлайн — из неё поисковик собирает сниппет.
// Словари грузим напрямую, а не через next-intl/server: тот читает язык из
// заголовков запроса, и русские страницы перестали бы быть статичными
// (а на reg.ru — `output: "export"`, без сервера).
async function loadMessages(locale: Locale) {
  return (await import(`../../../messages/${locale}.json`)).default as Record<string, unknown>;
}
async function translator(locale: Locale, namespace: string) {
  return createTranslator({ locale, messages: (await loadMessages(locale)) as never, namespace } as never) as (key: string) => string;
}

const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: BRAND,
  url: SITE_URL,
  telephone: "+79925111812",
  email: BRIEF_EMAIL,
  areaServed: { "@type": "Country", name: "Россия" },
  sameAs: ["https://t.me/hdkv"],
};

// Название сайта в выдаче Google (над ссылкой вместо голого домена) и
// варианты, которыми его ищут, — в том числе «худ сервис» по-русски.
const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BRAND,
  alternateName: ["HUD SERVICE", "Худ сервис", "hud-service.ru"],
  url: `${SITE_URL}/`,
};

export default async function SiteShell({
  locale,
  Wrap,
  children,
}: {
  locale: Locale;
  /** Обёртка контекста языка (английская ветка), внутри <body>. */
  Wrap?: React.ComponentType<{ locale: string; children: React.ReactNode }>;
  children: React.ReactNode;
}) {
  const Outer = Wrap ?? (({ children: c }: { children: React.ReactNode }) => <>{c}</>);
  const t = await translator(locale, "meta");
  const organizationLd = {
    ...ORGANIZATION_LD,
    description: t("description"),
    areaServed: { "@type": "Country", name: locale === "en" ? "Russia" : "Россия" },
  };
  const websiteLd = { ...WEBSITE_LD, inLanguage: locale };
  const messages = await loadMessages(locale);
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${montserrat.variable} ${bebas.variable}`}
    >
      <head>
        {/* Marks weak devices / slow connections before first paint so the
            "lite" CSS (globals.css) applies with no flash — see lib/lite.ts. */}
        <script dangerouslySetInnerHTML={{ __html: LITE_DETECT_SNIPPET }} />
        {/* Стартовое окно рендерится сервером и видно с первого кадра; если
            посетитель недавно его закрыл, этот флаг прячет его ещё до
            отрисовки — без вспышки окна (см. WelcomeOverlay). data-boot —
            этап очереди загрузки (lib/boot-sequence), с первого кадра. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var h=document.documentElement;h.setAttribute('data-boot','0');if(/[?&]vibe(=|&|$)/.test(location.search))h.setAttribute('data-welcome-snoozed','');else if(/^(\\/en)?\\/(content|ai|sites|smm)(\\/|\\.html|$)/.test(location.pathname))h.setAttribute('data-welcome-open','')}catch(e){}",
          }}
        />
        {/* Событие установки приходит один раз и рано — ловим до гидратации. */}
        <script dangerouslySetInnerHTML={{ __html: BIP_SNIPPET }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
      </head>
      <body className="relative bg-ink font-sans text-paper antialiased">
        <Outer locale={locale}>
        <NextIntlClientProvider locale={locale} messages={messages}>
        <BackgroundFX />
        {/* Уточняет уровень устройства (слабое/среднее/сильное) по видеокарте
            и реальным кадрам и при тормозах снижает его — см. компонент. */}
        <PerfGovernor />
        <MediaGovernor />
        <HeadingFit />
        {/* Плавающие кнопки на телефоне прячутся, пока страница листается. */}
        <ScrollQuiet />
        {/* Замораживает CSS-анимации в блоках за пределами экрана — см.
            сам компонент. Здесь, а не в шаблонах страниц: бесконечные
            анимации (неоновые пульсации кнопок, карточек, фото команды)
            живут на каждой странице сайта. */}
        <OffscreenAnimationPause />
        {/* Звуки интерфейса и смены страниц — см. lib/sound. */}
        <SoundSystem />
        {/* На слабых устройствах анимации появления — без полётов и
            масштабов, только проявление (см. компонент). */}
        <MotionTier>
        <FullpageProvider>
          <CinematicNavProvider>
            <HeaderMenuProvider>
              {/* VibeRail floats on top of the page by design — it does not
                  reserve any layout space, the same way the old FloatingCta
                  button never did either. */}
              <div className="relative z-10">
                <Header />
                {/* Вырез телефона в режиме приложения: страница начинается под шапкой. */}
                <main style={{ paddingTop: "var(--sat)" }}>
                  <Breadcrumbs />
                  <PageBarSpacer />
                  {children}
                </main>
                <ConditionalFooter />
              </div>
              <VibeRail />
              <VoiceAssistant />
              {/* Остров внизу на телефоне (‹ поиск · волна · страница ›) и
                  окно поиска по сайту — на всех страницах. */}
              <BottomIsland />
              <SiteSearch />
              <InstallApp />
              <GlobalLead />
              <SkipIntro />
              {/* Лишние стрелки вверх-вниз у края на телефоне убраны (Егор, 2026-10-03). */}
              {/* Кнопка «наверх» — здесь, а не в шаблонах страниц: она
                  нужна на каждой странице сайта, и один экземпляр в layout
                  закрывает и разделы, и подстраницы, и служебные. */}
              <ScrollTopButton />
              {/* Низ экрана на телефоне темнее: текст уходит в тень под
                  сферой, стрелками и волной, а не ложится под них (globals.css). */}
              <div aria-hidden="true" className="bottom-fade" />
              {/* ЗАКРЕПЛЕНО: по этой полосе Safari на iOS 26 красит зону под
                  своей нижней панелью (globals.css, «зоны под панелями»). */}
              <div aria-hidden="true" className="safari-bottom-tint" />
            </HeaderMenuProvider>
          </CinematicNavProvider>
        </FullpageProvider>
        </MotionTier>
        {/* Дым за курсором — на всех страницах, от заставки до модалок:
            он сам решает, запускаться ли (только мышь, без reduced-motion),
            и паркует свой цикл, пока курсор стоит. */}
        <FluidSmoke />
        <CalmMode />
        <Analytics />
        <YandexMetrika />
        </NextIntlClientProvider>
        </Outer>
      </body>
    </html>
  );
}
