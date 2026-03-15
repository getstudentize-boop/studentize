import { VisitorTable } from "@/features/tables/visitor";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { orpc } from "orpc/client";

export const Route = createFileRoute("/_authenticated/visitors")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = useParams({
    from: "/_authenticated/visitors/$chatId",
    shouldThrow: false,
  });

  const visitorsQuery = useQuery(orpc.visitorChat.list.queryOptions());

  const visitors = visitorsQuery.data ?? [];

  return (
    <>
      <div className="flex flex-1 p-4 pt-2.5 h-screen text-left">
        <div className="flex-1 flex-col flex">
          <div className="flex items-center justify-between p-2.5">
            <div>Visitors</div>
          </div>
          <VisitorTable
            data={visitors}
            currentChatId={params?.chatId}
            isLoading={visitorsQuery.isLoading}
            isError={visitorsQuery.isError}
          />
        </div>
      </div>
      <Outlet />
    </>
  );
}
