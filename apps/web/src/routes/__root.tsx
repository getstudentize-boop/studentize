import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanstackDevtools } from "@tanstack/react-devtools";

import appCss from "../styles.css?url";
import { QueryClient } from "@tanstack/react-query";

import { AuthKitProvider } from "@workos-inc/authkit-react";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    ssr: false,
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
          title: "Studentize",
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
        {
          rel: "apple-touch-icon",
          href: "/logo.png",
        },
        {
          rel: "shortcut icon",
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
    notFoundComponent: () => <div>404 - Not Found</div>,
    pendingComponent: () => (
      <div className="flex h-screen items-center justify-center">
        <img src="/logo.png" alt="Studentize Logo" className="w-24 animate-spin" />
      </div>
    ),
  }
);

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthKitProvider
          clientId={import.meta.env.VITE_WORKOS_CLIENT_ID!}
          // apiHostname="auth.workos.com"
          devMode
        >
          {children}
        </AuthKitProvider>
        {/* <TanstackDevtools
          config={{
            position: "bottom-left",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        /> */}
        <Scripts />
      </body>
    </html>
  );
}
