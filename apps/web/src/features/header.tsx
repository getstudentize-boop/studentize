import { Tooltip } from "@/components/tooltip";
import { cn } from "@/utils/cn";
import {
  AddressBookTabsIcon,
  BrainIcon,
  ChalkboardTeacherIcon,
  CircleNotchIcon,
  HeadsetIcon,
  HouseIcon,
  SignOutIcon,
  StudentIcon,
  VideoCameraIcon,
} from "@phosphor-icons/react";
import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";
import { RouterOutputs } from "orpc/client";
import { ReactNode, useTransition } from "react";

type UserType = RouterOutputs["user"]["current"]["type"];

export const Header = ({
  children,
  userType,
}: {
  children: ReactNode;
  userType: UserType;
}) => {
  const [isLoading, startTransition] = useTransition();

  const route = useMatchRoute();
  const navigate = useNavigate();

  const { signOut } = useAuth();

  const isGuru = route({ to: "/guru" });

  const icons: any = [
    {
      to: "/home",
      icon: <HouseIcon className="size-4" />,
      isActive: route({ to: "/home" }),
    },
    {
      to: "/guru",
      icon: <BrainIcon className="size-4" />,
      isActive: route({ to: "/guru" }),
    },
    userType === "ADMIN"
      ? {
          to: "/schedule",
          icon: <VideoCameraIcon className="size-4" />,
          isActive: route({ to: "/schedule" }),
          isDivider: true,
        }
      : null,
    userType === "ADMIN"
      ? {
          to: "/sessions",
          icon: <HeadsetIcon className="size-4" />,
          isActive: route({ to: "/sessions" }),
        }
      : null,
    userType === "ADMIN"
      ? {
          to: "/students",
          icon: <StudentIcon className="size-4" />,
          isActive: route({ to: "/students" }),
          isDivider: true,
        }
      : null,
    userType === "ADMIN"
      ? {
          to: "/advisors",
          icon: <ChalkboardTeacherIcon className="size-4" />,
          isActive: route({ to: "/advisors" }),
        }
      : null,
  ].filter(Boolean);

  return (
    <div
      className={cn("text-center flex gap-4 h-screen", {
        "bg-zinc-50": !isGuru,
      })}
    >
      <div className="w-[3.8rem] bg-zinc-50 border-r border-bzinc" />
      <div className="outline-r outline-zinc-100 px-3.5 py-6 gap-2 flex flex-col bg-white w-[3.8rem] absolute left-0 top-0 h-full shadow-sm hover:w-40 transition-all duration-300 z-100 group">
        <div className="mb-2.5 translate-x-[0.2rem]">
          <img src="/logo.png" alt="Studentize Logo" className="w-6" />
        </div>

        {icons.map(({ to, icon, isActive, isDivider }: any) => (
          <>
            {isDivider ? (
              <div className="h-px w-full bg-zinc-200 scale-x-50 group-hover:scale-x-90 transition-transform duration-300" />
            ) : null}
            <Link
              to={to}
              key={to}
              className={cn(
                "p-2 bg-linear-to-br from-zinc-800 to-zinc-700 text-white rounded-xl flex items-center h-8 gap-2 overflow-hidden transition-colors duration-300",
                !isActive ? "hover:from-zinc-100 hover:to-zinc-100" : undefined,
                {
                  "bg-linear-to-br from-white to-white text-zinc-800":
                    !isActive,
                }
              )}
              activeProps={{ className: "bg-white" }}
            >
              <div>{icon}</div>
              <div>{to.slice(1)}</div>
            </Link>
          </>
        ))}

        <div className="mt-auto flex">
          <button
            onClick={async () => {
              startTransition(async () => {
                await signOut({ navigate: false });
                navigate({ to: "/" });
              });
            }}
            className="rounded-md bg-zinc-100 p-2 shadow-sm outline outline-bzinc/80"
            disabled={isLoading}
          >
            {isLoading ? (
              <CircleNotchIcon className="animate-spin" />
            ) : (
              <SignOutIcon />
            )}
          </button>
        </div>
      </div>
      {children}
    </div>
  );
};
