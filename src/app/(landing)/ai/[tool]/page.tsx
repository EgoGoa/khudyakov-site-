import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DirectionFullPage from "@/components/home/direction/DirectionPage";
import CompactToolPage from "@/components/home/direction/CompactToolPage";
import { aiToolPages, aiCompactToolPages, aiToolMeta } from "@/components/home/direction/toolRegistry";
import FormatSideNav from "@/components/home/direction/FormatSideNav";

// Страница одного AI-инструмента — /ai/agent и ещё девять.
//
// Раскладка первых пяти (agent/content/video/voice/ops) целиком переиспользует
// страницу направления из /content: Егор просил сделать инструменты
// «аналогично тому, как мы сделали на первой странице». Вторые пять
// (comms/crm/personalization/analytics/training) идут по компактному
// шаблону — Егор попросил «сократить блоки, объединив несколько, или
// оптимизировать до 5–7» для новых страниц, не трогая уже принятые.
//
// Отсюда два реестра и два компонента вместо одного: маршрут смотрит, в
// каком из них есть slug, и рендерит соответствующий — DirectionPage
// (12 экранов, полный шаблон) или CompactToolPage (7 экранов, слитые блоки).
export function generateStaticParams() {
  return [...Object.keys(aiToolPages), ...Object.keys(aiCompactToolPages)].map((tool) => ({ tool }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  const { tool } = await params;
  const meta = aiToolMeta[tool];
  if (!meta) return {};
  return {
    title: `${meta.title} — HDKV.AGENCY`,
    description: meta.description,
  };
}

export default async function AiToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;

  const fullContent = aiToolPages[tool];
  const compactContent = aiCompactToolPages[tool];
  if (!fullContent && !compactContent) notFound();

  return (
    <>
      {fullContent ? (
        <DirectionFullPage content={fullContent} headingClass="ai-cool-headings" />
      ) : (
        <CompactToolPage content={compactContent!} />
      )}
      {/* Кольцо соседних инструментов: те же неоновые стрелки, что стоят по
          бокам основных страниц разделов, но шагают по инструментам
          внутри /ai. Одно на оба
          шаблона — для посетителя между «полной» и «компактной» страницей
          инструмента разницы нет, кольцо у них общее. */}
      <FormatSideNav section="ai" slug={tool} />
    </>
  );
}
