import { studentFormOpts, withStudentForm } from "./form";
import { ActivityCard } from "./activity-card";
import { Loader } from "@/components/loader";
import { Repeat } from "@/components/repeat";

const TabLoader = ({ isError }: { isError: boolean }) => {
  return (
    <div className="rounded-md border border-bzinc">
      <div className="border-b border-bzinc bg-zinc-50/50 p-2">
        <Loader className="w-20" isError={isError} />
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <Repeat
            component={
              <div>
                <Loader className="w-40" isError={isError} />
                <Loader className="h-8 mt-2" isError={isError} />
              </div>
            }
            times={4}
          />
        </div>
        <div className="mt-4">
          <Loader className="w-40" isError={isError} />
          <Loader className="h-20 mt-2" isError={isError} />
        </div>
      </div>
    </div>
  );
};

export const UserExtracurricularTab = withStudentForm({
  ...studentFormOpts,
  props: {
    isLoading: false,
    isError: false,
  },
  render: ({ form, isError, isLoading }) => {
    const isLoadingOrError = isLoading || isError;

    return (
      <div className="p-6 flex flex-col gap-4">
        <form.Field name="extracurricular" mode="array">
          {(field) => {
            return (
              <>
                <ActivityCard
                  state="new"
                  onChange={(value) => field.pushValue(value)}
                />
                {isLoadingOrError ? <TabLoader isError={isError} /> : null}
                {!isLoadingOrError &&
                  field.state.value.map((_, idx) => (
                    <form.Field
                      key={idx}
                      name={`extracurricular[${idx}]`}
                      children={(subField) => (
                        <ActivityCard
                          state="update"
                          defaultValues={subField.state.value}
                          onChange={(value) => subField.handleChange(value)}
                        />
                      )}
                    />
                  ))}
              </>
            );
          }}
        </form.Field>
      </div>
    );
  },
});
