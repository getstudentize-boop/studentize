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
          title: "TanStack Start Starter",
        },
      ],
      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
      ],
    }),
    shellComponent: RootDocument,
    notFoundComponent: () => <div>404 - Not Found</div>,
    pendingComponent: () => (
      <div className="flex h-screen items-center justify-center">
        <img src="/cube.png" className="w-36 animate-float" />
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
        <AuthKitProvider clientId={import.meta.env.VITE_WORKOS_CLIENT_ID!}>
          {children}
        </AuthKitProvider>
        <TanstackDevtools
          config={{
            position: "bottom-left",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
