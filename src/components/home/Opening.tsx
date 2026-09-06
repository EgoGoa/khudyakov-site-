"use client";

import CinematicSection from "@/components/ui/CinematicSection";
import DirectionsGrid from "@/components/home/DirectionsGrid";
import ContentDecoIcon from "@/components/home/content/ContentDecoIcon";

// Chapter 01 of /content — the direction grid.
//
// This used to be a hand-rolled motion.div with its own entrance (x: -180
// over 0.6s), its own <h1>, and a 10px uppercase supporting line, which made
// it the one chapter on the site that did not move or read like any other.
// Everything now goes through CinematicSection, so it enters on the same
// slide, at the same DUR.chapter, and its number/title/intro land on the
// same BEAT as every chapter of /content, /ai, /sites and /smm.
//
// Three things went with that:
//   * the heading is an <h2>, like every other chapter — the page's single
//     <h1> is the hero's, and two of them was an outright markup bug;
//   * the supporting line is the shared reading-size intro rather than the
//     old caption-sized uppercase, which is the weight Egor asked for on
//     every page;
//   * the "● HDKV.AGENCY" mono label is gone — no other chapter on the site
//     carries one, and the chapter number is the marker.
//
// The stat row that once sat here went earlier, for the same reason it is
// still absent: the first thing a visitor scrolls to should be "what do you
// actually make", not a number row.
export default function Opening() {
  return (
    <CinematicSection
      index={0}
      chapter="01"
      title={<>Основные <span className="kw">направления</span></>}
      // Not serviceMeta.description any more. That line — "Съёмка и монтаж
      // роликов под ваш формат и площадку" — is what the ServicePicker
      // directly above this chapter already says, so the two stacked and
      // repeated each other word for word on the way down the page. This
      // line does the job the picker's cannot: it says what the six cards
      // below actually are.
      intro={<>Пять форматов, которые мы снимаем чаще всего — от презентационного фильма до <span className="kw">AI-видео</span>.</>}
      // Same reasoning as chapter 02's: the body is a six-card grid, and at
      // the default header size it loses its bottom row on short viewports
      // (a chapter cannot scroll internally inside the deck — see
      // CinematicStage). A smaller title buys that room back from the
      // header rather than from the cards.
      titleClassName="text-4xl sm:text-5xl lg:text-6xl xl:text-6xl"
      decor={
        <>
          <ContentDecoIcon
            src="/images/icons/content/presentation.png"
            size={238}
            rotate={-6}
            variant={1}
            className="right-[6%] top-0"
          />
          {/* AI direction's own icon, tucked just in front of the
              presentation icon's left edge so the two read as one small
              cluster — sized and placed to only ever overlap that one
              icon, never the title or the cards below it. */}
          <ContentDecoIcon
            src="/images/icons/content/ai-video.png"
            size={168}
            rotate={4}
            variant={4}
            z={1}
            className="right-[19%] top-6"
          />
        </>
      }
    >
      <DirectionsGrid />
    </CinematicSection>
  );
}
