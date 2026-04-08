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

  if (!user.email?.endsWith("@studentize.com")) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 text-white">
        <img src="/logo.png" alt="Studentize Logo" className="w-12" />
        <h1 className="text-lg font-semibold text-white">Looking for your student portal?</h1>
        <p className="text-white">
          <a
            href="https://app.studentize.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500"
          >
            Head to app.studentize.com
          </a>
        </p>
        <p className="text-white">{user.email}</p>
      </div>
    );
  }

  return <>{children}</>;
}
