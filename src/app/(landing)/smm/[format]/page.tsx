import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CompactToolPage from "@/components/home/direction/CompactToolPage";
import { smmFormatPages, smmFormatMeta } from "@/components/home/direction/smmFormatRegistry";

// Страница одного формата SMM — /smm/reels и (со временем) ещё четыре:
// stories, carousel, ads, bloggers — те же пять карточек, что в карусели
// SmmDeck на /smm.
//
// Один реестр и один компонент вместо развилки, как у /ai/[tool]: там два
// шаблона существуют потому, что первая пятёрка инструментов уже был принята
// на полном DirectionPage до того, как появился компактный. У /smm такого
// наследия нет — все форматы сразу идут на компактном шаблоне
// (CompactToolPage), с фиолетовым акцентом страницы через `headingClass`.
export function generateStaticParams() {
  return Object.keys(smmFormatPages).map((format) => ({ format }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ format: string }>;
}): Promise<Metadata> {
  const { format } = await params;
  const meta = smmFormatMeta[format];
  if (!meta) return {};
  return {
    title: `${meta.title} — HDKV.AGENCY`,
    description: meta.description,
  };
}

export default async function SmmFormatPage({ params }: { params: Promise<{ format: string }> }) {
  const { format } = await params;
  const content = smmFormatPages[format];
  if (!content) notFound();

  return <CompactToolPage content={content} headingClass="smm-violet-headings" />;
}
