import Avvatar from "avvvatars-react";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "../table";
import { RouterOutputs } from "orpc/client";
import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, BrainIcon } from "@phosphor-icons/react";
import { useTableHeight } from "@/hooks/use-table-height";
import { cn } from "@/utils/cn";

const StudentCell = (props: { name: string }) => {
  return (
    <div className="flex gap-2 items-center">
      <Avvatar size={24} value={props.name} style="shape" />
      {props.name}
    </div>
  );
};

type Student = RouterOutputs["advisor"]["getStudentList"][number];

const columnHelper = createColumnHelper<Student>();

const columns = [
  columnHelper.accessor("name", {
    header: "Students",
    cell: (info) => {
      const status = info.row.original.status;

      return (
        <div
          className={cn(
            status === "INACTIVE" &&
              "opacity-50 transition-opacity group-hover:opacity-100"
          )}
        >
          <StudentCell name={info.getValue() ?? "n/a"} />
        </div>
      );
    },
  }),
  columnHelper.accessor("studentUserId", {
    header: "Guru",
    cell: (info) => {
      const status = info.row.original.status;

      return (
        <Link to="/guru" search={{ userId: info.getValue() }}>
          <BrainIcon
            className={cn(
              "size-4 hover:text-cyan-600 transition-all",
              status === "INACTIVE" && "opacity-50 group-hover:opacity-100"
            )}
          />
        </Link>
      );
    },
  }),
  columnHelper.accessor("studentUserId", {
    header: "",
    cell: (info) => {
      const status = info.row.original.status;

      return (
        <Link to="/student/$userId" params={{ userId: info.getValue() }}>
          <ArrowRightIcon
            className={cn(
              "size-4 hover:text-cyan-600 transition-colors",
              status === "INACTIVE" && "opacity-50 group-hover:opacity-100"
            )}
          />
        </Link>
      );
    },
  }),
];

export const StudentHomeTable = ({
  data,
  isError,
  isLoading,
}: {
  data: Student[];
  isError: boolean;
  isLoading?: boolean;
}) => {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="text-left overflow-y-auto no-scrollbar">
      <DataTable table={table} isLoading={isLoading} isError={isError} />
    </div>
  );
};
