import { Select } from "@/components/select";
import { FormApi } from "@tanstack/react-form";
import isoCountries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

isoCountries.registerLocale(enLocale);

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

const PINNED_CODES = new Set(["US", "GB"]);

const countries = (() => {
  const names = isoCountries.getNames("en");
  const rest = Object.entries(names)
    .filter(([code]) => !PINNED_CODES.has(code))
    .map(([, name]) => ({ value: name, label: name }))
    .sort((a, b) => a.label.localeCompare(b.label, "en"));

  return [
    { value: "United States", label: "United States" },
    { value: "United Kingdom", label: "United Kingdom" },
    ...rest,
    { value: "Other", label: "Other" },
  ];
})();

export const Step2Country = ({
  form,
}: {
  form: FormApi<FormData, unknown>;
}) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-2 text-purple-600">
        Which country are you in?
      </h1>
      <p className="text-center text-zinc-600 mb-8">
        This helps us personalize our recommendations
      </p>

      <form.Field
        name="location"
        children={(field) => (
          <div>
            <Select
              options={countries}
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value)}
              placeholder="Select your country"
              contentClassName="max-h-96"
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
