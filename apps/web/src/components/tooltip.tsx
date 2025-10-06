import { Tooltip as PrimitiveTooltip } from "radix-ui";
import { cn } from "@/utils/cn";
import { ReactNode } from "react";

type Props = {
  trigger: ReactNode;
  isAnchor?: boolean;
  className?: string;
  side?: PrimitiveTooltip.TooltipContentProps["side"];
  align?: PrimitiveTooltip.TooltipContentProps["align"];
  isArrowVisible?: boolean;
  style?: PrimitiveTooltip.TooltipContentProps["style"];
  /**
   * if used to show hint for a user.
   */
  isTooltip?: boolean;
} & PrimitiveTooltip.TooltipProps;

export const Tooltip = ({
  trigger,
  children,
  side,
  align,
  className,
  isArrowVisible,
  isTooltip,
  style,
  ...props
}: Props) => {
  return (
    <PrimitiveTooltip.Provider>
      <PrimitiveTooltip.Root delayDuration={350} {...props}>
        <PrimitiveTooltip.Trigger asChild>{trigger}</PrimitiveTooltip.Trigger>
        <PrimitiveTooltip.Portal>
          <PrimitiveTooltip.Content
            className={cn(
              "select-none text isolate z-[100] rounded-md bg-white px-[15px] py-2.5 text-[15px] will-change-[transform,opacity] data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade border border-bzinc",
              { "px-2 py-1": isTooltip },
              className
            )}
            style={style}
            sideOffset={5}
            side={side}
            align={align}
          >
            {children}
            {isArrowVisible ? (
              <PrimitiveTooltip.Arrow className="fill-bzinc" />
            ) : null}
          </PrimitiveTooltip.Content>
        </PrimitiveTooltip.Portal>
      </PrimitiveTooltip.Root>
    </PrimitiveTooltip.Provider>
  );
};
