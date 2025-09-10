import * as React from "react";
import { Select } from "radix-ui";
import { cn } from "@/utils/cn";
import { CheckIcon, CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
}

const SelectComponent = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      value,
      onValueChange,
      placeholder = "Select an option...",
      disabled,
      className,
      label,
      error,
      ...props
    },
    ref
  ) => {
    return (
      <div className="flex flex-col w-full text-left">
        {label && (
          <label className="mb-2 mx-1 text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <Select.Root
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
        >
          <Select.Trigger
            ref={ref}
            className={cn(
              "inline-flex h-10 items-center justify-between gap-2 rounded-md border border-bzinc bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-gray-500",
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            aria-label={label}
            {...props}
          >
            <Select.Value placeholder={placeholder} />
            <Select.Icon className="text-gray-400">
              <CaretDownIcon size={16} />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              className="rounded-lg bg-white p-[5px] overflow-hidden shadow-xs border border-bzinc w-full will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade z-50 min-w-[var(--radix-select-trigger-width)]"
              position="popper"
              sideOffset={5}
            >
              <Select.ScrollUpButton className="flex h-6 cursor-default items-center justify-center bg-white text-gray-400 hover:text-gray-600">
                <CaretUpIcon size={16} />
              </Select.ScrollUpButton>

              <Select.Viewport>
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </Select.Viewport>

              <Select.ScrollDownButton className="flex h-6 cursor-default items-center justify-center bg-white text-gray-400 hover:text-gray-600">
                <CaretDownIcon size={16} />
              </Select.ScrollDownButton>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        {error && (
          <span className="mt-1 mx-1 text-xs text-red-500">{error}</span>
        )}
      </div>
    );
  }
);

const SelectItem = React.forwardRef<
  React.ElementRef<typeof Select.Item>,
  React.ComponentPropsWithoutRef<typeof Select.Item>
>(({ children, className, ...props }, ref) => {
  return (
    <Select.Item
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center justify-between rounded-sm py-1.5 px-2 text-sm leading-6 font-normal text-zinc-950 hover:bg-gray-100 data-[highlighted]:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        <CheckIcon className="h-4 w-4" />
      </Select.ItemIndicator>
    </Select.Item>
  );
});

SelectComponent.displayName = "Select";
SelectItem.displayName = "SelectItem";

export { SelectComponent as Select, SelectItem };
