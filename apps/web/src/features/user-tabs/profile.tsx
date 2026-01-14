import { Button } from "@/components/button";
import { Loader } from "@/components/loader";
import { Repeat } from "@/components/repeat";
import { Select } from "@/components/select";
import { studentFormOpts, withStudentForm } from "./form";
import { GraduationCapIcon, HeartIcon } from "@phosphor-icons/react";

const curriculum = [
  {
    icon: "🎓",
    title: "IB",
  },
  {
    icon: "📚",
    title: "A-Levels",
  },
  {
    icon: "🌍",
    title: "MYP",
  },
  {
    icon: "📝",
    title: "GCSE",
  },
  {
    icon: "🇮🇳",
    title: "CBSE",
  },
  {
    icon: "🔬",
    title: "AP",
  },
  {
    icon: "✏️",
    title: "Other",
  },
];

const targetCountries = [
  {
    icon: "🇺🇸",
    title: "United States",
  },
  {
    icon: "🇬🇧",
    title: "United Kingdom",
  },
  {
    icon: "🇨🇦",
    title: "Canada",
  },
  {
    icon: "🇦🇺",
    title: "Australia",
  },
];

const areasOfInterest = [
  {
    icon: "📊",
    title: "Management",
  },
  {
    icon: "⚙️",
    title: "Engineering",
  },
  {
    icon: "💻",
    title: "Computers and Data Science",
  },
  {
    icon: "🎨",
    title: "Design",
  },
  {
    icon: "💰",
    title: "Finance and Banking",
  },
  {
    icon: "⚖️",
    title: "Law",
  },
  {
    icon: "📚",
    title: "Humanities and Social Sciences",
  },
  {
    icon: "🔬",
    title: "Sciences",
  },
  {
    icon: "💊",
    title: "Medicine and Pharma",
  },
  {
    icon: "🎭",
    title: "Performing and Creative Arts",
  },
  {
    icon: "📰",
    title: "Media and Journalism",
  },
  {
    icon: "🏨",
    title: "Hospitality and Tourism",
  },
  {
    icon: "📈",
    title: "Marketing and Advertising",
  },
  {
    icon: "🏃",
    title: "Sports and Nutrition",
  },
  {
    icon: "🏛️",
    title: "Architecture",
  },
];

const StudyCurriculum = ({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (value: string) => void;
}) => {
  return (
    <div className="space-x-2 space-y-2 -translate-x-1">
      {curriculum.map((item) => (
        <Button
          key={item.title}
          className="inline-block"
          variant={item.title === selected ? "primaryLight" : "neutral"}
          onClick={() => onSelect(item.title)}
        >
          {item.icon} {item.title}
        </Button>
      ))}
    </div>
  );
};

const MultiSelect = ({
  values,
  onChange,
  fields,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  fields: Array<{ title: string; icon: string }>;
}) => {
  return (
    <div className="space-x-2 space-y-2 -translate-x-1">
      {fields.map((item) => (
        <Button
          key={item.title}
          className="inline-block"
          variant={values.includes(item.title) ? "primaryLight" : "neutral"}
          onClick={() => {
            if (values.includes(item.title)) {
              onChange(values.filter((v) => v !== item.title));
            } else {
              onChange([...values, item.title]);
            }
          }}
        >
          {item.icon} {item.title}
        </Button>
      ))}
    </div>
  );
};

const ProfileLoader = ({ isError }: { isError: boolean }) => {
  return (
    <div className="space-y-2 p-6">
      <Loader className="w-40 mb-2" isError={isError} />
      <Loader className="w-40 mb-2 mt-4" isError={isError} />

      <Loader className="w-60 h-8 mb-2" isError={isError} />

      <div className="flex gap-2 mt-4">
        <Repeat
          component={
            <div className="flex-1">
              <Loader className="w-36" isError={isError} />
              <div className="mt-2">
                <Repeat
                  component={
                    <>
                      <Loader
                        className="w-16 h-8 rounded-full inline-block mr-2"
                        isError={isError}
                      />
                      <Loader
                        className="w-20 h-8 rounded-full inline-block mr-2"
                        isError={isError}
                      />
                    </>
                  }
                  times={2}
                />
              </div>
            </div>
          }
          times={2}
        />
      </div>
    </div>
  );
};

export const UserProfileTab = withStudentForm({
  ...studentFormOpts,
  props: {
    isLoading: false,
    isError: false,
    isDisabled: false,
  },
  render: ({ form, isLoading, isError, isDisabled }) => {
    const isLoadingOrError = isLoading || isError;

    if (isLoadingOrError) {
      return <ProfileLoader isError={isError} />;
    }

    return (
      <div className="p-6">
        <div className="mb-4">
          <form.Field
            name="status"
            children={(field) => (
              <Select
                label="Status"
                value={(field.state.value ?? "ACTIVE").toLowerCase()}
                onValueChange={(val) =>
                  !isDisabled &&
                  field.handleChange(val.toUpperCase() as "ACTIVE" | "INACTIVE")
                }
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            )}
          />
        </div>

        <div className="flex gap-2 font-semibold items-center">
          <GraduationCapIcon size={18} weight="bold" />
          <div>Academic Information</div>
        </div>

        <div className="grid grid-cols-2 mt-5 gap-4">
          <form.Field
            name="expectedGraduationYear"
            children={(field) => (
              <Select
                label="Expected Graduation Year"
                className="-translate-x-1"
                value={field.state.value}
                onValueChange={(val) => !isDisabled && field.handleChange(val)}
                options={[
                  { value: "2027", label: "2027" },
                  { value: "2028", label: "2028" },
                  { value: "2029", label: "2029" },
                  { value: "2030", label: "2030" },
                  { value: "2031", label: "2031" },
                  { value: "2032", label: "2032" },
                  { value: "2033", label: "2033" },
                ]}
              />
            )}
          />
          <div />
          <div>
            <div className="mb-2">Study Curriculum</div>
            <form.Field
              name="curriculum"
              children={() => (
                <StudyCurriculum
                  selected={form.state.values.curriculum}
                  onSelect={(val) => form.setFieldValue("curriculum", val)}
                />
              )}
            />
          </div>
          <div>
            <div className="mb-2">Target Countries</div>
            <form.Field
              name="targetCountries"
              children={(field) => (
                <MultiSelect
                  values={field.state.value}
                  onChange={(val) => !isDisabled && field.handleChange(val)}
                  fields={targetCountries}
                />
              )}
            />
          </div>
        </div>

        <div className="flex gap-2 font-semibold items-center mt-4">
          <HeartIcon size={18} weight="bold" />
          <div>Areas of Interest</div>
        </div>
        <div className="mt-3 mb-2">Select your areas of interest</div>
        <form.Field
          name="areasOfInterest"
          children={(field) => (
            <MultiSelect
              values={field.state.value}
              onChange={(val) => !isDisabled && field.handleChange(val)}
              fields={areasOfInterest}
            />
          )}
        />
      </div>
    );
  },
});
