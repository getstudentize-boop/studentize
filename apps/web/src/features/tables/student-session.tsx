import Avvatar from "avvvatars-react";

import { format } from "date-fns";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "../table";
import { useTableHeight } from "@/hooks/use-table-height";
import { useNavigate } from "@tanstack/react-router";
import { Tooltip } from "@/components/tooltip";

const StudentCell = (props: { name: string }) => {
  return (
    <div className="flex gap-2 items-center">
      <Avvatar size={24} value={props.name} style="shape" />
      {props.name}
    </div>
  );
};

const CreatedAtCell = (props: { createdAt: Date | null }) => {
  const date = props.createdAt ?? new Date();

  const formattedDate = format(date, "MMM dd, yyyy");
  const formattedTime = format(date, "HH:mm aa");

  return (
    <Tooltip
      className="px-2 py-1"
      side="bottom"
      trigger={<span>{formattedDate}</span>}
    >
      {formattedTime}
    </Tooltip>
  );
};

type Session = {
  sessionId: string;
  student: string;
  title: string;
  createdAt: Date | null;
  advisor: string;
};

const columnHelper = createColumnHelper<Session>();

const columns = [
  columnHelper.accessor("student", {
    header: "Student",
    cell: (info) => <StudentCell name={info.getValue()} />,
  }),
  columnHelper.accessor("title", {
    header: "Title",
  }),
  columnHelper.accessor("createdAt", {
    header: "Created At",
    cell: (info) => <CreatedAtCell createdAt={info.getValue()} />,
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
                to: "/sessions/user/$sessionId",
                params: { sessionId: row.original.sessionId },
              });
            }}
          />
        ) : null}
      </div>
    </div>
  );
};
