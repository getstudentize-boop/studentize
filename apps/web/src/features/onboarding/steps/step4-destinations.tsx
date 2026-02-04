import { FormApi } from "@tanstack/react-form";
import { cn } from "@/utils/cn";

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

const destinations = [
  { value: "United States", label: "United States", icon: "🇺🇸" },
  { value: "United Kingdom", label: "United Kingdom", icon: "🇬🇧" },
  { value: "Canada", label: "Canada", icon: "🇨🇦" },
  { value: "Australia", label: "Australia", icon: "🇦🇺" },
  { value: "European Union", label: "European Union", icon: "🇪🇺" },
  { value: "Other", label: "Other", icon: "🌍" },
];

export const Step4Destinations = ({
  form,
}: {
  form: FormApi<FormData, unknown>;
}) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-2">
        <span className="text-blue-600">Desired University</span>{" "}
        <span className="text-purple-600">Country Destination</span>
      </h1>
      <p className="text-center text-zinc-600 mb-8">
        Where would you like to study?
      </p>

      <form.Field
        name="targetCountries"
        children={(field) => (
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-4">
              Desired University Country Destination
            </label>
            <div className="space-y-2">
              {destinations.map((destination) => {
                const isSelected = field.state.value.includes(
                  destination.value
                );
                return (
                  <label
                    key={destination.value}
                    className={cn(
                      "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all",
                      isSelected
                        ? "border-purple-500 bg-purple-50"
                        : "border-zinc-200 hover:border-zinc-300"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          field.handleChange([
                            ...field.state.value,
                            destination.value,
                          ]);
                        } else {
                          field.handleChange(
                            field.state.value.filter(
                              (v) => v !== destination.value
                            )
                          );
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-zinc-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-2xl">{destination.icon}</span>
                    <span className="text-sm font-medium">{destination.label}</span>
                  </label>
                );
              })}
            </div>
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
