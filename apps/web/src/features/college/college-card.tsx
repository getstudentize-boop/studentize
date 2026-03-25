import {
  BookmarkSimpleIcon,
  GraduationCap,
  MapPin,
  CircleNotchIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";
import { College, UKCollegeData } from "./types";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "orpc/client";

// Determine selectivity color based on admission rate
const getSelectivityColor = (rate: number) => {
  if (rate < 0.15) return "bg-blue-500";
  if (rate < 0.3) return "bg-blue-400";
  if (rate < 0.5) return "bg-blue-300";
  return "bg-blue-200";
};

// Component to handle image loading with fallback
function CollegeImage({ src, alt }: { src: string | null; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-full h-40 mb-2 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <GraduationCap size={48} className="text-blue-300" weight="duotone" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className="w-full h-40 mb-2 rounded-lg object-cover bg-zinc-50"
    />
  );
}

function BookmarkButton({
  collegeId,
  country,
}: {
  collegeId: string;
  country: "us" | "uk";
}) {
  const queryClient = useQueryClient();

  const { data: shortlistCheck } = useQuery(
    orpc.shortlist.checkIfShortlisted.queryOptions({
      input: { collegeId, country },
    }),
  );

  const { data: shortlistData } = useQuery(
    orpc.shortlist.getMyShortlist.queryOptions({ input: {} }),
  );

  const shortlistItemId = shortlistData?.find(
    (item) => item.collegeId === collegeId && item.country === country,
  )?.id;

  const invalidateQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: orpc.shortlist.checkIfShortlisted.queryOptions({
          input: { collegeId, country },
        }).queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: orpc.shortlist.getMyShortlist.queryOptions({ input: {} })
          .queryKey,
      }),
    ]);
  };

  const addMutation = useMutation(
    orpc.shortlist.add.mutationOptions({ onSuccess: invalidateQueries }),
  );

  const removeMutation = useMutation(
    orpc.shortlist.remove.mutationOptions({ onSuccess: invalidateQueries }),
  );

  const isShortlisted = shortlistCheck?.isShortlisted ?? false;
  const isPending = addMutation.isPending || removeMutation.isPending;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (isPending) return;
        if (isShortlisted && shortlistItemId) {
          removeMutation.mutate({ id: shortlistItemId });
        } else if (!isShortlisted) {
          addMutation.mutate({ collegeId, country, source: "manual" });
        }
      }}
      className={`absolute top-2 right-2 z-10 p-1.5 rounded-full backdrop-blur-sm transition-all ${
        isShortlisted
          ? "bg-blue-500 text-white hover:bg-blue-600"
          : "bg-white/80 text-zinc-500 hover:bg-white hover:text-blue-500"
      }`}
      title={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
    >
      {isPending ? (
        <SpinnerIcon size={18} className="animate-spin" />
      ) : (
        <BookmarkSimpleIcon
          size={18}
          weight={isShortlisted ? "fill" : "regular"}
        />
      )}
    </button>
  );
}

type CollegeCardProps =
  | {
      country: "us";
      college: College;
      onClick: () => void;
    }
  | {
      country: "uk";
      college: UKCollegeData;
      onClick: () => void;
    };

export function CollegeCard(props: CollegeCardProps) {
  const { country, college, onClick } = props;

  if (country === "us") {
    const usCollege = college as College;
    const name = usCollege.schoolName;
    const location =
      usCollege.schoolCity && usCollege.schoolState
        ? `${usCollege.schoolCity}, ${usCollege.schoolState}`
        : usCollege.schoolState || usCollege.schoolCity || "—";

    return (
      <button
        onClick={onClick}
        className="w-full text-left bg-white rounded-lg border border-zinc-200 p-4 hover:border-blue-200 hover:shadow-md transition-all group"
      >
        <div className="relative">
          <CollegeImage src={usCollege.imageUrl} alt={name} />
          <BookmarkButton collegeId={usCollege.id} country="us" />
        </div>
        <div className="flex items-start gap-3">
          {usCollege.admissionRate && (
            <div
              className={`w-1 h-12 rounded-full ${getSelectivityColor(usCollege.admissionRate)} flex-shrink-0`}
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-zinc-900 text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <MapPin size={12} className="flex-shrink-0" />
              <span className="line-clamp-1">{location}</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 pt-3 mt-3 border-t border-zinc-100 text-xs">
          {usCollege.tuitionOutOfState && (
            <div className="flex justify-between">
              <span className="text-zinc-500">Tuition</span>
              <span className="font-medium text-zinc-900">
                ${Number(usCollege.tuitionOutOfState).toLocaleString()}
              </span>
            </div>
          )}
          {usCollege.admissionRate && (
            <div className="flex justify-between">
              <span className="text-zinc-500">Acceptance</span>
              <span className="font-medium text-blue-600">
                {(Number(usCollege.admissionRate) * 100).toFixed(0)}%
              </span>
            </div>
          )}
          {usCollege.satScoreAverage && (
            <div className="flex justify-between">
              <span className="text-zinc-500">Avg SAT</span>
              <span className="font-medium text-zinc-900">
                {usCollege.satScoreAverage}
              </span>
            </div>
          )}
        </div>
      </button>
    );
  } else {
    const ukCollege = college as UKCollegeData;
    const name = ukCollege.universityName;
    const location = ukCollege.location || "—";

    return (
      <button
        onClick={onClick}
        className="w-full text-left bg-white rounded-lg border border-zinc-200 p-4 hover:border-blue-200 hover:shadow-md transition-all group"
      >
        <div className="relative">
          <CollegeImage src={ukCollege.imageUrl} alt={name} />
          <BookmarkButton collegeId={ukCollege.id} country="uk" />
        </div>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-zinc-900 text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <MapPin size={12} className="flex-shrink-0" />
              <span className="line-clamp-1">{location}</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 pt-3 mt-3 border-t border-zinc-100 text-xs">
          {ukCollege.tuitionFees && (
            <div className="flex justify-between">
              <span className="text-zinc-500">Tuition</span>
              <span className="font-medium text-zinc-900">
                £{Number(ukCollege.tuitionFees).toLocaleString()}
              </span>
            </div>
          )}
          {ukCollege.totalForeignStudents && (
            <div className="flex justify-between">
              <span className="text-zinc-500">Intl Students</span>
              <span className="font-medium text-zinc-900">
                {Number(ukCollege.totalForeignStudents).toLocaleString()}
              </span>
            </div>
          )}
          {ukCollege.sizeOfCity && (
            <div className="flex justify-between">
              <span className="text-zinc-500">City Size</span>
              <span className="font-medium text-zinc-900">
                {ukCollege.sizeOfCity}
              </span>
            </div>
          )}
        </div>
      </button>
    );
  }
}
