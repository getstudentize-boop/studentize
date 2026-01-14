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
    <div className="flex items-center border-b border-zinc-100 bg-gradient-to-r from-white to-zinc-50/30">
      <div className="flex-1 flex flex-col justify-center px-10 py-7 border-r border-zinc-100">
        <div className="font-semibold text-lg text-zinc-900 mb-1">
          Hi {overview?.user?.name?.split(" ")[0]} 👋
        </div>
        <div className="flex gap-2.5 items-center mt-1 mb-3 text-sm text-zinc-600">
          <EnvelopeIcon className="size-4 text-zinc-400" />
          <div>{overview?.user.email}</div>
          <div className="text-zinc-300">●</div>
          <div>
            Joined {_format(overview?.createdAt ?? new Date(), "dd MMM yyyy")}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="rounded-lg border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-700 font-medium shadow-sm">
            {overview?.university}
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-700 font-medium shadow-sm">
            {overview?.courseMajor}
          </div>
          <button className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors opacity-60 hover:opacity-100">
            <GearIcon className="size-4 text-zinc-600" />
          </button>
        </div>
      </div>
      <div className="p-10 px-12 py-7 flex gap-12">
        <div>
          <div className="font-semibold text-2xl flex items-center gap-2.5 mb-1">
            <BrainIcon className="size-5" style={{ color: '#BCFAF9', filter: 'brightness(0.7)' }} />
            <span className="text-zinc-900">
              {overview?.totalStudents ?? 0}
            </span>
          </div>
          <div className="text-sm text-zinc-600">No. of Students</div>
        </div>
        <div>
          <div className="font-semibold text-2xl flex items-center gap-2.5 mb-1">
            <VideoCameraIcon className="size-5" style={{ color: '#BCFAF9', filter: 'brightness(0.7)' }} />
            <span className="text-zinc-900">
              {overview?.totalSessions ?? 0}
            </span>
          </div>
          <div className="text-sm text-zinc-600">No. of Sessions</div>
        </div>
      </div>
    </div>
  );
};
