import { AdvisorTable } from "@/features/tables/advisor";
import { StudentTable } from "@/features/tables/student";
import { PlusIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/users")({
  component: RouteComponent,
});

export const Header = ({
  title,
  actionTitle,
}: {
  title: string;
  actionTitle: string;
}) => {
  return (
    <div className="justify-between items-center flex p-2.5">
      <div className="flex gap-2 items-center">{title}</div>

      <div className="px-3 py-1.5 shadow border-b-2 border-zinc-950 flex gap-2 rounded-full text-white bg-zinc-800 items-center">
        {actionTitle}
        <PlusIcon />
      </div>
    </div>
  );
};

function RouteComponent() {
  return (
    <div className="flex flex-1 p-4 pt-2.5 gap-4 h-screen">
      <div className="flex-1 flex-col flex">
        <Header title="Advisors" actionTitle="New Advisor" />
        <div className="border border-zinc-200/60 rounded-lg flex-1 text-left">
          <AdvisorTable
            data={[
              { name: "Dr. Alice Johnson", university: "Harvard University" },
              { name: "Prof. Bob Lee", university: "Stanford University" },
              { name: "Dr. Carol White", university: "MIT" },
            ]}
          />
        </div>
      </div>
      <div className="flex-1 flex-col flex">
        <Header title="Students" actionTitle="New Student" />
        <div className="border border-zinc-200/60 rounded-lg flex-1 text-left">
          <StudentTable
            data={[
              { name: "John Doe", sessions: 5 },
              { name: "Jane Smith", sessions: 3 },
              { name: "Jim Brown", sessions: 2 },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
