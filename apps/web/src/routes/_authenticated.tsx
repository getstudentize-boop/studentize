import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { ArrowsCounterClockwiseIcon, SignOutIcon } from "@phosphor-icons/react";

import { Header } from "@/features/header";
import { orpc } from "orpc/client";
import { Button } from "@/components/button";
import { getUserAuth } from "@/utils/workos";
import { useAuth } from "@workos-inc/authkit-react";
import { useTransition } from "react";

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
  const navigate = Route.useNavigate();

  const [isPending, startTransition] = useTransition();

  const { signOut } = useAuth();

  if (user.type !== "ADMIN" && ["PENDING", "INACTIVE"].includes(user.status)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-sm text-center flex flex-col gap-4 items-center">
          Your account is pending approval by an admin. Please reach out to
          support if you believe this is an error.
          <div className="flex flex-col justify-center gap-10">
            <Button onClick={() => location.reload()}>
              Refresh Page
              <ArrowsCounterClockwiseIcon />
            </Button>

            <Button
              variant="neutral"
              isLoading={isPending}
              onClick={() => {
                startTransition(async () => {
                  await signOut({ navigate: false });
                  navigate({ to: "/" });
                });
              }}
            >
              Sign Out
              <SignOutIcon />
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
