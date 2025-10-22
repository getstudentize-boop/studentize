import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { UserSearch } from "@/features/user-search";
import {
  CalendarBlankIcon,
  ClockIcon,
  RobotIcon,
  VideoCameraIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { orpc, RouterOutputs } from "orpc/client";
import { useEffect, useState } from "react";

import { format as _format } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

export const Route = createFileRoute("/_authenticated/schedule/")({
  component: RouteComponent,
});

const Schedule = ({
  session,
}: {
  session: RouterOutputs["scheduledSession"]["list"][number];
}) => {
  const utils = useQueryClient();

  return (
    <div className="rounded-lg bg-white outline outline-bzinc">
      <div className="p-4">
        <div className="font-semibold text-lg px-2 truncate">
          {session.title}
        </div>

        <div className="mt-4 space-y-2 px-2">
          <div className="flex gap-2 items-center">
            <CalendarBlankIcon className="size-4 text-zinc-500" />
            <div>
              {_format(new Date(session.scheduledAt), "eeee MMMM d, yyyy")}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <ClockIcon className="size-4 text-zinc-500" />
            <div>{_format(new Date(session.scheduledAt), "h:mm a")}</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 items-center p-4 border-t border-bzinc">
        <button
          className="p-2 rounded-md border border-bzinc bg-zinc-50 transition-colors"
          onClick={() => {
            utils.invalidateQueries({
              queryKey: orpc.scheduledSession.list.queryKey(),
            });
          }}
        >
          <RobotIcon
            size={18}
            className={session.botId ? "text-indigo-600" : ""}
          />
        </button>
        <Button
          variant="neutral"
          className="rounded-md w-full"
          onClick={() => {
            window.open(
              `https://meet.google.com/${session.meetingCode}`,
              "_blank"
            );
          }}
        >
          Join Meeting
        </Button>
      </div>
    </div>
  );
};

type StudentOrAdvisor = { userId: string; name: string | null } | undefined;

function RouteComponent() {
  const [selectedAdvisor, setSelectedAdvisor] = useState<StudentOrAdvisor>();
  const [selectedStudent, setSelectedStudent] = useState<StudentOrAdvisor>();
  const [scheduledAt, setScheduledAt] = useState<string>();

  const [isLinkRequired, setIsLinkRequired] = useState(false);
  const [meetingCode, setmeetingCode] = useState<string>("");

  const utils = useQueryClient();
  const sessionListQuery = useQuery(orpc.scheduledSession.list.queryOptions());

  const sessionList = sessionListQuery.data ?? [];

  const createSessionMutation = useMutation(
    orpc.scheduledSession.create.mutationOptions({
      onSuccess: async () => {
        await utils.invalidateQueries({
          queryKey: orpc.scheduledSession.list.queryKey(),
        });

        setSelectedAdvisor(undefined);
        setSelectedStudent(undefined);
        setScheduledAt(undefined);
        setIsLinkRequired(false);
      },
    })
  );

  const searchStudentsMutation = useMutation(
    orpc.student.search.mutationOptions()
  );

  const searchAdvisorsMutation = useMutation(
    orpc.advisor.search.mutationOptions()
  );

  const availableStudents = searchStudentsMutation.data ?? [];
  const availableAdvisors = searchAdvisorsMutation.data ?? [];

  const handleCreateSession = async () => {
    if (!selectedAdvisor || !selectedStudent || !scheduledAt) {
      return;
    }

    if (!isLinkRequired) {
      setIsLinkRequired(true);
      return;
    }

    if (!meetingCode) {
      return;
    }

    const ukTime = fromZonedTime(scheduledAt, "Europe/London");

    createSessionMutation.mutate({
      advisorUserId: selectedAdvisor.userId,
      studentUserId: selectedStudent.userId,
      scheduledAt: ukTime.toISOString(),
      meetingCode,
    });
  };

  useEffect(() => {
    searchStudentsMutation.mutate({ query: "" });
    searchAdvisorsMutation.mutate({ query: "" });
  }, []);

  const Settings = () => (
    <div className="p-4 flex gap-4 text-left">
      <div className="flex-1">
        <div className="font-semibold mx-0.5 mb-1">Advisor</div>
        <UserSearch
          data={availableAdvisors}
          placeholder="Advisor"
          onSelect={setSelectedAdvisor}
          user={selectedAdvisor}
          onSearch={(query) => searchAdvisorsMutation.mutateAsync({ query })}
        />
      </div>
      <div className="flex-1">
        <div className="font-semibold mx-0.5 mb-1">Students</div>
        <UserSearch
          data={availableStudents}
          placeholder="Student"
          onSelect={setSelectedStudent}
          user={selectedStudent}
          onSearch={(query) => searchStudentsMutation.mutateAsync({ query })}
        />
      </div>
      <div className="flex-1">
        <div className="font-semibold mx-0.5 mb-1">Session Date/Time (UK)</div>
        <Input
          type="datetime-local"
          onChange={(ev) => setScheduledAt(ev.target.value)}
          value={scheduledAt}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="max-w-2xl w-full overflow-hidden bg-white rounded-xl shadow-xs outline outline-bzinc">
        {!isLinkRequired ? <Settings /> : null}

        {isLinkRequired ? (
          <div className="p-4 text-left">
            <Input
              placeholder="https://meet.google.com/qbt-kaqz-nho"
              label="Paste meeting link"
              className="w-full"
              value={meetingCode}
              onChange={(ev) => setmeetingCode(ev.target.value)}
            />
          </div>
        ) : null}

        <div className="p-8 border-t border-bzinc bg-zinc-100 flex items-center justify-center">
          <Button
            className="rounded-md"
            variant={isLinkRequired ? "primary" : "secondary"}
            isLoading={createSessionMutation.isPending}
            onClick={handleCreateSession}
          >
            Schedule a Session
            <VideoCameraIcon />
          </Button>
        </div>
      </div>
      <div className="mt-4 max-w-2xl w-full grid-cols-2 grid gap-4 text-left">
        {sessionList.map((session) => (
          <Schedule key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
