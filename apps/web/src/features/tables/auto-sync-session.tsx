import Avvatar from "avvvatars-react";

import { format } from "date-fns";

import {
  ArrowRightIcon,
  CircleIcon,
  DotsThreeIcon,
  DotsThreeOutlineVerticalIcon,
  DotsThreeVerticalIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "../table";
import { useTableHeight } from "@/hooks/use-table-height";
import { Link, useNavigate } from "@tanstack/react-router";
import { Popover } from "@/components/popover";
import { Dialog } from "@/components/dialog";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "orpc/client";

type Session = {
  id: string;
  title: string;
  createdAt: Date | null;
};

const columnHelper = createColumnHelper<Session>();

const SessionAction = ({ sessionId }: { sessionId: string }) => {
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const deleteSessionMutation = useMutation(
    orpc.session.delete.mutationOptions()
  );

  const handleDeleteSession = () => {
    setIsConfirmVisible(true);
    if (!isConfirmVisible) return;

    deleteSessionMutation.mutate({ sessionId });
  };

  return (
    <Popover
      trigger={
        <button>
          <DotsThreeOutlineVerticalIcon weight="fill" />
        </button>
      }
      className="p-0 border border-bzinc"
      align="end"
    >
      <Link
        to="/sessions/$sessionId"
        params={{ sessionId }}
        className="p-3 py-2 flex items-center gap-2"
      >
        Create session
        <ArrowRightIcon />
      </Link>
      <hr className="border-bzinc" />

      <button
        onClick={handleDeleteSession}
        className="p-3 py-2 font-semibold text-red-600 text-center flex items-center gap-2"
      >
        Delete session
        <TrashIcon />
      </button>
    </Popover>
  );
};

const columns = [
  columnHelper.accessor("title", {
    header: "Title",
  }),
  columnHelper.accessor("createdAt", {
    header: "Created At",
    cell: (info) =>
      format(info.getValue() ?? new Date(), "MMM dd, yyyy HH:mm aa"),
  }),
  columnHelper.accessor("id", {
    header: " ",
    cell: (info) => {
      return <SessionAction sessionId={info.getValue()} />;
    },
  }),
];

export const AutoSyncSessionTable = ({
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
