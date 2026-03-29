import { openai } from "@ai-sdk/openai";
import {
  getStudentByUserId,
  getStudentScores,
  searchUSColleges,
  searchUKColleges,
} from "@student/db";
import { generateText, stepCountIs, tool } from "ai";
import z from "zod";
import { AuthContext } from "../../utils/middleware";

export const GenerateShortlistInputSchema = z.object({});

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
      minSATScore: z
        .number()
        .optional()
        .describe("Minimum average SAT score"),
      maxSATScore: z
        .number()
        .optional()
        .describe("Maximum average SAT score"),
      maxTuition: z.number().optional().describe("Maximum out-of-state tuition"),
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

const createSearchUKCollegesTool = () => {
  return tool({
    description:
      "Search UK universities by name, location, tuition, and city size. Returns matching universities with details.",
    inputSchema: z.object({
      search: z
        .string()
        .optional()
        .describe("Search by university name or location"),
      locations: z
        .array(z.string())
        .optional()
        .describe("Filter by locations"),
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

      return result.colleges.map((c) => ({
        name: c.universityName,
        location: c.location,
        tuitionFees: c.tuitionFees,
        examsAccepted: c.examsAccepted,
        scholarships: c.scholarships,
        about: c.about,
        historicRanking: c.historicRanking,
      }));
    },
  });
};

const shortlistGeneratorPrompt = `You are Studentize's University Shortlist Generator — an intelligent system that creates personalized university shortlists for students based on their academic profile, interests, and goals.

## YOUR PROCESS

1. **First**, call \`studentProfile\` and \`studentScores\` to understand the student completely.
2. **Analyze** their profile: academic level, test scores, target countries, areas of interest, extracurriculars.
3. **Search** for universities using \`searchUSColleges\` and/or \`searchUKColleges\` based on their target countries. Make multiple searches with different criteria to find the best matches.
4. **Build a balanced shortlist** of 8-12 universities with a healthy mix:
   - **Reach** (2-3): Highly competitive schools where admission is challenging but possible
   - **Target** (3-5): Schools where the student's profile aligns well with admitted students
   - **Safety** (2-3): Schools where the student has a strong chance of admission

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

- Base categorization on the student's actual scores and profile, not just preferences.
- Consider the student's areas of interest when selecting universities — program strength matters.
- Include a mix of university sizes, locations, and characteristics for variety.
- Provide brief, specific reasons for each recommendation in the notes field.
- If the student has no scores recorded, base recommendations on other profile factors.
- Only recommend universities in the student's target countries.
- Never fabricate university statistics. Use data from the search tools.
- If data is limited, be transparent about it in the notes.`;

export type GenerateShortlistResult = {
  universities: Array<{
    name: string;
    country: string;
    category: "reach" | "target" | "safety";
    notes?: string;
  }>;
};

export const generateShortlist = async (
  ctx: AuthContext,
): Promise<GenerateShortlistResult> => {
  const studentUserId = ctx.user.id;

  const result = await generateText({
    model: openai("gpt-4.1"),
    tools: {
      studentProfile: createStudentProfileTool({ studentUserId }),
      studentScores: createStudentScoresTool({ studentUserId }),
      searchUSColleges: createSearchUSCollegesTool(),
      searchUKColleges: createSearchUKCollegesTool(),
    },
    system: shortlistGeneratorPrompt,
    prompt:
      "Generate a personalized university shortlist for this student. Fetch their profile and scores, search for matching universities, and return the final shortlist as JSON.",
    stopWhen: stepCountIs(15),
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
