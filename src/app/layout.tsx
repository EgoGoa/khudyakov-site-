import type { Metadata, Viewport } from "next";
import { Unbounded, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/layout/Header";
import PageBarSpacer from "@/components/layout/PageBarSpacer";
import SoundSystem from "@/components/layout/SoundSystem";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import VibeRail from "@/components/layout/VibeRail";
import VoiceAssistant from "@/components/layout/VoiceAssistant";
import ScrollTopButton from "@/components/ui/ScrollTopButton";
import MobileScrollRail from "@/components/ui/MobileScrollRail";
import BackgroundFX from "@/components/layout/BackgroundFX";
import MediaGovernor from "@/components/layout/MediaGovernor";
import PerfGovernor from "@/components/layout/PerfGovernor";
import MotionTier from "@/components/layout/MotionTier";
import { LITE_DETECT_SNIPPET } from "@/lib/lite";
import { SITE_URL, BRAND } from "@/lib/site";
import { BRIEF_EMAIL } from "@/lib/brief";
import OffscreenAnimationPause from "@/components/layout/OffscreenAnimationPause";
import FluidSmoke from "@/components/layout/FluidSmoke";
import { FullpageProvider } from "@/lib/fullpage";
import { HeaderMenuProvider } from "@/lib/header-menu";
import { CinematicNavProvider } from "@/lib/cinematic-nav";
import "./globals.css";

// Manrope/Unbounded replaced Montserrat/Oswald site-wide — the earlier pair
// read as generic template type. Both have native Cyrillic (no
// latin-only-with-a-fallback compromise like the old Bebas Neue swap).
const montserrat = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const bebas = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-bebas",
  display: "swap",
  weight: ["500", "600", "700", "800", "900"],
});

// Моноширинного шрифта больше нет: после запрета тонкого моно (JetBrains
// Mono мелким капсом) его не использовал ни один элемент, а файлы всё равно
// предзагружались на каждой странице. `font-mono` / --font-azeret-mono
// откатываются на системный ui-monospace.

const TITLE = "HUD.SERVICE — AI-диджитал сервис полного цикла";
const DESCRIPTION =
  "Видео, фото, брендинг, SMM и AI-контент под одной крышей. HUD.SERVICE соединяет продакшн и нейросети, чтобы бренды росли быстрее рынка. 8 лет опыта, 450+ проектов, 350+ клиентов.";

// viewport-fit=cover lets the page run under the notch in landscape so it can
// use the full width of the phone; the safe-area insets are re-applied where
// content needs them (see the `land:` paddings).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  // Absolute base for every relative URL below (opengraph-image.tsx included)
  // — without it a shared link resolves those against the visitor's own
  // origin instead of the site's, so Telegram/WhatsApp preview cards showed
  // nothing at all.
  metadataBase: new URL(SITE_URL),
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
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// Карточка компании для Яндекса и Google (schema.org): название, контакты и
// что работаем по всей России онлайн — из неё поисковик собирает сниппет.
const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: BRAND,
  url: SITE_URL,
  description: DESCRIPTION,
  telephone: "+79925111812",
  email: BRIEF_EMAIL,
  areaServed: { "@type": "Country", name: "Россия" },
  sameAs: ["https://t.me/hdkv"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${montserrat.variable} ${bebas.variable}`}
    >
      <head>
        {/* Marks weak devices / slow connections before first paint so the
            "lite" CSS (globals.css) applies with no flash — see lib/lite.ts. */}
        <script dangerouslySetInnerHTML={{ __html: LITE_DETECT_SNIPPET }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_LD) }}
        />
      </head>
      <body className="relative bg-ink font-sans text-paper antialiased">
        <BackgroundFX />
        {/* Уточняет уровень устройства (слабое/среднее/сильное) по видеокарте
            и реальным кадрам и при тормозах снижает его — см. компонент. */}
        <PerfGovernor />
        <MediaGovernor />
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
                <main>
                  <PageBarSpacer />
                  {children}
                </main>
                <ConditionalFooter />
              </div>
              <VibeRail />
              <VoiceAssistant />
              <MobileScrollRail />
              {/* Кнопка «наверх» — здесь, а не в шаблонах страниц: она
                  нужна на каждой странице сайта, и один экземпляр в layout
                  закрывает и разделы, и подстраницы, и служебные. */}
              <ScrollTopButton />
            </HeaderMenuProvider>
          </CinematicNavProvider>
        </FullpageProvider>
        </MotionTier>
        {/* Дым за курсором — на всех страницах, от заставки до модалок:
            он сам решает, запускаться ли (только мышь, без reduced-motion),
            и паркует свой цикл, пока курсор стоит. */}
        <FluidSmoke />
        <Analytics />
      </body>
    </html>
  );
}
