import { z } from "zod";
import { db, schema, eq } from "@student/db";

export const ListGradesInputSchema = z.object({
  courseId: z.string(),
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

export type ListGradesInput = z.infer<typeof ListGradesInputSchema>;

export const listGradesHandler = async (input: ListGradesInput) => {
  let grades;

  if (input.term) {
    grades = await db.query.grade.findMany({
      where: (grade, { and, eq }) =>
        and(
          eq(grade.courseId, input.courseId),
          eq(grade.term, input.term as any)
        ),
      orderBy: (grade, { desc }) => [desc(grade.date)],
    });
  } else {
    grades = await db.query.grade.findMany({
      where: eq(schema.grade.courseId, input.courseId),
      orderBy: (grade, { desc }) => [desc(grade.date)],
    });
  }

  return grades;
};
