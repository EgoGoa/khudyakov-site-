import type { Metadata } from "next";
import CalculatorPageContent from "@/components/calculator/CalculatorPageContent";

export const metadata: Metadata = {
  title: "Калькулятор стоимости — HUD.SERVICE",
  description:
    "Посчитайте ориентировочный бюджет проекта онлайн: тип ролика, хронометраж и дополнительные опции. HUD.SERVICE — 8 лет на рынке, 450+ проектов, 350+ клиентов.",
};

export default function CalculatorPage() {
  return <CalculatorPageContent />;
}
