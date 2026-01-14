import { Loader } from "@/components/loader";
import { Repeat } from "@/components/repeat";
import { TableSkeletonBody } from "@/components/skeletons";
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
  isLoading,
  isError,
}: {
  table: TableType<any>;
  onRowClick?: (row: Row<any>) => void;
  isRowSelected?: (row: Row<any>) => boolean;
  isLoading?: boolean;
  isError?: boolean;
}) => {
  const isLoadingOrError = isLoading || isError;

  return (
    <Table>
      <TableHeader className="sticky top-0 bg-white border-b border-zinc-200 z-10">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="hover:bg-transparent">
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
      <TableBody className="overflow-y-auto custom-scrollbar bg-white">
        {isLoadingOrError ? (
          <>
            <tr>
              {table.getAllColumns().map((c) => (
                <td key={c.id} className="pr-4 first:pl-4 pt-4 pb-2">
                  <Loader isError={isError} />
                </td>
              ))}
            </tr>
            <TableSkeletonBody columns={table.getAllColumns().length} rows={12} />
          </>
        ) : null}
        {!isLoadingOrError &&
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "transition-colors duration-150 group",
                !!onRowClick && "cursor-pointer",
                isRowSelected?.(row) && "bg-[#BCFAF9]/20 border-l-2 border-l-[#BCFAF9]"
              )}
            >
              {row.getAllCells().map((cell) => {
                return (
                  <TableCell
                    key={cell.id}
                    className="p-0 first:pl-4 last:pr-4 overflow-hidden whitespace-nowrap"
                  >
                    <div>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
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
