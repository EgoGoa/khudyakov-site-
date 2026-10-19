import type { Metadata } from "next";
import ServiceRedirect from "@/features/brief/components/ServiceRedirect";

export const metadata: Metadata = {
  title: "Калькулятор стоимости — HUD.SERVICE",
  description: "Посчитайте ориентировочный бюджет проекта онлайн под нужную услугу.",
};

export default function CalculatorEntryPage() {
  return <ServiceRedirect base="calculator" />;
}
