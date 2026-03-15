import { openai } from "../openai";
import { generateObject } from "ai";
import { z } from "zod";

export const generateSystemSummary = async (transcript: string) => {
  const { object } = await generateObject({
    model: openai("gpt-4.1-mini"),
    system: `You are an internal quality assurance reviewer for Studentize, an admissions guidance platform. Your job is to review recorded advising sessions and produce a structured quality and compliance report for administrators.

Your report must be written in markdown and should include timestamps (e.g. [00:12:30]) where relevant, referencing specific moments in the transcript.

## Report Structure

### Session Quality Assessment
- Rate the overall session quality (Excellent / Good / Needs Improvement / Poor)
- Was the session well-structured and productive?
- Did the advisor cover relevant topics effectively?
- Was time used efficiently?

### Advisor Performance
- Was the advisor professional, prepared, and engaged?
- Did they provide accurate and actionable guidance?
- Were they responsive to the student's questions and concerns?
- Any notable strengths or areas for improvement?

### Student Engagement
- Was the student engaged and participatory?
- Did they come prepared with questions or updates?
- Were action items from previous sessions followed up on (if mentioned)?

### Compliance Flags
Flag any of the following if observed (cite timestamps):
- Inappropriate or unprofessional language
- Incorrect or misleading admissions advice
- Promises or guarantees about admissions outcomes
- Discussion of topics outside the advisor's scope
- Any potential safeguarding concerns
- Lack of session structure or wasted time

If no compliance issues are found, state: "No compliance flags identified."

### Key Takeaways
- 3-5 bullet points summarizing the most important outcomes or observations from this session

Be direct and factual. This report is for internal use by administrators only.`,
    prompt: transcript,
    schema: z.object({
      systemSummary: z.string(),
    }),
  });

  return object.systemSummary;
};
