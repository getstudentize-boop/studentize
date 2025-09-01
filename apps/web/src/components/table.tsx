import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export const Table = forwardRef<
  HTMLTableElement,
  HTMLAttributes<HTMLTableElement>
>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <table
      ref={ref}
      className={cn("border-collapse w-full", className)}
      {...rest}
    />
  );
});

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>((props, ref) => {
  const { className, ...rest } = props;
  return <tbody ref={ref} className={cn(className)} {...rest} />;
});

export const TableRow = forwardRef<
  HTMLTableRowElement,
  HTMLAttributes<HTMLTableRowElement>
>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <tr
      ref={ref}
      className={cn("border-b border-secondary-b border-zinc-100", className)}
      {...rest}
    />
  );
});

export const TableCell = forwardRef<
  HTMLTableCellElement,
  HTMLAttributes<HTMLTableCellElement>
>((props, ref) => {
  const { className, ...rest } = props;
  return <td ref={ref} className={cn("h-10 px-4", className)} {...rest} />;
});

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>((props, ref) => {
  const { className, ...rest } = props;
  return <thead ref={ref} className={cn(className)} {...rest} />;
});

type TableHeadProps = HTMLAttributes<HTMLTableCellElement> & {};

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  (props, ref) => {
    const { className, ...rest } = props;

    return (
      <th
        ref={ref}
        className={cn(
          "font-semibold h-10 border-secondary-b border-zinc-100 bg-clip-padding first:pl-6 last:pr-6",
          className
        )}
        {...rest}
      />
    );
  }
);
