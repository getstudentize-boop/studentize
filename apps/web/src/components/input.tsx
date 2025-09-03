import { cn } from "@/utils/cn";
import { ComponentProps } from "react";

type InputProps = ComponentProps<"input"> & {
  label: string;
  error?: string;
};

export const Input = ({ label, error, ...props }: InputProps) => {
  return (
    <div>
      <label className="mb-2 mx-1 flex justify-between">
        {label}
        {error ? <span className="text-rose-700"> [{error}]</span> : null}
      </label>
      <input
        type="text"
        {...props}
        className={cn(
          "border border-bzinc rounded-md p-2 w-full focus:outline-violet-300",
          { "focus:outline-rose-300": error },
          props.className
        )}
      />
    </div>
  );
};
