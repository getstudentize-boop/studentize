import { z } from "zod";
import { generateObject } from "ai";
import { updateAptitudeSession, getAptitudeSessionById } from "@student/db";
import type { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";
import { openai } from "../../utils/openai";
import {
  PREDEFINED_QUESTIONS,
  INTEREST_AREA_REQUIRED_SUBJECTS,
} from "../../data/aptitude-questions";
import { OFFICIAL_INTEREST_AREAS, CAREERS_BY_INTEREST } from "../../data/careers";

export const GenerateRecommendationsInputSchema = z.object({
  sessionId: z.string(),
});

export type GenerateRecommendationsInput = z.infer<
  typeof GenerateRecommendationsInputSchema
>;

// Calculate category scores from test responses
function calculateCategoryScores(
  questionsResponses: { questions: string[]; answers: string[] },
  subjectComfortLevels: Record<string, number>
): Record<string, number> {
  const scores: Record<string, number> = {};

  // Initialize all categories with 0
  OFFICIAL_INTEREST_AREAS.forEach((area) => {
    scores[area] = 0;
  });

  // Process each answer
  questionsResponses.answers.forEach((answer, index) => {
    const question = PREDEFINED_QUESTIONS[index];
    if (!question) return;

    // Find which option was selected
    const optionIndex = question.options.findIndex((opt) => opt === answer);
    if (optionIndex === -1) return;

    // Get the categories for this option
    const categories = question.mappedCategories[optionIndex];
    if (!categories) return;

    // Add weighted score to each mapped category
    categories.forEach((category) => {
      if (scores[category] !== undefined) {
        scores[category] += question.weight;
      }
    });
  });

  // Factor in subject comfort levels
  Object.entries(INTEREST_AREA_REQUIRED_SUBJECTS).forEach(
    ([interest, requiredSubjects]) => {
      let comfortBonus = 0;
      let matchCount = 0;

      Object.entries(subjectComfortLevels).forEach(([subject, level]) => {
        const subjectLower = subject.toLowerCase();
        if (
          requiredSubjects.some((req) => subjectLower.includes(req.toLowerCase()))
        ) {
          comfortBonus += (level as number) * 0.5;
          matchCount++;
        }
      });

      if (matchCount > 0 && scores[interest] !== undefined) {
        scores[interest] += comfortBonus / matchCount;
      }
    }
  );

  return scores;
}

// Get top interests by score
function getTopInterests(
  scores: Record<string, number>,
  count: number = 5
): string[] {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([interest]) => interest);
}

export const generateRecommendationsHandler = async (
  ctx: AuthContext,
  input: GenerateRecommendationsInput
) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  if (ctx.user.type !== "STUDENT") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only students can generate recommendations",
    });
  }

  // Get session
  const session = await getAptitudeSessionById({
    sessionId: input.sessionId,
    studentUserId: ctx.user.id,
  });

  if (!session) {
    throw new ORPCError("NOT_FOUND", { message: "Session not found" });
  }

  // Validate session has required data
  if (
    !session.questionsResponses?.answers ||
    session.questionsResponses.answers.length < PREDEFINED_QUESTIONS.length
  ) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Please complete all questions before generating recommendations",
    });
  }

  // Calculate category scores
  const categoryScores = calculateCategoryScores(
    session.questionsResponses,
    session.subjectComfortLevels
  );

  // Get top interests
  const topInterests = getTopInterests(categoryScores, 5);

  // Generate AI recommendations
  const { object: aiResponse } = await generateObject({
    model: openai("gpt-4.1-mini"),
    system: `You are an academic counselor AI that analyzes student preferences and generates career recommendations.
Provide thoughtful, encouraging analysis based on their interests, comfort levels, and aptitude test responses.
Be specific about why each interest area is a good match based on their responses.
Keep your reasoning concise but insightful (2-3 sentences per interest).
The recommendations summary should be actionable and encouraging.`,
    prompt: `Analyze this student's aptitude test results and generate personalized career interest matches.

Favorite Subjects: ${session.favoriteSubjects.join(", ")}

Subject Comfort Levels: ${JSON.stringify(session.subjectComfortLevels)}

Test Questions and Answers:
${session.questionsResponses.questions
  .map((q, i) => `${q}: ${session.questionsResponses.answers[i]}`)
  .join("\n")}

Category Scores: ${JSON.stringify(categoryScores)}

Top Interest Areas (ranked by score): ${topInterests.join(", ")}

Generate interest matches for these top 5 interest areas with match percentages (50-95%) and reasoning.
Also provide a personalized recommendations summary (2-3 paragraphs) with actionable advice.`,
    schema: z.object({
      interestMatches: z.array(
        z.object({
          interest: z.string(),
          matchPercentage: z.number().min(0).max(100),
          reasoning: z.string(),
        })
      ),
      recommendations: z.string(),
    }),
  });

  // Attach careers from database for top matches
  const interestMatchesWithCareers = aiResponse.interestMatches.map((match) => ({
    ...match,
    careers: CAREERS_BY_INTEREST[match.interest] || [],
  }));

  // Flatten careers for easy access
  const allCareers = interestMatchesWithCareers
    .flatMap((m) => m.careers)
    .slice(0, 10);

  // Update session with results
  const updated = await updateAptitudeSession({
    sessionId: input.sessionId,
    studentUserId: ctx.user.id,
    status: "completed",
    currentStep: 4,
    completedAt: new Date(),
    generatedInterests: topInterests,
    recommendations: aiResponse.recommendations,
    interestMatches: interestMatchesWithCareers,
    careers: allCareers,
  });

  return updated;
};
