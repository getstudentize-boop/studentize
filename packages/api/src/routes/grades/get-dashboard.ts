import { z } from "zod";
import { db, schema, eq } from "@student/db";

export const GetDashboardInputSchema = z.object({});

export type GetDashboardInput = z.infer<typeof GetDashboardInputSchema>;

export const getDashboardHandler = async (
  input: GetDashboardInput,
  ctx: { studentId: string }
) => {
  // Get current academic year
  const currentYear = await db.query.academicYear.findFirst({
    where: (academicYear, { and, eq }) =>
      and(
        eq(academicYear.studentId, ctx.studentId),
        eq(academicYear.isActive, "true")
      ),
  });

  if (!currentYear) {
    return {
      currentYear: null,
      courses: [],
      recentGrades: [],
      gpaOverview: null,
    };
  }

  // Get courses for current year
  const courses = await db.query.course.findMany({
    where: eq(schema.course.academicYearId, currentYear.id),
  });

  // Get recent grades across all courses
  const recentGrades = await db.query.grade.findMany({
    where: (grade, { inArray }) =>
      inArray(
        grade.courseId,
        courses.map((c) => c.id)
      ),
    orderBy: (grade, { desc }) => [desc(grade.date)],
    limit: 10,
    with: {
      course: true,
    },
  });

  // Calculate current GPA
  const termGrades = await db.query.termGrade.findMany({
    where: (termGrade, { inArray }) =>
      inArray(
        termGrade.courseId,
        courses.map((c) => c.id)
      ),
    with: {
      course: true,
    },
  });

  let totalGradePoints = 0;
  let totalWeightedGradePoints = 0;
  let totalCredits = 0;

  for (const termGrade of termGrades) {
    if (termGrade.gradePoints && termGrade.course.credits) {
      const credits = termGrade.course.credits;
      totalGradePoints += termGrade.gradePoints * credits;

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
    currentYear,
    courses,
    recentGrades,
    gpaOverview: {
      unweightedGpa: Math.round(unweightedGpa * 100) / 100,
      weightedGpa: Math.round(weightedGpa * 100) / 100,
      totalCredits,
      courseCount: courses.length,
    },
  };
};
