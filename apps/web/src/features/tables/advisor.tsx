import Avvatar from "avvvatars-react";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "../table";
import { RouterOutputs } from "orpc/client";
import { cn } from "@/utils/cn";
import { useNavigate } from "@tanstack/react-router";

const AdvisorCell = (props: { name: string }) => {
  return (
    <div className="flex gap-2 items-center">
      <Avvatar size={24} value={props.name} />
      {props.name}
    </div>
  );
};

type Advisor = RouterOutputs["advisor"]["list"][number];

const columnHelper = createColumnHelper<Advisor>();

const columns = [
  columnHelper.accessor((row) => row.name ?? row.email, {
    header: "Name",
    cell: (info) => <AdvisorCell name={info.getValue()} />,
  }),
  columnHelper.accessor("universityName", {
    header: "University",
    cell: (info) => info.getValue() ?? "Not specified",
  }),
  columnHelper.accessor("courseMajor", {
    header: "Course Major",
    cell: (info) => info.getValue() ?? "Not specified",
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = info.getValue();
      return (
        <span
          className={cn(
            "rounded-md px-2 py-0.5 bg-lime-50 text-lime-950 font-semibold inline-block",
            { "bg-zinc-50 text-zinc-950": status === "PENDING" },
            { "bg-green-50 text-green-950": status === "ACTIVE" },
            { "bg-rose-50 text-rose-950": status === "INACTIVE" }
          )}
        >
          {info.getValue()}
        </span>
      );
    },
  }),
];

export const AdvisorTable = ({ data }: { data: Advisor[] }) => {
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
          to: "/advisors/$userId",
          params: { userId: row.original.userId },
        });
      }}
    />
  );
};
