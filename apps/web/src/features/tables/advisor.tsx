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
      <Avvatar size={24} value={props.name} style="shape" />
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
            "rounded-md px-2 py-1 border text-xs border-bzinc inline-flex gap-2"
          )}
        >
          {{ ACTIVE: "🟢", INACTIVE: "🔴", PENDING: "🟡" }[status]}
          <span className="ml-1 font-semibold">{status}</span>
        </span>
      );
    },
  }),
];

export const AdvisorTable = ({
  data,
  currentAdvisorUserId,
  isLoading,
  isError,
}: {
  data: Advisor[];
  currentAdvisorUserId?: string;
  isLoading?: boolean;
  isError?: boolean;
}) => {
  const navigate = useNavigate();

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataTable
      table={table}
      isRowSelected={(row) => row.original.userId === currentAdvisorUserId}
      isLoading={isLoading}
      isError={isError}
      onRowClick={(row) => {
        navigate({
          to: "/advisors/$userId",
          params: { userId: row.original.userId },
        });
      }}
    />
  );
};
