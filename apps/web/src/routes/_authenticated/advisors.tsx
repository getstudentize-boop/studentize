import { AdvisorTable } from "@/features/tables/advisor";
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
    <>
      <div className="flex flex-1 p-4 pt-2.5 h-screen text-left">
        <div className="flex-1 flex-col flex">
          <div className="flex items-center justify-between p-2.5">
            <div>Advisors</div>
          </div>
          <div className="border border-bzinc bg-white rounded-lg flex-1 text-left">
            <AdvisorTable
              data={advisors}
              currentAdvisorUserId={params?.userId}
            />
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}
