import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SmmServicePage from "@/components/home/direction/SmmServicePage";
import { smmServicePages, smmServiceMeta } from "@/components/home/smm/smmServiceRegistry";

// Страница одной услуги SMM — /smm/shooting и ещё пять.
//
// Пять экранов (SmmServicePage) — по просьбе Егора компактнее, чем у
// AI-инструментов (7 экранов, CompactToolPage): без шага персонализации,
// «кому подходит» и «под капотом» слиты в один рыночный блок. headingClass
// переключает раскладку на фиолетово-голубой акцент /smm вместо
// лайм-изумрудного /ai (см. .smm-violet-headings в globals.css).
export function generateStaticParams() {
  return Object.keys(smmServicePages).map((service) => ({ service }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service } = await params;
  const meta = smmServiceMeta[service];
  if (!meta) return {};
  return {
    title: `${meta.title} — HDKV.AGENCY`,
    description: meta.description,
  };
}

export default async function SmmServiceDetailPage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;

  const content = smmServicePages[service];
  if (!content) notFound();

  return <SmmServicePage content={content} />;
}
