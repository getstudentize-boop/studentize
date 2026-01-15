import { z } from "zod";
import { db, schema, eq } from "@student/db";

export const CalculateGPAInputSchema = z.object({
  academicYearId: z.string().optional(),
  term: z
    .enum([
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
    ])
    .optional(),
});

export type CalculateGPAInput = z.infer<typeof CalculateGPAInputSchema>;

export const calculateGPAHandler = async (
  input: CalculateGPAInput,
  ctx: { studentId: string }
) => {
  // Get all term grades for the student
  let query = db.query.termGrade.findMany({
    with: {
      course: {
        with: {
          academicYear: true,
        },
      },
    },
    where: (termGrade, { and, eq }) => {
      const conditions: any[] = [];

      if (input.academicYearId) {
        // Filter by academic year through course relationship
        conditions.push(
          eq(termGrade.course.academicYearId, input.academicYearId)
        );
      }

      if (input.term) {
        conditions.push(eq(termGrade.term, input.term as any));
      }

      return conditions.length > 0 ? and(...conditions) : undefined;
    },
  });

  const termGrades = await query;

  // Calculate weighted and unweighted GPA
  let totalGradePoints = 0;
  let totalWeightedGradePoints = 0;
  let totalCredits = 0;

  for (const termGrade of termGrades) {
    if (termGrade.gradePoints && termGrade.course.credits) {
      const credits = termGrade.course.credits;
      totalGradePoints += termGrade.gradePoints * credits;

      // For weighted GPA, add 1.0 for honors/AP courses
      const isHonors =
        termGrade.course.level?.toLowerCase().includes("honors") ||
        termGrade.course.level?.toLowerCase().includes("ap") ||
        termGrade.course.level?.toLowerCase().includes("hl");
      const weightedPoints = isHonors
        ? Math.min(termGrade.gradePoints + 1.0, 5.0)
        : termGrade.gradePoints;
      totalWeightedGradePoints += weightedPoints * credits;

      totalCredits += credits;
    }
  }

  const unweightedGpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
  const weightedGpa =
    totalCredits > 0 ? totalWeightedGradePoints / totalCredits : 0;

  return {
    unweightedGpa: Math.round(unweightedGpa * 100) / 100,
    weightedGpa: Math.round(weightedGpa * 100) / 100,
    totalCredits,
    courseCount: termGrades.length,
  };
};
