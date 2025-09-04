import { cn } from "@/utils/cn";
import { Popover as PrimitivePopover } from "radix-ui";
import { ReactNode } from "react";

type Props = {
  trigger: ReactNode;
  triggerAsChild?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  isAnchor?: boolean;
} & PrimitivePopover.PopoverContentProps;

export const Popover = ({
  trigger,
  triggerAsChild = true,
  onOpenChange,
  open,
  isAnchor,
  ...props
}: Props) => {
  const Trigger = isAnchor ? PrimitivePopover.Anchor : PrimitivePopover.Trigger;

  return (
    <PrimitivePopover.Root modal={true} onOpenChange={onOpenChange} open={open}>
      <Trigger asChild={triggerAsChild}>{trigger}</Trigger>

      <PrimitivePopover.Portal>
        <PrimitivePopover.Content
          sideOffset={5}
          {...props}
          className={cn(
            "p-4 rounded-md bg-white shadow z-[51] will-change-[transform,opacity] data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=top]:animate-slideDownAndFade",
            props.className
          )}
        />
      </PrimitivePopover.Portal>
    </PrimitivePopover.Root>
  );
};
