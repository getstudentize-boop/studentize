import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { ArrowLeftIcon, CopyIcon } from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { AdvisorUserSelection } from "@/features/advisor-user-selection";

export const Route = createFileRoute("/_authenticated/advisors/$userId")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  const userId = params.userId;
  const queryClient = useQueryClient();

  const advisorQuery = useQuery(
    orpc.advisor.getOne.queryOptions({ input: { userId } })
  );

  const updateAdvisorMutation = useMutation(
    orpc.advisor.update.mutationOptions({
      onSuccess: () => {
        return Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpc.advisor.getOne.key({ input: { userId } }),
          }),
          queryClient.invalidateQueries({
            queryKey: orpc.advisor.list.key(),
          }),
        ]);
      },
    })
  );

  const advisor = advisorQuery.data;

  const form = useForm({
    defaultValues: {
      name: advisor?.name ?? "",
      universityName: advisor?.universityName ?? "",
      courseMajor: advisor?.courseMajor ?? "",
      courseMinor: advisor?.courseMinor ?? "",
      status: advisor?.status ?? "PENDING",
      studentIds: advisor?.studentIds ?? [],
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, "Name is required"),
        universityName: z.string().min(1, "University is required"),
        courseMajor: z.string().min(1, "Course major is required"),
        courseMinor: z.string(),
        status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]),
        studentIds: z.array(z.object({ userId: z.string() })),
      }),
    },
    onSubmit: async (vals) => {
      await updateAdvisorMutation.mutateAsync({
        userId,
        ...vals.value,
        courseMinor: vals.value.courseMinor || undefined,
      });
    },
  });

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        form.handleSubmit();
      }}
      className="w-[30rem] bg-white border-l border-bzinc flex flex-col"
    >
      <div className="p-4 pt-5 border-b border-bzinc flex gap-4 items-center justify-between">
        <Link to="/advisors">
          <ArrowLeftIcon />
        </Link>
        <Button variant="neutral" type="button">
          {params.userId}
          <CopyIcon />
        </Button>
      </div>
      <div className="p-4 flex flex-col gap-4 border-b border-bzinc">
        <div className="flex w-full gap-2">
          <form.Field
            name="name"
            children={(field) => (
              <div className="w-full">
                <Input
                  label="Name"
                  value={field.state.value}
                  onChange={(ev) => field.handleChange(ev.target.value)}
                  className="w-full"
                  error={field.state.meta.errors[0]?.message}
                />
              </div>
            )}
          />
          <div className="w-full">
            <Input
              label="Email"
              value={advisor?.email}
              disabled
              className="disabled:bg-zinc-50"
            />
          </div>
        </div>
        <div className="flex flex-[0.5]">
          <form.Field
            name="status"
            children={(field) => (
              <Select
                label="Status"
                value={field.state.value}
                onValueChange={(value: string) =>
                  field.handleChange(value as "ACTIVE" | "INACTIVE" | "PENDING")
                }
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "INACTIVE", label: "Inactive" },
                  { value: "PENDING", label: "Pending" },
                ]}
                error={field.state.meta.errors[0]?.message}
              />
            )}
          />
        </div>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <form.Field
          name="universityName"
          children={(field) => (
            <Input
              label="University"
              value={field.state.value}
              onChange={(ev) => field.handleChange(ev.target.value)}
              className="w-full"
              error={field.state.meta.errors[0]?.message}
            />
          )}
        />

        <div className="flex w-full gap-2">
          <form.Field
            name="courseMajor"
            children={(field) => (
              <div className="w-full">
                <Input
                  label="Course Major"
                  value={field.state.value}
                  onChange={(ev) => field.handleChange(ev.target.value)}
                  className="w-full"
                  error={field.state.meta.errors[0]?.message}
                />
              </div>
            )}
          />
          <form.Field
            name="courseMinor"
            children={(field) => (
              <div className="w-full">
                <Input
                  label="Course Minor"
                  value={field.state.value}
                  onChange={(ev) => field.handleChange(ev.target.value)}
                  className="w-full"
                  error={field.state.meta.errors[0]?.message}
                />
              </div>
            )}
          />
        </div>
      </div>
      <div className="flex-1 p-4 pt-2">
        <form.Field
          name="studentIds"
          children={(field) => (
            <AdvisorUserSelection
              onSelectionChange={(selectedUsers) => {
                field.handleChange(selectedUsers);
              }}
              selectedUsers={field.state.value}
            />
          )}
        />
      </div>
      <form.Subscribe
        selector={(state) => [state.isSubmitting]}
        children={([isSubmitting]) => (
          <Button
            type="submit"
            className="rounded-md mx-4 mb-4"
            isLoading={isSubmitting}
          >
            Save Changes
          </Button>
        )}
      />
    </form>
  );
}
