import type { Metadata } from "next";
import BriefForm from "@/components/brief/BriefForm";

export const metadata: Metadata = {
  title: "Бриф на видеопродакшн — KHUDYAKOV.AGENCY",
  description:
    "Заполните бриф на видеопроизводство за 5 минут: 20 вопросов о задаче, аудитории, формате и бюджете. В конце бриф собирается в письмо для KHUDYAKOV.AGENCY.",
};

export default function BriefPage() {
  return <BriefForm />;
}
