import { StarIcon } from "@phosphor-icons/react";

import { cn } from "@/utils/cn";

export const SessionRatingStars = ({
  rating = 0,
  onChange,
  size = "md",
  className,
  disabled = false,
}: {
  rating?: number | null;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}) => {
  const iconSize =
    size === "sm" ? "size-4" : size === "lg" ? "size-7" : "size-5";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: 5 }, (_, index) => {
        const value = index + 1;
        const isActive = value <= (rating ?? 0);

        return (
          <button
            key={value}
            type="button"
            className={cn(
              "transition-transform",
              disabled ? "cursor-default" : "cursor-pointer hover:scale-110"
            )}
            onClick={() => onChange?.(value)}
            disabled={disabled}
            aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
          >
            <StarIcon
              className={cn(
                iconSize,
                isActive ? "text-amber-400" : "text-zinc-300"
              )}
              weight={isActive ? "fill" : "regular"}
            />
          </button>
        );
      })}
    </div>
  );
};
