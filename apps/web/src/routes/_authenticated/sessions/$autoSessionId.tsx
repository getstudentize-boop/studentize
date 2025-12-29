import { createFileRoute, Link, useParams } from "@tanstack/react-router";

import { Input } from "@/components/input";
import { UserSearch } from "@/features/user-search";
import { ArrowLeftIcon, SubtitlesIcon, XIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { z } from "zod";
import { convertStringToFile, uploadFileToStorage } from "@/utils/s3";
import { Button } from "@/components/button";

import { useAuthUser } from "@/routes/_authenticated";
import { Switch } from "@/components/switch";
import { useSessionSummary } from "@/hooks/use-session-summary";
import { Loader } from "@/components/loader";

export const Route = createFileRoute("/_authenticated/sessions/$autoSessionId")(
  {
    component: RouteComponent,
  }
);

type StudentOrAdvisor = { userId: string; name: string };

function RouteComponent() {
  const currentUser = useAuthUser();

  const { autoSessionId } = Route.useParams();

  const autoSyncSessionQuery = useQuery(
    orpc.session.getOneAutoSync.queryOptions({
      input: { sessionId: autoSessionId },
    })
  );

  const readTemporaryTranscriptionQuery = useQuery(
    orpc.session.readTemporaryTranscription.queryOptions({
      input: { sessionId: autoSessionId },
    })
  );

  const uploadTranscriptionMutation = useMutation(
    orpc.session.createAutoSync.mutationOptions({
      onSuccess: () => {
        return Promise.all([
          utils.invalidateQueries({
            queryKey: orpc.session.list.queryKey({
              input: { studentUserId: student?.userId },
            }),
          }),
          utils.invalidateQueries({
            queryKey: orpc.session.listAutoSync.queryKey({
              input: {},
            }),
          }),
        ]);
      },
    })
  );

  const utils = useQueryClient();

  const [advisor, setAdvisor] = useState<StudentOrAdvisor | undefined>();
  const [student, setStudent] = useState<StudentOrAdvisor | undefined>();

  const form = useForm({
    defaultValues: {
      title: autoSyncSessionQuery.data?.title ?? "",
      studentQuery: autoSyncSessionQuery.data?.studentUserId ?? "",
      advisorQuery: autoSyncSessionQuery.data?.advisorUserId ?? "",
    },
    validators: {
      onSubmit: z.object({
        title: z.string().min(1, "Title is required"),
        studentQuery: z.string(),
        advisorQuery: z.string(),
      }),
    },
    onSubmit: async () => {
      if (!student || !advisor) {
        throw new Error("Student and Advisor are required");
      }

      await uploadTranscriptionMutation.mutate({
        advisorUserId: advisor.userId,
        studentUserId: student.userId,
        sessionId: autoSessionId,
      });
    },
  });

  const searchStudentsMutation = useMutation(
    orpc.student.search.mutationOptions()
  );

  const searchAdvisorsMutation = useMutation(
    orpc.advisor.search.mutationOptions({
      onSuccess: (data) => {
        if (currentUser.user.type === "ADVISOR") {
          const advisor = data[0];
          setAdvisor({
            userId: advisor.userId,
            name: advisor.name ?? "",
          });
        }
      },
    })
  );

  const students = searchStudentsMutation.data ?? [];
  const advisors = searchAdvisorsMutation.data ?? [];

  useEffect(() => {
    searchStudentsMutation.mutate({ query: "" });
    searchAdvisorsMutation.mutate({ query: "" });
  }, []);

  if (
    autoSyncSessionQuery.isPending ||
    readTemporaryTranscriptionQuery.isPending
  ) {
    return (
      <div className="w-[500px] border-l border-bzinc bg-white">
        <div className="flex gap-4 items-center px-4 pt-7 pb-4 border-b border-bzinc">
          <Link to="/sessions">
            <ArrowLeftIcon />
          </Link>
          <div>
            <div className="font-semibold">Create a new auto-sync session</div>
          </div>
        </div>

        <div className="p-4 text-left">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="font-semibold">Title</div>
              <Loader className="w-full h-8" />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <div>Student</div>
                <Loader className="w-full h-8 mt-2" />
              </div>
              <div className="flex-1">
                <div>Advisor</div>
                <Loader className="w-full h-8 mt-2" />
              </div>
            </div>

            <div>
              <div>Transcription</div>
              <Loader className="h-32 mt-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();

        await form.handleSubmit();
        form.reset();
      }}
      className="w-[500px] border-l border-bzinc bg-white"
    >
      <div className="flex gap-4 items-center px-4 pt-7 pb-4 border-b border-bzinc">
        <Link to="/sessions">
          <ArrowLeftIcon />
        </Link>
        <div>
          <div className="font-semibold">Create a new auto-sync session</div>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <form.Field
          name="title"
          children={(field) => (
            <Input
              label="Title"
              placeholder="e.g: Advisory Session"
              onChange={(ev) => field.handleChange(ev.target.value)}
              value={field.state.value}
            />
          )}
        />

        <div className="flex gap-4">
          <form.Field
            name="studentQuery"
            asyncDebounceMs={300}
            listeners={{
              onChange: ({ value }) => {
                searchStudentsMutation.mutate({ query: value });
              },
            }}
            children={(field) => (
              <div className="flex-1">
                <label className="mb-2 mx-1 flex justify-between">
                  Student
                </label>
                <UserSearch
                  placeholder="Search student"
                  data={students}
                  onSelect={setStudent}
                  user={student}
                  onSearch={field.handleChange}
                />
              </div>
            )}
          />
          <form.Field
            name="advisorQuery"
            asyncDebounceMs={300}
            listeners={{
              onChange: ({ value }) => {
                searchAdvisorsMutation.mutate({ query: value });
              },
            }}
            children={(field) => (
              <div className="flex-1">
                <label className="mb-2 mx-1 flex justify-between">
                  Advisor
                </label>
                <UserSearch
                  align="end"
                  placeholder="Search advisor"
                  data={advisors}
                  onSelect={setAdvisor}
                  user={advisor}
                  onSearch={field.handleChange}
                />
              </div>
            )}
          />
        </div>
        <div>
          <label className="mb-2 mx-1 flex justify-between">
            Transcription
          </label>
          <div className="border border-bzinc rounded-md">
            <textarea
              className="w-full h-32 p-2 outline-none"
              rows={10}
              value={readTemporaryTranscriptionQuery.data}
            />
            <div className="border-t border-bzinc p-2 text-left flex justify-between items-center">
              <SubtitlesIcon size={18} />
              <div className="flex gap-2 items-center">
                Count: {readTemporaryTranscriptionQuery.data?.length} chars
              </div>
            </div>
          </div>
        </div>

        <form.Subscribe
          selector={(state) => [state.isSubmitting]}
          children={([isSubmitting]) => (
            <Button
              className="mt-auto rounded-lg"
              type="submit"
              isLoading={isSubmitting || uploadTranscriptionMutation.isPending}
            >
              Upload
            </Button>
          )}
        />
      </div>
    </form>
  );
}
