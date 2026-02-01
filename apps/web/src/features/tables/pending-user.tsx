import Avvatar from "avvvatars-react";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "../table";
import { RouterOutputs } from "orpc/client";
import { useTableHeight } from "@/hooks/use-table-height";
import { ApproveAdvisorDialog } from "../dialogs/approve-advisor-dialog";
import { ApproveStudentDialog } from "../dialogs/approve-student-dialog";

const PendingUserCell = (props: { name: string | null; email: string }) => {
  const displayName = props.name ?? props.email;
  return (
    <div className="flex gap-2 items-center">
      <Avvatar size={24} value={displayName} style="shape" />
      {displayName}
    </div>
  );
};

type PendingUser = RouterOutputs["user"]["listPending"][number];

const columnHelper = createColumnHelper<PendingUser>();

const columns = [
  columnHelper.accessor((row) => row.name ?? row.email, {
    header: "Name",
    cell: (info) => (
      <PendingUserCell name={info.row.original.name} email={info.row.original.email} />
    ),
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("createdAt", {
    header: "Created At",
    cell: (info) => {
      const date = new Date(info.getValue() ?? "");
      return date.toLocaleDateString();
    },
  }),
  columnHelper.accessor("userId", {
    header: "Actions",
    cell: (info) => {
      const userId = info.getValue();

      return (
        <div className="flex gap-2">
          <ApproveAdvisorDialog userId={userId} />
          <ApproveStudentDialog userId={userId} />
        </div>
      );
    },
  }),
];

export const PendingUserTable = ({
  data,
  isError,
  isLoading,
}: {
  data: PendingUser[];
  isError: boolean;
  isLoading?: boolean;
}) => {
  const { handleRef, tableHeight } = useTableHeight();

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div
      ref={handleRef}
      className="border border-zinc-200 bg-white rounded-lg flex-1 text-left overflow-y-auto no-scrollbar shadow-sm"
      style={{ height: tableHeight ? tableHeight - 32 : undefined }}
    >
      {tableHeight ? (
        <DataTable
          table={table}
          isLoading={isLoading}
          isError={isError}
        />
      ) : null}
    </div>
  );
};
