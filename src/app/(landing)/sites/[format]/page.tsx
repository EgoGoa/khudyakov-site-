import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CompactToolPage from "@/components/home/direction/CompactToolPage";
import { sitesFormatPages, sitesFormatMeta } from "@/components/home/direction/sitesFormatRegistry";

// Страница одного формата /sites — /sites/landing и ещё четыре: card,
// turnkey, assistant, redesign. Те же пять карточек, что в карусели
// SitesDeck на /sites.
//
// headingClass="" — сознательный выбор, не пропуск: /sites не заводит свой
// .kw-оверрайд, как /ai (.ai-cool-headings) или /smm (.smm-violet-headings).
// Сайт-вайд магента→циан `.kw` и есть родной акцент /sites (см. комментарий
// в ServicePicker.tsx и в любом из sites-*.tsx файлов данных), поэтому
// страницы форматов получают его просто не передавая какой-либо
// переопределяющий класс — передать сюда дефолт CompactToolPage
// (.ai-cool-headings) перекрасил бы их в эмеральд /ai.
export function generateStaticParams() {
  return Object.keys(sitesFormatPages).map((format) => ({ format }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ format: string }>;
}): Promise<Metadata> {
  const { format } = await params;
  const meta = sitesFormatMeta[format];
  if (!meta) return {};
  return {
    title: `${meta.title} — HDKV.AGENCY`,
    description: meta.description,
  };
}

export default async function SitesFormatPage({ params }: { params: Promise<{ format: string }> }) {
  const { format } = await params;
  const content = sitesFormatPages[format];
  if (!content) notFound();

  return <CompactToolPage content={content} headingClass="" />;
}
