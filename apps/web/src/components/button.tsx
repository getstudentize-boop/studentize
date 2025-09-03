import { cn } from "@/utils/cn";
import { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "neutral";
};

export const Button = (props: ButtonProps) => {
  return (
    <button
      {...props}
      className={cn(
        "px-3 py-1.5 cursor-pointer shadow border-b-2 border-zinc-950 flex gap-2 rounded-full text-white bg-zinc-800 items-center",
        props.variant === "neutral" &&
          "text-inherit bg-white border-b-2 border border-zinc-100 border-b-zinc-200",
        props.variant === "primary" &&
          "bg-violet-700 border-b-violet-700 border-violet-800",
        props.className
      )}
    />
  );
};
