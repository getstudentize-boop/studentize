import { cn } from "@/utils/cn";
import { ComponentProps } from "react";

export const Button = (props: ComponentProps<"button">) => {
  return (
    <button
      {...props}
      className={cn(
        "px-3 py-1.5 shadow border-b-2 border-zinc-950 flex gap-2 rounded-full text-white bg-zinc-800 items-center",
        props.className
      )}
    />
  );
};
