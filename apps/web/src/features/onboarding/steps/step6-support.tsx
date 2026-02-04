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

const supportAreas = [
  {
    value: "Profile Understanding & Aptitude Testing",
    label: "Profile Understanding & Aptitude Testing",
  },
  { value: "Profile Building", label: "Profile Building" },
  { value: "Course Selection", label: "Course Selection" },
  { value: "Application Writing", label: "Application Writing" },
  { value: "University Selection", label: "University Selection" },
  { value: "Post-Application Support", label: "Post-Application Support" },
];

export const Step6Support = ({
  form,
}: {
  form: FormApi<FormData, unknown>;
}) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-2 text-purple-600">
        What areas do you need support in?
      </h1>
      <p className="text-center text-zinc-600 mb-8">Select all that apply</p>

      <form.Field
        name="supportAreas"
        children={(field) => (
          <div>
            <div className="space-y-2">
              {supportAreas.map((area) => {
                const isSelected = field.state.value.includes(area.value);
                return (
                  <label
                    key={area.value}
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
                          field.handleChange([...field.state.value, area.value]);
                        } else {
                          field.handleChange(
                            field.state.value.filter((v) => v !== area.value)
                          );
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-zinc-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium">{area.label}</span>
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
