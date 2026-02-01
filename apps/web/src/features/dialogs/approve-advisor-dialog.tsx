import { useForm } from "@tanstack/react-form";
import { GraduationCapIcon, XIcon } from "@phosphor-icons/react";
import { z } from "zod";
import { Dialog, DialogClose } from "@/components/dialog";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { useState } from "react";

export const ApproveAdvisorDialog = ({ userId }: { userId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const approveMutation = useMutation(
    orpc.user.approve.mutationOptions({
      onSuccess: () => {
        form.reset();
        setIsOpen(false);

        queryClient.invalidateQueries({
          queryKey: orpc.user.listPending.key({ type: "query" }),
        });
      },
    })
  );

  const form = useForm({
    defaultValues: {
      universityName: "",
      courseMajor: "",
      courseMinor: "",
    },
    validators: {
      onSubmit: z.object({
        universityName: z.string().min(2, "University name is required"),
        courseMajor: z.string().min(2, "Course major is required"),
        courseMinor: z.string().optional(),
      }),
    },
    onSubmit: (vals) =>
      approveMutation.mutateAsync({
        userId,
        role: "ADVISOR",
        universityName: vals.value.universityName,
        courseMajor: vals.value.courseMajor,
        courseMinor: vals.value.courseMinor || undefined,
      }),
  });

  return (
    <Dialog
      trigger={
        <button className="px-3 py-1.5 rounded-lg border border-zinc-200 inline-flex gap-2 items-center text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-150 bg-white">
          Approve as Advisor
        </button>
      }
      className="p-0"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          form.handleSubmit(ev);
        }}
      >
        <div className="p-4 border-b border-bzinc flex items-center justify-between">
          <div>Approve as Advisor</div>
          <DialogClose>
            <Button variant="neutral">
              <XIcon />
            </Button>
          </DialogClose>
        </div>
        <div className="px-6 pt-4 pb-8 flex flex-col gap-4">
          <form.Field
            name="universityName"
            children={(field) => (
              <Input
                label="University"
                placeholder="e.g. Harvard University"
                name={field.name}
                value={field.state.value}
                onChange={(ev) => field.handleChange(ev.target.value)}
                error={field.state.meta.errors[0]?.message}
              />
            )}
          />
          <form.Field
            name="courseMajor"
            children={(field) => (
              <Input
                label="Course Major"
                placeholder="e.g. Computer Science"
                name={field.name}
                value={field.state.value}
                onChange={(ev) => field.handleChange(ev.target.value)}
                error={field.state.meta.errors[0]?.message}
              />
            )}
          />
          <form.Field
            name="courseMinor"
            children={(field) => (
              <Input
                label="Course Minor (Optional)"
                placeholder="e.g. Mathematics"
                name={field.name}
                value={field.state.value}
                onChange={(ev) => field.handleChange(ev.target.value)}
                error={field.state.meta.errors[0]?.message}
              />
            )}
          />
        </div>
        <div className="p-4 bg-zinc-100 border-t border-bzinc flex justify-end">
          <form.Subscribe
            selector={(state) => [state.isSubmitting]}
            children={([isSubmitting]) => (
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting || approveMutation.isPending}
              >
                Approve
                <GraduationCapIcon size={18} />
              </Button>
            )}
          />
        </div>
      </form>
    </Dialog>
  );
};
