import usCollegesData from "./us-colleges-data.json";

export interface USCollege {
  id: string;
  schoolName: string;
  schoolCity: string | null;
  schoolState: string | null;
  admissionRate: number | null;
  tuitionOutOfState: number | null;
  satScoreAverage: number | null;
  studentSize: number | null;
  imageUrl: string | null;
  address: string | null;
  phone: string | null;
  internationalEmail: string | null;
  yearOfEstablishment: string | null;
  totalForeignStudents: number | null;
  noOfCampus: string | null;
  overallGraduationRate: string | null;
  ugRaceJson: Record<string, string> | null;
  ugStudentResidenceJson: Record<string, string> | null;
  ugAgeDistributionJson: Record<string, string> | null;
  graduationRate: number | null;
  postGradEarnings: number | null;
  medianFamilyIncome: number | null;
  retentionRate: number | null;
  shareFirstGeneration: number | null;
  plusLoanDebtMedian: number | null;
  pellGrantRate: number | null;
  federalLoanRate: number | null;
  avgFamilyIncome: number | null;
  actScoreMidpoint: number | null;
  totalEnrollment: number | null;
  undergraduateEnrollment: number | null;
  graduateEnrollment: number | null;
  femaleShare: number | null;
  maleShare: number | null;
  medianDebt: number | null;
  website: string | null;
  campusSetting: string | null;
  servicesData: {
    campus_security?: string[];
    student_services?: string[];
  } | null;
  admissionsFactors: Record<string, string> | null;
  applicationDeadlines: unknown | null;
  applicationRequirements: Array<{
    Area?: string;
    Details?: string;
    Required?: string;
    Recommended?: string;
    "Required for Some"?: string;
  }> | null;
  aboutSection: string | null;
  essayPrompts: unknown | null;
  mathSatRange: string | null;
  readingSatRange: string | null;
  satAcceptanceChances: {
    title?: string;
    ranges?: Array<{
      chance?: string;
      score_text?: string;
      chance_level?: string;
    }>;
    headers?: {
      column1?: string;
      column2?: string;
    };
  } | null;
  greekLife: string | null;
  environment: string | null;
  politicalAndSocialClimate: string | null;
  costOfLiving: string | null;
  safetyAndCrime: string | null;
  healthAndWellbeing: string | null;
  gymAndHealth: string | null;
}

// Type-cast the imported JSON
const usColleges: USCollege[] = usCollegesData as USCollege[];

/**
 * Get all US colleges
 */
export function getAllUSColleges(): USCollege[] {
  return usColleges;
}

/**
 * Get a US college by ID
 */
export function getUSCollegeById(id: string): USCollege | undefined {
  return usColleges.find((college) => college.id === id);
}

/**
 * Search US colleges by name, city, or state
 */
export function searchUSColleges(query: string): USCollege[] {
  const lowerQuery = query.toLowerCase();
  return usColleges.filter(
    (college) =>
      college.schoolName.toLowerCase().includes(lowerQuery) ||
      college.schoolCity?.toLowerCase().includes(lowerQuery) ||
      college.schoolState?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get unique states for filtering
 */
export function getUSCollegeStates(): string[] {
  const states = new Set<string>();
  usColleges.forEach((college) => {
    if (college.schoolState) {
      states.add(college.schoolState);
    }
  });
  return Array.from(states).sort();
}

/**
 * Get unique campus settings for filtering
 */
export function getUSCollegeCampusSettings(): string[] {
  const settings = new Set<string>();
  usColleges.forEach((college) => {
    if (college.campusSetting) {
      settings.add(college.campusSetting);
    }
  });
  return Array.from(settings).sort();
}

/**
 * Filter US colleges with various criteria
 */
export function filterUSColleges(filters: {
  search?: string;
  states?: string[];
  minAdmissionRate?: number;
  maxAdmissionRate?: number;
  minSATScore?: number;
  maxSATScore?: number;
  maxTuition?: number;
  campusSetting?: string[];
}): USCollege[] {
  let results = usColleges;

  if (filters.search) {
    const lowerQuery = filters.search.toLowerCase();
    results = results.filter(
      (college) =>
        college.schoolName.toLowerCase().includes(lowerQuery) ||
        college.schoolCity?.toLowerCase().includes(lowerQuery) ||
        college.schoolState?.toLowerCase().includes(lowerQuery)
    );
  }

  if (filters.states && filters.states.length > 0) {
    results = results.filter(
      (college) =>
        college.schoolState !== null &&
        filters.states!.includes(college.schoolState)
    );
  }

  if (filters.minAdmissionRate !== undefined) {
    results = results.filter(
      (college) =>
        college.admissionRate !== null &&
        college.admissionRate >= filters.minAdmissionRate!
    );
  }

  if (filters.maxAdmissionRate !== undefined) {
    results = results.filter(
      (college) =>
        college.admissionRate !== null &&
        college.admissionRate <= filters.maxAdmissionRate!
    );
  }

  if (filters.minSATScore !== undefined) {
    results = results.filter(
      (college) =>
        college.satScoreAverage !== null &&
        college.satScoreAverage >= filters.minSATScore!
    );
  }

  if (filters.maxSATScore !== undefined) {
    results = results.filter(
      (college) =>
        college.satScoreAverage !== null &&
        college.satScoreAverage <= filters.maxSATScore!
    );
  }

  if (filters.maxTuition !== undefined) {
    results = results.filter(
      (college) =>
        college.tuitionOutOfState !== null &&
        college.tuitionOutOfState <= filters.maxTuition!
    );
  }

  if (filters.campusSetting && filters.campusSetting.length > 0) {
    results = results.filter(
      (college) =>
        college.campusSetting !== null &&
        filters.campusSetting!.includes(college.campusSetting)
    );
  }

  return results;
}

export { usColleges };
