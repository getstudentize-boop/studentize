import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from "@/components/table";
import { cn } from "@/utils/cn";

import {
  Row,
  type Table as TableType,
  flexRender,
} from "@tanstack/react-table";

export const DataTable = ({
  table,
  onRowClick,
  isRowSelected,
}: {
  table: TableType<any>;
  onRowClick?: (row: Row<any>) => void;
  isRowSelected?: (row: Row<any>) => boolean;
}) => {
  return (
    <Table>
      <TableHeader className="sticky top-0 bg-white border-b border-bzinc">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody className="overflow-y-auto custom-scrollbar">
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            onClick={() => onRowClick?.(row)}
            className={cn(
              "transition-colors",
              !!onRowClick && "cursor-pointer hover:bg-zinc-50",
              isRowSelected?.(row) && "bg-zinc-100"
            )}
          >
            {row.getAllCells().map((cell) => {
              return (
                <TableCell
                  key={cell.id}
                  className="p-0 first:pl-4 last:pr-4 overflow-hidden whitespace-nowrap"
                >
                  <div>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
