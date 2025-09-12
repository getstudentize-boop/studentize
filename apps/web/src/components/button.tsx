import { cn } from "@/utils/cn";
import { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "primaryLight" | "secondary" | "neutral";
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
        },
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
