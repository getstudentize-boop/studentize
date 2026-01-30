import { Input } from "@/components/input";
import { UserSearch } from "./user-search";
import { ArrowLeftIcon, SubtitlesIcon, XIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { z } from "zod";
import { convertStringToFile, uploadFileToStorage } from "@/utils/s3";
import { Button } from "@/components/button";

import { useAuthUser } from "@/routes/_authenticated";
import { Switch } from "@/components/switch";
import { useSessionSummary } from "@/hooks/use-session";

type StudentOrAdvisor = { userId: string; name: string };

export const CreateSession = ({
  onComplete,
  onBack,
}: {
  onComplete: () => void;
  onBack: () => void;
}) => {
  const currentUser = useAuthUser();
  const { startSessionSummaryGeneration } = useSessionSummary();

  const utils = useQueryClient();

  const [advisor, setAdvisor] = useState<StudentOrAdvisor | undefined>();
  const [student, setStudent] = useState<StudentOrAdvisor | undefined>();

  const uploadTranscriptionMutation = useMutation(
    orpc.session.transcriptionUploadUrl.mutationOptions()
  );

  const form = useForm({
    defaultValues: {
      title: "",
      studentQuery: "",
      advisorQuery: "",
      transcription: "",
      summarize: false,
    },
    validators: {
      onSubmit: z.object({
        title: z.string().min(1, "Title is required"),
        studentQuery: z.string(),
        advisorQuery: z.string(),
        transcription: z.string().min(1, "Transcription is required"),
        summarize: z.boolean(),
      }),
    },
    onSubmit: async (vals) => {
      if (!student || !advisor) {
        throw new Error("Student and Advisor are required");
      }

      const value = vals.value;

      const session = await createSessionMutation.mutateAsync({
        title: value.title,
        studentUserId: student.userId,
        advisorUserId: advisor.userId,
      });

      // upload transcription as markdown file
      const result = await uploadTranscriptionMutation.mutateAsync({
        sessionId: session.id,
        ext: "txt",
        studentUserId: student.userId,
      });

      const markdown = await convertStringToFile(
        value.transcription,
        `${session.id}.txt`,
        "text/plain"
      );

      await uploadFileToStorage(result.url, markdown);

      // trigger the summary generation
      if (vals.value.summarize) {
        await startSessionSummaryGeneration({ sessionId: session.id });
      }
    },
  });

  const createSessionMutation = useMutation(
    orpc.session.create.mutationOptions({
      onSuccess: async () => {
        await utils.invalidateQueries({
          queryKey: orpc.session.list.key({ type: "query" }),
        });

        onComplete();
      },
    })
  );

  const searchStudentsMutation = useMutation(
    orpc.student.search.mutationOptions()
  );

  const searchAdvisorsMutation = useMutation(
    orpc.advisor.search.mutationOptions({
      onSuccess: (data) => {
        if (currentUser.user.organization?.role === "ADVISOR") {
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
        <button onClick={() => onBack()}>
          <ArrowLeftIcon />
        </button>
        <div>
          <div className="font-semibold">New Session</div>
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
        <form.Field
          name="transcription"
          children={(field) => (
            <div>
              <label className="mb-2 mx-1 flex justify-between">
                Transcription
              </label>
              <div className="border border-bzinc rounded-md">
                <textarea
                  className="w-full h-32 p-2 outline-none"
                  rows={10}
                  onChange={(ev) => field.handleChange(ev.target.value)}
                  value={field.state.value}
                />
                <div className="border-t border-bzinc p-2 text-left flex justify-between items-center">
                  <SubtitlesIcon size={18} />
                  <div className="flex gap-2 items-center">
                    Count: {field.state.value.length} chars
                    <XIcon size={18} />
                  </div>
                </div>
              </div>
            </div>
          )}
        />

        <div className="text-left">
          <div className="mb-2">Summarize</div>

          <form.Field
            name="summarize"
            children={(field) => (
              <Switch
                onCheckedChange={field.handleChange}
                checked={field.state.value}
              />
            )}
          />
        </div>

        <form.Subscribe
          selector={(state) => [state.isSubmitting]}
          children={([isSubmitting]) => (
            <Button
              className="mt-auto rounded-lg"
              type="submit"
              isLoading={isSubmitting}
            >
              Upload
            </Button>
          )}
        />
      </div>
    </form>
  );
};
