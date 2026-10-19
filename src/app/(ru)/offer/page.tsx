import type { Metadata } from "next";
import { Suspense } from "react";
import OfferPage from "@/components/vibe/OfferPage";

// Персональный лендинг из вайб-режима. Страница у каждого своя (ответы в адресе),
// поэтому в поиск она не идёт.
export const metadata: Metadata = {
  title: "Персональный лендинг — HUD.SERVICE",
  description: "Лендинг, собранный под твою сферу, задачу и бюджет.",
  robots: { index: false, follow: false },
};

export default function Offer() {
  return (
    <Suspense fallback={null}>
      <OfferPage />
    </Suspense>
  );
}
