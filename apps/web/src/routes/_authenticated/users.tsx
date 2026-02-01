import { PendingUserTable } from "@/features/tables/pending-user";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { orpc } from "orpc/client";

export const Route = createFileRoute("/_authenticated/users")({
  component: RouteComponent,
});

function RouteComponent() {
  const pendingUsersQuery = useQuery(
    orpc.user.listPending.queryOptions()
  );

  const pendingUsers = pendingUsersQuery.data ?? [];

  return (
    <div className="flex flex-1 p-4 pt-2.5 h-screen text-left">
      <div className="flex-1 flex-col flex">
        <div className="flex items-center justify-between p-2.5">
          <div>Pending Users</div>
        </div>
        <PendingUserTable
          data={pendingUsers}
          isError={pendingUsersQuery.isError}
          isLoading={pendingUsersQuery.isLoading}
        />
      </div>
    </div>
  );
}
