"use client";

import type { ReactNode } from "react";
import CinematicSection from "@/components/ui/CinematicSection";
import FunnelCta from "@/components/ui/FunnelCta";
import FaqAside from "@/components/home/FaqAside";
import ContentDecoIcon from "@/components/home/content/ContentDecoIcon";
import Appear from "@/components/ui/Appear";
import { BEAT, STAGGER } from "@/lib/motion";
import { useService } from "@/lib/service-context";
import { whyByCategory } from "@/lib/service-content";

// Chapter 03 on /content (the deck position `index`/`chapter` default to) —
// the old Why + Testimonials + LogoCloud folded into one screen. They made
// the same argument three times across three scroll stops; here the three
// reasons carry it, one quote backs it up, and the client names run as a
// single rule-separated line rather than a logo grid.
//
// `title`/`intro`/`clients` are props (defaulted to content's own copy and
// client roster) because both are genuinely content-specific — a different
// service reusing this chapter (see /ai) has neither a matching pitch line
// nor that client list to show, and `clients` empty hides the line rather
// than rendering it blank.

const DEFAULT_CLIENTS = [
  "KIA",
  "Федерация баскетбола",
  "Гольф-клуб",
  "Ani d. Zop",
  "COTRIL",
  "OUTDOOR",
  "GOOD GAME",
];

export default function Trust({
  index = 2,
  chapter = "03",
  title = "Именно мы",
  intro = "Продюсерский центр полного цикла: от идеи до готового ролика. Около 60% заказов — клиенты, которые возвращаются.",
  clients = DEFAULT_CLIENTS,
}: {
  index?: number;
  chapter?: string;
  title?: ReactNode;
  intro?: ReactNode;
  clients?: string[];
}) {
  const { active } = useService();
  const why = whyByCategory[active];

  return (
    <CinematicSection
      index={index}
      chapter={chapter}
      title={title}
      side="right"
      // The argument continues here, so it rises rather than cutting in sideways.
      entrance="rise"
      intro={intro}
    >
      <div className="lg:flex lg:items-start lg:justify-between lg:gap-16">
        {/* The reasons opposite it push everything lg:ml-auto, which leaves
            this whole column empty above that breakpoint — an FAQ belongs
            here rather than nowhere, since it answers exactly the practical
            questions those reasons raise. Held back below lg: the chapter
            has no vertical room to spare once it's stacking. */}
        <Appear from="left" delay={BEAT.content} className="hidden shrink-0 lg:block lg:w-[300px] xl:w-[340px]">
          <FaqAside />
        </Appear>

        <div className="mt-10 lg:mt-0 lg:max-w-2xl">
          {/* The glass frame itself (rounded-2xl bg-ink/45) used to render
              statically — it popped in with the chapter's own quick wipe,
              well before BEAT.content, and sat empty through the whole
              heading pause while the rows inside it cascaded in late. Now it
              arrives on the same beat as the first row, so frame and text
              read as one arrival rather than an empty box appearing first. */}
          <Appear
            from="up"
            delay={BEAT.content}
            className="grid gap-x-8 gap-y-6 rounded-2xl bg-ink/45 p-6 backdrop-blur-md sm:grid-cols-3 [@media(max-height:860px)]:p-3.5"
          >
            {why.reasons.map((reason, i) => (
              <Appear
                key={reason.title}
                from="up"
                delay={BEAT.content + i * STAGGER.normal}
                className="border-t border-paper/25 pt-4 [@media(max-height:860px)]:pt-2.5"
              >
                <span className="font-mono text-[10px] tracking-[0.2em] text-glow">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-sans text-sm font-semibold leading-snug text-white [text-shadow:0_2px_16px_rgba(11,11,16,0.9)]">
                  {reason.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-paper/70 [text-shadow:0_2px_16px_rgba(11,11,16,0.9)]">
                  {reason.description}
                </p>
              </Appear>
            ))}
          </Appear>

          {clients.length > 0 && (
            <Appear
              from="up"
              delay={BEAT.content + why.reasons.length * STAGGER.normal}
              className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-2 border-t border-paper/15 pt-5 [@media(max-height:860px)]:mt-3 [@media(max-height:860px)]:pt-3"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper/45">
                Нам доверяют
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper/70 [text-shadow:0_2px_16px_rgba(11,11,16,0.9)]">
                {clients.join(" / ")}
              </span>
            </Appear>
          )}

          <Appear from="up" delay={BEAT.cta} className="relative mt-7 [@media(max-height:860px)]:mt-3">
            <FunnelCta
              item="consult"
              align="right"
              size="sm"
              spacious
              flatButton
              eyebrow="Есть вопрос?"
              headline="Ответит продюсер"
              accent="а не отдел продаж"
              pitch="Около 60% заказов — клиенты, которые вернулись."
            />
            {/* Trust is shared across /ai, /sites, /smm too (each passes its
                own title/intro/clients) — this decoration is content's own
                orange-red icon set, so it only renders on /content. /ai gets
                its own emerald icon in the same slot. */}
            {active === "content" && (
              // Exception to every other icon's "always behind text" rule —
              // this one was asked to sit right on top of the card block.
              <ContentDecoIcon
                src="/images/icons/content/image.png"
                size={320}
                rotate={-30}
                variant={3}
                z={10}
                className="-left-6 top-1/2 -translate-y-1/2"
              />
            )}
          </Appear>
        </div>
      </div>
    </CinematicSection>
  );
}
