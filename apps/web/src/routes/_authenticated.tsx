import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { ArrowsCounterClockwiseIcon } from "@phosphor-icons/react";

import { Header } from "@/features/header";
import { orpc } from "orpc/client";
import { Button } from "@/components/button";
import { getUserAuth } from "@/utils/workos";

export const Route = createFileRoute("/_authenticated")({
  component: App,
  beforeLoad: async () => {
    const user = await getUserAuth();

    if (!user) {
      throw redirect({ to: "/" });
    }
  },
  loader: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(
      orpc.user.current.queryOptions()
    );

    return { user };
  },
  pendingComponent: () => (
    <div className="flex h-screen items-center justify-center">
      <img src="/cube.png" className="w-36 animate-float" />
    </div>
  ),
});

export const useAuthUser = () => {
  const data = Route.useLoaderData();
  return data;
};

function App() {
  const { user } = Route.useLoaderData();

  if (user.type !== "ADMIN" && ["PENDING", "INACTIVE"].includes(user.status)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-sm text-center flex flex-col gap-4 items-center">
          Your account is pending approval by an admin. Please reach out to
          support if you believe this is an error.
          <div>
            <Button onClick={() => location.reload()}>
              Refresh Page
              <ArrowsCounterClockwiseIcon />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Header userType={user.type}>
      <Outlet />
    </Header>
  );
}
