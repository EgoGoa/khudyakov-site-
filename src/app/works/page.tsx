import type { Metadata } from "next";
import Works from "@/components/home/Works";
import { ServiceProvider } from "@/lib/service-context";

const TITLE = "Все работы — HDKV.AGENCY";
const DESCRIPTION = "Полный каталог проектов: реклама, шоурилы, 3D и моушн, документальные и обучающие форматы.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/works" },
  openGraph: { title: TITLE, description: DESCRIPTION, images: ["/images/showreel-frame.jpg"] },
  twitter: { title: TITLE, description: DESCRIPTION, images: ["/images/showreel-frame.jpg"] },
};

// The full catalogue with both filter axes, moved off the service page so
// that page's Works chapter can stay a six-item showcase (see WorksShowcase).
export default function WorksPage() {
  return (
    <ServiceProvider forcedValue="content">
      <div className="pt-24 sm:pt-28">
        <Works />
      </div>
    </ServiceProvider>
  );
}
