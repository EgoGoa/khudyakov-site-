import type { Metadata } from "next";
import ServiceMenuOverlay from "@/components/home/ServiceMenuOverlay";
import SitesPitch from "@/components/home/sites/SitesPitch";
import SitesMethod from "@/components/home/sites/SitesMethod";
import SitesAudience from "@/components/home/sites/SitesAudience";
import Offer from "@/components/home/Offer";
import SitesDecoIcon from "@/components/home/sites/SitesDecoIcon";
import Process from "@/components/home/Process";
import { SITES_PROCESS_STEPS } from "@/components/home/sites/sitesProcessSteps";
import SitesGuarantees from "@/components/home/sites/SitesGuarantees";
import Close from "@/components/home/Close";
import SitesSeoText from "@/components/home/sites/SitesSeoText";
import { ServiceProvider } from "@/lib/service-context";

export const metadata: Metadata = {
  title: "Vibe сайты — HDKV.AGENCY",
  description: "Сайты под ключ с помощью AI-инструментов под контролем опытной команды.",
};

// No CinematicStage yet: public/video/bg-sites.mp4 is only the small preview
// loop used in DirectionsGrid, not a full cinematic reel like content-reel.mp4
// or ai-reel.mp4 — Egor is preparing that footage in parallel (per his own
// note). Every section below is a <CinematicSection>, which renders as a
// normal always-visible, static-flow section outside a staged deck (see that
// component's `useIsStaged` check) — so once the reel lands, wrapping these
// same children in <CinematicStage src="/video/sites-reel.mp4" ...> with the
// right phase timecodes is the only change needed; no section here needs a
// rewrite for that.
//
// Portfolio is deliberately skipped — worksByCategory.sites is empty and the
// copy brief (content/site-copy.md) is explicit that placeholder case cards
// work against trust more than no portfolio section at all. Add a
// SitesPortfolio chapter once 2–3 real projects exist.
export default function SitesServicePage() {
  return (
    <ServiceProvider forcedValue="sites">
      <ServiceMenuOverlay service="sites" />

      <div className="overflow-x-clip">
        <SitesPitch />
      </div>
      <SitesMethod />
      <SitesAudience />
      <div className="relative">
        <SitesDecoIcon
          src="/images/icons/sites/code.png"
          size={380}
          rotate={8}
          className="right-2 bottom-0 lg:right-8"
        />
        <Offer
          index={3}
          chapter="04"
          title="Что мы делаем"
          intro="От одностраничного лендинга до сайта под ключ с интеграциями — вёрстка на React/HTML, без привязки к конструктору."
          spacious
        />
      </div>
      <Process
        index={4}
        chapter="05"
        title="Как проходит работа"
        intro="Пять шагов от брифа до запуска — на каждом понятный результат и точка согласования."
        steps={SITES_PROCESS_STEPS}
        spacious
      />
      <SitesGuarantees />
      <div className="relative z-10 overflow-x-clip">
        <SitesDecoIcon
          src="/images/icons/sites/tag.png"
          size={190}
          rotate={-11}
          className="-left-20 top-8 lg:-left-10"
        />
        <Close index={6} chapter="07" spacious />
      </div>

      <SitesSeoText />
    </ServiceProvider>
  );
}
