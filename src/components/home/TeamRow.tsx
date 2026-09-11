import type { TeamMember } from "@/lib/team";
import TeamCard from "@/components/home/TeamCard";

// Two team cards side by side (stacked on mobile) — one row, dropped into a
// chapter that already has its own entrance choreography (Appear/motion),
// so this stays a plain layout wrapper with no animation of its own.
export default function TeamRow({ members, className = "" }: { members: [TeamMember, TeamMember]; className?: string }) {
  return (
    <div className={`mx-auto grid w-full max-w-2xl gap-3 sm:grid-cols-2 ${className}`}>
      {members.map((member) => (
        <TeamCard key={member.id} member={member} />
      ))}
    </div>
  );
}
