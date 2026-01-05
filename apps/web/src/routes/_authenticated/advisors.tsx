import { Breadcrumb } from "@/features/breadcrumb";
import { UserCrumb } from "@/features/breadcrumb/user-crumb";
import { AdvisorTable } from "@/features/tables/advisor";
import { ChalkboardTeacherIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { orpc } from "orpc/client";

export const Route = createFileRoute("/_authenticated/advisors")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = useParams({
    from: "/_authenticated/advisors/$userId",
    shouldThrow: false,
  });

  const advisorsQuery = useQuery(orpc.advisor.list.queryOptions());

  const advisors = advisorsQuery.data ?? [];

  return (
    <div className="flex-1">
      <Breadcrumb
        paths={[
          {
            label: "Advisors",
            to: "/advisors",
            component: (
              <div className="flex gap-2.5 items-center">
                <ChalkboardTeacherIcon />
                Advisors
              </div>
            ),
          },
          params?.userId
            ? {
                label: "Advisor",
                to: ".",
                component: <UserCrumb userId={params?.userId} />,
              }
            : undefined,
        ]}
      />
      <div className="flex h-[calc(100vh-60px)]">
        <div className="flex flex-1 p-4 pt-2.5 text-left">
          <div className="border border-bzinc bg-white rounded-lg flex-1 text-left overflow-hidden">
            <AdvisorTable
              data={advisors}
              currentAdvisorUserId={params?.userId}
              isLoading={advisorsQuery.isLoading}
              isError={advisorsQuery.isError}
            />
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
