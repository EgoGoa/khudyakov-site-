import type { Metadata } from "next";
import HotelVideoBriefForm from "@/components/brief/HotelVideoBriefForm";

export const metadata: Metadata = {
  title: "Бриф на видеосъёмку базы отдыха — HDKV.AGENCY",
  description:
    "Короткий бриф на видеосъёмку базы отдыха или отеля: земля и воздух. 10 вопросов, 2 минуты, письмо уходит нам напрямую.",
};

export default function HotelVideoBriefPage() {
  return <HotelVideoBriefForm />;
}
