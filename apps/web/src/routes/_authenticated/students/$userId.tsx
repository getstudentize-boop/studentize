import { UserOverviewTab } from "@/features/user-tabs";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

export const Route = createFileRoute("/_authenticated/students/$userId")({
  component: RouteComponent,
  validateSearch: (search) =>
    z
      .object({
        tab: z
          .enum(["profile", "extracurricular", "sessions"])
          .default("profile")
          .optional(),
      })
      .parse(search),
});

function RouteComponent() {
  const params = Route.useParams();
  const search = Route.useSearch();

  const currentTab = search.tab ?? "profile";

  return (
    <UserOverviewTab
      currentTab={currentTab}
      studentUserId={params.userId}
      goBack="/students"
      className=""
    />
  );
}
