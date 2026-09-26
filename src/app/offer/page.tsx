import type { Metadata } from "next";
import { Suspense } from "react";
import OfferPage from "@/components/vibe/OfferPage";

// Личное КП из вайб-режима. Страница у каждого своя (ответы в адресе),
// поэтому в поиск она не идёт.
export const metadata: Metadata = {
  title: "Персональное предложение — HUD.SERVICE",
  description: "Коммерческое предложение, собранное под твою сферу, задачу и бюджет.",
  robots: { index: false, follow: false },
};

export default function Offer() {
  return (
    <Suspense fallback={null}>
      <OfferPage />
    </Suspense>
  );
}
