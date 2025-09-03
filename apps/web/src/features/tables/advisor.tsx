import Avvatar from "avvvatars-react";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "../table";

const AdvisorCell = (props: { name: string }) => {
  return (
    <div className="flex gap-2 items-center">
      <Avvatar size={24} value={props.name} />
      {props.name}
    </div>
  );
};

type Advisor = {
  name: string;
  university?: string;
};

const columnHelper = createColumnHelper<Advisor>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => <AdvisorCell name={info.getValue()} />,
  }),
  columnHelper.accessor("university", {
    header: "University",
    cell: (info) => <div>{info.getValue()}</div>,
  }),
];

export const AdvisorTable = ({ data }: { data: Advisor[] }) => {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return <DataTable table={table} />;
};
