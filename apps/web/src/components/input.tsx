import { cn } from "@/utils/cn";
import { ComponentProps } from "react";

export const Input = ({ className, ...props }: ComponentProps<"input">) => {
  return (
    <input
      {...props}
      className={cn(
        "w-full px-3 py-2 border border-zinc-300 rounded-md text-sm",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    />
  );
};
