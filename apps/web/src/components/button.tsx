import { cn } from "@/utils/cn";
import { ComponentProps } from "react";
import { LoadingIndicator } from "./loading-indicator";

type ButtonProps = ComponentProps<"button"> & {
  variant?:
    | "primary"
    | "primaryLight"
    | "secondary"
    | "neutral"
    | "destructive";
  isLoading?: boolean;
};

export const Button = ({
  variant = "secondary",
  isLoading,
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      className={cn(
        "px-3 py-1.5 cursor-pointer shadow border flex justify-center gap-2 rounded-full items-center relative overflow-hidden",
        "text-inherit bg-white border-b-2 border",
        {
          "bg-white  border-zinc-100 border-b-zinc-200": variant === "neutral",
          "bg-zinc-800 border-zinc-950 text-white": variant === "secondary",
          "bg-violet-700 border-b-violet-700 border-violet-800 text-white":
            variant === "primary",
          "bg-violet-100 border-b-violet-500 border-violet-200 font-semibold text-violet-950":
            variant === "primaryLight",
          "bg-rose-600 border-b-rose-700 border-rose-700 text-white":
            variant === "destructive",
        },
        props.className
      )}
      disabled={props.disabled || isLoading}
    >
      {props.children}
      {isLoading ? (
        <div
          className={cn(
            "absolute top-0 left-0 h-full w-full bg-white text-zinc-800 font-semibold flex items-center justify-center",
            { "bg-white": variant === "neutral" },
            { "bg-zinc-800": variant === "secondary" },
            { "bg-violet-700": variant === "primary" },
            { "bg-violet-100": variant === "primaryLight" },
            { "bg-rose-600": variant === "destructive" }
          )}
        >
          <div className="flex gap-2 mx-auto">
            <LoadingIndicator
              className={cn(
                variant === "neutral" || variant === "primaryLight"
                  ? "text-zinc-800"
                  : "text-white"
              )}
            />
          </div>
        </div>
      ) : null}
    </button>
  );
};
