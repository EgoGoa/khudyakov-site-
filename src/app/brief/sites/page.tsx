import type { Metadata } from "next";
import BriefForm from "@/components/brief/BriefForm";

export const metadata: Metadata = {
  title: "Бриф на сайт — HDKV.AGENCY",
  description:
    "Короткий бриф под разработку сайта: лендинг, интернет-магазин или сайт на AI. 12 вопросов, 5 минут, письмо уходит нам напрямую.",
};

export default function BriefSitesPage() {
  return <BriefForm variant="sites" />;
}
