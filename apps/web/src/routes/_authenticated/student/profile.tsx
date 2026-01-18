import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { orpc } from "orpc/client";
import { useAuthUser } from "@/routes/_authenticated";
import {
  EnvelopeIcon,
  MapPinIcon,
  GraduationCapIcon,
  BookOpenIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/button";

export const Route = createFileRoute("/_authenticated/student/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuthUser();

  // Fetch student's own profile data
  const studentQuery = useQuery(
    orpc.student.getMyProfile.queryOptions({ input: {} })
  );

  const student = studentQuery.data;

  return (
    <div className="flex flex-1 h-screen text-left">
      <div className="flex-1 flex flex-col p-4 pt-2.5 overflow-auto">
        {/* Header */}
        <div className="p-2.5 mb-4">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Your Profile
          </h1>
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
              <Button variant="secondary" className="text-xs px-3 py-1.5">
                Edit Profile
              </Button>
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
                  Your student profile is being set up. Please contact your advisor to complete your profile.
                </div>
              ) : (
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
                  {user?.name && (
                    <div className="flex gap-3 items-start">
                      <UserIcon className="size-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
                          Name
                        </div>
                        <div className="text-sm text-zinc-900">{user.name}</div>
                      </div>
                    </div>
                  )}

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
                        {student.areasOfInterest && student.areasOfInterest.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {student.areasOfInterest.map((interest: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-zinc-100 text-zinc-700 rounded text-xs"
                              >
                                {interest}
                              </span>
                            ))}
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
                        {student.targetCountries && student.targetCountries.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {student.targetCountries.map((country: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-zinc-100 text-zinc-700 rounded text-xs"
                              >
                                {country}
                              </span>
                            ))}
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
                        {student.extracurricular && student.extracurricular.length > 0 ? (
                          <div className="space-y-3">
                            {student.extracurricular.map((activity, idx: number) => (
                              <div
                                key={idx}
                                className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg"
                              >
                                <div className="font-medium text-zinc-900 mb-1">
                                  {activity.name}
                                </div>
                                <div className="text-xs text-zinc-600 space-y-1">
                                  <div>Type: {activity.type}</div>
                                  <div>Hours per week: {activity.hoursPerWeek}</div>
                                  <div>Years of experience: {activity.yearsOfExperience}</div>
                                  {activity.description && (
                                    <div className="mt-2 text-zinc-700">{activity.description}</div>
                                  )}
                                </div>
                              </div>
                            ))}
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

          {/* Note about editing */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-900">
              To update your profile information, please contact your advisor or use the "Edit Profile" button above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
