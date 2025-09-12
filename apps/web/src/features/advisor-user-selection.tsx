import { useQuery } from "@tanstack/react-query";
import { orpc } from "orpc/client";

const User = ({
  name,
  email,
  onCheckChange,
  isChecked,
}: {
  name: string;
  email: string;
  onCheckChange: (checked: boolean) => void;
  isChecked: boolean;
}) => {
  return (
    <button
      onClick={() => onCheckChange(!isChecked)}
      type="button"
      className="px-4 py-2 hover:bg-zinc-50 flex items-center text-left w-full"
    >
      <div className="flex-1">
        <div>{name}</div>
        <div>{email}</div>
      </div>
      <div>
        <input type="checkbox" checked={isChecked} />
      </div>
    </button>
  );
};

export const AdvisorUserSelection = ({
  onSelectionChange,
  selectedUsers,
}: {
  onSelectionChange: (selectedUsers: Array<{ userId: string }>) => void;
  selectedUsers: Array<{ userId: string }>;
}) => {
  const handleUserCheckChange = (userId: string, isChecked: boolean) => {
    onSelectionChange(
      isChecked
        ? [...selectedUsers, { userId }]
        : selectedUsers.filter((user) => user.userId !== userId)
    );
  };

  const studentsListQuery = useQuery(
    orpc.student.list.queryOptions({ input: {} })
  );

  const studentsList = studentsListQuery.data ?? [];

  return (
    <div className="rounded-md border border-bzinc flex-1 h-full text-left">
      <div className="border-b border-bzinc px-4 py-2">
        <input
          type="text"
          className="outline-none"
          placeholder="Student name or email"
        />
      </div>
      {studentsList.map((student) => (
        <User
          key={student.email}
          name={student.name ?? "Unknown"}
          email={student.email}
          onCheckChange={(isChecked) =>
            handleUserCheckChange(student.userId, isChecked)
          }
          isChecked={selectedUsers.some(
            (user) => user.userId === student.userId
          )}
        />
      ))}
    </div>
  );
};
