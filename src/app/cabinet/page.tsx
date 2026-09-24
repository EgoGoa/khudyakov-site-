import type { Metadata } from "next";
import CabinetFrame from "@/components/cabinet/CabinetFrame";

export const metadata: Metadata = {
  title: "Личный кабинет — HUD.SERVICE",
  description: "Заказы, рекомендации команды, бонусы и связь с продюсером в одном месте.",
  robots: { index: false, follow: false },
};

// Отдельная страница кабинета — ссылку можно дать клиенту. Та же вёрстка,
// что в окне поверх сайта.
export default function CabinetPage() {
  return (
    <main className="cab-scope relative min-h-[100dvh] overflow-hidden bg-ink px-3 pb-6 pt-20 sm:px-8 sm:pt-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_20%,rgba(255,79,216,0.18),transparent_70%),radial-gradient(50%_50%_at_85%_80%,rgba(0,210,255,0.16),transparent_70%)]" />
      <CabinetFrame />
    </main>
  );
}
