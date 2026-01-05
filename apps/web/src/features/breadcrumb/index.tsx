import { cn } from "@/utils/cn";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { Link, useCanGoBack, useRouter } from "@tanstack/react-router";
import { ReactNode } from "react";

type Path = {
  label: string;
  to: string;
  component?: ReactNode;
  params?: Record<string, string>;
};

export const Breadcrumb = ({
  paths,
  rightComponent,
  className,
}: {
  paths: Array<Path | undefined>;
  className?: string;
  rightComponent?: ReactNode;
}) => {
  const router = useRouter();
  const isCanGoBack = useCanGoBack();

  const filteredPaths = paths.filter(Boolean) as Array<Path>;

  return (
    <div
      className={cn(
        "border-r border-bzinc p-5 pb-4 border-b bg-white text-left flex items-center gap-2",
        className
      )}
    >
      {isCanGoBack ? (
        <button onClick={() => router.history.back()} className="mr-2">
          <CaretLeftIcon />
        </button>
      ) : null}
      {filteredPaths.map((path, idx) => {
        const isLast =
          idx === filteredPaths.length - 1 && filteredPaths.length > 1;

        const Component = path.component;

        return (
          <>
            {idx > 0 ? <span className="text-zinc-400">/</span> : null}
            <Link
              key={path.to}
              to={path.to}
              params={path.params}
              className={cn(
                isLast ? "text-zinc-600" : "hover:underline decoration-dotted"
              )}
            >
              {Component ?? path.label}
            </Link>
          </>
        );
      })}
      <div className="ml-auto">{rightComponent}</div>
    </div>
  );
};
