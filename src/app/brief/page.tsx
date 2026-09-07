import type { Metadata } from "next";
import BriefForm from "@/components/brief/BriefForm";

const TITLE = "Бриф на проект — HDKV.AGENCY";
const DESCRIPTION =
  "Заполните бриф за 5 минут: 20 вопросов о задаче, аудитории, формате и бюджете. В конце бриф собирается в письмо для HDKV.AGENCY.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/brief" },
  openGraph: { title: TITLE, description: DESCRIPTION, images: ["/images/showreel-frame.jpg"] },
  twitter: { title: TITLE, description: DESCRIPTION, images: ["/images/showreel-frame.jpg"] },
};

export default function BriefPage() {
  return <BriefForm />;
}
