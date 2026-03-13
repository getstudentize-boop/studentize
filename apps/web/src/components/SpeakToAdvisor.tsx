import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { ChatCircle, XIcon } from "@phosphor-icons/react";
import { z } from "zod";

import { Popover } from "@/components/popover";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { orpc } from "orpc/client";
import { useState } from "react";
import { cn } from "@/utils/cn";

export const SpeakToAdvisor = () => {
  const [isOpen, setIsOpen] = useState(false);

  const submitMutation = useMutation(
    orpc.consultationRequest.submit.mutationOptions({
      onSuccess: () => {
        form.reset();
        setIsOpen(false);
      },
    })
  );

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },
    validators: {
      onSubmit: z.object({
        fullName: z.string().min(1, "Full name is required"),
        email: z.email("Invalid email address"),
        phone: z.string().min(1, "Phone number is required"),
      }),
    },
    onSubmit: (vals) =>
      submitMutation.mutateAsync({
        fullName: vals.value.fullName,
        email: vals.value.email,
        phone: vals.value.phone,
      }),
  });

  return (
    <Popover
      trigger={
        <button
          type="button"
          aria-label="Speak to a Virtual Advisor"
          className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-cyan-600 text-white shadow-lg transition-colors hover:bg-cyan-500"
        >
          <ChatCircle className="size-4" weight="fill" />
        </button>
      }
      open={isOpen}
      onOpenChange={setIsOpen}
      side="top"
      align="end"
      className="w-96 max-w-[calc(100vw-2rem)] overflow-hidden p-0"
    >
      <div className="relative flex flex-col">
        <div className="bg-gradient-to-br from-violet-600 to-violet-800 px-6 pt-6 pb-8 text-center">
          <div className="flex items-center justify-between">
            <div className="flex size-12 items-center justify-center rounded-full bg-white/10">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setIsOpen(false)}
              className="flex size-8 items-center justify-center rounded-full border-2 border-white/60 text-white transition-colors hover:bg-white/20"
            >
              <XIcon className="size-4" weight="bold" />
            </button>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-white">
            Welcome to Studentize! 👋
          </h2>
          <p className="mt-2 text-sm text-violet-100">
            Let&apos;s get started with your university journey
          </p>
        </div>

        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            form.handleSubmit(ev);
          }}
          className="flex flex-col gap-4 p-4"
        >
          <form.Field
            name="fullName"
            children={(field) => (
              <div className="space-y-1">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium text-zinc-700"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Enter your full name"
                  value={field.state.value}
                  onChange={(ev) => field.handleChange(ev.target.value)}
                  className={cn(
                    field.state.meta.errors?.[0] &&
                      "border-red-500 focus:ring-red-500"
                  )}
                />
                {field.state.meta.errors?.[0] && (
                  <p className="text-xs text-red-500">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          />
          <form.Field
            name="email"
            children={(field) => (
              <div className="space-y-1">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium text-zinc-700"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="your.email@example.com"
                  value={field.state.value}
                  onChange={(ev) => field.handleChange(ev.target.value)}
                  className={cn(
                    field.state.meta.errors?.[0] &&
                      "border-red-500 focus:ring-red-500"
                  )}
                />
                {field.state.meta.errors?.[0] && (
                  <p className="text-xs text-red-500">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          />
          <form.Field
            name="phone"
            children={(field) => (
              <div className="space-y-1">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium text-zinc-700"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={field.state.value}
                  onChange={(ev) => field.handleChange(ev.target.value)}
                  className={cn(
                    field.state.meta.errors?.[0] &&
                      "border-red-500 focus:ring-red-500"
                  )}
                />
                {field.state.meta.errors?.[0] && (
                  <p className="text-xs text-red-500">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          />

          <form.Subscribe
            selector={(state) => [state.isSubmitting]}
            children={([isSubmitting]) => (
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="w-full bg-gradient-to-r from-violet-600 to-violet-700 text-white hover:from-violet-700 hover:to-violet-800 focus:ring-violet-500"
              >
                <ChatCircle className="size-5" weight="fill" />
                Start Chat with Expert →
              </Button>
            )}
          />

          <p className="text-center text-xs text-zinc-500">
            Your information is secure and will only be used to provide
            personalized guidance.
          </p>
        </form>
      </div>
    </Popover>
  );
};
