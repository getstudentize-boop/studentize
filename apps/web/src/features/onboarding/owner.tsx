import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { z } from "zod";
import { OrganizationLogo } from "../organization/logo";
import { useNavigate } from "@tanstack/react-router";

export const OwnerOnboarding = ({
  organizationId,
}: {
  organizationId: string;
}) => {
  const queryClient = useQueryClient();\

  const navigate = useNavigate()

  const completeOnboardingMutation = useMutation(
    orpc.organization.completeOnboarding.mutationOptions({
      onSuccess: () => {
        // Invalidate user and organization queries to refresh the data
        queryClient.invalidateQueries({
          queryKey: orpc.user.current.key({ type: "query" }),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.organization.current.key({ type: "query" }),
        });
        
        navigate({ to: "/home" });
      },
    })
  );

  const form = useForm({
    defaultValues: {
      name: "",
      organizationName: "",
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, "Name is required"),
        organizationName: z.string().min(1, "Organization name is required"),
      }),
    },
    onSubmit: (vals) => completeOnboardingMutation.mutateAsync(vals.value),
  });

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="max-w-md w-full border border-zinc-200 rounded-xl overflow-hidden">
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="p-6">
            <div>
              <OrganizationLogo
                organizationId={organizationId}
                alt="Organization Logo"
                className="w-40 h-24 object-cover mx-auto"
              />
            </div>
            <div className="mt-6">
              <div className="font-bold text-center">Welcome to Studentize</div>
              <div className="text-center text-zinc-600 mt-2">
                If you have any questions, please contact us at{" "}
                <a href="mailto:team@studentize.com" className="font-semibold">
                  team@studentize.com
                </a>
              </div>
            </div>
            <form.Field
              name="name"
              children={(field) => (
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="name" className="px-1">
                    Name & Surname
                  </label>
                  <Input
                    placeholder="Enter here"
                    id="name"
                    name={field.name}
                    value={field.state.value}
                    onChange={(ev) => field.handleChange(ev.target.value)}
                  />
                  {field.state.meta.errors[0]?.message && (
                    <span className="text-red-500 text-sm px-1">
                      {field.state.meta.errors[0].message}
                    </span>
                  )}
                </div>
              )}
            />
            <form.Field
              name="organizationName"
              children={(field) => (
                <div className="flex flex-col gap-2 mt-4">
                  <label htmlFor="organizationName" className="px-1">
                    Organization Name
                  </label>
                  <Input
                    placeholder="Enter here"
                    id="organizationName"
                    name={field.name}
                    value={field.state.value}
                    onChange={(ev) => field.handleChange(ev.target.value)}
                  />
                  {field.state.meta.errors[0]?.message && (
                    <span className="text-red-500 text-sm px-1">
                      {field.state.meta.errors[0].message}
                    </span>
                  )}
                </div>
              )}
            />
          </div>
          <div className="border-zinc-200 border-t p-4 bg-zinc-50">
            <form.Subscribe
              selector={(state) => [state.isSubmitting]}
              children={([isSubmitting]) => (
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isSubmitting}
                >
                  Continue <ArrowRightIcon />
                </Button>
              )}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
