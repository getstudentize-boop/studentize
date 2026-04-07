import { useState } from "react";
import { PlusIcon, XIcon, BookOpenIcon, TrophyIcon } from "@phosphor-icons/react";
import { WizardData } from "./types";

interface StepInterestsProps {
  data: WizardData;
  onChange: (data: Partial<WizardData>) => void;
}

const POPULAR_MAJORS = [
  "Computer Science",
  "Business/Economics",
  "Engineering",
  "Medicine/Pre-Med",
  "Law/Pre-Law",
  "Psychology",
  "Biology",
  "Mathematics",
  "English/Literature",
  "Political Science",
  "Chemistry",
  "Physics",
  "Art/Design",
  "Communications",
  "Finance",
];

const POPULAR_EXTRACURRICULARS = [
  "Debate/Model UN",
  "Sports Team",
  "Music/Band",
  "Student Government",
  "Volunteering",
  "Research",
  "Robotics/STEM Club",
  "Theatre/Drama",
  "Newspaper/Journalism",
  "Tutoring/Mentoring",
  "Art Club",
  "Environmental Club",
  "Entrepreneurship",
  "Community Service",
];

export function StepInterests({ data, onChange }: StepInterestsProps) {
  const [customMajor, setCustomMajor] = useState("");
  const [customActivity, setCustomActivity] = useState("");

  const toggleMajor = (major: string) => {
    const current = data.intendedMajors;
    if (current.includes(major)) {
      onChange({ intendedMajors: current.filter((m) => m !== major) });
    } else {
      onChange({ intendedMajors: [...current, major] });
    }
  };

  const addCustomMajor = () => {
    if (customMajor.trim() && !data.intendedMajors.includes(customMajor.trim())) {
      onChange({ intendedMajors: [...data.intendedMajors, customMajor.trim()] });
      setCustomMajor("");
    }
  };

  const toggleActivity = (activity: string) => {
    const current = data.extracurriculars;
    if (current.includes(activity)) {
      onChange({ extracurriculars: current.filter((a) => a !== activity) });
    } else {
      onChange({ extracurriculars: [...current, activity] });
    }
  };

  const addCustomActivity = () => {
    if (customActivity.trim() && !data.extracurriculars.includes(customActivity.trim())) {
      onChange({ extracurriculars: [...data.extracurriculars, customActivity.trim()] });
      setCustomActivity("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Intended Majors */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BookOpenIcon size={18} className="text-zinc-600" />
          <label className="block text-sm font-medium text-zinc-900">
            What do you want to study?
          </label>
        </div>

        {/* Selected majors */}
        {data.intendedMajors.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {data.intendedMajors.map((major) => (
              <span
                key={major}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {major}
                <button
                  type="button"
                  onClick={() => toggleMajor(major)}
                  className="hover:text-blue-600"
                >
                  <XIcon size={12} weight="bold" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Popular majors */}
        <div className="flex flex-wrap gap-2 mb-3">
          {POPULAR_MAJORS.filter((m) => !data.intendedMajors.includes(m)).map((major) => (
            <button
              key={major}
              type="button"
              onClick={() => toggleMajor(major)}
              className="px-3 py-1.5 border border-zinc-200 rounded-full text-sm text-zinc-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              {major}
            </button>
          ))}
        </div>

        {/* Custom major input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customMajor}
            onChange={(e) => setCustomMajor(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomMajor())}
            placeholder="Add another major..."
            className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addCustomMajor}
            disabled={!customMajor.trim()}
            className="px-3 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            <PlusIcon size={16} weight="bold" />
          </button>
        </div>
      </div>

      {/* Extracurriculars */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrophyIcon size={18} className="text-zinc-600" />
          <label className="block text-sm font-medium text-zinc-900">
            Key extracurricular activities
          </label>
        </div>

        {/* Selected activities */}
        {data.extracurriculars.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {data.extracurriculars.map((activity) => (
              <span
                key={activity}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {activity}
                <button
                  type="button"
                  onClick={() => toggleActivity(activity)}
                  className="hover:text-green-600"
                >
                  <XIcon size={12} weight="bold" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Popular activities */}
        <div className="flex flex-wrap gap-2 mb-3">
          {POPULAR_EXTRACURRICULARS.filter((a) => !data.extracurriculars.includes(a)).map((activity) => (
            <button
              key={activity}
              type="button"
              onClick={() => toggleActivity(activity)}
              className="px-3 py-1.5 border border-zinc-200 rounded-full text-sm text-zinc-700 hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              {activity}
            </button>
          ))}
        </div>

        {/* Custom activity input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customActivity}
            onChange={(e) => setCustomActivity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomActivity())}
            placeholder="Add another activity..."
            className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addCustomActivity}
            disabled={!customActivity.trim()}
            className="px-3 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            <PlusIcon size={16} weight="bold" />
          </button>
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium text-zinc-900 mb-2">
          Anything else we should know? <span className="text-zinc-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={data.additionalNotes || ""}
          onChange={(e) => onChange({ additionalNotes: e.target.value })}
          placeholder="E.g., specific programs you're interested in, financial aid needs, location preferences within a country..."
          rows={3}
          className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
}
