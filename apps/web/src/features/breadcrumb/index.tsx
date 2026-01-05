import { cn } from "@/utils/cn";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { Link, useCanGoBack, useRouter } from "@tanstack/react-router";

export const Breadcrumb = ({
  paths,
}: {
  paths: Array<{ label: string; to: string }>;
}) => {
  const router = useRouter();
  const isCanGoBack = useCanGoBack();

  return (
    <div className="border-r border-bzinc p-5 pb-4 border-b bg-white text-left flex items-center gap-2">
      {isCanGoBack ? (
        <button onClick={() => router.history.back()} className="mr-2">
          <CaretLeftIcon />
        </button>
      ) : null}
      {paths.map((path, idx) => {
        const isLast = idx === paths.length - 1;

        return (
          <>
            {idx > 0 ? <span className="text-zinc-400">/</span> : null}
            <span
              key={path.to}
              className={cn(
                isLast ? "text-zinc-600" : "hover:underline decoration-dotted"
              )}
            >
              <Link to={path.to}>{path.label}</Link>
            </span>
          </>
        );
      })}
    </div>
  );
};
