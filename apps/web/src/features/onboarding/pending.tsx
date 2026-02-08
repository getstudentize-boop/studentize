import { Button } from "@/components/button";
import { ArrowsCounterClockwiseIcon, SignOutIcon } from "@phosphor-icons/react";
import { useTransition } from "react";
import { useAuth } from "@workos-inc/authkit-react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { Loader } from "@/components/loader";
import { StudentOnboarding } from "./student";
import { OwnerOnboarding } from "./owner";
import { useAuthUser } from "@/routes/_authenticated";

export const OnboardingPending = ({
  organizationRole,
}: {
  organizationRole: "OWNER" | "ADMIN" | "ADVISOR" | "STUDENT";
}) => {
  const [isPending, startTransition] = useTransition();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { user } = useAuthUser();

  const organizationQuery = useQuery(
    orpc.organization.current.queryOptions({})
  );

  if (organizationQuery.isPending || !organizationQuery.data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-sm text-center flex flex-col gap-2 items-center">
          <Loader className="w-50" />
          <Loader className="w-40" />

          <Loader className="w-28 h-8 mt-4" />
        </div>
      </div>
    );
  }

  const organization = organizationQuery.data;

  if (organizationRole === "STUDENT" && !user?.onboardingCompleted) {
    return <StudentOnboarding organizationId={organization.id} />;
  }

  if (organization.status === "PENDING" && organizationRole === "OWNER") {
    return <OwnerOnboarding organizationId={organization.id} />;
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="max-w-sm text-center flex flex-col gap-4 items-center">
        Your account is pending approval by an admin. Please reach out to
        support if you believe this is an error.
        <div className="flex flex-col justify-center gap-10">
          <Button onClick={() => location.reload()}>
            Refresh Page
            <ArrowsCounterClockwiseIcon />
          </Button>

          <Button
            variant="neutral"
            isLoading={isPending}
            onClick={() => {
              startTransition(async () => {
                await signOut({ navigate: false });
                navigate({ to: "/" });
              });
            }}
          >
            Sign Out
            <SignOutIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};
