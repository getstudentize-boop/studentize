import { createFileRoute, redirect } from "@tanstack/react-router";

import { Button } from "@/components/button";
import { useAuth } from "@workos-inc/authkit-react";
import { getUserAuth } from "@/utils/workos";
import { orpc } from "orpc/client";
import { setLocalStorage } from "@/utils/local-storage";

export const Route = createFileRoute("/")({
  component: App,
  ssr: false,
  beforeLoad: async ({ context }) => {
    const user = await getUserAuth();

    if (user) {
      // Fetch full user data to check their role
      const fullUser = await context.queryClient.ensureQueryData(
        orpc.user.current.queryOptions()
      );

      // Redirect students to their dashboard, others to /home
      // Students who have completed onboarding should not see the sign-in form
      if (fullUser.organization?.role === "STUDENT") {
        // If student has completed onboarding, redirect to dashboard
        // (onboardingCompleted is checked in the authenticated route)
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
      <div className="flex-1 flex flex-col justify-center items-center px-12 relative">
        <img src="/logo.png" alt="Studentize Logo" className="w-16 mb-2" />
        <div className=" mt-4 font-semibold text-zinc-900 mb-1">
          All-in-One Admissions Solution
        </div>
        <div className="text-zinc-600 text-center max-w-md mb-4">
          Powered by Real Mentors.
        </div>
        <div className="flex flex-col gap-3 mt-2 w-56">
          <Button variant="neutral" className="w-full" onClick={() => signIn()}>
            Sign In
          </Button>
        </div>

        <button
          className="absolute bottom-10 right-10 hover:underline"
          onClick={() => {
            setLocalStorage("signupAsAdvisor", true);
            signIn();
          }}
        >
          Sign up as advisor
        </button>
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
