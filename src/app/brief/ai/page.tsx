import type { Metadata } from "next";
import BriefForm from "@/components/brief/BriefForm";

export const metadata: Metadata = {
  title: "Бриф на AI-решение — HUD.SERVICE",
  description:
    "Короткий бриф под AI-инструменты: чат-боты, голосовой AI, AI-видео и автоматизация CRM. 11 вопросов, 5 минут, письмо уходит нам напрямую.",
};

export default function BriefAiPage() {
  return <BriefForm variant="ai" />;
}
