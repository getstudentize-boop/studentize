import { openai } from "@ai-sdk/openai";
import {
  getStudentByUserId,
  getStudentScores,
  searchUSColleges,
  searchUKColleges,
} from "@student/db";
import { generateText, stepCountIs, tool } from "ai";
import z from "zod";
import { AuthContext } from "../../../utils/middleware";

// Schema for test scores from the wizard
const TestScoreSchema = z.object({
  type: z.enum(["sat", "act", "ielts", "toefl", "psat"]),
  total: z.number().optional(),
  sections: z.array(z.object({
    name: z.string(),
    score: z.number(),
    maxScore: z.number(),
  })).optional(),
});

// Schema for grade entries
const GradeEntrySchema = z.object({
  subject: z.string(),
  grade: z.string(),
});

// Schema for preferences passed from the wizard
const PreferencesSchema = z.object({
  curriculum: z.enum(["ib", "a_levels", "us_high_school", "ap", "gcse", "cbse", "icse", "other"]).nullable().optional(),
  gpa: z.string().optional(),
  grades: z.array(GradeEntrySchema).optional(),
  testScores: z.array(TestScoreSchema).optional(),
  targetCountries: z.array(z.string()).optional(),
  campusPreference: z.enum(["large_campus", "city_based", "suburban", "rural", "no_preference"]).optional(),
  classSizePreference: z.enum(["small", "medium", "large", "no_preference"]).optional(),
  intendedMajors: z.array(z.string()).optional(),
  extracurriculars: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
});

export const GenerateShortlistInputSchema = z.object({
  preferences: PreferencesSchema.optional(),
});

const createStudentProfileTool = (input: { studentUserId: string }) => {
  return tool({
    description:
      "Get comprehensive student profile including academic background, areas of interest, extracurriculars, target countries, study curriculum, and graduation year. Always call this first to understand the student.",
    inputSchema: z.object({}),
    execute: async () => {
      const student = await getStudentByUserId(input.studentUserId);
      if (!student) return "No student profile found.";

      return {
        name: student.name,
        location: student.location,
        studyCurriculum: student.studyCurriculum,
        expectedGraduationYear: student.expectedGraduationYear,
        targetCountries: student.targetCountries,
        areasOfInterest: student.areasOfInterest,
        extracurricular: student.extracurricular,
        supportAreas: student.supportAreas,
      };
    },
  });
};

const createStudentScoresTool = (input: { studentUserId: string }) => {
  return tool({
    description:
      "Get the student's academic scores including SAT, ACT, subject scores, and other standardized test results. Use this to assess which universities are realistic reach/target/safety options.",
    inputSchema: z.object({}),
    execute: async () => {
      const scores = await getStudentScores(input.studentUserId);
      if (!scores || scores.length === 0)
        return "No academic scores recorded yet.";

      return scores.map((s) => ({
        subject: s.subject,
        score: s.score,
        maxScore: s.maxScore,
        examDate: s.examDate,
        notes: s.notes,
      }));
    },
  });
};

const createSearchUSCollegesTool = () => {
  return tool({
    description:
      "Search US colleges by name, state, admission rate range, SAT score range, tuition, and campus setting. Returns matching colleges with details. Use this to find specific universities or explore options matching the student's profile.",
    inputSchema: z.object({
      search: z
        .string()
        .optional()
        .describe("Search by college name, city, or alias"),
      states: z
        .array(z.string())
        .optional()
        .describe("Filter by US states (e.g., ['CA', 'NY'])"),
      minAdmissionRate: z
        .number()
        .optional()
        .describe("Minimum admission rate (0-1, e.g., 0.1 for 10%)"),
      maxAdmissionRate: z
        .number()
        .optional()
        .describe("Maximum admission rate (0-1, e.g., 0.5 for 50%)"),
      minSATScore: z.number().optional().describe("Minimum average SAT score"),
      maxSATScore: z.number().optional().describe("Maximum average SAT score"),
      maxTuition: z
        .number()
        .optional()
        .describe("Maximum out-of-state tuition"),
      sortBy: z
        .enum(["name", "admission_rate", "sat_score", "tuition", "ranking"])
        .optional()
        .describe("Sort results by field"),
      sortOrder: z.enum(["asc", "desc"]).optional(),
      limit: z.number().optional().describe("Number of results (default 20)"),
    }),
    execute: async (params) => {
      const result = await searchUSColleges({
        ...params,
        limit: params.limit ?? 20,
      });

      return result.colleges.map((c) => ({
        name: c.schoolName,
        city: c.schoolCity,
        state: c.schoolState,
        admissionRate: c.admissionRate,
        satScoreAverage: c.satScoreAverage,
        tuitionOutOfState: c.tuitionOutOfState,
        ranking: c.usNewsNationalRanking,
        studentSize: c.studentSize,
        graduationRate: c.overallGraduationRate,
        campusSetting: c.campusSetting,
      }));
    },
  });
};

// Helper to extract latest ranking from historicRanking JSONB
const extractLatestRanking = (historicRanking: Record<string, Array<{ rank: number; year: number }>> | null | undefined): number | null => {
  if (!historicRanking) return null;

  // Try common ranking sources in order of preference
  const sources = ["QS World University Rankings", "Times Higher Education", "THE World University Rankings", "Complete University Guide"];

  for (const source of sources) {
    const rankings = historicRanking[source];
    if (rankings && rankings.length > 0) {
      // Get the most recent year's ranking
      const sorted = [...rankings].sort((a, b) => b.year - a.year);
      return sorted[0].rank;
    }
  }

  // If none of the preferred sources, try any source
  const firstSource = Object.keys(historicRanking)[0];
  if (firstSource && historicRanking[firstSource]?.length > 0) {
    const sorted = [...historicRanking[firstSource]].sort((a, b) => b.year - a.year);
    return sorted[0].rank;
  }

  return null;
};

const createSearchUKCollegesTool = () => {
  return tool({
    description:
      "Search UK universities by name, location, tuition, and city size. Returns matching universities with details including rankings and academic requirements.",
    inputSchema: z.object({
      search: z
        .string()
        .optional()
        .describe("Search by university name or location. For top universities, search for: Oxford, Cambridge, Imperial, LSE, UCL, Edinburgh, Manchester, King's College, Warwick, Bristol"),
      locations: z.array(z.string()).optional().describe("Filter by locations"),
      maxTuition: z.number().optional().describe("Maximum tuition fees"),
      sortBy: z.enum(["name", "tuition", "ranking"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
      limit: z.number().optional().describe("Number of results (default 20)"),
    }),
    execute: async (params) => {
      const result = await searchUKColleges({
        ...params,
        limit: params.limit ?? 20,
      });

      return result.colleges.map((c) => {
        const latestRanking = extractLatestRanking(c.historicRanking);
        return {
          name: c.universityName,
          location: c.location,
          tuitionFees: c.tuitionFees,
          examsAccepted: c.examsAccepted,
          academicRequirements: c.academicRequirements,
          scholarships: c.scholarships,
          about: c.about,
          ranking: latestRanking,
          historicRanking: c.historicRanking,
        };
      });
    },
  });
};

const createShortlistPrompt = (preferences?: z.infer<typeof PreferencesSchema>) => {
  let preferencesSection = "";

  if (preferences) {
    const parts: string[] = [];

    if (preferences.curriculum) {
      const curriculumLabels: Record<string, string> = {
        ib: "IB Diploma",
        a_levels: "A-Levels",
        us_high_school: "US High School",
        ap: "AP Courses",
        gcse: "GCSE",
        cbse: "CBSE",
        icse: "ICSE",
        other: "Other",
      };
      parts.push(`**Curriculum**: ${curriculumLabels[preferences.curriculum] || preferences.curriculum}`);
    }

    if (preferences.gpa) {
      parts.push(`**GPA**: ${preferences.gpa}`);
    }

    if (preferences.grades && preferences.grades.length > 0) {
      const gradesList = preferences.grades
        .filter(g => g.subject && g.grade)
        .map(g => `${g.subject}: ${g.grade}`)
        .join(", ");
      if (gradesList) {
        parts.push(`**Grades**: ${gradesList}`);
      }
    }

    if (preferences.testScores && preferences.testScores.length > 0) {
      const scoresList = preferences.testScores
        .filter(t => t.total)
        .map(t => {
          const sections = t.sections?.filter(s => s.score > 0)
            .map(s => `${s.name}: ${s.score}/${s.maxScore}`)
            .join(", ");
          return `${t.type.toUpperCase()}: ${t.total}${sections ? ` (${sections})` : ""}`;
        })
        .join("; ");
      if (scoresList) {
        parts.push(`**Test Scores**: ${scoresList}`);
      }
    }

    if (preferences.targetCountries && preferences.targetCountries.length > 0) {
      const countryLabels: Record<string, string> = { us: "United States", uk: "United Kingdom" };
      const countries = preferences.targetCountries.map(c => countryLabels[c] || c).join(", ");
      parts.push(`**Target Countries**: ${countries}`);
    }

    if (preferences.campusPreference && preferences.campusPreference !== "no_preference") {
      const campusLabels: Record<string, string> = {
        large_campus: "Large traditional campus",
        city_based: "City-based/urban campus",
        suburban: "Suburban campus",
        rural: "Rural/secluded campus",
      };
      parts.push(`**Campus Preference**: ${campusLabels[preferences.campusPreference]}`);
    }

    if (preferences.classSizePreference && preferences.classSizePreference !== "no_preference") {
      const sizeLabels: Record<string, string> = {
        small: "Small classes (more professor interaction)",
        medium: "Medium classes (mix of lectures and seminars)",
        large: "Large classes (more independence)",
      };
      parts.push(`**Class Size Preference**: ${sizeLabels[preferences.classSizePreference]}`);
    }

    if (preferences.intendedMajors && preferences.intendedMajors.length > 0) {
      parts.push(`**Intended Majors**: ${preferences.intendedMajors.join(", ")}`);
    }

    if (preferences.extracurriculars && preferences.extracurriculars.length > 0) {
      parts.push(`**Extracurriculars**: ${preferences.extracurriculars.join(", ")}`);
    }

    if (preferences.additionalNotes) {
      parts.push(`**Additional Notes from Student**: ${preferences.additionalNotes}`);
    }

    if (parts.length > 0) {
      preferencesSection = `

## STUDENT'S PROVIDED PREFERENCES

The student has provided the following information directly. PRIORITIZE this data over fetched profile data as it represents their current preferences:

${parts.join("\n")}
`;
    }
  }

  return `You are Studentize's University Shortlist Generator — an intelligent system that creates personalized university shortlists for students based on their academic profile, interests, and goals.
${preferencesSection}
## YOUR PROCESS (BE EFFICIENT - MINIMIZE TOOL CALLS)

1. **Review** student preferences above. Only call \`studentProfile\`/\`studentScores\` if preferences are missing.
2. **Check student's grades** against the GRADE CONVERSION TABLE and determine their tier eligibility.
3. **For UK**: Use the UK UNIVERSITIES REFERENCE - only include universities where student meets minimum grade threshold.
4. **For US**: Use the US UNIVERSITIES REFERENCE for top schools - only include if student meets minimums. Search for additional matches if needed.
5. **Output** a balanced shortlist of 8-12 universities:
   - **Reach** (2-3): Challenging but realistic based on grades
   - **Target** (3-5): Good fit schools
   - **Safety** (2-3): High admission probability

**IMPORTANT**: If student's grades are low, skip Tier 1-2 entirely and focus on Tier 3-5 universities.

## DATA PRIORITY FOR CATEGORIZATION

When determining reach/target/safety categories, weight factors in this order:

**PRIMARY (High Weight)** — Use these to determine category:
1. Test scores (SAT, ACT, etc.) compared to university averages
2. Grades/GPA compared to admitted student profiles
3. Intended major strength at the university
4. University acceptance rate and ranking

**SECONDARY (Medium Weight)** — Use when primary data is limited:
- University national/global rankings
- Historical admission data
- Program reputation in student's intended field

**LOW WEIGHT (For Fit, Not Categorization)** — Use to add variety, NOT to determine category:
- Campus type preference (city vs rural)
- Class size preference
- Extracurricular alignment
- Location within country

**IMPORTANT**: When a student provides LIMITED academic information (no test scores, no grades), rely MORE heavily on university rankings to create the categorization:
- Top 20 nationally ranked = Reach
- Top 21-60 = Target
- 60+ or higher acceptance rates = Safety

## UK UNIVERSITIES REFERENCE (USE THIS - NO NEED TO SEARCH)

**CRITICAL - MINIMUM GRADES TO EVEN CONSIDER (DO NOT RECOMMEND IF BELOW):**
- Oxford/Cambridge: Only if IB average is 6+ (mostly 6s and 7s) → ~36+ total points
- Imperial/LSE/UCL: Only if IB average is 5.5+ (mostly 5s, 6s, 7s) → ~33+ total points
- Top Russell Group: Only if IB average is 5+ → ~30+ total points
- Other Russell Group: Only if IB average is 4+ → ~24+ total points

**If student has IB grades of mostly 3s and 4s (average <5), DO NOT recommend Tier 1-3 universities at all - not even as reach.**

**TIER 1 - Super Selective (min IB avg 6+):**
| University | Subjects | Requirement | Min to Consider |
|------------|----------|-------------|-----------------|
| University of Oxford | All subjects | 40-42 pts | IB avg 6+ only |
| University of Cambridge | All subjects | 40-42 pts | IB avg 6+ only |

**TIER 2 - Highly Selective (min IB avg 5.5+):**
| University | Subjects | Requirement | Min to Consider |
|------------|----------|-------------|-----------------|
| Imperial College London | **STEM ONLY** | 38-40 pts | IB avg 5.5+ |
| London School of Economics (LSE) | **SOCIAL SCIENCES ONLY** - NOT for STEM | 38-40 pts | IB avg 5.5+ |
| University College London (UCL) | All subjects | 36-38 pts | IB avg 5.5+ |

**TIER 3 - Top Russell Group (min IB avg 5+):**
| University | Subjects | Requirement | Min to Consider |
|------------|----------|-------------|-----------------|
| University of Edinburgh | All subjects | 34-38 pts | IB avg 5+ |
| King's College London | All subjects | 34-36 pts | IB avg 5+ |
| University of Manchester | All subjects | 34-36 pts | IB avg 5+ |
| University of Warwick | All subjects | 34-38 pts | IB avg 5+ |
| University of Bristol | All subjects | 34-36 pts | IB avg 5+ |
| Durham University | All subjects | 34-36 pts | IB avg 5+ |

**TIER 4 - Russell Group (min IB avg 4+):**
| University | Subjects | Requirement | Min to Consider |
|------------|----------|-------------|-----------------|
| University of Glasgow | All subjects | 32-36 pts | IB avg 4+ |
| University of Birmingham | All subjects | 32-34 pts | IB avg 4+ |
| University of Leeds | All subjects | 32-34 pts | IB avg 4+ |
| University of Sheffield | All subjects | 32-34 pts | IB avg 4+ |
| University of Nottingham | All subjects | 32-34 pts | IB avg 4+ |
| University of Southampton | All subjects | 32-34 pts | IB avg 4+ |

**TIER 5 - For lower grades (IB avg 3-4):**
Use searchUKColleges to find universities with lower entry requirements.

**SUBJECT MATCHING:**
- **STEM**: Imperial, Oxford, Cambridge, UCL, Edinburgh, Manchester, Warwick. **NEVER LSE for STEM.**
- **Social Sciences/Humanities**: LSE, Oxford, Cambridge, UCL, Edinburgh, King's, Warwick.
- **Business/Finance**: LSE, UCL, Warwick, Manchester, Edinburgh.

**IB Grade Mapping:** 7=A*, 6=A, 5=B, 4=C, 3=D, 2=E

## US UNIVERSITIES REFERENCE

**GRADE CONVERSION ACROSS CURRICULUMS:**
| Quality | US GPA | IB Avg | A-Level | AP | CBSE/ICSE % |
|---------|--------|--------|---------|-----|-------------|
| Excellent | 3.9-4.0 | 6.5-7 | A*-A | 5 | 90%+ |
| Very Good | 3.7-3.9 | 6-6.5 | A-B | 4-5 | 85-90% |
| Good | 3.5-3.7 | 5.5-6 | B-C | 3-4 | 75-85% |
| Average | 3.0-3.5 | 5-5.5 | C-D | 3 | 65-75% |
| Below Avg | 2.5-3.0 | 4-5 | D-E | 2 | 55-65% |
| Low | <2.5 | <4 | E or below | 1-2 | <55% |

**CRITICAL - MINIMUM GRADES TO EVEN CONSIDER US UNIVERSITIES:**
- Ivy League + MIT/Stanford/Caltech: Only if GPA 3.7+ (IB avg 6+, A-Level A-B, 85%+)
- Top 20 (Duke, Northwestern, etc.): Only if GPA 3.5+ (IB avg 5.5+, A-Level B+, 80%+)
- Top 50: Only if GPA 3.3+ (IB avg 5+, A-Level B-C, 75%+)
- Top 100: Only if GPA 3.0+ (IB avg 4.5+, A-Level C+, 70%+)

**If student has low grades (GPA <3.0, IB avg <4.5, A-Level below C), DO NOT recommend Top 50 universities - not even as reach.**

**TIER 1 - Ivy League & Elite (min GPA 3.7+ / IB avg 6+):**
| University | Strengths | Admission Rate | Min to Consider |
|------------|-----------|----------------|-----------------|
| Harvard, Yale, Princeton | All fields | 3-5% | GPA 3.7+ only |
| MIT, Caltech | **STEM ONLY** | 3-7% | GPA 3.7+ only |
| Stanford, Columbia | All fields | 4-6% | GPA 3.7+ only |
| UPenn, Brown, Dartmouth, Cornell | All fields | 5-10% | GPA 3.7+ only |

**TIER 2 - Top 20 (min GPA 3.5+ / IB avg 5.5+):**
| University | Strengths | Admission Rate | Min to Consider |
|------------|-----------|----------------|-----------------|
| Duke, Northwestern, Johns Hopkins | All fields | 6-10% | GPA 3.5+ |
| UChicago, Vanderbilt, Rice | All fields | 6-12% | GPA 3.5+ |
| Notre Dame, WashU St. Louis | All fields | 10-15% | GPA 3.5+ |
| UCLA, UC Berkeley | All fields (public) | 9-14% | GPA 3.5+ |
| Georgetown, CMU | Varies | 12-17% | GPA 3.5+ |

**TIER 3 - Top 50 (min GPA 3.3+ / IB avg 5+):**
| University | Admission Rate | Min to Consider |
|------------|----------------|-----------------|
| NYU, Boston University, USC | 12-20% | GPA 3.3+ |
| Tufts, Wake Forest, UVA | 15-25% | GPA 3.3+ |
| UMich, UNC Chapel Hill | 18-25% | GPA 3.3+ |
| Boston College, William & Mary | 20-30% | GPA 3.3+ |

**TIER 4 - Top 100 (min GPA 3.0+ / IB avg 4.5+):**
Use searchUSColleges with admission rate filters to find appropriate matches.

**TIER 5 - For lower grades (GPA <3.0 / IB avg <4.5):**
Use searchUSColleges with minAdmissionRate=0.5 to find universities with higher acceptance rates.

**US SUBJECT MATCHING:**
- **STEM**: MIT, Caltech, CMU, Georgia Tech, Stanford, Berkeley, Purdue. **Do NOT recommend liberal arts colleges for engineering.**
- **Business**: UPenn Wharton, NYU Stern, MIT Sloan, Michigan Ross, UC Berkeley Haas.
- **Liberal Arts/Humanities**: Williams, Amherst, Swarthmore, and Ivy League schools.
- **Pre-Med**: Johns Hopkins, Duke, WashU, Northwestern, Stanford.

## CATEGORIZATION CRITERIA

- **Reach**: Student's profile is below the university's typical admitted student profile (acceptance rate < 20% OR student stats below 25th percentile of admits)
- **Target**: Student's profile aligns well with the university's typical admits (student stats within the middle 50% range)
- **Safety**: Student's profile exceeds the university's typical requirements (student stats above 75th percentile of admits, acceptance rate > 50%)

## OUTPUT FORMAT

You MUST output your final shortlist as a JSON array. Your final text response must contain ONLY a valid JSON array (no markdown, no explanation, no code fences) with this structure:

[
  {
    "name": "Full University Name",
    "country": "us" or "uk",
    "category": "reach" or "target" or "safety",
    "notes": "Brief reason for recommendation"
  }
]

## GUIDELINES

**BALANCE IS CRITICAL - You MUST include:**
- Exactly 2-3 Reach universities
- Exactly 3-5 Target universities
- Exactly 2-3 Safety universities
- Total: 8-12 universities

**CRITICAL - COUNTRY RESTRICTION:**
- **ONLY recommend universities from the student's selected target countries**
- If student selected UK only → ALL universities must be UK. Do NOT include any US universities.
- If student selected US only → ALL universities must be US. Do NOT include any UK universities.
- If student selected both → Include a mix from both countries.

**Selection Rules:**
- **ENFORCE MINIMUM GRADE THRESHOLDS** - Do NOT recommend universities if student's grades are below the minimum. Use the grade conversion table to compare across curriculums.
- Match universities to student's intended major/subjects - NEVER recommend LSE for STEM, MIT/Caltech for humanities-only students
- For UK: Use the UK reference table directly - check minimum IB/A-Level grades before including
- For US: Use the US reference table for top universities, then search for additional matches
- Base categorization ONLY on grades, test scores, and rankings

**Notes:** Keep brief (1 sentence) explaining the academic rationale for the category.`;
};

export type GenerateShortlistResult = {
  universities: Array<{
    name: string;
    country: string;
    category: "reach" | "target" | "safety";
    notes?: string;
  }>;
};

export type GenerateShortlistInput = z.infer<typeof GenerateShortlistInputSchema>;

export const generateShortlist = async (
  ctx: AuthContext,
  input: GenerateShortlistInput,
): Promise<GenerateShortlistResult> => {
  const studentUserId = ctx.user.id;
  const preferences = input.preferences;

  // Create personalized prompt with preferences
  const systemPrompt = createShortlistPrompt(preferences);

  // Build user prompt based on what info we have
  let userPrompt = "Generate a balanced shortlist with exactly 2-3 reach, 3-5 target, and 2-3 safety universities.";

  if (preferences && Object.keys(preferences).length > 0) {
    // If we have target countries, be explicit
    if (preferences.targetCountries && preferences.targetCountries.length > 0) {
      const hasUS = preferences.targetCountries.includes("us");
      const hasUK = preferences.targetCountries.includes("uk");

      if (hasUK && !hasUS) {
        userPrompt += " ONLY UK universities - do NOT include any US universities. Use the UK reference table directly. Return JSON immediately.";
      } else if (hasUS && !hasUK) {
        userPrompt += " ONLY US universities - do NOT include any UK universities. Search once for reach and once for target/safety. Return JSON.";
      } else {
        userPrompt += " Include BOTH UK and US universities. For UK use the reference table; for US search by admission rate. Return JSON.";
      }
    }
  } else {
    userPrompt += " Fetch profile first, then generate shortlist. Return JSON.";
  }

  const result = await generateText({
    model: openai("gpt-4o-mini"),
    tools: {
      studentProfile: createStudentProfileTool({ studentUserId }),
      studentScores: createStudentScoresTool({ studentUserId }),
      searchUSColleges: createSearchUSCollegesTool(),
      searchUKColleges: createSearchUKCollegesTool(),
    },
    system: systemPrompt,
    prompt: userPrompt,
    stopWhen: stepCountIs(8),
  });

  // Parse the JSON shortlist from the final text response
  const text = result.text.trim();

  try {
    const universities = JSON.parse(text);
    return { universities };
  } catch {
    // Try to extract JSON from the response if it has extra text
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const universities = JSON.parse(jsonMatch[0]);
      return { universities };
    }
    throw new Error("Failed to parse shortlist from AI response");
  }
};
