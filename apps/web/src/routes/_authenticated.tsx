import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { ArrowsCounterClockwiseIcon } from "@phosphor-icons/react";

import { Header } from "@/features/header";
import { orpc } from "orpc/client";
import { Button } from "@/components/button";

export const Route = createFileRoute("/_authenticated")({
  component: App,
  loader: async () => {
    const user = await orpc.user.current.call();
    return { user };
  },
});

function App() {
  const { user } = Route.useLoaderData();

  if (user.status === "PENDING") {
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
    <Header>
      <Outlet />
    </Header>
  );
}
