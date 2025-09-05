import { Input } from "@/components/input";
import { UserSearch } from "./user-search";
import { SubtitlesIcon, XIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";

type StudentOrAdvisor = { id: string; name: string };

export const CreateSession = () => {
  const [advisor, setAdvisor] = useState<StudentOrAdvisor | undefined>();
  const [student, setStudent] = useState<StudentOrAdvisor | undefined>();

  const form = useForm({
    defaultValues: {
      title: "",
      studentQuery: "",
      advisorQuery: "",
      transcription: "",
    },
    validators: {
      //   onChange: z.object({
      //     title: z.string().min(2, "Title is required"),
      //     transcription: z.string(),
      //   }),
    },
  });

  const createSessionMutation = useMutation(
    orpc.session.create.mutationOptions()
  );

  const searchStudentsMutation = useMutation(
    orpc.student.search.mutationOptions()
  );

  const searchAdvisorsMutation = useMutation(
    orpc.advisor.search.mutationOptions()
  );

  const students = searchStudentsMutation.data ?? [];
  const advisors = searchAdvisorsMutation.data ?? [];

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        ev.stopPropagation();

        form.handleSubmit();
      }}
      className="w-[500px] border-l border-bzinc flex flex-col gap-4 p-4 py-7"
    >
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
              <label className="mb-2 mx-1 flex justify-between">Student</label>
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
              <label className="mb-2 mx-1 flex justify-between">Advisor</label>
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
        <label className="mb-2 mx-1 flex justify-between">Transcription</label>
        <div className="border border-bzinc rounded-md">
          <textarea className="w-full h-32 p-2 outline-none" rows={10} />
          <div className="border-t border-bzinc p-2 text-left flex justify-between items-center">
            <SubtitlesIcon size={18} />
            <div className="flex gap-2 items-center">
              Count: 100 words
              <XIcon size={18} />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
