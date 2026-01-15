import { z } from "zod";
import { db, schema, createId } from "@student/db";

export const AddGradeInputSchema = z.object({
  courseId: z.string(),
  term: z.enum([
    "SEMESTER_1",
    "SEMESTER_2",
    "TRIMESTER_1",
    "TRIMESTER_2",
    "TRIMESTER_3",
    "QUARTER_1",
    "QUARTER_2",
    "QUARTER_3",
    "QUARTER_4",
    "YEAR",
  ]),
  assessmentName: z.string().optional(),
  assessmentType: z.string().optional(),
  score: z.number(),
  maxScore: z.number(),
  letterGrade: z.string().optional(),
  weight: z.number().default(1),
  date: z.string().optional(),
  notes: z.string().optional(),
});

export type AddGradeInput = z.infer<typeof AddGradeInputSchema>;

// Helper function to calculate grade points based on letter grade
function calculateGradePoints(letterGrade?: string | null): number | null {
  if (!letterGrade) return null;

  const gradeMap: Record<string, number> = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    "D-": 0.7,
    F: 0.0,
  };

  return gradeMap[letterGrade.toUpperCase()] || null;
}

export const addGradeHandler = async (input: AddGradeInput) => {
  const percentage = (input.score / input.maxScore) * 100;
  const gradePoints = input.letterGrade
    ? calculateGradePoints(input.letterGrade)
    : null;

  const grade = await db
    .insert(schema.grade)
    .values({
      id: createId(),
      courseId: input.courseId,
      term: input.term,
      assessmentName: input.assessmentName || null,
      assessmentType: input.assessmentType || null,
      score: input.score,
      maxScore: input.maxScore,
      percentage,
      letterGrade: input.letterGrade || null,
      gradePoints,
      weight: input.weight,
      date: input.date ? new Date(input.date) : null,
      notes: input.notes || null,
    })
    .returning();

  return grade[0];
};
