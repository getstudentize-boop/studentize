import { cn } from "@/utils/cn";
import {
  BrainIcon,
  ChalkboardTeacherIcon,
  HeadsetIcon,
  SignOutIcon,
  StudentIcon,
} from "@phosphor-icons/react";
import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";
import { RouterOutputs } from "orpc/client";
import { ReactNode } from "react";

type UserType = RouterOutputs["user"]["current"]["type"];

export const Header = ({
  children,
  userType,
}: {
  children: ReactNode;
  userType: UserType;
}) => {
  const route = useMatchRoute();
  const navigate = useNavigate();

  const { signOut } = useAuth();

  const isGuru = route({ to: "/guru" });
  const isSessions = route({ to: "/sessions" });
  const isStudents = route({ to: "/students" });
  const isAdvisors = route({ to: "/advisors" });

  const icons: any = [
    { to: "/guru", icon: <BrainIcon className="size-4" />, isActive: isGuru },
    userType === "ADMIN"
      ? {
          to: "/sessions",
          icon: <HeadsetIcon className="size-4" />,
          isActive: isSessions,
        }
      : null,
    {
      to: "/students",
      icon: <StudentIcon className="size-4" />,
      isActive: isStudents,
    },
    userType === "ADMIN"
      ? {
          to: "/advisors",
          icon: <ChalkboardTeacherIcon className="size-4" />,
          isActive: isAdvisors,
        }
      : null,
  ].filter(Boolean);

  return (
    <div
      className={cn("text-center flex gap-4 h-screen", {
        "bg-zinc-50": !isGuru,
      })}
    >
      <div className="border-r border-zinc-100 px-3.5 py-6 gap-2 flex flex-col items-center bg-white">
        {icons.map(({ to, icon, isActive }) => (
          <Link
            to={to}
            key={to}
            className={cn(
              "p-2 bg-linear-to-br from-zinc-800 to-zinc-700 text-white rounded-xl",
              {
                "bg-linear-to-br from-white to-white text-zinc-800": !isActive,
              }
            )}
            activeProps={{ className: "bg-white" }}
          >
            {icon}
          </Link>
        ))}

        <button
          onClick={() => {
            signOut();
            navigate({ to: "/" });
          }}
          className="rounded-md bg-zinc-100 p-2 shadow-sm outline outline-bzinc/80 mt-auto"
        >
          <SignOutIcon />
        </button>
      </div>
      {children}
    </div>
  );
};
