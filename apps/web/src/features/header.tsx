import { cn } from "@/utils/cn";
import {
  BrainIcon,
  ChalkboardTeacherIcon,
  ChartLineIcon,
  CircleNotchIcon,
  HeadsetIcon,
  HouseIcon,
  SignOutIcon,
  StudentIcon,
  VideoCameraIcon,
  PencilIcon,
  GraduationCapIcon,
} from "@phosphor-icons/react";
import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";
import { RouterOutputs } from "orpc/client";
import { ReactNode, useTransition } from "react";

type UserRole = RouterOutputs["user"]["current"]["organization"]["role"];

export const Header = ({
  children,
  userRole,
}: {
  children: ReactNode;
  userRole: UserRole;
}) => {
  const [isLoading, startTransition] = useTransition();

  const route = useMatchRoute();
  const navigate = useNavigate();

  const { signOut } = useAuth();

  const isGuru = route({ to: "/guru" });

  const isAdmin = ["OWNER", "ADMIN"].includes(userRole);

  const icons: any =
    userRole === "STUDENT"
      ? [
          // Student-specific navigation
          {
            to: "/student/dashboard",
            icon: <HouseIcon className="size-4" />,
            label: "Dashboard",
            isActive: route({ to: "/student/dashboard" }),
          },
          {
            to: "/student/universities/explorer",
            icon: <GraduationCapIcon className="size-4" />,
            label: "Universities",
            isActive:
              route({ to: "/student/universities/explorer" }) ||
              route({ to: "/student/universities/shortlist" }),
          },
          {
            to: "/essays",
            icon: <PencilIcon className="size-4" />,
            label: "Essays",
            isActive:
              route({ to: "/essays" }) || route({ to: "/essays/$essayId" }),
          },
          {
            to: "/student/sessions",
            icon: <HeadsetIcon className="size-4" />,
            label: "Sessions",
            isActive:
              route({ to: "/student/sessions" }) ||
              route({ to: "/student/sessions/$sessionId" }),
          },
          {
            to: "/student/aptitude",
            icon: <ChartLineIcon className="size-4" />,
            label: "Aptitude",
            isActive:
              route({ to: "/student/aptitude" }) ||
              route({ to: "/student/aptitude/$sessionId" }),
          },
          {
            to: "/guru",
            icon: <BrainIcon className="size-4" />,
            label: "Guru",
            isActive: route({ to: "/guru" }),
          },
        ]
      : [
          // Admin/Advisor navigation
          {
            to: "/home",
            icon: <HouseIcon className="size-4" />,
            label: "Home",
            isActive: route({ to: "/home" }),
          },
          {
            to: "/guru",
            icon: <BrainIcon className="size-4" />,
            label: "Guru",
            isActive: route({ to: "/guru" }),
          },
          isAdmin
            ? {
                to: "/sessions",
                icon: <HeadsetIcon className="size-4" />,
                label: "Sessions",
                isActive: route({ to: "/sessions" }),
              }
            : null,
          isAdmin
            ? {
                to: "/schedule",
                icon: <VideoCameraIcon className="size-4" />,
                label: "Schedule",
                isActive: route({ to: "/schedule" }),
              }
            : null,
          isAdmin
            ? {
                to: "/students",
                icon: <StudentIcon className="size-4" />,
                label: "Students",
                isActive: route({ to: "/students" }),
              }
            : null,
          isAdmin
            ? {
                to: "/advisors",
                icon: <ChalkboardTeacherIcon className="size-4" />,
                label: "Advisors",
                isActive: route({ to: "/advisors" }),
              }
            : null,
        ].filter(Boolean);

  return (
    <div
      className={cn("text-center flex gap-0 h-screen", {
        "bg-zinc-50": !isGuru,
      })}
    >
      <div className="border-r border-zinc-200 px-3 py-5 gap-2 flex flex-col items-start bg-white transition-all duration-300 ease-out overflow-hidden group hover:w-44 w-[60px]">
        <div className="mb-4 flex items-center gap-3 w-full">
          <img
            src="/logo.png"
            alt="Studentize Logo"
            className="w-7 flex-shrink-0"
          />
          <span className="text-sm font-semibold text-zinc-900 whitespace-nowrap transition-opacity duration-300 group-hover:opacity-100 opacity-0">
            Studentize
          </span>
        </div>

        {icons.map(({ to, icon, label, isActive }: any) => (
          <Link
            to={to}
            key={to}
            className={cn(
              "p-2.5 rounded-lg transition-all duration-200 ease-out",
              "flex items-center gap-3 w-full",
              isActive
                ? "bg-zinc-900 text-white shadow-sm"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            )}
            activeProps={{ className: "bg-zinc-900 text-white" }}
          >
            <span className="flex-shrink-0">{icon}</span>
            <span className="text-sm font-medium whitespace-nowrap transition-opacity duration-300 group-hover:opacity-100 opacity-0">
              {label}
            </span>
          </Link>
        ))}

        <button
          onClick={async () => {
            startTransition(async () => {
              await signOut({ navigate: false });
              navigate({ to: "/" });
            });
          }}
          className={cn(
            "rounded-lg bg-zinc-100 p-2.5 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 transition-all duration-200 ease-out mt-auto disabled:opacity-50",
            "flex items-center gap-3 w-full"
          )}
          disabled={isLoading}
        >
          <span className="flex-shrink-0">
            {isLoading ? (
              <CircleNotchIcon className="animate-spin size-4" />
            ) : (
              <SignOutIcon className="size-4" />
            )}
          </span>
          <span className="text-sm font-medium whitespace-nowrap transition-opacity duration-300 group-hover:opacity-100 opacity-0">
            Sign Out
          </span>
        </button>
      </div>
      {children}
    </div>
  );
};
