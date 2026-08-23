import type { Metadata } from "next";
import PhotoStage, { type ChapterMeta } from "@/components/ui/PhotoStage";
import ServiceMenuOverlay from "@/components/home/ServiceMenuOverlay";
import AiPitch from "@/components/home/ai/AiPitch";
import AiPortfolio from "@/components/home/ai/AiPortfolio";
import AiSegments from "@/components/home/ai/AiSegments";
import Trust from "@/components/home/Trust";
import Offer from "@/components/home/Offer";
import AiGuarantees from "@/components/home/ai/AiGuarantees";
import Process from "@/components/home/Process";
import { AI_PROCESS_STEPS } from "@/components/home/ai/aiProcessSteps";
import AiTeamBlog from "@/components/home/ai/AiTeamBlog";
import Close from "@/components/home/Close";
import AiSeoText from "@/components/home/ai/AiSeoText";
import { ServiceProvider } from "@/lib/service-context";

export const metadata: Metadata = {
  title: "AI-решения — HDKV.AGENCY",
  description: "Внедряем ИИ-инструменты в продакшн и коммуникацию с клиентами.",
};

// Same section architecture as /content's cinematic deck (see that page),
// built on top of the ruvision.ru/ai reference — see docs/ai-page-todo.md
// for what's still a structural [TODO] placeholder versus real content.
//
// Background is PhotoStage (a static-image sibling of CinematicStage, see
// that component) rather than a scrubbed video reel: /ai has no edited
// footage of its own yet. `photo` below is a placeholder path — drop the
// real image in at that path and it picks up automatically; nothing else
// changes. Once there's a proper AI reel, swap PhotoStage for CinematicStage
// here and this file's chapters don't need to move.
const PHOTO = "/images/ai-hero-placeholder.jpg";

const CHAPTERS: ChapterMeta[] = [
  { id: "pitch" },
  { id: "portfolio" },
  { id: "segments" },
  { id: "trust" },
  { id: "offer" },
  { id: "guarantees" },
  { id: "process" },
  { id: "team" },
  { id: "close" },
];

export default function AiServicePage() {
  return (
    <ServiceProvider forcedValue="ai">
      <ServiceMenuOverlay service="ai" />

      <PhotoStage photo={PHOTO} chapters={CHAPTERS}>
        <AiPitch />
        <AiPortfolio />
        <AiSegments />
        <Trust
          index={3}
          chapter="04"
          title="Продюсерский центр, не коробка"
          intro="AI-инструменты внедряем с 2024 года внутри агентства полного цикла. Около 60% заказов — клиенты, которые возвращаются."
          clients={[]}
        />
        <Offer index={4} chapter="05" />
        <AiGuarantees />
        <Process
          index={6}
          chapter="07"
          title="Как проходит внедрение"
          intro="Шесть шагов от аудита до сопровождения. На каждом — понятный результат и точка согласования."
          steps={AI_PROCESS_STEPS}
        />
        <AiTeamBlog />
        <Close index={8} chapter="09" />
      </PhotoStage>

      <AiSeoText />
    </ServiceProvider>
  );
}
