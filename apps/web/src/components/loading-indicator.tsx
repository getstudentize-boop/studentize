import { cn } from "@/utils/cn";
import { CircleIcon } from "@phosphor-icons/react";

export const LoadingIndicator = (props: { className?: string }) => {
  return (
    <>
      <CircleIcon
        weight="fill"
        className={cn("animate-bounce w-2", props.className)}
        style={{ animationDuration: "1.5s" }}
      />
      <CircleIcon
        weight="fill"
        className={cn("animate-bounce w-2", props.className)}
        style={{ animationDelay: "0.1s", animationDuration: "1.5s" }}
      />
      <CircleIcon
        weight="fill"
        className={cn("animate-bounce w-2", props.className)}
        style={{ animationDelay: "0.2s", animationDuration: "1.5s" }}
      />
    </>
  );
};
