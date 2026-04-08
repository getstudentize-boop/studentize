import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { AuthKitProvider } from "@workos-inc/authkit-react";
import { Header } from "../components/header";
import { AuthGate } from "../components/auth-gate";

import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  // ssr: false,
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Studentize Analytics",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/logo.png",
      },
    ],
  }),
  shellComponent: RootDocument,
  errorComponent: ({ error }) => (
    <div>
      <h1>App Error</h1>
      <pre>{error.message}</pre>
    </div>
  ),
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

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        <AuthKitProvider
          clientId={import.meta.env.VITE_WORKOS_CLIENT_ID!}
          devMode
        >
          <AuthGate>
            <Header>{children}</Header>
          </AuthGate>
        </AuthKitProvider>
        <Scripts />
      </body>
    </html>
  );
}
