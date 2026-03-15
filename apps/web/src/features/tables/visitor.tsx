import Avvatar from "avvvatars-react";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "../table";
import { RouterOutputs } from "orpc/client";
import { useTableHeight } from "@/hooks/use-table-height";
import { useNavigate } from "@tanstack/react-router";

type VisitorChat = RouterOutputs["visitorChat"]["list"][number];

const columnHelper = createColumnHelper<VisitorChat>();

const columns = [
  columnHelper.accessor("fullName", {
    header: "Name",
    cell: (info) => {
      const name = info.getValue();
      return (
        <div className="flex gap-2 items-center">
          <Avvatar size={24} value={name} style="shape" />
          {name}
        </div>
      );
    },
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("phone", {
    header: "Phone",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("title", {
    header: "Chat Topic",
    cell: (info) => (
      <span className="text-zinc-500">{info.getValue() ?? "—"}</span>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: "Date",
    cell: (info) => {
      const date = new Date(info.getValue() ?? "");
      return date.toLocaleDateString();
    },
  }),
];

export const VisitorTable = ({
  data,
  currentChatId,
  isError,
  isLoading,
}: {
  data: VisitorChat[];
  currentChatId?: string;
  isError: boolean;
  isLoading?: boolean;
}) => {
  const { handleRef, tableHeight } = useTableHeight();
  const navigate = useNavigate();

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div
      ref={handleRef}
      className="border border-zinc-200 bg-white rounded-lg flex-1 text-left overflow-y-auto no-scrollbar shadow-sm"
      style={{ height: tableHeight ? tableHeight - 32 : undefined }}
    >
      {tableHeight ? (
        <DataTable
          table={table}
          isLoading={isLoading}
          isError={isError}
          onRowClick={(row) =>
            navigate({
              to: "/visitors/$chatId",
              params: { chatId: row.original.id },
            })
          }
          isRowSelected={(row) => row.original.id === currentChatId}
        />
      ) : null}
    </div>
  );
};
