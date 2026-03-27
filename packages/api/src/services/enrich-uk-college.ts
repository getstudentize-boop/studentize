import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { z } from "zod";
import { schema, updateUKCollege } from "@student/db";

type UKCollege = typeof schema.ukCollege.$inferSelect;

const enrichableFields = [
  "location",
  "tuitionFees",
  "examsAccepted",
  "scholarships",
  "address",
  "phone",
  "internationalEmail",
  "yearOfEstablishment",
  "totalForeignStudents",
  "numberOfCampuses",
  "onCampusAccommodation",
  "offCampusAccommodation",
  "sizeOfCity",
  "academicRequirements",
  "about",
  "website",
  "populationOfCity",
] as const;

type EnrichableField = (typeof enrichableFields)[number];

const enrichmentSchema = z.object({
  location: z
    .string()
    .nullable()
    .describe("City and region where the university is located"),
  tuitionFees: z
    .string()
    .nullable()
    .describe(
      "Annual international tuition fees in GBP (just the number, e.g. '29000')",
    ),
  examsAccepted: z
    .string()
    .nullable()
    .describe(
      "Accepted exams/qualifications (e.g. 'A-Levels, IB, SAT, IELTS')",
    ),
  scholarships: z
    .string()
    .nullable()
    .describe(
      "Overview of scholarship opportunities for international students. Use markdown: headers for scholarship names, bullet points for details, bold for amounts.",
    ),
  address: z
    .string()
    .nullable()
    .describe("Full postal address of the university"),
  phone: z.string().nullable().describe("Main phone number"),
  internationalEmail: z
    .string()
    .nullable()
    .describe("International admissions email"),
  yearOfEstablishment: z
    .string()
    .nullable()
    .describe("Year the university was established"),
  totalForeignStudents: z
    .string()
    .nullable()
    .describe("Approximate number of international students"),
  numberOfCampuses: z.string().nullable().describe("Number of campuses"),
  onCampusAccommodation: z
    .string()
    .nullable()
    .describe(
      "Description of on-campus accommodation options. Use markdown: bullet points for each hall/option, bold for prices, include room types and weekly costs.",
    ),
  offCampusAccommodation: z
    .string()
    .nullable()
    .describe(
      "Description of off-campus accommodation options. Use markdown: bullet points for areas/options, bold for average monthly rent, include popular neighborhoods.",
    ),
  sizeOfCity: z
    .string()
    .nullable()
    .describe(
      "Size classification of the city (e.g. 'Large', 'Medium', 'Small')",
    ),
  academicRequirements: z
    .string()
    .nullable()
    .describe(
      "Academic entry requirements for international students. Use markdown: headers for undergraduate/postgraduate, bullet points for each qualification type (A-Levels, IB, IELTS), bold for grade requirements.",
    ),
  about: z
    .string()
    .nullable()
    .describe(
      "2-3 paragraph description of the university. Use markdown for structure: bold key facts, separate paragraphs for history, strengths, and student experience.",
    ),
  website: z.string().nullable().describe("Official university website URL"),
  populationOfCity: z
    .string()
    .nullable()
    .describe("Approximate population of the city"),
});

function getMissingFields(college: UKCollege): EnrichableField[] {
  return enrichableFields.filter((field) => {
    const value = college[field];
    return value === null || value === undefined || value === "";
  });
}

export async function enrichUKCollege(college: UKCollege): Promise<UKCollege> {
  const missingFields = getMissingFields(college);

  if (missingFields.length === 0) {
    return college;
  }

  console.log(
    `Enriching UK college "${college.universityName}" - missing fields:`,
    missingFields,
  );

  const partialSchema = z.object(
    Object.fromEntries(
      missingFields.map((field) => [field, enrichmentSchema.shape[field]]),
    ),
  );

  const { text } = await generateText({
    model: openai("gpt-5.4-mini"),
    tools: {
      web_search_preview: openai.tools.webSearchPreview({}),
    },
    maxSteps: 5,
    system: `You are a university research assistant. Your job is to find accurate, up-to-date information about UK universities.
Use the web_search_preview tool to search for the information. Be factual and concise.
If you cannot find reliable information for a field, use null for that field.
Focus on information relevant to international students.

FORMATTING RULES:
- For long-form text fields (about, scholarships, accommodation, academicRequirements), use markdown formatting: headers (##), bullet points (-), bold (**text**) for key info.
- For short factual fields (location, phone, website, yearOfEstablishment, etc.), return plain strings without markdown.
- All string values in the JSON must be properly escaped (use \\n for newlines within strings).

You MUST respond with ONLY a valid JSON object matching the requested fields. No wrapping markdown code fences, no explanation — just the raw JSON object.`,
    prompt: `Find the following missing information about "${college.universityName}" (UK university).

Missing fields to fill (respond as JSON with these keys):
${JSON.stringify(Object.fromEntries(missingFields.map((f) => [f, enrichmentSchema.shape[f].description])), null, 2)}

${college.location ? `Known location: ${college.location}` : ""}
${college.website ? `Known website: ${college.website}` : ""}

Search the web for this university's official information, then respond with ONLY a JSON object containing the missing fields.`,
  });

  let object: Record<string, string | null>;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const raw = JSON.parse(jsonMatch?.[0] ?? "{}");

    // Coerce any non-string values (objects, arrays, numbers) to strings
    for (const key of Object.keys(raw)) {
      const val = raw[key];
      if (val !== null && val !== undefined && typeof val !== "string") {
        raw[key] = typeof val === "object" ? JSON.stringify(val) : String(val);
      }
    }

    object = partialSchema.parse(raw);
  } catch (e) {
    console.error("Failed to parse enrichment response:", text, e);
    return college;
  }

  // Filter out null values - only update fields we actually found data for
  const updates: Record<string, string> = {};
  for (const [key, value] of Object.entries(object)) {
    if (value !== null && value !== undefined && value !== "") {
      updates[key] = value;
    }
  }

  if (Object.keys(updates).length === 0) {
    return college;
  }

  const updated = await updateUKCollege(college.id, updates);
  return updated ?? college;
}
