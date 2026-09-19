import type { Metadata, Viewport } from "next";
import { Unbounded, Manrope, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/layout/Header";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import VibeRail from "@/components/layout/VibeRail";
import ScrollTopButton from "@/components/ui/ScrollTopButton";
import MobileScrollRail from "@/components/ui/MobileScrollRail";
import BackgroundFX from "@/components/layout/BackgroundFX";
import MediaGovernor from "@/components/layout/MediaGovernor";
import { LITE_DETECT_SNIPPET } from "@/lib/lite";
import OffscreenAnimationPause from "@/components/layout/OffscreenAnimationPause";
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

// Моноширинный тоже обязан иметь кириллицу.
//
// Здесь стоял Azeret Mono с subsets: ["latin"] — и это была настоящая
// ошибка, а не стилистический выбор. Кириллицы у него нет вовсе, поэтому
// каждая русская подпись на сайте (а их 145) рисовалась подменным
// системным шрифтом, тогда как цифры в той же строке — самим Azeret.
// Два шрифта в одной строке: разная высота, разная ширина знака, разный
// вес. Егор увидел это на «ШАГ 1 ИЗ 3» и назвал «скачет размер шрифтов».
//
// JetBrains Mono несёт кириллицу нативно, поэтому буквы и цифры снова
// приходят из одной гарнитуры. Имя переменной оставлено прежним, чтобы не
// трогать tailwind.config и полторы сотни мест разом.
const azeretMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-azeret-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://khudyakov-site.vercel.app";
const TITLE = "HDKV.AGENCY — AI-диджитал агентство полного цикла";
const DESCRIPTION =
  "Видео, фото, брендинг, SMM и AI-контент под одной крышей. HDKV.AGENCY соединяет продакшн и нейросети, чтобы бренды росли быстрее рынка. 8 лет опыта, 450+ проектов, 350+ клиентов.";

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
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "HDKV.AGENCY",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      data-scroll-behavior="smooth"
      className={`${montserrat.variable} ${bebas.variable} ${azeretMono.variable}`}
    >
      <head>
        {/* Marks weak devices / slow connections before first paint so the
            "lite" CSS (globals.css) applies with no flash — see lib/lite.ts. */}
        <script dangerouslySetInnerHTML={{ __html: LITE_DETECT_SNIPPET }} />
      </head>
      <body className="relative bg-ink font-sans text-paper antialiased">
        <BackgroundFX />
        <MediaGovernor />
        {/* Замораживает CSS-анимации в блоках за пределами экрана — см.
            сам компонент. Здесь, а не в шаблонах страниц: бесконечные
            анимации (неоновые пульсации кнопок, карточек, фото команды)
            живут на каждой странице сайта. */}
        <OffscreenAnimationPause />
        <FullpageProvider>
          <CinematicNavProvider>
            <HeaderMenuProvider>
              {/* VibeRail floats on top of the page by design — it does not
                  reserve any layout space, the same way the old FloatingCta
                  button never did either. */}
              <div className="relative z-10">
                <Header />
                <main>{children}</main>
                <ConditionalFooter />
              </div>
              <VibeRail />
              <MobileScrollRail />
              {/* Кнопка «наверх» — здесь, а не в шаблонах страниц: она
                  нужна на каждой странице сайта, и один экземпляр в layout
                  закрывает и разделы, и подстраницы, и служебные. */}
              <ScrollTopButton />
            </HeaderMenuProvider>
          </CinematicNavProvider>
        </FullpageProvider>
        <Analytics />
      </body>
    </html>
  );
}
