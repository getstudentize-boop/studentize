import Avvatar from "avvvatars-react";

import { CircleIcon } from "@phosphor-icons/react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "../table";

const StudentCell = (props: { name: string }) => {
  return (
    <div className="flex gap-2 items-center">
      <Avvatar size={24} value={props.name} />
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
  createdAt: string;
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
  }),
  columnHelper.accessor("advisor", {
    header: "Advisor",
    cell: (info) => <AdvisorCell name={info.getValue()} />,
  }),
];

export const SessionTable = ({ data }: { data: Session[] }) => {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return <DataTable table={table} />;
};
