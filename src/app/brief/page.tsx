import type { Metadata } from "next";
import BriefForm from "@/components/brief/BriefForm";

export const metadata: Metadata = {
  title: "Бриф на проект — HUD.SERVICE",
  description:
    "Заполните бриф за 5 минут: 20 вопросов о задаче, аудитории, формате и бюджете. В конце бриф собирается в письмо для HUD.SERVICE.",
};

export default function BriefPage() {
  return <BriefForm />;
}
