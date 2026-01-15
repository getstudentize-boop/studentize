import { z } from "zod";
import { db, schema, eq } from "@student/db";

export const ListCoursesInputSchema = z.object({
  academicYearId: z.string().optional(),
});

export type ListCoursesInput = z.infer<typeof ListCoursesInputSchema>;

export const listCoursesHandler = async (
  input: ListCoursesInput,
  ctx: { studentId: string }
) => {
  if (input.academicYearId) {
    const courses = await db.query.course.findMany({
      where: eq(schema.course.academicYearId, input.academicYearId),
    });
    return courses;
  }

  // Get all courses for the student
  const courses = await db.query.course.findMany({
    where: eq(schema.course.studentId, ctx.studentId),
    with: {
      academicYear: true,
    },
  });

  return courses;
};
