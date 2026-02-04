import { Input } from "@/components/input";
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

export const Step1Contact = ({
  form,
}: {
  form: FormApi<FormData, unknown>;
}) => {
  return (
    <div>
      <h1 className="font-bold text-center mb-2">Your Contact Information</h1>
      <p className="text-center text-zinc-600 mb-8">
        How can we reach you regarding your university journey?
      </p>

      <div className="space-y-4">
        <form.Field
          name="email"
          children={(field) => (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Your Email Address
              </label>
              <Input
                type="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="example@email.com"
                disabled
                className="bg-zinc-50"
              />
            </div>
          )}
        />

        <form.Field
          name="phone"
          children={(field) => (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Your Phone Number
              </label>
              <Input
                type="tel"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="+1 (555) 555-5555"
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
    </div>
  );
};
