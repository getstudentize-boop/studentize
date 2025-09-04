import { cn } from "@/utils/cn";
import { DropdownMenu } from "radix-ui";
import { forwardRef } from "react";

export const DropdownRoot = DropdownMenu.Root;
export const DropdownTrigger = DropdownMenu.Trigger;

export const DropdownPortal = DropdownMenu.Portal;

export const DropdownContent = forwardRef<
  HTMLDivElement,
  DropdownMenu.DropdownMenuContentProps
>((props, ref) => {
  return (
    <DropdownMenu.Content
      ref={ref}
      sideOffset={5}
      {...props}
      className={cn(
        "min-w-[220px] rounded-lg bg-white p-[5px] overflow-hidden shadow-xs border border-bzinc w-full will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade",
        props.className
      )}
    />
  );
});

export const DropdownItem = forwardRef<
  HTMLDivElement,
  DropdownMenu.DropdownMenuItemProps
>((props, ref) => {
  return (
    <DropdownMenu.Item
      ref={ref}
      {...props}
      className={cn(
        "relative flex select-none items-center gap-2.5 px-[10px] py-[8px] text-sm leading-none outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-zinc-50 focus:bg-zinc-50",
        props.className
      )}
    />
  );
});
