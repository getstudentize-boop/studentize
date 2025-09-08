import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { Header } from "@/features/header";

export const Route = createFileRoute("/_authenticated")({
  ssr: true,
  component: App,
});

function App() {
  return (
    <Header>
      <Outlet />
    </Header>
  );
}
