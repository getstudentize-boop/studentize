import Avvatar from "avvvatars-react";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "../table";
import { RouterOutputs } from "orpc/client";
import { useNavigate } from "@tanstack/react-router";

const StudentCell = (props: { name: string }) => {
  return (
    <div className="flex gap-2 items-center">
      <Avvatar size={24} value={props.name} />
      {props.name}
    </div>
  );
};

type Student = RouterOutputs["student"]["list"][number];

const columnHelper = createColumnHelper<Student>();

const columns = [
  columnHelper.accessor("name", {
    header: "Students",
    cell: (info) => <StudentCell name={info.getValue() ?? "n/a"} />,
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => info.getValue() ?? "n/a",
  }),
  // columnHelper.accessor("sessions", {
  //   header: "Sessions",
  //   cell: (info) => (
  //     <button className="underline">{info.getValue() ?? 0}</button>
  //   ),
  // }),
];

export const StudentTable = ({ data }: { data: Student[] }) => {
  const navigate = useNavigate();

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataTable
      table={table}
      onRowClick={(row) => {
        navigate({
          to: "/students/$userId",
          params: { userId: row.original.userId },
        });
      }}
    />
  );
};
