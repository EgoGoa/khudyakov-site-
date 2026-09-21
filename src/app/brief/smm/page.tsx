import type { Metadata } from "next";
import BriefForm from "@/components/brief/BriefForm";

export const metadata: Metadata = {
  title: "Бриф на SMM — HUD.SERVICE",
  description:
    "Короткий бриф под ведение соцсетей, таргет и работу с блогерами. 11 вопросов, 5 минут, письмо уходит нам напрямую.",
};

export default function BriefSmmPage() {
  return <BriefForm variant="smm" />;
}
