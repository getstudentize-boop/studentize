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
        "px-4 py-2 cursor-pointer flex justify-center gap-2 rounded-lg items-center relative overflow-hidden",
        "text-sm font-medium transition-all duration-200 ease-out",
        "focus:outline-none focus:ring-2 focus:ring-offset-1",
        {
          "bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 focus:ring-zinc-300 shadow-sm": variant === "neutral",
          "bg-zinc-900 border border-zinc-900 text-white hover:bg-zinc-800 hover:border-zinc-800 focus:ring-zinc-400 shadow-sm": variant === "secondary",
          "bg-[#BCFAF9] border border-[#BCFAF9] text-zinc-900 hover:bg-[#A8F0EF] hover:border-[#A8F0EF] focus:ring-[#BCFAF9] shadow-sm": variant === "primary",
          "bg-[#BCFAF9]/20 border border-[#BCFAF9]/40 text-zinc-900 hover:bg-[#BCFAF9]/30 hover:border-[#BCFAF9]/50 focus:ring-[#BCFAF9]/30 font-semibold": variant === "primaryLight",
          "bg-rose-600 border border-rose-600 text-white hover:bg-rose-700 hover:border-rose-700 focus:ring-rose-400 shadow-sm": variant === "destructive",
        },
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-inherit",
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
            { "bg-[#A8F0EF]": variant === "primary" },
            { "bg-[#BCFAF9]/30": variant === "primaryLight" },
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
