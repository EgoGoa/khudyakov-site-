import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CalculatorPageContent from "@/components/calculator/CalculatorPageContent";
import { calcConfigs } from "@/components/calculator/calcData";
import type { BriefId } from "@/features/brief/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(calcConfigs).map((service) => ({ service }));
}

const TITLE: Record<BriefId, string> = {
  content: "Калькулятор стоимости видео и контента",
  sites: "Калькулятор стоимости сайта",
  smm: "Калькулятор стоимости SMM",
  ai: "Калькулятор стоимости AI-решения",
};

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }): Promise<Metadata> {
  const { service } = await params;
  if (!(service in calcConfigs)) return {};
  return {
    title: `${TITLE[service as BriefId]} — HUD.SERVICE`,
    description: "Посчитайте ориентировочный бюджет проекта онлайн. HUD.SERVICE — 8 лет на рынке, 450+ проектов, 350+ клиентов.",
  };
}

export default async function CalculatorServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  if (!(service in calcConfigs)) notFound();
  return <CalculatorPageContent config={calcConfigs[service as BriefId]} />;
}
