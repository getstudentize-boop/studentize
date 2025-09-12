import {
  studentFormOpts,
  withStudentForm,
} from "@/routes/_authenticated/students/$userId";
import { ActivityCard } from "./activity-card";

export const UserExtracurricularTab = withStudentForm({
  ...studentFormOpts,
  render: ({ form }) => {
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
                {field.state.value.map((_, idx) => (
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
