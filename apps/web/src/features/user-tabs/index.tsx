import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { Input } from "@/components/input";
import { UserExtracurricularTab } from "@/features/user-tabs/extracurricular";
import { UserProfileTab } from "@/features/user-tabs/profile";
import { UserSessionsTab } from "@/features/user-tabs/sessions";
import { cn } from "@/utils/cn";
import { ArrowLeftIcon, FloppyDiskIcon, GearIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import Avvvatars from "avvvatars-react";
import { orpc } from "orpc/client";
import { useState } from "react";

import { studentFormOpts, useAppForm } from "./form";

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

export const UserOverviewTab = ({
  studentUserId,
  currentTab,
  className,
  isHeaderFixedHeightDisabled,
  goBack,
  isSettingsDisabled,
  search,
}: {
  studentUserId: string;
  currentTab: "profile" | "extracurricular" | "sessions";
  className?: string;
  isHeaderFixedHeightDisabled?: boolean;
  isSettingsDisabled?: boolean;
  goBack?: string;
  search?: Record<string, any>;
}) => {
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);

  const utils = useQueryClient();

  const studentQuery = useQuery(
    orpc.student.getOne.queryOptions({ input: { userId: studentUserId } })
  );

  const isLoading = studentQuery.isLoading;

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
      status: (student?.status ?? "ACTIVE") as "ACTIVE" | "INACTIVE",
      extracurricular: student?.extracurricular ?? [],
    },
    onSubmit: async (vals) => {
      await updateStudentMutation.mutateAsync({
        ...vals.value,
        studyCurriculum: vals.value.curriculum,
        status: vals.value.status,
        studentUserId,
      });

      await utils.invalidateQueries({
        queryKey: orpc.student.getOne.key({ input: { userId: studentUserId } }),
      });
    },
  });

  return (
    <div
      className={cn(
        "w-[35rem] bg-white border-l border-bzinc flex flex-col text-left",
        className
      )}
    >
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="flex p-4 gap-4">
          <Avvvatars value="student name" size={50} style="shape" />
          <div className="flex-1">
            <div className="font-semibold">{student?.name}</div>
            <div className="flex mt-2 gap-8">
              <div>
                <div>Location</div>
                <div className="font-semibold">
                  {student?.location ?? "n/a"}
                </div>
              </div>
            </div>
          </div>
          <div>
            {!isSettingsDisabled ? (
              <div className="flex gap-4 items-center">
                <StudentSettingsDialog
                  email=""
                  location={student?.location ?? ""}
                  userId={studentUserId}
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
                        className="rounded-lg"
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
            ) : null}
          </div>
        </div>
        <div className="pt-2.5 flex px-5 border-b border-bzinc sticky top-0 bg-white">
          <Link
            to="."
            search={{ tab: "profile", ...search }}
            className={cn(
              "border-b-2 transition-colors pb-1 px-4",
              currentTab === "profile" ? "border-violet-950" : "border-white"
            )}
          >
            Profile
          </Link>
          <Link
            to="."
            search={{ tab: "extracurricular", ...search }}
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
            search={{ tab: "sessions", ...search }}
            className={cn(
              "border-b-2 transition-colors pb-1 px-4",
              currentTab === "sessions" ? "border-violet-950" : "border-white"
            )}
          >
            Sessions
          </Link>
        </div>
        {currentTab === "profile" ? (
          <UserProfileTab
            isLoading={isLoading}
            isError={studentQuery.isError}
            isDisabled={!!isSettingsDisabled}
            form={form}
          />
        ) : null}
        {currentTab === "extracurricular" ? (
          <UserExtracurricularTab
            isError={studentQuery.isError}
            isLoading={isLoading}
            isDisabled={!!isSettingsDisabled}
            form={form}
          />
        ) : null}
        {currentTab === "sessions" ? (
          <UserSessionsTab studentUserId={studentUserId} />
        ) : null}
      </div>
    </div>
  );
};
