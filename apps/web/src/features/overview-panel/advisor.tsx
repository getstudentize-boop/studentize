import { Loader } from "@/components/loader";
import {
  BrainIcon,
  EnvelopeIcon,
  GearIcon,
  VideoCameraIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "orpc/client";

import { format as _format } from "date-fns";

const PanelLoader = () => {
  return (
    <div className="flex items-center border-b border-bzinc">
      <div className="flex-1 flex flex-col justify-center px-10 py-8 border-r border-bzinc">
        <Loader className="w-24" />
        <div className="flex gap-2 items-center mt-2.5 mb-2">
          <EnvelopeIcon className="size-4" />
          <Loader className="w-40" />
          <div className="text-zinc-600">●</div>
          <Loader className="w-36" />
        </div>
        <div className="flex -translate-x-0.5 gap-2 items-center">
          <Loader className="w-36" />
          <Loader className="w-28" />
          <button className="opacity-40">
            <GearIcon />
          </button>
        </div>
      </div>
      <div className="p-10 px-12 py-8 flex gap-10">
        <div>
          <div className="font-semibold text-2xl flex items-center gap-2">
            <BrainIcon className="size-4" />
            <Loader className="h-[30px] w-6" />
          </div>
          <div>No. of Students</div>
        </div>
        <div>
          <div className="font-semibold text-2xl flex items-center gap-2">
            <VideoCameraIcon className="size-4" />
            <Loader className="h-[30px] w-6" />
          </div>
          <div>No. of Sessions</div>
        </div>
      </div>
    </div>
  );
};

export const AdvisorOverviewPanel = () => {
  const overviewQuery = useQuery(orpc.advisor.getOverview.queryOptions({}));

  if (overviewQuery.isPending) {
    return <PanelLoader />;
  }

  const overview = overviewQuery.data;

  return (
    <div className="flex items-center border-b border-bzinc">
      <div className="flex-1 flex flex-col justify-center px-10 py-8 border-r border-bzinc">
        <div className="font-semibold">
          Hi {overview?.user?.name?.split(" ")[0]} 👋
        </div>
        <div className="flex gap-2 items-center mt-2.5 mb-2">
          <EnvelopeIcon className="size-4" />
          <div>{overview?.user.email}</div>
          <div className="text-zinc-600">●</div>
          <div>
            Joined {_format(overview?.createdAt ?? new Date(), "dd MMM yyyy")}
          </div>
        </div>
        <div className="flex -translate-x-0.5 gap-2 items-center">
          <div className="rounded-lg border border-bzinc bg-zinc-50 px-2 py-0.5 text-sm">
            {overview?.university}
          </div>
          <div className="rounded-lg border border-bzinc bg-zinc-50 px-2 py-0.5 text-sm">
            {overview?.courseMajor}
          </div>
          <button className="opacity-40">
            <GearIcon />
          </button>
        </div>
      </div>
      <div className="p-10 px-12 py-8 flex gap-10">
        <div>
          <div className="font-semibold text-2xl flex items-center gap-2">
            <BrainIcon className="size-4" />
            <span className="text-indigo-800">
              {overview?.totalStudents ?? 0}
            </span>
          </div>
          <div>No. of Students</div>
        </div>
        <div>
          <div className="font-semibold text-2xl flex items-center gap-2">
            <VideoCameraIcon className="size-4" />
            <span className="text-cyan-800">
              {overview?.totalSessions ?? 0}
            </span>
          </div>
          <div>No. of Sessions</div>
        </div>
      </div>
    </div>
  );
};
