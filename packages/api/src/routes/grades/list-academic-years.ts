import { z } from "zod";
import { db, schema, eq } from "@student/db";

export const ListAcademicYearsInputSchema = z.object({});

export type ListAcademicYearsInput = z.infer<
  typeof ListAcademicYearsInputSchema
>;

export const listAcademicYearsHandler = async (
  input: ListAcademicYearsInput,
  ctx: { studentId: string }
) => {
  const years = await db.query.academicYear.findMany({
    where: eq(schema.academicYear.studentId, ctx.studentId),
    orderBy: (academicYear, { desc }) => [desc(academicYear.startDate)],
  });

  return years;
};
