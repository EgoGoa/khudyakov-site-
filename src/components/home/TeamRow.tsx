import type { TeamMember } from "@/lib/team";
import TeamCard from "@/components/home/TeamCard";
import FlyingPlaneIcon from "@/components/home/FlyingPlaneIcon";
import TeamPulse from "@/components/home/team-pulse/TeamPulse";
import { TEAM_PULSE } from "@/components/home/team-pulse/registry";

// Two team cards side by side (stacked on mobile) — one row, dropped into a
// chapter that already has its own entrance choreography (Appear/motion),
// so this stays a plain layout wrapper with no animation of its own.
export default function TeamRow({
  members,
  className = "",
  /** Member id to pin the small flying-plane decoration to (/content's own
   *  ask — a plane drifting across Egor's card rather than a separate icon
   *  floating over the closing CTA line). Omit on every other page. */
  planeMemberId,
  page,
}: {
  members: [TeamMember, TeamMember];
  className?: string;
  planeMemberId?: string;
  /** Страница — чтобы взять уведомление человека с её текстами. */
  page?: "content" | "ai" | "sites" | "smm";
}) {
  const pulse = page ? TEAM_PULSE[page] : undefined;
  return (
    <div className={`mx-auto grid w-full max-w-2xl gap-3 sm:grid-cols-2 ${className}`}>
      {members.map((member) =>
        // Участник, который уже работает «как сервис», стоит здесь своим
        // уведомлением (компактный TeamPulse) — Егор: «Сашу меняем везде».
        pulse?.[member.id] ? (
          <TeamPulse key={member.id} data={pulse[member.id]} compact source="финальный блок страницы" />
        ) : (
          <TeamCard
            key={member.id}
            member={member}
            decor={member.id === planeMemberId ? <FlyingPlaneIcon /> : undefined}
          />
        ),
      )}
    </div>
  );
}
