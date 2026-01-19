import { createFileRoute, redirect } from "@tanstack/react-router";

import { Button } from "@/components/button";
import { useAuth } from "@workos-inc/authkit-react";
import { getUserAuth } from "@/utils/workos";
import { orpc } from "orpc/client";

export const Route = createFileRoute("/")({
  component: App,
  ssr: false,
  beforeLoad: async ({ context }) => {
    const user = await getUserAuth();

    if (user) {
      // Fetch full user data to check their type
      const fullUser = await context.queryClient.ensureQueryData(
        orpc.user.current.queryOptions()
      );

      // Redirect students to their dashboard, others to /home
      if (fullUser.type === "STUDENT") {
        throw redirect({ to: "/student/dashboard" });
      } else {
        throw redirect({ to: "/home" });
      }
    }
  },
});

function App() {
  const { signIn } = useAuth();

  return (
    <div className="flex h-screen flex-1 bg-white">
      <div className="flex-1 flex flex-col justify-center items-center gap-6 px-12">
        <img src="/logo.png" alt="Studentize Logo" className="w-24 mb-2" />
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
          All-in-One Admissions Solution
        </h1>
        <p className="text-zinc-600 text-center max-w-md">
          Powered by Real Mentors.
        </p>
        <div className="flex flex-col gap-3 mt-2 w-56">
          <Button
            variant="neutral"
            className="w-full"
            onClick={() => signIn({ state: "student-signup" })}
          >
            Sign In
          </Button>
        </div>
      </div>
      <div className="flex-1 p-6 flex bg-zinc-50">
        <div className="w-full h-full border overflow-hidden border-zinc-200 rounded-xl bg-gradient-to-b from-zinc-50 to-white relative shadow-sm">
          <img
            src="/screenshot.png"
            alt=""
            className="w-full scale-150 absolute bottom-16 left-96 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
