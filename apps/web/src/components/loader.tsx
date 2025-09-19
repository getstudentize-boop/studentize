import { cn } from "@/utils/cn";
import { ComponentProps } from "react";

type LoaderProps = ComponentProps<"div"> & {
  isError?: boolean;
};

export const Loader = ({ isError, ...props }: LoaderProps) => {
  return (
    <div
      {...props}
      className={cn(
        "rounded-md h-5",
        isError
          ? "bg-radial from-rose-50 to-rose-100"
          : "animate-pulse bg-zincLoading",
        props.className
      )}
    />
  );
};
