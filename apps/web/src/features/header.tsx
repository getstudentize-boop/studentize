import { Tooltip } from "@/components/tooltip";
import { cn } from "@/utils/cn";
import {
  AddressBookTabsIcon,
  BrainIcon,
  ChalkboardTeacherIcon,
  CircleNotchIcon,
  HeadsetIcon,
  SignOutIcon,
  StudentIcon,
  VideoCameraIcon,
  VideoConferenceIcon,
} from "@phosphor-icons/react";
import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";
import { RouterOutputs } from "orpc/client";
import { ReactNode, useState } from "react";

type UserType = RouterOutputs["user"]["current"]["type"];

export const Header = ({
  children,
  userType,
}: {
  children: ReactNode;
  userType: UserType;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const route = useMatchRoute();
  const navigate = useNavigate();

  const { signOut } = useAuth();

  const isGuru = route({ to: "/guru" });

  const icons: any = [
    {
      to: "/guru",
      icon: <BrainIcon className="size-4" />,
      isActive: route({ to: "/guru" }),
    },
    userType === "ADMIN"
      ? {
          to: "/sessions",
          icon: <HeadsetIcon className="size-4" />,
          isActive: route({ to: "/sessions" }),
        }
      : null,
    userType === "ADMIN"
      ? {
          to: "/schedule",
          icon: <VideoCameraIcon className="size-4" />,
          isActive: route({ to: "/schedule" }),
        }
      : null,
    {
      to: "/students",
      icon: <StudentIcon className="size-4" />,
      isActive: route({ to: "/students" }),
    },
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
      <div className="border-r border-zinc-100 px-3.5 py-6 gap-2 flex flex-col items-center bg-white">
        <div className="mb-2.5">
          <img src="/logo.png" alt="Studentize Logo" className="w-6" />
        </div>

        {icons.map(({ to, icon, isActive }: any) => (
          <Tooltip
            side="right"
            className="p-1 border-zinc-950 px-2.5 text-sm shadow bg-zinc-800 text-white rounded-xl"
            trigger={
              <Link
                to={to}
                key={to}
                className={cn(
                  "p-2 bg-linear-to-br from-zinc-800 to-zinc-700 text-white rounded-xl",
                  {
                    "bg-linear-to-br from-white to-white text-zinc-800":
                      !isActive,
                  }
                )}
                activeProps={{ className: "bg-white" }}
              >
                {icon}
              </Link>
            }
          >
            {to.slice(1)}
          </Tooltip>
        ))}

        <button
          onClick={async () => {
            try {
              setIsLoading(true);
              await signOut({ navigate: false });
              navigate({ to: "/" });
            } catch (e) {
              console.log(e);
            } finally {
              setIsLoading(false);
            }
          }}
          className="rounded-md bg-zinc-100 p-2 shadow-sm outline outline-bzinc/80 mt-auto"
          disabled={isLoading}
        >
          {isLoading ? (
            <CircleNotchIcon className="animate-spin" />
          ) : (
            <SignOutIcon />
          )}
        </button>
      </div>
      {children}
    </div>
  );
};
