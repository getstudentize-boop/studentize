import { cn } from "#/utils/cn";
import { HouseIcon, InfoIcon } from "@phosphor-icons/react";
import { Link, useMatchRoute } from "@tanstack/react-router";

const navItems = [
  {
    to: "/",
    icon: <HouseIcon className="size-4" />,
    label: "Home",
  },
  {
    to: "/about",
    icon: <InfoIcon className="size-4" />,
    label: "About",
  },
] as const;

export default function Header({ children }: { children: React.ReactNode }) {
  const route = useMatchRoute();

  return (
    <div className="flex h-screen gap-0">
      <div className="group flex w-[60px] flex-col items-start gap-2 overflow-hidden border-r border-zinc-200 bg-white px-3 py-5 transition-all duration-300 ease-out hover:w-46">
        <Link
          to="/"
          className="mb-4 flex w-full translate-x-[2.8px] items-center gap-3 transition-opacity hover:opacity-80"
        >
          <img
            src="/logo.png"
            alt="Studentize Logo"
            className="w-7 flex-shrink-0"
          />
          <span className="whitespace-nowrap text-sm font-semibold text-zinc-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Studentize
          </span>
        </Link>

        {navItems.map(({ to, icon, label }) => {
          const isActive = route({ to });

          return (
            <Link
              to={to}
              key={to}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 transition-all duration-200 ease-out",
                isActive
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              )}
            >
              <span className="flex-shrink-0">{icon}</span>
              <span className="whitespace-nowrap text-sm font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="flex-1 overflow-auto bg-zinc-50 flex">{children}</div>
    </div>
  );
}
