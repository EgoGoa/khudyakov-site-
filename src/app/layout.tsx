import type { Metadata } from "next";
import { Unbounded, Manrope, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/layout/Header";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import VibeRail from "@/components/layout/VibeRail";
import BackgroundFX from "@/components/layout/BackgroundFX";
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
