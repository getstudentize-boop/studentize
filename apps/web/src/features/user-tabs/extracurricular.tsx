import { Input } from "@/components/input";
import { Select } from "@/components/select";

const activityTypes = [
  { value: "sports-team", label: "Sports Team" },
  { value: "music", label: "Music" },
  { value: "art", label: "Art" },
  { value: "volunteering", label: "Volunteering" },
  { value: "academic-club", label: "Academic Club" },
  { value: "student-government", label: "Student Government" },
  { value: "community-service", label: "Community Service" },
  { value: "debate", label: "Debate" },
  { value: "language-club", label: "Language Club" },
  { value: "science-fair", label: "Science Fair" },
  { value: "drama-theater", label: "Drama/Theater" },
  { value: "coding-technology", label: "Coding/Technology" },
  { value: "environmental-club", label: "Environmental Club" },
  { value: "cultural-club", label: "Cultural Club" },
  { value: "religious-group", label: "Religious Group" },
  { value: "school-publication", label: "School Publication" },
  { value: "internship", label: "Internship" },
  { value: "research", label: "Research" },
  { value: "dance", label: "Dance" },
  { value: "other", label: "Other" },
];

export const UserExtracurricularTab = () => {
  return (
    <div className="p-6">
      <div className="bg-zinc-50/50 border border-bzinc rounded-md">
        <div className="px-4 py-2 border-b border-bzinc">Add new activity</div>

        <div className="px-2.5 py-4 grid-cols-2 grid gap-2">
          <Select
            options={activityTypes}
            placeholder="Select Activity Type"
            label="Activity Type"
          />
          <Input placeholder="Activity Name" label="Activity Name" />
          <Input label="Hours Per Week" type="number" />
          <Input label="Years of Experience" type="number" />
          <div className="col-span-2">
            <div className="px-1 mb-1">Description (Optional)</div>
            <textarea
              className="w-full border border-bzinc rounded-md p-2 h-24 resize-none focus:outline-violet-300 bg-white"
              placeholder="Describe your role, achievements, or other details about this activity"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
