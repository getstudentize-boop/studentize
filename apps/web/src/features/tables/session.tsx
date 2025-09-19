import Avvatar from "avvvatars-react";

import { format } from "date-fns";

import { CircleIcon } from "@phosphor-icons/react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "../table";
import { useTableHeight } from "@/hooks/use-table-height";

const StudentCell = (props: { name: string }) => {
  return (
    <div className="flex gap-2 items-center">
      <Avvatar size={24} value={props.name} style="shape" />
      {props.name}
    </div>
  );
};

const AdvisorCell = (props: { name: string }) => {
  return (
    <div className="bg-indigo-50 text-indigo-950 rounded-md py-1 px-2.5 font-semibold border border-indigo-100 text-xs inline-flex items-center gap-2">
      <CircleIcon className="size-2 fill-indigo-500" weight="fill" />
      {props.name}
    </div>
  );
};

type Session = {
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
    cell: (info) => format(info.getValue() ?? new Date(), "PPpp"),
  }),
  columnHelper.accessor("advisor", {
    header: "Advisor",
    cell: (info) => <AdvisorCell name={info.getValue()} />,
  }),
];

export const SessionTable = ({
  data,
  isError,
  isLoading,
}: {
  data: Session[];
  isLoading?: boolean;
  isError: boolean;
}) => {
  const { handleRef, tableHeight } = useTableHeight();

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
          <DataTable table={table} isLoading={isLoading} isError={isError} />
        ) : null}
      </div>
    </div>
  );
};
