import type { Metadata } from "next";
import { Oswald, Montserrat, Azeret_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/layout/Header";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import VibeRail from "@/components/layout/VibeRail";
import BackgroundFX from "@/components/layout/BackgroundFX";
import CursorGlow from "@/components/layout/CursorGlow";
import { FullpageProvider } from "@/lib/fullpage";
import { HeaderMenuProvider } from "@/lib/header-menu";
import { CinematicNavProvider } from "@/lib/cinematic-nav";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

// Bebas Neue has no Cyrillic glyphs, so Russian headlines would silently
// fall back to a system font. Oswald gives the same bold condensed
// editorial look and fully supports Cyrillic.
const bebas = Oswald({
  subsets: ["latin", "cyrillic"],
  variable: "--font-bebas",
  display: "swap",
  weight: ["500", "600", "700"],
});

const azeretMono = Azeret_Mono({
  subsets: ["latin"],
  variable: "--font-azeret-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "HDKV.AGENCY — AI-диджитал агентство полного цикла",
  description:
    "Видео, фото, брендинг, SMM и AI-контент под одной крышей. HDKV.AGENCY соединяет продакшн и нейросети, чтобы бренды росли быстрее рынка. 8 лет опыта, 450+ проектов, 350+ клиентов.",
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
      <body className="relative bg-ink font-sans text-paper antialiased">
        <BackgroundFX />
        <CursorGlow />
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
            </HeaderMenuProvider>
          </CinematicNavProvider>
        </FullpageProvider>
        <Analytics />
      </body>
    </html>
  );
}
