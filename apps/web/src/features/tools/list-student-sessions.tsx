import { Dialog } from "@/components/dialog";
import { ListDashesIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { formatDate } from "date-fns";

export const ListStudentSessionsTool = ({
  output = {},
  input = {},
}: {
  output: any;
  input: any;
}) => {
  return (
    <Dialog
      trigger={
        <button className="rounded-md shadow-sm outline outline-bzinc py-1 px-2 inline-flex gap-2 items-center cursor-pointer">
          <ListDashesIcon />
          <div>Session Log History</div>
        </button>
      }
      className="p-0"
    >
      <div className="px-4 py-3 border-bzinc border-b flex gap-4 items-center">
        <ListDashesIcon />
        Session Log History
      </div>
      <div className="p-4">
        {output?.map((o: any) => {
          const [date, title, sessionId] = o.split(";");

          return (
            <div className="mb-1.5 last:mb-0" key={o}>
              <Link
                to="/sessions/$sessionId"
                params={{ sessionId }}
                target="_blank"
                rel="noreferrer"
              >
                <button className="flex items-center text-left cursor-pointer gap-4 last:mb-0 group">
                  <div className="w-[7rem] group-hover:underline">
                    {formatDate(new Date(date), "MMM dd, HH:mm")}
                  </div>
                  <div>
                    <div className="w-2 h-2 bg-zinc-200 rounded-full" />
                  </div>
                  <div className="w-[20rem] group-hover:underline">
                    <div className="truncate">{title}</div>
                  </div>
                </button>
              </Link>
            </div>
          );
        })}
      </div>
    </Dialog>
  );
};
