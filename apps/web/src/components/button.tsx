import { cn } from "@/utils/cn";
import { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "neutral";
  isLoading?: boolean;
};

export const Button = ({ variant, isLoading, ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className={cn(
        "px-3 py-1.5 cursor-pointer shadow border-b-2 border-zinc-950 flex justify-center gap-2 rounded-full text-white bg-zinc-800 items-center relative overflow-hidden",
        variant === "neutral" &&
          "text-inherit bg-white border-b-2 border border-zinc-100 border-b-zinc-200",
        variant === "primary" &&
          "bg-violet-700 border-b-violet-700 border-violet-800",
        props.className
      )}
      disabled={props.disabled || isLoading}
    >
      {props.children}
      {isLoading ? (
        <div className="absolute top-0 left-0 h-full w-full bg-white text-zinc-800 font-semibold">
          ...
        </div>
      ) : null}
    </button>
  );
};
