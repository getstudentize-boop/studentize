import { createFileRoute, Outlet } from "@tanstack/react-router";

import { Header } from "@/features/header";
import { orpc } from "orpc/client";
import { Button } from "@/components/button";
import { ArrowsCounterClockwiseIcon } from "@phosphor-icons/react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: App,
  loader: async () => {
    const currentUser = await orpc.user.current.call();
    return { currentUser };
  },
});

function App() {
  const { currentUser } = Route.useLoaderData();

  if (currentUser.status === "PENDING") {
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
