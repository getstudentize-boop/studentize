import { Button } from "@/components/button";
import { Select } from "@/components/select";
import { GraduationCapIcon, HeartIcon } from "@phosphor-icons/react";

const curriculum = [
  {
    icon: "🎓",
    title: "IB",
  },
  {
    icon: "📚",
    title: "A-Levels",
  },
  {
    icon: "🌍",
    title: "MYP",
  },
  {
    icon: "📝",
    title: "GCSE",
  },
  {
    icon: "🇮🇳",
    title: "CBSE",
  },
  {
    icon: "🔬",
    title: "AP",
  },
  {
    icon: "✏️",
    title: "Other",
  },
];

const targetCountries = [
  {
    icon: "🇺🇸",
    title: "United States",
  },
  {
    icon: "🇬🇧",
    title: "United Kingdom",
  },
  {
    icon: "🇨🇦",
    title: "Canada",
  },
  {
    icon: "🇦🇺",
    title: "Australia",
  },
];

const areasOfInterest = [
  {
    icon: "📊",
    title: "Management",
  },
  {
    icon: "⚙️",
    title: "Engineering",
  },
  {
    icon: "💻",
    title: "Computers and Data Science",
  },
  {
    icon: "🎨",
    title: "Design",
  },
  {
    icon: "💰",
    title: "Finance and Banking",
  },
  {
    icon: "⚖️",
    title: "Law",
  },
  {
    icon: "📚",
    title: "Humanities and Social Sciences",
  },
  {
    icon: "🔬",
    title: "Sciences",
  },
  {
    icon: "💊",
    title: "Medicine and Pharma",
  },
  {
    icon: "🎭",
    title: "Performing and Creative Arts",
  },
  {
    icon: "📰",
    title: "Media and Journalism",
  },
  {
    icon: "🏨",
    title: "Hospitality and Tourism",
  },
  {
    icon: "📈",
    title: "Marketing and Advertising",
  },
  {
    icon: "🏃",
    title: "Sports and Nutrition",
  },
  {
    icon: "🏛️",
    title: "Architecture",
  },
];

export const UserProfileTab = () => {
  return (
    <div className="p-6">
      <div className="flex gap-2 font-semibold items-center">
        <GraduationCapIcon size={18} weight="bold" />
        <div>Academic Information</div>
      </div>

      <div className="grid grid-cols-2 mt-5 gap-4">
        <Select
          label="Expected Graduation Year"
          value="2030"
          className="-translate-x-1"
          options={[
            { value: "2027", label: "2027" },
            { value: "2028", label: "2028" },
            { value: "2029", label: "2029" },
            { value: "2030", label: "2030" },
            { value: "2031", label: "2031" },
            { value: "2032", label: "2032" },
            { value: "2033", label: "2033" },
          ]}
        />
        <div />
        <div>
          <div className="mb-2">Study Curriculum</div>
          <div className="space-x-2 space-y-2 -translate-x-1">
            {curriculum.map((item) => (
              <Button
                key={item.title}
                className="inline-block"
                variant="neutral"
              >
                {item.icon} {item.title}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2">Target Countries</div>
          <div className="space-x-2 space-y-2 -translate-x-1">
            {targetCountries.map((item) => (
              <Button
                key={item.title}
                className="inline-block"
                variant="neutral"
              >
                {item.icon} {item.title}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 font-semibold items-center mt-4">
        <HeartIcon size={18} weight="bold" />
        <div>Areas of Interest</div>
      </div>
      <div className="mt-3 mb-2">Select your areas of interest</div>
      <div className="space-x-2 space-y-2 -translate-x-1">
        {areasOfInterest.map((item) => (
          <Button key={item.title} className="inline-block" variant="neutral">
            {item.icon} {item.title}
          </Button>
        ))}
      </div>
    </div>
  );
};
