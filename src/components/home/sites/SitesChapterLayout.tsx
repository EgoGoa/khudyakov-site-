"use client";

import type { ComponentProps } from "react";
import ChapterLayout, { CHAPTER_PANEL, type ChapterAccent } from "@/components/home/shared/ChapterLayout";
import { PILL, ROUND } from "@/components/home/sites/SitesDeck";

// /sites' chapters, in this page's warm accent. The skeleton itself — the two
// columns, the beats, the button row — is the shared one in
// shared/ChapterLayout; this file is only the page's colours. See that file
// for why the two pages that use it stopped keeping a copy each.

const ACCENT: ChapterAccent = {
  number: "text-glow",
  rule: "bg-glow/40",
  heading: "chapter-neon-warm",
  pill: PILL,
  round: ROUND,
};

export default function SitesChapterLayout(
  props: Omit<ComponentProps<typeof ChapterLayout>, "accent">,
) {
  return <ChapterLayout accent={ACCENT} {...props} />;
}

export const SITES_PANEL = CHAPTER_PANEL;
