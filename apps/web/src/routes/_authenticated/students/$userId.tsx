import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { Input } from "@/components/input";
import { UserExtracurricularTab } from "@/features/user-tabs/extracurricular";
import { UserProfileTab } from "@/features/user-tabs/profile";
import { UserSessionsTab } from "@/features/user-tabs/sessions";
import { cn } from "@/utils/cn";
import { ArrowLeftIcon, FloppyDiskIcon, GearIcon } from "@phosphor-icons/react";
import {
  createFormHook,
  createFormHookContexts,
  formOptions,
  useForm,
} from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import Avvvatars from "avvvatars-react";
import { orpc } from "orpc/client";
import { useState } from "react";
import z from "zod";

const { fieldContext, formContext } = createFormHookContexts();

const { useAppForm, withForm } = createFormHook({
  formComponents: {},
  fieldComponents: {},
  fieldContext,
  formContext,
});

export const withStudentForm = withForm;

export const studentFormOpts = formOptions({
  defaultValues: {
    curriculum: "",
    targetCountries: [] as string[],
    areasOfInterest: [] as string[],
    expectedGraduationYear: "",
    extracurricular: [] as Array<{
      type: string;
      name: string;
      hoursPerWeek: number;
      yearsOfExperience: number;
      description?: string;
    }>,
  },
});

const StudentSettingsDialog = ({
  location,
  email,
  userId,
  isOpen,
  onOpenChange,
}: {
  location: string;
  email: string;
  userId: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const utils = useQueryClient();

  const updateStudentMutation = useMutation(
    orpc.student.updateSettings.mutationOptions({
      onSuccess: async () => {
        await utils.invalidateQueries({
          queryKey: orpc.student.getOne.key({ input: { userId } }),
        });

        onOpenChange?.(false);
      },
    })
  );

  const form = useForm({
    defaultState: {
      values: {
        location,
        email,
      },
    },
    onSubmit: (field) => {
      updateStudentMutation.mutate({
        location: field.value.location,
        email: field.value.email,
        userId,
      });
    },
  });

  return (
    <Dialog
      trigger={
        <button>
          <GearIcon className="size-4" />
        </button>
      }
      className="p-0 max-w-sm"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <div className="px-4 py-2.5 border-b border-bzinc">Student settings</div>
      <div className="p-4 flex flex-col gap-4">
        <form.Field
          name="location"
          children={(field) => (
            <Input
              label="Location"
              placeholder="South Africa"
              value={field.state.value}
              onChange={(ev) => field.handleChange(ev.target.value)}
            />
          )}
        />
        <form.Field
          name="email"
          children={(field) => (
            <Input
              label="Email"
              placeholder="student@example.com"
              value={field.state.value}
              onChange={(ev) => field.handleChange(ev.target.value)}
            />
          )}
        />

        <Button
          className="rounded-md"
          isLoading={updateStudentMutation.isPending}
          onClick={() => form.handleSubmit()}
        >
          Update <FloppyDiskIcon />
        </Button>
      </div>
    </Dialog>
  );
};

export const Route = createFileRoute("/_authenticated/students/$userId")({
  component: RouteComponent,
  validateSearch: (search) =>
    z
      .object({
        tab: z
          .enum(["profile", "extracurricular", "sessions"])
          .default("profile")
          .optional(),
      })
      .parse(search),
});

function RouteComponent() {
  const params = Route.useParams();

  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);

  const utils = useQueryClient();

  const studentQuery = useQuery(
    orpc.student.getOne.queryOptions({ input: { userId: params.userId } })
  );

  const updateStudentMutation = useMutation(
    orpc.student.update.mutationOptions()
  );

  const student = studentQuery.data;

  const form = useAppForm({
    ...studentFormOpts,
    defaultValues: {
      curriculum: student?.studyCurriculum ?? "",
      targetCountries: student?.targetCountries ?? [],
      areasOfInterest: student?.areasOfInterest ?? [],
      expectedGraduationYear: student?.expectedGraduationYear ?? "",
      extracurricular: student?.extracurricular ?? [],
    },
    onSubmit: async (vals) => {
      await updateStudentMutation.mutateAsync({
        ...vals.value,
        studyCurriculum: vals.value.curriculum,
        studentUserId: params.userId,
      });

      await utils.invalidateQueries({
        queryKey: orpc.student.getOne.key({ input: { userId: params.userId } }),
      });
    },
  });

  const search = Route.useSearch();

  const currentTab = search.tab ?? "profile";

  return (
    <div className="w-[35rem] bg-white border-l border-bzinc flex flex-col text-left">
      <div className="border-b h-14 mt-2 px-4 border-bzinc flex justify-between items-center">
        <Link to="/students">
          <ArrowLeftIcon />
        </Link>

        <div className="flex gap-4 items-center">
          <StudentSettingsDialog
            email={student?.email ?? ""}
            location={student?.location ?? ""}
            userId={params.userId}
            isOpen={isUserSettingsOpen}
            onOpenChange={setIsUserSettingsOpen}
          />
          <form.Subscribe
            selector={(val) => [val.isDirty, val.isSubmitting]}
            children={([isDirty, isSubmitting]) =>
              isDirty ? (
                <Button
                  variant="primary"
                  isLoading={isSubmitting}
                  onClick={async () => {
                    await form.handleSubmit();
                    form.reset();
                  }}
                >
                  <FloppyDiskIcon /> Save
                </Button>
              ) : null
            }
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="flex p-4 gap-4">
          <Avvvatars value="student name" size={50} style="shape" />
          <div className="flex-1">
            <div className="font-semibold">{student?.name}</div>
            <div className="flex mt-2 gap-8">
              <div>
                <div>Location</div>
                <div className="font-semibold">South Africa</div>
              </div>
              <div>
                <div>Email</div>
                <div className="font-semibold">{student?.email}</div>
              </div>
              <div>
                <div>Sessions</div>
                <div className="font-semibold">5</div>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-2.5 flex px-5 border-b border-bzinc sticky top-0 bg-white">
          <Link
            to="."
            search={{ tab: "profile" }}
            className={cn(
              "border-b-2 transition-colors pb-1 px-4",
              currentTab === "profile" ? "border-violet-950" : "border-white"
            )}
          >
            Profile
          </Link>
          <Link
            to="."
            search={{ tab: "extracurricular" }}
            className={cn(
              "border-b-2 transition-colors pb-1 px-4",
              currentTab === "extracurricular"
                ? "border-violet-950"
                : "border-white"
            )}
          >
            Extracurricular
          </Link>
          <Link
            to="."
            search={{ tab: "sessions" }}
            className={cn(
              "border-b-2 transition-colors pb-1 px-4",
              currentTab === "sessions" ? "border-violet-950" : "border-white"
            )}
          >
            Sessions
          </Link>
        </div>
        {currentTab === "profile" ? <UserProfileTab form={form} /> : null}
        {currentTab === "extracurricular" ? (
          <UserExtracurricularTab form={form} />
        ) : null}
        {currentTab === "sessions" ? (
          <UserSessionsTab studentUserId={params.userId} />
        ) : null}
      </div>
    </div>
  );
}
