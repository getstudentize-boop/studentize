import { z } from "zod";

export const SearchScorecardInputSchema = z.object({
  search: z.string().optional(),
  state: z.string().optional(),
  campusSetting: z.enum(["City", "Suburban", "Town", "Rural"]).optional(),
  minAdmissionRate: z.number().min(0).max(1).optional(),
  maxAdmissionRate: z.number().min(0).max(1).optional(),
  minSAT: z.number().optional(),
  maxSAT: z.number().optional(),
  minTuition: z.number().optional(),
  maxTuition: z.number().optional(),
  limit: z.number().min(1).max(200).default(200),
});

export type SearchScorecardInput = z.infer<typeof SearchScorecardInputSchema>;

interface CollegeData {
  id: number;
  "school.name": string;
  "school.city": string | null;
  "school.state": string | null;
  "school.school_url": string | null;
  "school.locale": number | null;
  "latest.admissions.admission_rate.overall": number | null;
  "latest.cost.tuition.out_of_state": number | null;
  "latest.admissions.sat_scores.average.overall": number | null;
  "latest.student.size": number | null;
  "latest.completion.completion_rate_4yr_100nt": number | null;
  "latest.earnings.10_yrs_after_entry.median": number | null;
  "latest.student.retention_rate.four_year.full_time": number | null;
}

const API_KEY = process.env.COLLEGE_SCORECARD_API_KEY;
const BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools";

const FIELDS = [
  "id",
  "school.name",
  "school.city",
  "school.state",
  "school.school_url",
  "school.locale",
  "latest.admissions.admission_rate.overall",
  "latest.cost.tuition.out_of_state",
  "latest.admissions.sat_scores.average.overall",
  "latest.student.size",
  "latest.completion.completion_rate_4yr_100nt",
  "latest.earnings.10_yrs_after_entry.median",
  "latest.student.retention_rate.four_year.full_time",
].join(",");

function mapLocaleToCampusSetting(locale: number): string {
  if (locale >= 11 && locale <= 13) return "City";
  if (locale >= 21 && locale <= 23) return "Suburban";
  if (locale >= 31 && locale <= 33) return "Town";
  if (locale >= 41 && locale <= 43) return "Rural";
  return "Unknown";
}

function isQualityCollege(college: CollegeData): boolean {
  // Must have admission rate data
  if (!college["latest.admissions.admission_rate.overall"]) return false;

  // Must have significant enrollment (at least 1000 students for top universities)
  if (!college["latest.student.size"] || college["latest.student.size"] < 1000)
    return false;

  // Must have tuition data
  if (!college["latest.cost.tuition.out_of_state"]) return false;

  // Must have SAT scores (top universities should have this)
  if (!college["latest.admissions.sat_scores.average.overall"]) return false;

  // Must have graduation rate
  if (!college["latest.completion.completion_rate_4yr_100nt"]) return false;

  return true;
}

function transformCollegeData(college: CollegeData) {
  return {
    id: college.id.toString(),
    name: college["school.name"],
    city: college["school.city"],
    state: college["school.state"],
    website: college["school.school_url"],
    campusSetting: college["school.locale"]
      ? mapLocaleToCampusSetting(college["school.locale"])
      : null,
    admissionRate: college["latest.admissions.admission_rate.overall"],
    tuition: college["latest.cost.tuition.out_of_state"],
    satAverage: college["latest.admissions.sat_scores.average.overall"],
    studentSize: college["latest.student.size"],
    graduationRate: college["latest.completion.completion_rate_4yr_100nt"],
    postGradEarnings: college["latest.earnings.10_yrs_after_entry.median"],
    retentionRate:
      college["latest.student.retention_rate.four_year.full_time"],
  };
}

export const searchScorecardHandler = async (input: SearchScorecardInput) => {
  if (!API_KEY) {
    throw new Error("COLLEGE_SCORECARD_API_KEY not configured");
  }

  const url = new URL(BASE_URL);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("per_page", "100");

  // Base filters for quality 4-year institutions
  url.searchParams.set("school.degrees_awarded.predominant", "3"); // Bachelor's degree
  url.searchParams.set("school.operating", "1"); // Currently operating
  url.searchParams.set("latest.student.size__range", "1000.."); // At least 1000 students
  url.searchParams.set("latest.admissions.admission_rate.overall__range", "0..1"); // Must have admission rate

  // Apply user filters
  if (input.state) {
    url.searchParams.set("school.state", input.state);
  }

  if (input.minAdmissionRate !== undefined) {
    const currentRange = url.searchParams.get(
      "latest.admissions.admission_rate.overall__range"
    );
    const maxRate = currentRange?.split("..")[1] || "1";
    url.searchParams.set(
      "latest.admissions.admission_rate.overall__range",
      `${input.minAdmissionRate}..${maxRate}`
    );
  }

  if (input.maxAdmissionRate !== undefined) {
    const currentRange = url.searchParams.get(
      "latest.admissions.admission_rate.overall__range"
    );
    const minRate = currentRange?.split("..")[0] || "0";
    url.searchParams.set(
      "latest.admissions.admission_rate.overall__range",
      `${minRate}..${input.maxAdmissionRate}`
    );
  }

  if (input.minSAT !== undefined) {
    url.searchParams.set(
      "latest.admissions.sat_scores.average.overall__range",
      `${input.minSAT}..1600`
    );
  }

  if (input.maxSAT !== undefined) {
    const currentRange = url.searchParams.get(
      "latest.admissions.sat_scores.average.overall__range"
    );
    const minSAT = currentRange?.split("..")[0] || "400";
    url.searchParams.set(
      "latest.admissions.sat_scores.average.overall__range",
      `${minSAT}..${input.maxSAT}`
    );
  }

  if (input.minTuition !== undefined) {
    url.searchParams.set(
      "latest.cost.tuition.out_of_state__range",
      `${input.minTuition}..`
    );
  }

  if (input.maxTuition !== undefined) {
    const currentRange = url.searchParams.get(
      "latest.cost.tuition.out_of_state__range"
    );
    const minTuition = currentRange?.split("..")[0] || "0";
    url.searchParams.set(
      "latest.cost.tuition.out_of_state__range",
      `${minTuition}..${input.maxTuition}`
    );
  }

  // Sort by SAT scores (descending) to get top universities first
  url.searchParams.set(
    "sort",
    "latest.admissions.sat_scores.average.overall:desc"
  );

  const allColleges: CollegeData[] = [];
  let page = 0;

  // Fetch multiple pages until we have enough quality colleges
  while (allColleges.length < input.limit && page < 10) {
    url.searchParams.set("page", page.toString());

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const colleges = data.results || [];

      if (colleges.length === 0) break;

      // Filter for quality colleges
      const qualityColleges = colleges.filter(isQualityCollege);
      allColleges.push(...qualityColleges);

      page++;
    } catch (error) {
      console.error("Error fetching from College Scorecard API:", error);
      break;
    }
  }

  // Apply search filter (client-side since API doesn't support name search well)
  let filteredColleges = allColleges;
  if (input.search) {
    const searchLower = input.search.toLowerCase();
    filteredColleges = allColleges.filter((college) =>
      college["school.name"].toLowerCase().includes(searchLower)
    );
  }

  // Apply campus setting filter (client-side)
  if (input.campusSetting) {
    filteredColleges = filteredColleges.filter((college) => {
      if (!college["school.locale"]) return false;
      return (
        mapLocaleToCampusSetting(college["school.locale"]) === input.campusSetting
      );
    });
  }

  // Limit to requested amount
  const limitedColleges = filteredColleges.slice(0, input.limit);

  // Transform to frontend format
  const transformedColleges = limitedColleges.map(transformCollegeData);

  return {
    colleges: transformedColleges,
    total: transformedColleges.length,
  };
};
