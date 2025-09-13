import { createFileRoute, redirect } from "@tanstack/react-router";

import { Button } from "@/components/button";
import { useAuth } from "@workos-inc/authkit-react";
import { getUserAuth } from "@/utils/workos";

export const Route = createFileRoute("/")({
  component: App,
  ssr: false,
  beforeLoad: async () => {
    const user = await getUserAuth();

    if (user) {
      throw redirect({ to: "/guru" });
    }
  },
});

function App() {
  const { signIn } = useAuth();

  return (
    <div className="flex h-screen flex-1">
      <div className="flex-1 flex flex-col justify-center items-center gap-4">
        <Button className="rounded-md w-52" onClick={() => signIn()}>
          Login
        </Button>
        <Button className="rounded-md w-52" variant="neutral">
          Sign up as advisor
        </Button>
      </div>
      <div className="flex-1 p-2 flex">
        <img
          src="https://images.unsplash.com/photo-1622397333309-3056849bc70b?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
          className="h-full w-full flex-1 rounded-lg"
        />
      </div>
    </div>
  );
}
