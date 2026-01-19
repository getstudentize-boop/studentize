import { format } from "date-fns";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "../table";
import { useTableHeight } from "@/hooks/use-table-height";
import { useNavigate } from "@tanstack/react-router";

type Session = {
  id: string;
  title: string;
  createdAt: Date | null;
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
];

export const MySessionTable = ({
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
            isRowSelected={(row) => row.original.id === currentSessionId}
            onRowClick={(row) => {
              navigate({
                to: "/student/sessions/$sessionId",
                params: { sessionId: row.original.id },
                search: {},
              });
            }}
          />
        ) : null}
      </div>
    </div>
  );
};
