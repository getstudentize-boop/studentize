import { useQuery } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { LockedOverlay } from "@/components/upgrade-modal";
import { SectionSkeleton } from "./section-skeleton";
import { ChalkboardTeacherIcon } from "@phosphor-icons/react";

export function AdvisorCard({
  onUpgrade,
}: {
  onUpgrade: (feature: string) => void;
}) {
  const profileQuery = useQuery(
    orpc.student.getMyProfile.queryOptions({ input: {} }),
  );
  const advisorQuery = useQuery(
    orpc.student.getMyAdvisor.queryOptions({ input: {} }),
  );

  const isFreeUser =
    !profileQuery.data?.tier || profileQuery.data.tier === "FREE";
  const advisor = advisorQuery.data;

  if (profileQuery.isLoading || advisorQuery.isLoading) {
    return <SectionSkeleton />;
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 relative min-h-36">
      {isFreeUser && (
        <LockedOverlay
          onClick={() => onUpgrade("your personal advisor")}
          message="Advisor Access"
        />
      )}
      <div className="flex items-center gap-2 mb-2">
        <ChalkboardTeacherIcon className="size-5 text-zinc-400" />
        <span className="text-sm font-medium text-zinc-500 uppercase tracking-wide">
          Your Advisor
        </span>
      </div>
      {advisor ? (
        <div className="text-lg font-semibold text-zinc-900">
          {advisor.advisorName}
        </div>
      ) : (
        <div className="text-zinc-400">Not assigned yet</div>
      )}
    </div>
  );
}
