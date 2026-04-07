import { useAuth } from "@workos-inc/authkit-react";
import { useEffect } from "react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, signIn } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      signIn();
    }
  }, [loading, user, signIn]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <img
          src="/logo.png"
          alt="Studentize Logo"
          className="w-24 animate-spin"
        />
      </div>
    );
  }

  return <>{children}</>;
}
