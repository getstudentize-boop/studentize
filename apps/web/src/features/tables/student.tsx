import Avvatar from "avvvatars-react";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "../table";
import { RouterOutputs } from "orpc/client";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { useTableHeight } from "@/hooks/use-table-height";

const StudentCell = (props: { name: string }) => {
  return (
    <div className="flex gap-2 items-center">
      <Avvatar size={24} value={props.name} style="shape" />
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
  columnHelper.accessor("studyCurriculum", {
    header: "Curriculum",
    cell: (info) => {
      const curriculum = info.getValue();

      return (
        <span className="py-1 px-2 border border-bzinc rounded-md text-xs inline-flex gap-2 bg-white">
          {
            {
              IB: "🎓",
              "A-Levels": "📚",
              MYP: "🌍",
              GCSE: "📝",
              CBSE: "🇮🇳",
              AP: "🔬",
              Other: "✏️",
            }[curriculum ?? "Other"]
          }
          <span>{curriculum ?? "n/a"}</span>
        </span>
      );
    },
  }),
  columnHelper.accessor("targetCountries", {
    header: "Target Countries",
    cell: (info) => {
      const countries = info.getValue();

      if (!countries || countries.length === 0) {
        return "n/a";
      }

      return (
        <div className="flex gap-1">
          {countries.map((country) => (
            <span
              key={country}
              className="py-1 px-2 border border-bzinc rounded-md text-xs bg-white"
            >
              {
                {
                  "United States": "🇺🇸",
                  "United Kingdom": "🇬🇧",
                  Canada: "🇨🇦",
                  Australia: "🇦🇺",
                }[country]
              }
            </span>
          ))}
        </div>
      );
    },
  }),
  columnHelper.accessor("userId", {
    header: "Session Summary",
    cell: (info) => {
      const userId = info.getValue();

      return (
        <Link
          to="/students/$userId"
          params={{ userId }}
          search={{ tab: "sessions" }}
          className="underline"
        >
          View
        </Link>
      );
    },
  }),
  columnHelper.accessor("userId", {
    header: " ",
    cell: (info) => {
      const userId = info.getValue();

      return (
        <Link
          to="/students/$userId"
          params={{ userId }}
          search={{ tab: "sessions" }}
          className="py-0.5 px-1.5 rounded-sm border-bzinc border inline-flex group bg-white gap-2 items-center"
        >
          <span className="group-hover:translate-x-0.5 transition-transform duration-300">
            Open
          </span>
          <ArrowRightIcon className="group-hover:-translate-x-0.5 transition-transform duration-300" />
        </Link>
      );
    },
  }),
];

export const StudentTable = ({
  data,
  currentStudentUserId,
  isError,
  isLoading,
}: {
  data: Student[];
  currentStudentUserId?: string;
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
      className="border border-bzinc bg-white rounded-lg flex-1 text-left overflow-y-auto no-scrollbar"
      style={{ height: tableHeight ? tableHeight - 32 : undefined }}
    >
      {tableHeight ? (
        <DataTable
          table={table}
          isRowSelected={(row) => row.original.userId === currentStudentUserId}
          isLoading={isLoading}
          isError={isError}
        />
      ) : null}
    </div>
  );
};
