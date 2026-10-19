import type { Metadata } from "next";
import ServiceRedirect from "@/features/brief/components/ServiceRedirect";

export const metadata: Metadata = {
  title: "Бриф на проект — HUD.SERVICE",
  description: "Короткий бриф по вашей услуге: контент, сайты, SMM или AI-инструменты.",
};

export default function BriefEntryPage() {
  return <ServiceRedirect base="brief" />;
}
