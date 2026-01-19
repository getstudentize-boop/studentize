import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/student/universities/")({
  beforeLoad: () => {
    throw redirect({ to: "/student/universities/explorer" });
  },
});
