import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { UserSearch } from "@/features/user-search";
import {
  CalendarBlankIcon,
  ClockIcon,
  VideoCameraIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { orpc } from "orpc/client";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/schedule/")({
  component: RouteComponent,
});

const Schedule = ({ title }: { title: string }) => {
  return (
    <div className="rounded-lg bg-white outline outline-bzinc p-4">
      <div className="font-semibold text-lg px-2">{title}</div>

      <div className="mt-4 mb-6 space-y-2 px-2">
        <div className="flex gap-2 items-center">
          <CalendarBlankIcon className="size-4 text-zinc-500" />
          <div>Tuesday, June 18, 2024</div>
        </div>
        <div className="flex gap-2 items-center">
          <ClockIcon className="size-4 text-zinc-500" />
          <div>4:00 PM - 5:00 PM</div>
        </div>
      </div>

      <Button variant="neutral" className="rounded-md w-full">
        Join Session
      </Button>
    </div>
  );
};

type StudentOrAdvisor = { userId: string; name: string | null } | undefined;

function RouteComponent() {
  const [selectedAdvisor, setSelectedAdvisor] = useState<StudentOrAdvisor>();
  const [selectedStudent, setSelectedStudent] = useState<StudentOrAdvisor>();
  const [scheduledAt, setScheduledAt] = useState<string>();

  const [isLinkRequired, setIsLinkRequired] = useState(false);
  const [meetingLink, setMeetingLink] = useState<string>("");

  const utils = useQueryClient();
  const sessionListQuery = useQuery(orpc.scheduledSession.list.queryOptions());

  const sessionList = sessionListQuery.data ?? [];

  const createSessionMutation = useMutation(
    orpc.scheduledSession.create.mutationOptions({
      onSuccess: async () => {
        setSelectedAdvisor(undefined);
        setSelectedStudent(undefined);
        setScheduledAt(undefined);
        setIsLinkRequired(false);

        return utils.invalidateQueries({
          queryKey: orpc.scheduledSession.list.queryKey(),
        });
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

    if (!meetingLink) {
      return;
    }

    createSessionMutation.mutate({
      advisorUserId: selectedAdvisor.userId,
      studentUserId: selectedStudent.userId,
      scheduledAt: new Date(scheduledAt).toISOString(),
      meetingLink,
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
        <div className="font-semibold mx-0.5 mb-1">Session Start Time</div>
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
              value={meetingLink}
              onChange={(ev) => setMeetingLink(ev.target.value)}
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
          <Schedule key={session.id} title={session.title} />
        ))}
      </div>
    </div>
  );
}
