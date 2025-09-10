import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { Header } from "@/features/header";
import { getWorkOSClient } from "@/utils/workos";

export const Route = createFileRoute("/_authenticated")({
  component: App,
});

function App() {
  // const { user } = Route.useLoaderData();

  // if (user.status === "PENDING") {
  //   return (
  //     <div className="flex h-screen items-center justify-center">
  //       <div className="max-w-sm text-center flex flex-col gap-4 items-center">
  //         Your account is pending approval by an admin. Please reach out to
  //         support if you believe this is an error.
  //         <div>
  //           <Button onClick={() => location.reload()}>
  //             Refresh Page
  //             <ArrowsCounterClockwiseIcon />
  //           </Button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <Header>
      <Outlet />
    </Header>
  );
}
