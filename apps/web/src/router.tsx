import { createRouter as createTanstackRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { QueryClient } from "@tanstack/react-query";

import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

// Create a new router instance
export const createRouter = () => {
  const queryClient = new QueryClient();

  const router = createTanstackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    context: { queryClient },
    defaultPendingComponent: () => (
      <div className="flex h-screen items-center justify-center">
        <img src="/cube.png" className="w-48 animate-float" />
      </div>
    ),
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
};

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
