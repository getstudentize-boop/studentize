import { UserExtracurricularTab } from "@/features/user-tabs/extracurricular";
import { UserProfileTab } from "@/features/user-tabs/profile";
import { UserSessionsTab } from "@/features/user-tabs/sessions";
import { cn } from "@/utils/cn";
import { ArrowLeftIcon, GearIcon } from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import Avvvatars from "avvvatars-react";
import z from "zod";

export const Route = createFileRoute("/_authenticated/students/$userId")({
  component: RouteComponent,
  validateSearch: (search) =>
    z
      .object({
        tab: z
          .enum(["profile", "extracurricular", "sessions"])
          .default("profile")
          .optional(),
      })
      .parse(search),
});

function RouteComponent() {
  const search = Route.useSearch();

  const currentTab = search.tab ?? "profile";

  return (
    <div className="w-[35rem] bg-white border-l border-bzinc flex flex-col text-left">
      <div className="px-4 pt-7 pb-4 border-b border-bzinc flex justify-between items-center">
        <Link to="/students">
          <ArrowLeftIcon />
        </Link>

        <GearIcon className="size-4" />
      </div>
      <div>
        <div className="flex p-4 gap-4">
          <Avvvatars value="student name" size={50} style="shape" />
          <div className="flex-1">
            <div className="font-semibold">Khaya Zulu</div>
            <div className="flex mt-2 gap-8">
              <div>
                <div>Location</div>
                <div className="font-semibold">South Africa</div>
              </div>
              <div>
                <div>Email</div>
                <div className="font-semibold">khaya.zulu@example.com</div>
              </div>
              <div>
                <div>Sessions</div>
                <div className="font-semibold">5</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2.5 flex px-5 border-b border-bzinc">
          <Link
            to="."
            search={{ tab: "profile" }}
            className={cn(
              "border-b-4 pb-1 px-4",
              currentTab === "profile" ? "border-violet-500" : "border-white"
            )}
          >
            Profile
          </Link>
          <Link
            to="."
            search={{ tab: "extracurricular" }}
            className={cn(
              "border-b-4 pb-1 px-4",
              currentTab === "extracurricular"
                ? "border-violet-500"
                : "border-white"
            )}
          >
            Extracurricular
          </Link>
          <Link
            to="."
            search={{ tab: "sessions" }}
            className={cn(
              "border-b-4 pb-1 px-4",
              currentTab === "sessions" ? "border-violet-500" : "border-white"
            )}
          >
            Sessions
          </Link>
        </div>
        {currentTab === "profile" ? <UserProfileTab /> : null}
        {currentTab === "extracurricular" ? <UserExtracurricularTab /> : null}
        {currentTab === "sessions" ? <UserSessionsTab /> : null}
      </div>
    </div>
  );
}
