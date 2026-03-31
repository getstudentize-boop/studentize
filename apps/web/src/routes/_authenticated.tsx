import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";

import { Header } from "@/features/header";
import { orpc } from "orpc/client";
import { OnboardingPending } from "@/features/onboarding/pending";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated")({
  component: App,
});

export const useAuthUser = () => {
  const userQuery = useQuery(
    orpc.user.current.queryOptions({
      staleTime: Infinity,
    }),
  );

  // prefetch the essays and universities
  useQuery(orpc.essay.list.queryOptions({ input: {} }));
  useQuery(orpc.essay.list.queryOptions({ input: { region: "US" } }));
  useQuery(orpc.essay.list.queryOptions({ input: { region: "UK" } }));
  useQuery(orpc.essay.list.queryOptions({ input: { region: "Other" } }));
  useQuery(orpc.college.searchUS.queryOptions({ input: {} }));
  useQuery(orpc.college.searchUK.queryOptions({ input: {} }));

  return { user: userQuery.data!, isPending: userQuery.isPending };
};

function App() {
  const { isPending, user } = useAuthUser();

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <img
          src="/logo.png"
          alt="Studentize Logo"
          className="w-24 animate-spin"
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (["PENDING", "INACTIVE"].includes(user?.status)) {
    return (
      <OnboardingPending
        organizationRole={user?.organization?.role ?? "STUDENT"}
      />
    );
  }

  return (
    <Header userRole={user?.organization?.role ?? "STUDENT"}>
      <Outlet />
    </Header>
  );
}
