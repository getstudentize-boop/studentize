import { createFileRoute } from "@tanstack/react-router";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

import { CircleIcon, PlusIcon } from "@phosphor-icons/react";

import Avvatar from "avvvatars-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from "@/components/table";

export const Route = createFileRoute("/sessions")({
  component: RouteComponent,
});

function RouteComponent() {
  const table = useReactTable({
    data: [
      {
        student: "Khaya Zulu",
        createdAt: "(GMT+02:00) Pretoria",
        title: "Advisor Session",
        advisor: "Rachel Chang",
      },
    ],
    columns: [
      {
        accessorKey: "student",
        header: "Student",
        cell: (info) => {
          return (
            <div className="flex gap-2 items-center">
              <Avvatar size={24} value={info.getValue() as string} />
              {info.getValue()}
            </div>
          );
        },
      },
      { accessorKey: "title", header: "Title" },
      { accessorKey: "createdAt", header: "Created At" },
      {
        accessorKey: "advisor",
        header: "Advisor",
        cell: (info) => {
          return (
            <div className="bg-indigo-50 text-indigo-950 rounded-md py-1 px-2.5 font-semibold border border-indigo-100 text-xs inline-flex items-center gap-2">
              <CircleIcon className="size-2 fill-indigo-500" weight="fill" />
              {info.getValue()}
            </div>
          );
        },
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-1 flex-col p-4 pt-2.5 h-screen">
      <div className="justify-between items-center flex p-2.5">
        <div className="flex gap-2 items-center">Sessions</div>

        <div className="px-3 py-1.5 shadow border-b-2 border-zinc-950 flex gap-2 rounded-full text-white bg-zinc-800 items-center">
          New Session
          <PlusIcon />
        </div>
      </div>
      <div className="flex-1 rounded-lg border border-zinc-200/60 text-left">
        <div className="p-4 border-b border-zinc-200/60">
          <div className="border border-zinc-200 rounded-lg inline-flex items-center">
            <div className="p-2 border-r border-zinc-200/80">
              <Avvatar size={24} value="test" />
            </div>
            <div className="px-2">
              <input
                placeholder="Search User"
                className="min-w-80 outline-none"
              />
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
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
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => {
                  return (
                    <TableCell
                      key={cell.id}
                      className="max-w-0 p-0 first:pl-6 last:pr-6 overflow-hidden whitespace-nowrap"
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
      </div>
    </div>
  );
}
