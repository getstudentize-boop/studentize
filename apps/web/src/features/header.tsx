import { cn } from "@/utils/cn";
import { BrainIcon, HeadsetIcon, UserIcon } from "@phosphor-icons/react";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { ReactNode } from "react";

export const Header = ({ children }: { children: ReactNode }) => {
  const route = useMatchRoute();

  const isGuru = route({ to: "/guru" });
  const isSessions = route({ to: "/sessions" });
  const isUsers = route({ to: "/users" });

  const icons = [
    { to: "/guru", icon: <BrainIcon className="size-4" />, isActive: isGuru },
    {
      to: "/sessions",
      icon: <HeadsetIcon className="size-4" />,
      isActive: isSessions,
    },
    { to: "/users", icon: <UserIcon className="size-4" />, isActive: isUsers },
  ];

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
      </div>
      {children}
    </div>
  );
};
