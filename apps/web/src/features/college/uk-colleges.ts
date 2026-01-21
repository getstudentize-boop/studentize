import ukCollegesData from "./uk-colleges-data.json";

export interface UKCollege {
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
  studentComposition: {
    by_subject?: Record<string, number>;
    by_level_of_study?: {
      total?: number;
      postgraduates?: number;
      undergraduates?: number;
    };
    foreign_students_by_nationality?: Record<string, number>;
  } | null;
  historicRanking: Record<
    string,
    Array<{ rank: number; year: number }>
  > | null;
  about: string | null;
  website: string | null;
  studentLifeInfo: Record<string, unknown> | null;
  populationOfCity: string | null;
}

// Type-cast the imported JSON
const ukColleges: UKCollege[] = ukCollegesData as UKCollege[];

/**
 * Get all UK colleges
 */
export function getAllUKColleges(): UKCollege[] {
  return ukColleges;
}

/**
 * Get a UK college by ID
 */
export function getUKCollegeById(id: string): UKCollege | undefined {
  return ukColleges.find((college) => college.id === id);
}

/**
 * Search UK colleges by name or location
 */
export function searchUKColleges(query: string): UKCollege[] {
  const lowerQuery = query.toLowerCase();
  return ukColleges.filter(
    (college) =>
      college.universityName.toLowerCase().includes(lowerQuery) ||
      college.location?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get unique locations for filtering
 */
export function getUKCollegeLocations(): string[] {
  const locations = new Set<string>();
  ukColleges.forEach((college) => {
    if (college.location) {
      locations.add(college.location);
    }
  });
  return Array.from(locations).sort();
}

/**
 * Get unique city sizes for filtering
 */
export function getUKCollegeCitySizes(): string[] {
  const sizes = new Set<string>();
  ukColleges.forEach((college) => {
    if (college.sizeOfCity) {
      sizes.add(college.sizeOfCity);
    }
  });
  return Array.from(sizes).sort();
}

/**
 * Filter UK colleges with various criteria
 */
export function filterUKColleges(filters: {
  search?: string;
  locations?: string[];
  maxTuition?: number;
  citySize?: string[];
}): UKCollege[] {
  let results = ukColleges;

  if (filters.search) {
    const lowerQuery = filters.search.toLowerCase();
    results = results.filter(
      (college) =>
        college.universityName.toLowerCase().includes(lowerQuery) ||
        college.location?.toLowerCase().includes(lowerQuery)
    );
  }

  if (filters.locations && filters.locations.length > 0) {
    results = results.filter((college) =>
      filters.locations!.some((loc) =>
        college.location?.toLowerCase().includes(loc.toLowerCase())
      )
    );
  }

  if (filters.maxTuition !== undefined) {
    results = results.filter(
      (college) =>
        college.tuitionFees !== null && college.tuitionFees <= filters.maxTuition!
    );
  }

  if (filters.citySize && filters.citySize.length > 0) {
    results = results.filter(
      (college) =>
        college.sizeOfCity !== null &&
        filters.citySize!.includes(college.sizeOfCity)
    );
  }

  return results;
}

export { ukColleges };
