export type CampusPreference = "large_campus" | "city_based" | "suburban" | "rural" | "no_preference";
export type ClassSizePreference = "small" | "medium" | "large" | "no_preference";

export type Curriculum =
  | "ib"
  | "a_levels"
  | "us_high_school"
  | "ap"
  | "gcse"
  | "cbse"
  | "icse"
  | "other";

export interface TestScore {
  type: "sat" | "act" | "ielts" | "toefl" | "psat";
  total?: number;
  sections?: {
    name: string;
    score: number;
    maxScore: number;
  }[];
}

export interface GradeEntry {
  subject: string;
  grade: string; // Could be "A*", "7", "4.0", etc. depending on curriculum
}

export interface WizardData {
  // Step 1: Academics
  curriculum: Curriculum | null;
  grades: GradeEntry[];
  predictedGrades?: GradeEntry[];
  gpa?: string;
  testScores: TestScore[];

  // Step 2: Preferences
  targetCountries: string[];
  campusPreference: CampusPreference;
  classSizePreference: ClassSizePreference;
  budgetRange?: string;

  // Step 3: Interests
  intendedMajors: string[];
  extracurriculars: string[];
  additionalNotes?: string;
}

export const DEFAULT_WIZARD_DATA: WizardData = {
  curriculum: null,
  grades: [],
  testScores: [],
  targetCountries: [],
  campusPreference: "no_preference",
  classSizePreference: "no_preference",
  intendedMajors: [],
  extracurriculars: [],
};

export const CURRICULUM_OPTIONS: { value: Curriculum; label: string; gradeScale: string }[] = [
  { value: "ib", label: "IB Diploma", gradeScale: "1-7" },
  { value: "a_levels", label: "A-Levels", gradeScale: "A*-E" },
  { value: "us_high_school", label: "US High School", gradeScale: "GPA 0-4.0" },
  { value: "ap", label: "AP Courses", gradeScale: "1-5" },
  { value: "gcse", label: "GCSE", gradeScale: "9-1" },
  { value: "cbse", label: "CBSE", gradeScale: "Percentage" },
  { value: "icse", label: "ICSE", gradeScale: "Percentage" },
  { value: "other", label: "Other", gradeScale: "Describe" },
];

export const CAMPUS_OPTIONS: { value: CampusPreference; label: string; description: string }[] = [
  { value: "large_campus", label: "Large Campus", description: "Traditional university campus with extensive facilities" },
  { value: "city_based", label: "City-Based", description: "Urban campus integrated into a city environment" },
  { value: "suburban", label: "Suburban", description: "Campus in a suburban area, balance of space and accessibility" },
  { value: "rural", label: "Rural", description: "Secluded campus in a quieter, natural setting" },
  { value: "no_preference", label: "No Preference", description: "Open to any campus type" },
];

export const CLASS_SIZE_OPTIONS: { value: ClassSizePreference; label: string; description: string }[] = [
  { value: "small", label: "Small Classes", description: "Intimate settings with more professor interaction" },
  { value: "medium", label: "Medium Classes", description: "Mix of lecture halls and smaller seminars" },
  { value: "large", label: "Large Classes", description: "Larger lectures, more independence" },
  { value: "no_preference", label: "No Preference", description: "Open to any class size" },
];

export const COUNTRY_OPTIONS = [
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
];
