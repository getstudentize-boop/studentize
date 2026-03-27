import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { orpc } from "orpc/client";
import { useAuthUser } from "@/routes/_authenticated";
import { useState } from "react";
import {
  EnvelopeIcon,
  MapPinIcon,
  GraduationCapIcon,
  BookOpenIcon,
  UserIcon,
  XIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/button";
import { cn } from "@/utils/cn";
import { PageLoader } from "@/components/page-loader";

export const Route = createFileRoute("/_authenticated/student/profile")({
  component: RouteComponent,
});

const destinations = [
  { value: "United States", label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Canada", label: "Canada" },
  { value: "Australia", label: "Australia" },
  { value: "European Union", label: "European Union" },
  { value: "Other", label: "Other" },
];

const areasOfInterestOptions = [
  { value: "Management", label: "Management" },
  { value: "Engineering", label: "Engineering" },
  { value: "Computers and Data Science", label: "Computers and Data Science" },
  { value: "Design", label: "Design" },
  { value: "Finance and Banking", label: "Finance and Banking" },
  { value: "Law", label: "Law" },
  {
    value: "Humanities and Social Sciences",
    label: "Humanities and Social Sciences",
  },
  { value: "Sciences", label: "Sciences" },
  { value: "Medicine and Pharma", label: "Medicine and Pharma" },
  {
    value: "Performing and Creative Arts",
    label: "Performing and Creative Arts",
  },
  { value: "Media and Journalism", label: "Media and Journalism" },
  { value: "Hospitality and Tourism", label: "Hospitality and Tourism" },
  { value: "Marketing and Advertising", label: "Marketing and Advertising" },
  { value: "Sports and Nutrition", label: "Sports and Nutrition" },
  { value: "Architecture", label: "Architecture" },
];

const curriculumOptions = [
  "IB Diploma",
  "A-Levels",
  "AP",
  "CBSE",
  "ICSE",
  "State Board",
  "Other",
];

function RouteComponent() {
  const authData = useAuthUser();
  const user = authData?.user;
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch student's own profile data
  const studentQuery = useQuery(
    orpc.student.getMyProfile.queryOptions({ input: {} })
  );

  const student = studentQuery.data;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    expectedGraduationYear: "",
    studyCurriculum: "",
    targetCountries: [] as string[],
    areasOfInterest: [] as string[],
  });

  // Initialize form when entering edit mode
  const handleStartEditing = () => {
    setFormData({
      name: user?.name || "",
      location: student?.location || "",
      expectedGraduationYear: student?.expectedGraduationYear || "",
      studyCurriculum: student?.studyCurriculum || "",
      targetCountries: student?.targetCountries || [],
      areasOfInterest: student?.areasOfInterest || [],
    });
    setIsEditing(true);
  };

  const updateProfileMutation = useMutation(
    orpc.student.updateMyProfile.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries();
        setIsEditing(false);
      },
    })
  );

  const handleSave = () => {
    updateProfileMutation.mutate({
      name: formData.name || undefined,
      location: formData.location || undefined,
      expectedGraduationYear: formData.expectedGraduationYear || undefined,
      studyCurriculum: formData.studyCurriculum || undefined,
      targetCountries:
        formData.targetCountries.length > 0
          ? formData.targetCountries
          : undefined,
      areasOfInterest:
        formData.areasOfInterest.length > 0
          ? formData.areasOfInterest
          : undefined,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const toggleArrayItem = (
    field: "targetCountries" | "areasOfInterest",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  // Generate graduation year options (current year to 10 years from now)
  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: 10 }, (_, i) =>
    (currentYear + i).toString()
  );

  if (studentQuery.isLoading || !user) {
    return <PageLoader message="Loading your profile..." />;
  }

  return (
    <div className="flex flex-1 h-screen text-left">
      <div className="flex-1 flex flex-col p-4 pt-2.5 overflow-auto">
        {/* Header */}
        <div className="p-2.5 mb-4">
          <h1 className="text-2xl font-semibold text-zinc-900">Your Profile</h1>
          <p className="text-zinc-600 text-sm mt-1">
            View and manage your profile information
          </p>
        </div>

        <div className="max-w-3xl">
          {/* Profile Card */}
          <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserIcon className="size-4 text-zinc-400" />
                <h2 className="font-semibold text-base text-zinc-900">
                  Profile Information
                </h2>
              </div>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="text-xs px-3 py-1.5"
                    onClick={handleCancel}
                    disabled={updateProfileMutation.isPending}
                  >
                    <XIcon className="size-3.5" />
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="text-xs px-3 py-1.5"
                    onClick={handleSave}
                    isLoading={updateProfileMutation.isPending}
                  >
                    <CheckIcon className="size-3.5" />
                    Save
                  </Button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  className="text-xs px-3 py-1.5"
                  onClick={handleStartEditing}
                >
                  Edit Profile
                </Button>
              )}
            </div>
            <div className="p-6">
              {studentQuery.isLoading ? (
                <div className="text-sm text-zinc-500">Loading...</div>
              ) : studentQuery.isError ? (
                <div className="text-sm text-red-600">
                  Error loading profile. Please contact support.
                </div>
              ) : !student ? (
                <div className="text-sm text-zinc-500">
                  Your student profile is being set up. Please contact your
                  advisor to complete your profile.
                </div>
              ) : isEditing ? (
                // Edit Mode
                <div className="space-y-6">
                  {/* Name */}
                  <div className="flex gap-3 items-start">
                    <UserIcon className="size-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1 block">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  {user?.email && (
                    <div className="flex gap-3 items-start">
                      <EnvelopeIcon className="size-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
                          Email
                        </div>
                        <div className="text-sm text-zinc-500 bg-zinc-50 px-3 py-2 rounded-lg">
                          {user?.email}
                          <span className="text-xs text-zinc-400 ml-2">
                            (cannot be changed)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex gap-3 items-start">
                    <MapPinIcon className="size-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1 block">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your location"
                      />
                    </div>
                  </div>

                  {/* Expected Graduation Year */}
                  <div className="flex gap-3 items-start">
                    <GraduationCapIcon className="size-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1 block">
                        Expected Graduation Year
                      </label>
                      <select
                        value={formData.expectedGraduationYear}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            expectedGraduationYear: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select year</option>
                        {graduationYears.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Study Curriculum */}
                  <div className="flex gap-3 items-start">
                    <BookOpenIcon className="size-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1 block">
                        Study Curriculum
                      </label>
                      <select
                        value={formData.studyCurriculum}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            studyCurriculum: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select curriculum</option>
                        {curriculumOptions.map((curriculum) => (
                          <option key={curriculum} value={curriculum}>
                            {curriculum}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Target Countries */}
                  <div className="flex gap-3 items-start">
                    <MapPinIcon className="size-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2 block">
                        Target Countries
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {destinations.map((dest) => (
                          <button
                            key={dest.value}
                            type="button"
                            onClick={() =>
                              toggleArrayItem("targetCountries", dest.value)
                            }
                            className={cn(
                              "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                              formData.targetCountries.includes(dest.value)
                                ? "bg-blue-50 border-blue-500 text-blue-700"
                                : "bg-white border-zinc-300 text-zinc-700 hover:border-zinc-400"
                            )}
                          >
                            {dest.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Areas of Interest */}
                  <div className="flex gap-3 items-start">
                    <BookOpenIcon className="size-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2 block">
                        Areas of Interest
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {areasOfInterestOptions.map((area) => (
                          <button
                            key={area.value}
                            type="button"
                            onClick={() =>
                              toggleArrayItem("areasOfInterest", area.value)
                            }
                            className={cn(
                              "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                              formData.areasOfInterest.includes(area.value)
                                ? "bg-purple-50 border-purple-500 text-purple-700"
                                : "bg-white border-zinc-300 text-zinc-700 hover:border-zinc-400"
                            )}
                          >
                            {area.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-6">
                  {/* Email */}
                  {user?.email && (
                    <div className="flex gap-3 items-start">
                      <EnvelopeIcon className="size-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
                          Email
                        </div>
                        <div className="text-sm text-zinc-900">{user.email}</div>
                      </div>
                    </div>
                  )}

                  {/* Name */}
                  <div className="flex gap-3 items-start">
                    <UserIcon className="size-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
                        Name
                      </div>
                      <div className="text-sm text-zinc-900">
                        {user?.name || (
                          <span className="text-zinc-400 italic">Not set</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex gap-3 items-start">
                    <MapPinIcon className="size-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
                        Location
                      </div>
                      <div className="text-sm text-zinc-900">
                        {student.location || (
                          <span className="text-zinc-400 italic">Not set</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expected Graduation */}
                  <div className="flex gap-3 items-start">
                    <GraduationCapIcon className="size-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
                        Expected Graduation Year
                      </div>
                      <div className="text-sm text-zinc-900">
                        {student.expectedGraduationYear || (
                          <span className="text-zinc-400 italic">Not set</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Study Curriculum */}
                  <div className="flex gap-3 items-start">
                    <BookOpenIcon className="size-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
                        Study Curriculum
                      </div>
                      <div className="text-sm text-zinc-900">
                        {student.studyCurriculum || (
                          <span className="text-zinc-400 italic">Not set</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Areas of Interest */}
                  <div className="flex gap-3 items-start">
                    <BookOpenIcon className="size-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
                        Areas of Interest
                      </div>
                      <div className="text-sm text-zinc-900">
                        {student.areasOfInterest &&
                        student.areasOfInterest.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {student.areasOfInterest.map(
                              (interest: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-zinc-100 text-zinc-700 rounded text-xs"
                                >
                                  {interest}
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic">Not set</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Target Countries */}
                  <div className="flex gap-3 items-start">
                    <MapPinIcon className="size-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
                        Target Countries
                      </div>
                      <div className="text-sm text-zinc-900">
                        {student.targetCountries &&
                        student.targetCountries.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {student.targetCountries.map(
                              (country: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-zinc-100 text-zinc-700 rounded text-xs"
                                >
                                  {country}
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic">Not set</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Extracurricular Activities */}
                  <div className="flex gap-3 items-start">
                    <BookOpenIcon className="size-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
                        Extracurricular Activities
                      </div>
                      <div className="text-sm text-zinc-900">
                        {student.extracurricular &&
                        student.extracurricular.length > 0 ? (
                          <div className="space-y-3">
                            {student.extracurricular.map(
                              (activity: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg"
                                >
                                  <div className="font-medium text-zinc-900 mb-1">
                                    {activity.name}
                                  </div>
                                  <div className="text-xs text-zinc-600 space-y-1">
                                    <div>Type: {activity.type}</div>
                                    <div>
                                      Hours per week: {activity.hoursPerWeek}
                                    </div>
                                    <div>
                                      Years of experience:{" "}
                                      {activity.yearsOfExperience}
                                    </div>
                                    {activity.description && (
                                      <div className="mt-2 text-zinc-700">
                                        {activity.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic">Not set</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error message */}
          {updateProfileMutation.isError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-900">
                Failed to update profile. Please try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
