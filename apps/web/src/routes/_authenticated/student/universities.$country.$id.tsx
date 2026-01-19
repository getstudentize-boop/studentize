import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import {
  ArrowLeft,
  MapPin,
  GlobeHemisphereWest,
  Phone,
  EnvelopeSimple,
  CalendarBlank,
  Users,
  GraduationCap,
  CurrencyDollar,
  ChartLine,
  Buildings,
} from "@phosphor-icons/react";

export const Route = createFileRoute(
  "/_authenticated/student/universities/$country/$id"
)({
  component: CollegeDetailPage,
});

function CollegeDetailPage() {
  const { country, id } = Route.useParams();
  const isUS = country === "us";

  // Fetch US college
  const usCollegeQuery = useQuery({
    ...orpc.college.getUS.queryOptions({ input: { id } }),
    enabled: isUS,
  });

  // Fetch UK college
  const ukCollegeQuery = useQuery({
    ...orpc.college.getUK.queryOptions({ input: { id } }),
    enabled: !isUS,
  });

  const college = isUS ? usCollegeQuery.data : ukCollegeQuery.data;
  const isLoading = isUS ? usCollegeQuery.isLoading : ukCollegeQuery.isLoading;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading university details...</div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="text-gray-500 mb-4">University not found</div>
        <Link
          to="/student/universities/explorer"
          className="text-blue-600 hover:text-blue-700"
        >
          ← Back to University Explorer
        </Link>
      </div>
    );
  }

  const collegeName = isUS ? college.schoolName : college.universityName;
  const placeholderImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(collegeName)}&size=800&background=3b82f6&color=fff&bold=true&format=svg`;

  return (
    <div className="h-screen overflow-auto bg-zinc-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-zinc-200 px-8 py-4">
        <Link
          to="/student/universities/explorer"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={20} />
          <span>Back to Explorer</span>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="h-96 bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden">
        <img
          src={college.imageUrl || placeholderImage}
          alt={collegeName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = placeholderImage;
          }}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Title and Basic Info */}
        <div className="bg-white rounded-xl border border-zinc-200 p-8 mb-6 shadow-sm">
          <h1 className="text-4xl font-semibold text-zinc-900 mb-6 tracking-tight">
            {collegeName}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {college.address && (
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-zinc-400 mt-1" />
                <div>
                  <div className="text-sm text-zinc-500">Location</div>
                  <div className="font-medium text-zinc-900">{college.address}</div>
                </div>
              </div>
            )}

            {college.website && (
              <div className="flex items-start gap-3">
                <GlobeHemisphereWest size={20} className="text-gray-400 mt-1" />
                <div>
                  <div className="text-sm text-gray-600">Website</div>
                  <a
                    href={`https://${college.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    {college.website}
                  </a>
                </div>
              </div>
            )}

            {college.yearOfEstablishment && (
              <div className="flex items-start gap-3">
                <CalendarBlank size={20} className="text-gray-400 mt-1" />
                <div>
                  <div className="text-sm text-gray-600">Established</div>
                  <div className="font-medium">{college.yearOfEstablishment}</div>
                </div>
              </div>
            )}

            {college.phone && (
              <div className="flex items-start gap-3">
                <Phone size={20} className="text-gray-400 mt-1" />
                <div>
                  <div className="text-sm text-gray-600">Phone</div>
                  <div className="font-medium">{college.phone}</div>
                </div>
              </div>
            )}

            {college.internationalEmail && (
              <div className="flex items-start gap-3">
                <EnvelopeSimple size={20} className="text-gray-400 mt-1" />
                <div>
                  <div className="text-sm text-gray-600">
                    International Admissions
                  </div>
                  <a
                    href={`mailto:${college.internationalEmail}`}
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    {college.internationalEmail}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* About Section */}
          {(isUS ? college.aboutSection : college.about) && (
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                About
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {isUS ? college.aboutSection : college.about}
              </p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {isUS ? (
            <>
              {college.admissionRate && (
                <StatCard
                  icon={<ChartLine size={24} />}
                  label="Acceptance Rate"
                  value={`${(college.admissionRate * 100).toFixed(1)}%`}
                />
              )}
              {college.tuitionOutOfState && (
                <StatCard
                  icon={<CurrencyDollar size={24} />}
                  label="Out-of-State Tuition"
                  value={`$${Number(college.tuitionOutOfState).toLocaleString()}`}
                />
              )}
              {college.totalEnrollment && (
                <StatCard
                  icon={<Users size={24} />}
                  label="Total Enrollment"
                  value={Number(college.totalEnrollment).toLocaleString()}
                />
              )}
              {college.graduationRate && (
                <StatCard
                  icon={<GraduationCap size={24} />}
                  label="Graduation Rate"
                  value={`${college.graduationRate}%`}
                />
              )}
            </>
          ) : (
            <>
              {college.tuitionFees && (
                <StatCard
                  icon={<CurrencyDollar size={24} />}
                  label="Tuition Fees"
                  value={`£${Number(college.tuitionFees).toLocaleString()}`}
                />
              )}
              {college.totalForeignStudents && (
                <StatCard
                  icon={<Users size={24} />}
                  label="International Students"
                  value={Number(college.totalForeignStudents).toLocaleString()}
                />
              )}
              {college.numberOfCampuses && (
                <StatCard
                  icon={<Buildings size={24} />}
                  label="Number of Campuses"
                  value={college.numberOfCampuses}
                />
              )}
              {college.examsAccepted && (
                <StatCard
                  icon={<GraduationCap size={24} />}
                  label="Exams Accepted"
                  value={college.examsAccepted}
                />
              )}
            </>
          )}
        </div>

        {/* Detailed Information Sections */}
        <div className="space-y-6">
          {isUS ? (
            <USCollegeDetails college={college} />
          ) : (
            <UKCollegeDetails college={college} />
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-blue-600">{icon}</div>
        <div className="text-sm text-zinc-500">{label}</div>
      </div>
      <div className="text-2xl font-semibold text-zinc-900">{value}</div>
    </div>
  );
}

function USCollegeDetails({ college }: { college: any }) {
  return (
    <>
      {/* Admissions */}
      {college.admissionsFactors && (
        <InfoSection title="Admissions Factors">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(college.admissionsFactors).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600">{key}:</span>
                <span className="font-medium">{value as string}</span>
              </div>
            ))}
          </div>
        </InfoSection>
      )}

      {/* Test Scores */}
      {(college.satScoreAverage ||
        college.actScoreMidpoint ||
        college.mathSatRange ||
        college.readingSatRange) && (
        <InfoSection title="Test Scores">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {college.satScoreAverage && (
              <div>
                <div className="text-sm text-gray-600">Average SAT</div>
                <div className="text-xl font-semibold">
                  {college.satScoreAverage}
                </div>
              </div>
            )}
            {college.actScoreMidpoint && (
              <div>
                <div className="text-sm text-gray-600">ACT Midpoint</div>
                <div className="text-xl font-semibold">
                  {college.actScoreMidpoint}
                </div>
              </div>
            )}
            {college.mathSatRange && (
              <div>
                <div className="text-sm text-gray-600">Math SAT Range</div>
                <div className="text-xl font-semibold">
                  {college.mathSatRange}
                </div>
              </div>
            )}
            {college.readingSatRange && (
              <div>
                <div className="text-sm text-gray-600">Reading SAT Range</div>
                <div className="text-xl font-semibold">
                  {college.readingSatRange}
                </div>
              </div>
            )}
          </div>
        </InfoSection>
      )}

      {/* Campus Life */}
      {college.greekLife && (
        <InfoSection title="Greek Life">
          <p className="text-gray-700">{college.greekLife}</p>
        </InfoSection>
      )}

      {college.environment && (
        <InfoSection title="Campus Environment">
          <p className="text-gray-700">{college.environment}</p>
        </InfoSection>
      )}

      {college.costOfLiving && (
        <InfoSection title="Cost of Living">
          <p className="text-gray-700">{college.costOfLiving}</p>
        </InfoSection>
      )}

      {college.healthAndWellbeing && (
        <InfoSection title="Health & Wellbeing">
          <p className="text-gray-700">{college.healthAndWellbeing}</p>
        </InfoSection>
      )}
    </>
  );
}

function UKCollegeDetails({ college }: { college: any }) {
  return (
    <>
      {/* Accommodation */}
      {college.onCampusAccommodation && (
        <InfoSection title="On-Campus Accommodation">
          <p className="text-gray-700 whitespace-pre-line">
            {college.onCampusAccommodation}
          </p>
        </InfoSection>
      )}

      {college.offCampusAccommodation && (
        <InfoSection title="Off-Campus Accommodation">
          <p className="text-gray-700 whitespace-pre-line">
            {college.offCampusAccommodation}
          </p>
        </InfoSection>
      )}

      {/* Rankings */}
      {college.historicRanking && (
        <InfoSection title="Historic Rankings">
          <div className="space-y-4">
            {Object.entries(college.historicRanking).map(
              ([rankingName, rankings]) => (
                <div key={rankingName}>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {rankingName}
                  </h4>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {(rankings as any[])
                      .slice(-5)
                      .reverse()
                      .map((r) => (
                        <div
                          key={r.year}
                          className="flex-shrink-0 bg-gray-50 rounded-lg p-3 border border-gray-200"
                        >
                          <div className="text-xs text-gray-600">{r.year}</div>
                          <div className="text-lg font-bold text-gray-900">
                            #{r.rank}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )
            )}
          </div>
        </InfoSection>
      )}

      {/* Student Life */}
      {college.studentLifeInfo && (
        <InfoSection title="Student Life">
          <div className="text-gray-700">
            <p className="mb-4">
              Detailed student life information available including
              transportation, accommodation, and campus activities.
            </p>
          </div>
        </InfoSection>
      )}
    </>
  );
}

interface InfoSectionProps {
  title: string;
  children: React.ReactNode;
}

function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-zinc-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}
