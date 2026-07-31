import type { Metadata } from "next";
import { Oswald, Montserrat, Azeret_Mono } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingCta from "@/components/layout/FloatingCta";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700"],
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
  title: "KHUDYAKOV.AGENCY — видеопродакшн полного цикла",
  description:
    "Агентство видеопроизводства KHUDYAKOV.AGENCY: рекламные ролики, имиджевые видео, съёмка мероприятий и motion design. 5 лет на рынке, 450+ роликов, 200+ клиентов.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      className={`${montserrat.variable} ${bebas.variable} ${azeretMono.variable}`}
    >
      <body className="bg-paper font-sans text-ink antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
        <FloatingCta />
      </body>
    </html>
  );
}
