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

const areasOfInterest = [
  { value: "Management", label: "Management", icon: "📊" },
  { value: "Engineering", label: "Engineering", icon: "⚙️" },
  { value: "Computers and Data Science", label: "Computers and Data Science", icon: "💻" },
  { value: "Design", label: "Design", icon: "🎨" },
  { value: "Finance and Banking", label: "Finance and Banking", icon: "💰" },
  { value: "Law", label: "Law", icon: "⚖️" },
  { value: "Humanities and Social Sciences", label: "Humanities and Social Sciences", icon: "📚" },
  { value: "Sciences", label: "Sciences", icon: "🔬" },
  { value: "Medicine and Pharma", label: "Medicine and Pharma", icon: "💊" },
  { value: "Performing and Creative Arts", label: "Performing and Creative Arts", icon: "🎭" },
  { value: "Media and Journalism", label: "Media and Journalism", icon: "📰" },
  { value: "Hospitality and Tourism", label: "Hospitality and Tourism", icon: "🏨" },
  { value: "Marketing and Advertising", label: "Marketing and Advertising", icon: "📈" },
  { value: "Sports and Nutrition", label: "Sports and Nutrition", icon: "🏃" },
  { value: "Architecture", label: "Architecture", icon: "🏛️" },
];

export const Step5Interests = ({
  form,
}: {
  form: FormApi<FormData, unknown>;
}) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-2 text-purple-600">
        Areas of Interest
      </h1>
      <p className="text-center text-zinc-600 mb-8">
        Select all areas that interest you academically
      </p>

      <form.Field
        name="areasOfInterest"
        children={(field) => (
          <div>
            <div className="grid grid-cols-3 gap-3">
              {areasOfInterest.map((area) => {
                const isSelected = field.state.value.includes(area.value);
                return (
                  <label
                    key={area.value}
                    className={cn(
                      "flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all text-sm",
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
                    <span>{area.icon}</span>
                    <span className="font-medium">{area.label}</span>
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
