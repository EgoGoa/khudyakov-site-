import type { Metadata } from "next";
import ServiceMenuOverlay from "@/components/home/ServiceMenuOverlay";
import SmmPitch from "@/components/home/smm/SmmPitch";
import Offer from "@/components/home/Offer";
import Trust from "@/components/home/Trust";
import SmmTeaserLink from "@/components/home/smm/SmmTeaserLink";
import Process from "@/components/home/Process";
import { SMM_PROCESS_STEPS } from "@/components/home/smm/smmProcessSteps";
import SmmGuarantees from "@/components/home/smm/SmmGuarantees";
import Close from "@/components/home/Close";
import SmmSeoText from "@/components/home/smm/SmmSeoText";
import SmmDecoIcon from "@/components/home/smm/SmmDecoIcon";
import { ServiceProvider } from "@/lib/service-context";

export const metadata: Metadata = {
  title: "SMM — HDKV.AGENCY",
  description:
    "SMM силами продакшена: съёмка, монтаж и ведение соцсетей одной командой, без подрядчиков со стороны.",
};

// No CinematicStage yet: public/video/bg-smm.mp4 is only the 10s preview
// loop used in DirectionsGrid/ServicePicker, not a full cinematic reel like
// content-reel.mp4 or ai-reel.mp4 — same situation as /sites (see that
// page's own comment). Every section below is a <CinematicSection>, which
// renders as a normal always-visible, static-flow section outside a staged
// deck — so once real footage lands, wrapping these same children in
// <CinematicStage src="/video/smm-reel.mp4" ...> is the only change needed.
//
// Portfolio is deliberately skipped for the same reason as /sites:
// worksByCategory.smm is empty and content/site-copy.md's placeholder-cases
// rule applies here too. /smm/cases exists as its own page for when 2–3
// real projects land; a teaser card links to it instead of an empty chapter.
//
// Decorative icons: each one sits in its own `relative` wrapper next to the
// chapter it illustrates, positioned by hand against that chapter's real
// layout rather than computed from page-wide percentages — a global overlay
// couldn't be calibrated against content it doesn't know the height of.
// z-0 vs the chapter's z-10 keeps every icon behind the text it sits near,
// so overlap with empty space beside a paragraph is fine by construction.
export default function SmmServicePage() {
  return (
    <ServiceProvider forcedValue="smm">
      <ServiceMenuOverlay service="smm" />

      <div className="relative z-10">
        <SmmDecoIcon
          src="/images/icons/smm/launch.png"
          size={285}
          rotate={30}
          className="-left-6 top-2 lg:left-0"
        />
        <SmmPitch />
      </div>

      <div className="relative z-10">
        <SmmDecoIcon
          src="/images/icons/smm/reels.png"
          size={240}
          rotate={7}
          className="-right-4 bottom-0 lg:right-2"
        />
        <Offer
          index={1}
          chapter="02"
          title="Что делаем"
          intro="Полный цикл ведения соцсетей — от съёмки до отчёта."
        />
      </div>

      <div className="relative z-10">
        <SmmDecoIcon
          src="/images/icons/smm/influencer.png"
          size={225}
          rotate={-6}
          className="left-2 top-2 lg:left-8"
        />
        <Trust
          index={2}
          chapter="03"
          title="Продюсерский центр, не подрядчик"
          intro="SMM ведёт та же команда, что снимает рекламные ролики: одни операторы, монтажёры и продюсер на проекте — без передачи задачи фрилансерам."
          clients={[]}
        />
      </div>

      <SmmTeaserLink
        text="Кейсы SMM — в процессе. Смотрите, как мы ведём проекты."
        href="/smm/cases"
        cta="Смотреть кейсы"
      />

      <div className="relative z-10">
        <SmmDecoIcon
          src="/images/icons/smm/strategy.png"
          size={300}
          rotate={-8}
          className="right-2 top-0 lg:right-6"
        />
        <Process
          index={3}
          chapter="04"
          title="Как проходит работа"
          intro="Пять шагов от аудита до отчёта — на каждом понятный результат."
          steps={SMM_PROCESS_STEPS}
        />
      </div>

      <div className="relative z-10 overflow-x-clip">
        <SmmDecoIcon
          src="/images/icons/smm/analytics.png"
          size={255}
          rotate={9}
          className="-left-28 -top-16 lg:-left-16"
        />
        <SmmGuarantees />
      </div>

      <SmmTeaserLink
        text="Три пакета ведения — от разового аудита до полного цикла с блогерами и таргетом."
        href="/smm/pricing"
        cta="Смотреть цены"
      />

      <div className="relative z-10 overflow-x-clip">
        <SmmDecoIcon
          src="/images/icons/smm/ai.png"
          size={105}
          rotate={10}
          className="left-6 bottom-10 lg:left-10"
        />
        <SmmDecoIcon
          src="/images/icons/smm/handshake.png"
          size={230}
          rotate={-10}
          className="-right-10 top-4 lg:right-2"
        />
        <SmmDecoIcon
          src="/images/icons/smm/pricetag.png"
          size={190}
          rotate={14}
          className="-left-24 top-56 lg:-left-16"
        />
        <Close index={5} chapter="06" />
      </div>

      <SmmSeoText />
    </ServiceProvider>
  );
}
