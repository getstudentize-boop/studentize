import { useState } from "react";
import {
  PlusIcon,
  XIcon,
  ExamIcon,
} from "@phosphor-icons/react";
import { cn } from "@/utils/cn";
import {
  WizardData,
  Curriculum,
  CURRICULUM_OPTIONS,
  TestScore,
  GradeEntry,
} from "./types";

interface StepAcademicsProps {
  data: WizardData;
  onChange: (data: Partial<WizardData>) => void;
}

export function StepAcademics({ data, onChange }: StepAcademicsProps) {
  const [showTestForm, setShowTestForm] = useState(false);
  const [newTestType, setNewTestType] = useState<TestScore["type"]>("sat");

  const selectedCurriculum = CURRICULUM_OPTIONS.find(
    (c) => c.value === data.curriculum
  );

  const handleAddGrade = () => {
    onChange({
      grades: [...data.grades, { subject: "", grade: "" }],
    });
  };

  const handleUpdateGrade = (
    index: number,
    field: keyof GradeEntry,
    value: string
  ) => {
    const newGrades = [...data.grades];
    newGrades[index] = { ...newGrades[index], [field]: value };
    onChange({ grades: newGrades });
  };

  const handleRemoveGrade = (index: number) => {
    onChange({
      grades: data.grades.filter((_, i) => i !== index),
    });
  };

  const handleAddTestScore = () => {
    const newTest: TestScore = {
      type: newTestType,
      total: undefined,
      sections: getDefaultSections(newTestType),
    };
    onChange({
      testScores: [...data.testScores, newTest],
    });
    setShowTestForm(false);
  };

  const handleUpdateTestScore = (
    index: number,
    field: "total" | "sections",
    value: any
  ) => {
    const newScores = [...data.testScores];
    newScores[index] = { ...newScores[index], [field]: value };
    onChange({ testScores: newScores });
  };

  const handleRemoveTestScore = (index: number) => {
    onChange({
      testScores: data.testScores.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Curriculum Selection */}
      <div>
        <label className="block text-sm font-medium text-zinc-900 mb-2">
          What curriculum are you studying?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CURRICULUM_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ curriculum: option.value })}
              className={cn(
                "px-3 py-2.5 rounded-lg border text-left transition-all",
                data.curriculum === option.value
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-zinc-200 hover:border-zinc-300 text-zinc-700"
              )}
            >
              <div className="font-medium text-sm">{option.label}</div>
              <div className="text-xs text-zinc-500">{option.gradeScale}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Grades Section */}
      {data.curriculum && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-zinc-900">
              Your Grades{" "}
              <span className="text-zinc-500 font-normal">
                ({selectedCurriculum?.gradeScale})
              </span>
            </label>
            <button
              type="button"
              onClick={handleAddGrade}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <PlusIcon size={14} weight="bold" />
              Add Subject
            </button>
          </div>

          {data.curriculum === "us_high_school" || data.curriculum === "ap" ? (
            <div>
              <label className="block text-xs text-zinc-500 mb-1">
                Overall GPA (0.0 - 4.0)
              </label>
              <input
                type="text"
                value={data.gpa || ""}
                onChange={(e) => onChange({ gpa: e.target.value })}
                placeholder="e.g., 3.8"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : null}

          {data.grades.length > 0 && (
            <div className="space-y-2 mt-3">
              {data.grades.map((grade, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={grade.subject}
                    onChange={(e) =>
                      handleUpdateGrade(index, "subject", e.target.value)
                    }
                    placeholder="Subject"
                    className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={grade.grade}
                    onChange={(e) =>
                      handleUpdateGrade(index, "grade", e.target.value)
                    }
                    placeholder={getGradePlaceholder(data.curriculum)}
                    className="w-20 px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveGrade(index)}
                    className="p-2 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {data.grades.length === 0 && data.curriculum !== "us_high_school" && (
            <p className="text-sm text-zinc-500 italic">
              No subjects added yet. Click "Add Subject" to enter your grades.
            </p>
          )}
        </div>
      )}

      {/* Test Scores Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-zinc-900">
            Standardized Test Scores
          </label>
          {!showTestForm && (
            <button
              type="button"
              onClick={() => setShowTestForm(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <PlusIcon size={14} weight="bold" />
              Add Test
            </button>
          )}
        </div>

        {showTestForm && (
          <div className="p-3 border border-zinc-200 rounded-lg bg-zinc-50 mb-3">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs text-zinc-500 mb-1">
                  Test Type
                </label>
                <select
                  value={newTestType}
                  onChange={(e) =>
                    setNewTestType(e.target.value as TestScore["type"])
                  }
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="sat">SAT</option>
                  <option value="act">ACT</option>
                  <option value="psat">PSAT</option>
                  <option value="ielts">IELTS</option>
                  <option value="toefl">TOEFL</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddTestScore}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowTestForm(false)}
                className="px-3 py-2 border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {data.testScores.length > 0 ? (
          <div className="space-y-3">
            {data.testScores.map((test, index) => (
              <TestScoreCard
                key={index}
                test={test}
                onUpdate={(field, value) =>
                  handleUpdateTestScore(index, field, value)
                }
                onRemove={() => handleRemoveTestScore(index)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 italic">
            No test scores added. Add SAT, ACT, IELTS, or other tests if
            available.
          </p>
        )}
      </div>
    </div>
  );
}

function TestScoreCard({
  test,
  onUpdate,
  onRemove,
}: {
  test: TestScore;
  onUpdate: (field: "total" | "sections", value: any) => void;
  onRemove: () => void;
}) {
  const [showSections, setShowSections] = useState(false);
  const testConfig = getTestConfig(test.type);

  return (
    <div className="p-3 border border-zinc-200 rounded-lg bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ExamIcon size={18} className="text-zinc-600" />
          <span className="font-medium text-sm text-zinc-900">
            {testConfig.label}
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-zinc-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
        >
          <XIcon size={14} />
        </button>
      </div>

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-xs text-zinc-500 mb-1">
            Total Score (out of {testConfig.maxScore})
          </label>
          <input
            type="number"
            value={test.total || ""}
            onChange={(e) =>
              onUpdate("total", e.target.value ? Number(e.target.value) : undefined)
            }
            placeholder={`e.g., ${testConfig.exampleScore}`}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {testConfig.hasSections && (
          <button
            type="button"
            onClick={() => setShowSections(!showSections)}
            className="text-xs text-blue-600 hover:text-blue-700 px-2 py-2"
          >
            {showSections ? "Hide sections" : "Add sections"}
          </button>
        )}
      </div>

      {showSections && test.sections && (
        <div className="mt-3 pt-3 border-t border-zinc-100 space-y-2">
          {test.sections.map((section, sIdx) => (
            <div key={sIdx} className="flex gap-2 items-center">
              <span className="text-xs text-zinc-600 w-24">{section.name}</span>
              <input
                type="number"
                value={section.score || ""}
                onChange={(e) => {
                  const newSections = [...test.sections!];
                  newSections[sIdx] = {
                    ...newSections[sIdx],
                    score: Number(e.target.value),
                  };
                  onUpdate("sections", newSections);
                }}
                placeholder={`/ ${section.maxScore}`}
                className="flex-1 px-2 py-1.5 border border-zinc-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-zinc-400">/ {section.maxScore}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getGradePlaceholder(curriculum: Curriculum | null): string {
  switch (curriculum) {
    case "ib":
      return "7";
    case "a_levels":
      return "A*";
    case "us_high_school":
    case "ap":
      return "A";
    case "gcse":
      return "9";
    case "cbse":
    case "icse":
      return "95%";
    default:
      return "Grade";
  }
}

function getTestConfig(type: TestScore["type"]) {
  switch (type) {
    case "sat":
      return { label: "SAT", maxScore: 1600, exampleScore: 1400, hasSections: true };
    case "act":
      return { label: "ACT", maxScore: 36, exampleScore: 32, hasSections: true };
    case "psat":
      return { label: "PSAT", maxScore: 1520, exampleScore: 1300, hasSections: true };
    case "ielts":
      return { label: "IELTS", maxScore: 9, exampleScore: 7.5, hasSections: true };
    case "toefl":
      return { label: "TOEFL", maxScore: 120, exampleScore: 105, hasSections: true };
  }
}

function getDefaultSections(type: TestScore["type"]) {
  switch (type) {
    case "sat":
      return [
        { name: "Reading & Writing", score: 0, maxScore: 800 },
        { name: "Math", score: 0, maxScore: 800 },
      ];
    case "act":
      return [
        { name: "English", score: 0, maxScore: 36 },
        { name: "Math", score: 0, maxScore: 36 },
        { name: "Reading", score: 0, maxScore: 36 },
        { name: "Science", score: 0, maxScore: 36 },
      ];
    case "psat":
      return [
        { name: "Reading & Writing", score: 0, maxScore: 760 },
        { name: "Math", score: 0, maxScore: 760 },
      ];
    case "ielts":
      return [
        { name: "Listening", score: 0, maxScore: 9 },
        { name: "Reading", score: 0, maxScore: 9 },
        { name: "Writing", score: 0, maxScore: 9 },
        { name: "Speaking", score: 0, maxScore: 9 },
      ];
    case "toefl":
      return [
        { name: "Reading", score: 0, maxScore: 30 },
        { name: "Listening", score: 0, maxScore: 30 },
        { name: "Speaking", score: 0, maxScore: 30 },
        { name: "Writing", score: 0, maxScore: 30 },
      ];
    default:
      return [];
  }
}
