import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { cn } from "@/utils/cn";
import { ArrowDownIcon, PlusIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import z from "zod";

const activityTypes = [
  { value: "sports-team", label: "Sports Team" },
  { value: "music", label: "Music" },
  { value: "art", label: "Art" },
  { value: "volunteering", label: "Volunteering" },
  { value: "academic-club", label: "Academic Club" },
  { value: "student-government", label: "Student Government" },
  { value: "community-service", label: "Community Service" },
  { value: "debate", label: "Debate" },
  { value: "language-club", label: "Language Club" },
  { value: "science-fair", label: "Science Fair" },
  { value: "drama-theater", label: "Drama/Theater" },
  { value: "coding-technology", label: "Coding/Technology" },
  { value: "environmental-club", label: "Environmental Club" },
  { value: "cultural-club", label: "Cultural Club" },
  { value: "religious-group", label: "Religious Group" },
  { value: "school-publication", label: "School Publication" },
  { value: "internship", label: "Internship" },
  { value: "research", label: "Research" },
  { value: "dance", label: "Dance" },
  { value: "other", label: "Other" },
];

type Activity = {
  type: string;
  name: string;
  hoursPerWeek: number;
  yearsOfExperience: number;
  description?: string;
};

export const ActivityCard = ({
  state,
  onChange,
  defaultValues,
}: {
  state: "new" | "update";
  defaultValues?: Activity;
  onChange: (value: Activity) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    defaultValues: defaultValues ?? {
      type: "",
      name: "",
      hoursPerWeek: null as number | null,
      yearsOfExperience: null as number | null,
      description: "",
    },
    onSubmit: (vals) => {
      onChange({
        ...vals.value,
        hoursPerWeek: vals.value.hoursPerWeek ?? 0,
        yearsOfExperience: vals.value.yearsOfExperience ?? 0,
      });
    },
    validators: {
      onChange: ({ value }) => {
        const schema = z.object({
          type: z.string().min(1, "Activity type is required"),
          name: z.string().min(1, "Activity name is required"),
          hoursPerWeek: z.number().min(1, "Hours per week must be at least 1"),
          yearsOfExperience: z.number(),
          description: z.string().optional(),
        });

        if (schema.safeParse(value).success) {
          if (state === "update") {
            onChange(value);
          }
        } else {
          return "Invalid data";
        }
      },
    },
  });

  return (
    <form
      className={cn("bg-zinc-50/50 border border-bzinc rounded-md shadow-xs", {
        "bg-white": state === "update",
      })}
      onSubmit={async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();

        await form.handleSubmit();
        form.reset();
        setIsOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => state === "new" && setIsOpen((v) => !v)}
        className={cn("px-4 py-2 flex w-full justify-between", {
          "bg-zinc-50/50": state === "update",
          "border-b border-bzinc": isOpen || state === "update",
        })}
      >
        {state === "new" ? (
          <>
            Add new activity
            <div className="flex gap-2 items-center">
              <ArrowDownIcon
                className={cn(
                  "transition-transform",
                  isOpen ? "rotate-180" : "rotate-"
                )}
              />
              <form.Subscribe
                selector={(vals) => [vals.isFormValid && vals.isDirty]}
                children={([isFormValid]) => (
                  <button type="submit" disabled={!isFormValid}>
                    <PlusIcon weight={isFormValid ? "bold" : "thin"} />
                  </button>
                )}
              />
            </div>
          </>
        ) : (
          <button className="font-semibold text-rose-600">Remove</button>
        )}
      </button>

      {isOpen || state === "update" ? (
        <div className="px-3.5 py-4 grid-cols-2 grid gap-2">
          <form.Field
            name="type"
            children={(field) => (
              <Select
                options={activityTypes}
                placeholder="Select Type"
                label="Type"
                value={field.state.value}
                onValueChange={(val) => field.handleChange(val)}
              />
            )}
          />

          <form.Field
            name="name"
            children={(field) => (
              <Input
                placeholder="Name"
                label="Name"
                value={field.state.value}
                onChange={(val) => field.handleChange(val.target.value)}
              />
            )}
          />

          <form.Field
            name="hoursPerWeek"
            children={(field) => (
              <Input
                type="number"
                placeholder="Hours Per Week"
                label="Hours Per Week"
                value={field.state.value}
                onChange={(val) => field.handleChange(+val.target.value)}
              />
            )}
          />

          <form.Field
            name="yearsOfExperience"
            children={(field) => (
              <Input
                type="number"
                placeholder="Years of Experience"
                label="Years of Experience"
                value={field.state.value}
                onChange={(val) => field.handleChange(+val.target.value)}
              />
            )}
          />

          <div className="col-span-2">
            <div className="px-1 mb-1">Description (Optional)</div>
            <form.Field
              name="description"
              children={(field) => (
                <textarea
                  className="w-full border border-bzinc rounded-md p-2.5 h-24 resize-none focus:outline-[#BCFAF9] bg-white"
                  placeholder="Describe your role, achievements, or other details about this activity"
                  onChange={(val) => field.handleChange(val.target.value)}
                  value={field.state.value}
                />
              )}
            />
          </div>
        </div>
      ) : null}
    </form>
  );
};
