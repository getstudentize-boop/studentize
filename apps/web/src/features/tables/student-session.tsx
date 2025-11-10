import { format } from "date-fns";

import { CircleIcon } from "@phosphor-icons/react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "../table";
import { useTableHeight } from "@/hooks/use-table-height";
import { useNavigate } from "@tanstack/react-router";

const AdvisorCell = (props: { name: string }) => {
  return (
    <div className="bg-indigo-800 text-white rounded-md py-1 px-2.5 font-semibold text-xs inline-flex items-center gap-2">
      <CircleIcon className="size-2 fill-indigo-200" weight="fill" />
      {props.name}
    </div>
  );
};

type Session = {
  id: string;
  student: string;
  title: string;
  createdAt: Date | null;
  advisor: string;
};

const columnHelper = createColumnHelper<Session>();

const columns = [
  columnHelper.accessor("title", {
    header: "Title",
  }),
  columnHelper.accessor("createdAt", {
    header: "Created At",
    cell: (info) =>
      format(info.getValue() ?? new Date(), "MMM dd, yyyy HH:mm aa"),
  }),
  columnHelper.accessor("advisor", {
    header: "Advisor",
    cell: (info) => <AdvisorCell name={info.getValue()} />,
  }),
];

export const StudentSessionTable = ({
  data,
  isError,
  isLoading,
  currentSessionId,
}: {
  data: Session[];
  isLoading?: boolean;
  isError: boolean;
  currentSessionId?: string;
}) => {
  const { handleRef, tableHeight } = useTableHeight();
  const navigate = useNavigate();

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex-1" ref={handleRef}>
      <div
        className="overflow-y-auto no-scrollbar"
        style={{ height: tableHeight ? tableHeight - 10 : undefined }}
      >
        {tableHeight ? (
          <DataTable
            table={table}
            isLoading={isLoading}
            isError={isError}
            isRowSelected={(row) => row.original.sessionId === currentSessionId}
            onRowClick={(row) => {
              navigate({
                to: "/sessions/$sessionId",
                params: { sessionId: row.original.sessionId },
              });
            }}
          />
        ) : null}
      </div>
    </div>
  );
};
