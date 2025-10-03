import { cn } from "@/utils/cn";
import { Dialog as PrimitiveDialog } from "radix-ui";
import { forwardRef, ReactNode } from "react";

export const DialogRoot = PrimitiveDialog.Root;

export const DialogTrigger = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof PrimitiveDialog.Trigger>
>((props, ref) => <PrimitiveDialog.Trigger ref={ref} asChild {...props} />);

export const DialogPortal = PrimitiveDialog.Portal;

export const DialogOverlay = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof PrimitiveDialog.Overlay>
>((props, ref) => (
  <PrimitiveDialog.Overlay
    ref={ref}
    className="fixed inset-0 bg-black/50 data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut"
    {...props}
  />
));

export const DialogContent = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof PrimitiveDialog.Content>
>((props, ref) => (
  <PrimitiveDialog.Content
    ref={ref}
    {...props}
    className={cn(
      "fixed overflow-hidden top-1/2 left-1/2 max-h-[85vh] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg focus:outline-none data-[state=open]:animate-contentShow data-[state=closed]:animate-contentHide",
      props.className
    )}
  />
));

export const DialogTitle = forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof PrimitiveDialog.Title>
>((props, ref) => (
  <PrimitiveDialog.Title
    ref={ref}
    className="m-0 text-lg font-medium text-gray-900"
    {...props}
  />
));

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof PrimitiveDialog.Description>
>((props, ref) => (
  <PrimitiveDialog.Description
    ref={ref}
    className="mt-2 mb-4 text-sm text-gray-700"
    {...props}
  />
));

export const DialogClose = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof PrimitiveDialog.Close>
>((props, ref) => <PrimitiveDialog.Close ref={ref} asChild {...props} />);

export const Dialog = ({
  trigger,
  children,
  className,
  isOpen,
  onOpenChange,
}: {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  return (
    <DialogRoot open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className={className}>{children}</DialogContent>
      </DialogPortal>
    </DialogRoot>
  );
};
