"use client";

import type { ComponentProps } from "react";
import ChapterLayout, { CHAPTER_PANEL, type ChapterAccent } from "@/components/home/shared/ChapterLayout";
import { PILL, ROUND } from "@/components/home/smm/SmmDeck";

// /smm's chapters, in this page's violet accent. The skeleton itself — the
// two columns, the beats, the button row — is the shared one in
// shared/ChapterLayout; this file is only the page's colours. See that file
// for why the two pages that use it stopped keeping a copy each.

const ACCENT: ChapterAccent = {
  number: "text-[#c4a0ff]",
  rule: "bg-[#a855f7]/40",
  heading: "chapter-neon-violet",
  pill: PILL,
  round: ROUND,
};

export default function SmmChapterLayout(
  props: Omit<ComponentProps<typeof ChapterLayout>, "accent">,
) {
  return <ChapterLayout accent={ACCENT} {...props} />;
}

export const SMM_PANEL = CHAPTER_PANEL;
