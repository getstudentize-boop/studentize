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
        <span className="py-1 px-2 border border-bzinc rounded-md text-xs bg-white">
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
];

export const StudentTable = ({
  data,
  currentStudentUserId,
}: {
  data: Student[];
  currentStudentUserId?: string;
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
      isRowSelected={(row) => row.original.userId === currentStudentUserId}
      onRowClick={(row) => {
        navigate({
          to: "/students/$userId",
          params: { userId: row.original.userId },
        });
      }}
    />
  );
};
