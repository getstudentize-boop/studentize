import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { Header } from "@/features/header";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({ href: "/api/auth/login" });
    }
  },
  component: App,
});

function App() {
  return (
    <Header>
      <Outlet />
    </Header>
  );
}
