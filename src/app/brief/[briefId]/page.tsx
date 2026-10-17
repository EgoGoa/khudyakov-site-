import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Brief from "@/features/brief/components/Brief";
import { BRIEF_PAGE_IDS, getBriefConfig } from "@/features/brief/registry";
import type { AnyBriefId } from "@/features/brief/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return BRIEF_PAGE_IDS.map((briefId) => ({ briefId }));
}

export async function generateMetadata({ params }: { params: Promise<{ briefId: string }> }): Promise<Metadata> {
  const { briefId } = await params;
  if (!BRIEF_PAGE_IDS.includes(briefId as AnyBriefId)) return {};
  const c = getBriefConfig(briefId as AnyBriefId);
  return { title: `${c.title} — HUD.SERVICE`, description: c.intro };
}

export default async function BriefPage({ params }: { params: Promise<{ briefId: string }> }) {
  const { briefId } = await params;
  if (!BRIEF_PAGE_IDS.includes(briefId as AnyBriefId)) notFound();
  return <Brief briefId={briefId as AnyBriefId} />;
}
