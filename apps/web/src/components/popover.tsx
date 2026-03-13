import { motion } from "motion/react";
import { Popover as PrimitivePopover } from "radix-ui";
import { ReactNode } from "react";

import { cn } from "@/utils/cn";

type Props = {
  trigger: ReactNode;
  triggerAsChild?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  isAnchor?: boolean;
  children?: ReactNode;
} & PrimitivePopover.PopoverContentProps;

export const Popover = ({
  trigger,
  triggerAsChild = true,
  onOpenChange,
  open,
  isAnchor,
  children,
  className,
  ...props
}: Props) => {
  const Trigger = isAnchor ? PrimitivePopover.Anchor : PrimitivePopover.Trigger;

  return (
    <PrimitivePopover.Root modal={true} onOpenChange={onOpenChange} open={open}>
      <Trigger asChild={triggerAsChild}>{trigger}</Trigger>

      <PrimitivePopover.Portal>
        <PrimitivePopover.Content asChild sideOffset={5} {...props}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "p-4 rounded-md bg-white shadow z-[51]",
              className
            )}
          >
            {children}
          </motion.div>
        </PrimitivePopover.Content>
      </PrimitivePopover.Portal>
    </PrimitivePopover.Root>
  );
};
