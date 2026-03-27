import { cn } from "@/utils/cn";

interface PageLoaderProps {
  message?: string;
  className?: string;
}

export const PageLoader = ({ message = "Loading...", className }: PageLoaderProps) => {
  return (
    <div className={cn("flex flex-1 h-screen items-center justify-center bg-zinc-50", className)}>
      <div className="flex flex-col items-center gap-4">
        <img
          src="/logo.png"
          alt="Studentize"
          className="size-12 animate-spin"
          style={{ animationDuration: "1.5s" }}
        />
        <span className="text-sm text-zinc-500">{message}</span>
      </div>
    </div>
  );
};

interface InlineLoaderProps {
  message?: string;
  className?: string;
}

export const InlineLoader = ({ message, className }: InlineLoaderProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-8 gap-3", className)}>
      <img
        src="/logo.png"
        alt="Studentize"
        className="size-8 animate-spin"
        style={{ animationDuration: "1.5s" }}
      />
      {message && <span className="text-xs text-zinc-400">{message}</span>}
    </div>
  );
};
