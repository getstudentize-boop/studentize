import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { Header } from "@/features/header";
import { orpc } from "orpc/client";
import { getUserAuth } from "@/utils/workos";
import { OnboardingPending } from "@/features/onboarding/pending";

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
      <img
        src="/logo.png"
        alt="Studentize Logo"
        className="w-24 animate-spin"
      />
    </div>
  ),
});

export const useAuthUser = () => {
  const data = Route.useLoaderData();
  return data;
};

function App() {
  const { user } = Route.useLoaderData();

  if (["PENDING", "INACTIVE"].includes(user.status)) {
    return (
      <OnboardingPending
        organizationRole={user.organization?.role ?? "STUDENT"}
      />
    );
  }

  return (
    <Header userRole={user.organization?.role ?? "STUDENT"}>
      <Outlet />
    </Header>
  );
}
