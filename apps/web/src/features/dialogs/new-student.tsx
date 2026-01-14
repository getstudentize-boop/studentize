import { useForm } from "@tanstack/react-form";

import { GraduationCapIcon, PlusIcon, XIcon } from "@phosphor-icons/react";

import { z } from "zod";

import { Dialog, DialogClose } from "@/components/dialog";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { useState } from "react";

export const NewStudentDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const createStudentMutation = useMutation(
    orpc.student.create.mutationOptions({
      onSuccess: () => {
        form.reset();
        setIsOpen(false);
      },
    })
  );

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, "Name is required"),
        email: z.email("Invalid email address"),
      }),
    },
    onSubmit: (vals) => createStudentMutation.mutateAsync(vals.value),
  });

  return (
    <Dialog
      trigger={
        <button className="px-3 py-1.5 shadow border-b-2 border-zinc-950 flex gap-2 rounded-full text-white bg-zinc-800 items-center">
          New Student
          <PlusIcon />
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
          <div>Create new student</div>
          <DialogClose>
            <Button variant="neutral">
              <XIcon />
            </Button>
          </DialogClose>
        </div>
        <div className="px-6 pt-4 pb-8 flex flex-col gap-4">
          <form.Field
            name="name"
            children={(field) => (
              <Input
                label="Name"
                placeholder="e.g. Robert Greene"
                name={field.name}
                value={field.state.value}
                onChange={(ev) => field.handleChange(ev.target.value)}
                error={field.state.meta.errors[0]?.message}
              />
            )}
          />
          <form.Field
            name="email"
            children={(field) => (
              <Input
                label="Email"
                placeholder="e.g. robert@greene.com"
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
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Create
                <GraduationCapIcon size={18} />
              </Button>
            )}
          />
        </div>
      </form>
    </Dialog>
  );
};
