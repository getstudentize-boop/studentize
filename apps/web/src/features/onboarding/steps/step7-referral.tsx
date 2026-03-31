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
  agreedToTerms: boolean;
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

      <form.Field
        name="agreedToTerms"
        children={(field) => (
          <div className="mt-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-zinc-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-zinc-600">
                Please confirm you have read our{" "}
                <a
                  href="https://www.studentize.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 underline hover:text-purple-700"
                >
                  Privacy Policy
                </a>
                {" & "}
                <a
                  href="https://www.studentize.com/safeguarding-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 underline hover:text-purple-700"
                >
                  Safeguarding Policy
                </a>
                {" and agree to our "}
                <a
                  href="https://www.studentize.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 underline hover:text-purple-700"
                >
                  Terms & Conditions
                </a>
              </span>
            </label>
            {field.state.meta.errors[0] && (
              <span className="text-red-500 text-sm mt-1 block ml-7">
                {field.state.meta.errors[0]}
              </span>
            )}
          </div>
        )}
      />
    </div>
  );
};
