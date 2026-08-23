"use client";

import CinematicSection from "@/components/ui/CinematicSection";

// Chapter 07 — team and blog folded together, both genuinely thin: the site
// has no blog infrastructure anywhere (no posts, no CMS) and no team/studio
// profile section to reuse, so both halves are structural placeholders
// rather than invented copy. What's real (agency-wide facts already used
// elsewhere on the site) is written plainly; what isn't is [TODO]-marked.

const ARTICLES = [1, 2, 3];

export default function AiTeamBlog() {
  return (
    <CinematicSection
      index={7}
      chapter="08"
      title="Команда и блог"
      icon="users"
      side="right"
      entrance="rise"
      id="team"
      intro="За AI-решениями стоят конкретные люди — не коробочный сервис."
    >
      <div className="lg:flex lg:items-start lg:gap-12">
        <div className="rounded-2xl bg-ink/45 p-5 backdrop-blur-md lg:max-w-md lg:flex-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-glow">Команда</span>
          <p className="mt-2 text-sm leading-relaxed text-paper/75">
            AI-инструменты внедряем с 2024 года в составе продюсерского центра HDKV.AGENCY —
            [TODO] специалистов, включая AI-инженеров и продюсеров направления.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Продюсер направления", "AI-инженер", "[TODO РОЛЬ]"].map((role) => (
              <span
                key={role}
                className="rounded-full border border-paper/15 px-3 py-1 text-[11px] text-paper/60"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 lg:mt-0 lg:w-[360px] lg:shrink-0 xl:w-[400px]">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/45">
            Блог · [TODO СТАТЬЯ ×3]
          </span>
          <div className="mt-3 space-y-2.5">
            {ARTICLES.map((i) => (
              <div
                key={i}
                className="rounded-xl border border-dashed border-paper/20 bg-ink/30 px-4 py-3 text-xs text-paper/45"
              >
                <div className="font-mono uppercase tracking-[0.1em] text-paper/55">
                  [TODO РУБРИКА] · [TODO ДАТА]
                </div>
                <p className="mt-1">[TODO заголовок статьи]</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CinematicSection>
  );
}
