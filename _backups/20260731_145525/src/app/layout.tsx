import type { Metadata } from "next";
import { Inter, Unbounded } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
  display: "swap",
  weight: ["600", "700", "800", "900"],
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
    <html lang="ru" className={`${inter.variable} ${unbounded.variable}`}>
      <body className="bg-[#F7F5FC] font-sans text-ink antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
