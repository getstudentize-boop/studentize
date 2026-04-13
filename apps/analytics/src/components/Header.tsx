import { cn } from "#/utils/cn";
import {
  ChatCircleTextIcon,
  ChatIcon,
  HouseIcon,
  InfoIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";

const navItems = [
  {
    to: "/",
    icon: <HouseIcon className="size-4" />,
    label: "Home",
  },
  {
    to: "/guru",
    icon: <ChatCircleTextIcon className="size-4" />,
    label: "Guru",
  },
] as const;

export function Header({ children }: { children: React.ReactNode }) {
  const route = useMatchRoute();
  const { signOut } = useAuth();

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
              <span
                className={cn(
                  "flex-shrink-0",
                  isActive ? "text-white" : "text-zinc-600",
                )}
              >
                {icon}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-sm font-medium opacity-0 text-balance transition-opacity duration-300 group-hover:opacity-100",
                  isActive ? "text-white" : "text-zinc-600",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => signOut()}
          className="mt-auto flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-zinc-600 transition-all duration-200 ease-out hover:bg-zinc-100 hover:text-zinc-900"
        >
          <span className="shrink-0 text-zinc-600">
            <SignOutIcon className="size-4" />
          </span>
          <span className="whitespace-nowrap text-sm font-medium text-zinc-600 opacity-0 text-balance transition-opacity duration-300 group-hover:opacity-100">
            Sign out
          </span>
        </button>
      </div>
      <div className="flex-1 overflow-auto bg-zinc-50 flex">{children}</div>
    </div>
  );
}
