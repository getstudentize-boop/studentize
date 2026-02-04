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

const referralSources = [
  { value: "Google Search", label: "Google Search" },
  { value: "Social Media (Instagram, TikTok, etc.)", label: "Social Media (Instagram, TikTok, etc.)" },
  { value: "Friend/Family", label: "Friend/Family" },
  { value: "School Counselor", label: "School Counselor" },
  { value: "Advertisement", label: "Advertisement" },
  { value: "Event/Webinar", label: "Event/Webinar" },
  { value: "Other", label: "Other" },
];

export const Step7Referral = ({
  form,
}: {
  form: FormApi<FormData, unknown>;
}) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-2 text-purple-600">
        How did you hear about Studentize?
      </h1>
      <p className="text-center text-zinc-600 mb-8">
        We're always looking to improve our reach
      </p>

      <form.Field
        name="referralSource"
        children={(field) => (
          <div>
            <Select
              options={referralSources}
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value)}
              placeholder="Select an option"
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
