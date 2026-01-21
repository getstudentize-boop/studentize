// Full College type matching US college data structure
export type College = {
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
};

// Simplified college type for card display (backwards compatible)
export type CollegeCardData = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  admissionRate: number | null;
  tuition: number | null;
  satAverage: number | null;
  studentSize: number | null;
  graduationRate: number | null;
  retentionRate: number | null;
  postGradEarnings: number | null;
  website: string | null;
  campusSetting: string | null;
};
