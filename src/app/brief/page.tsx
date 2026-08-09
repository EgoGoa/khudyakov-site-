import type { Metadata } from "next";
import BriefForm from "@/components/brief/BriefForm";

export const metadata: Metadata = {
  title: "Бриф на проект — HDKV.AGENCY",
  description:
    "Заполните бриф за 5 минут: 20 вопросов о задаче, аудитории, формате и бюджете. В конце бриф собирается в письмо для HDKV.AGENCY.",
};

export default function BriefPage() {
  return <BriefForm />;
}
