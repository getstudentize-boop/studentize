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
  overallGraduationRate: number | null;
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

// UK College type matching the transformed API response
export type UKCollegeData = {
  id: string;
  universityName: string;
  location: string | null;
  tuitionFees: number | null;
  examsAccepted: string | null;
  scholarships: string | null;
  imageUrl: string | null;
  address: string | null;
  phone: string | null;
  internationalEmail: string | null;
  yearOfEstablishment: string | null;
  totalForeignStudents: number | null;
  numberOfCampuses: string | null;
  onCampusAccommodation: string | null;
  offCampusAccommodation: string | null;
  sizeOfCity: string | null;
  academicRequirements: string | null;
  studentComposition: string | null;
  historicRanking: Record<string, Array<{ rank: number; year: number }>> | null;
  about: string | null;
  website: string | null;
  studentLifeInfo: string | null;
  populationOfCity: string | null;
};
