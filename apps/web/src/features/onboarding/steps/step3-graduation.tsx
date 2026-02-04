import { Select } from "@/components/select";
import { FormApi } from "@tanstack/react-form";

type FormData = {
  email: string;
  phone: string;
  location: string;
  expectedGraduationYear: string;
  targetCountries: string[];
  areasOfInterest: string[];
  supportAreas: string[];
  referralSource: string;
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => {
  const year = currentYear + i;
  return { value: year.toString(), label: year.toString() };
});

export const Step3Graduation = ({
  form,
}: {
  form: FormApi<FormData, unknown>;
}) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-2 text-purple-600">
        When do you graduate high school?
      </h1>
      <p className="text-center text-zinc-600 mb-8">
        We'll create a timeline that works for your academic journey
      </p>

      <form.Field
        name="expectedGraduationYear"
        children={(field) => (
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              When do you graduate high school?
            </label>
            <Select
              options={years}
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value)}
              placeholder="Select year"
            />
            {field.state.meta.errors[0] && (
              <span className="text-red-500 text-sm mt-1">
                {field.state.meta.errors[0]}
              </span>
            )}
          </div>
        )}
      />
    </div>
  );
};
